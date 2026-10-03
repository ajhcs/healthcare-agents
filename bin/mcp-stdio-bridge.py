#!/usr/bin/env python3
"""Optional POSIX stdio adapter: anonymous pipes for the unchanged Node MCP server."""
import argparse
import os
from pathlib import Path
import select
import shutil
import signal
import subprocess
import sys
import threading
import time

def relay(command, grace_seconds=1.0, drain_seconds=2.0):
    child = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, bufsize=0, start_new_session=True)
    stop_input = threading.Event()
    stop_drain = threading.Event()
    failures = []
    stop_at = None

    def send_owned_group(sig):
        if child.poll() is None:
            try:
                if os.getpgid(child.pid) == child.pid:
                    os.killpg(child.pid, sig)
            except ProcessLookupError:
                pass

    def request_stop(sig, _frame=None):
        nonlocal stop_at
        if stop_at is None:
            stop_at = time.monotonic() + grace_seconds
            send_owned_group(sig)

    def pump(source, dest, label, stop, close_input=False):
        try:
            while not stop.is_set():
                if not select.select([source], [], [], 0.1)[0]:
                    continue
                try:
                    data = os.read(source, 65536)
                except BlockingIOError:
                    continue
                if not data:
                    break
                while data and not stop.is_set():
                    if not select.select([], [dest], [], 0.1)[1]:
                        continue
                    try:
                        written = os.write(dest, data)
                    except BlockingIOError:
                        continue
                    if not written:
                        raise OSError("zero-byte write")
                    data = data[written:]
        except (OSError, ValueError):
            if child.poll() is None or label != "stdin":
                failures.append(label + " forwarding failed")
        finally:
            if close_input:
                try:
                    child.stdin.close()
                except OSError:
                    pass

    previous = {}
    for sig in (signal.SIGTERM, signal.SIGINT):
        previous[sig] = signal.signal(sig, request_stop)
    threads = [
        threading.Thread(target=pump, args=(0, child.stdin.fileno(), "stdin", stop_input, True), daemon=True),
        threading.Thread(target=pump, args=(child.stdout.fileno(), 1, "stdout", stop_drain), daemon=True),
        threading.Thread(target=pump, args=(child.stderr.fileno(), 2, "stderr", stop_drain), daemon=True),
    ]
    try:
        for thread in threads:
            thread.start()
        while child.poll() is None:
            if failures and stop_at is None:
                request_stop(signal.SIGTERM)
            if stop_at is not None and time.monotonic() >= stop_at:
                send_owned_group(signal.SIGKILL)
            time.sleep(0.02)
        code = child.wait()
        stop_input.set()
        deadline = time.monotonic() + drain_seconds
        for thread in threads[1:]:
            thread.join(timeout=max(0, deadline - time.monotonic()))
        if any(thread.is_alive() for thread in threads[1:]):
            failures.append("output drain deadline exceeded")
            stop_drain.set()
            for thread in threads[1:]:
                thread.join(timeout=0.2)
        if failures:
            diagnostic = ("Healthcare administration stdio bridge: " + "; ".join(sorted(set(failures))) + "\n").encode()
            try:
                if select.select([], [2], [], 0.1)[1]:
                    os.write(2, diagnostic)
            except OSError:
                pass
        return (1 if code == 0 and failures else code if code >= 0 else 128 - code)
    finally:
        stop_input.set()
        stop_drain.set()
        if child.poll() is None:
            send_owned_group(signal.SIGKILL)
            child.wait()
        for stream in (child.stdin, child.stdout, child.stderr):
            try:
                stream.close()
            except OSError:
                pass
        for sig, handler in previous.items():
            signal.signal(sig, handler)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", default="node", help="Operator-selected Node executable")
    parser.add_argument("--allow-aggregate", action="store_true")
    args = parser.parse_args()
    if os.name != "posix":
        parser.error("This optional bridge supports POSIX hosts only")
    node = shutil.which(args.node)
    if node is None:
        parser.error("Node executable is unavailable")
    command = [node, str(Path(__file__).with_name("mcp-server.js")), "--stdio"]
    if args.allow_aggregate:
        command.append("--allow-aggregate")
    return relay(command)

if __name__ == "__main__":
    try:
        sys.exit(main())
    except OSError:
        sys.stderr.write("Healthcare administration stdio bridge could not start\n")
        sys.exit(1)
