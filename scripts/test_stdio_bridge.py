#!/usr/bin/env python3
"""Meaningful byte, EOF, signal and drain regressions; no network or models."""
import importlib.util
import fcntl
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
HELPER = ROOT / "bin/mcp-stdio-bridge.py"
LOAD = "import importlib.util,sys; s=importlib.util.spec_from_file_location('bridge',sys.argv[1]);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);sys.exit(m.relay([sys.executable,sys.argv[2]]))"

class StdioBridge(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="hag-stdio-bridge-")
        self.directory = Path(self.tmp.name)
    def tearDown(self):
        self.tmp.cleanup()
    def start(self, code):
        script = self.directory / "peer.py"
        script.write_text(code)
        return subprocess.Popen([sys.executable, "-B", "-c", LOAD, str(HELPER), str(script)],
                                stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    def test_exact_binary_bytes_and_clean_eof(self):
        proc = self.start("import sys; data=sys.stdin.buffer.read();sys.stdout.buffer.write(data);sys.stderr.buffer.write(b'peer diagnostic\\n')")
        payload = bytes(range(256)) * 2048
        out, err = proc.communicate(payload, timeout=10)
        self.assertEqual(proc.returncode, 0)
        self.assertEqual(out, payload)
        self.assertEqual(err, b"peer diagnostic\n")
    def test_child_error_is_retained(self):
        proc = self.start("import sys; sys.stderr.write('peer failed\\n');sys.exit(7)")
        out, err = proc.communicate(timeout=5)
        self.assertEqual(proc.returncode, 7)
        self.assertEqual(out, b"")
        self.assertEqual(err, b"peer failed\n")
    def test_signal_escalates_and_reaps_only_owned_child(self):
        proc = self.start("import os,signal,time;signal.signal(signal.SIGTERM,lambda *_:None);print(os.getpid(),flush=True);time.sleep(30)")
        child_pid = int(proc.stdout.readline())
        started = time.monotonic()
        proc.send_signal(signal.SIGTERM)
        proc.communicate(timeout=5)
        self.assertEqual(proc.returncode, 137)
        self.assertLess(time.monotonic() - started, 4)
        with self.assertRaises(ProcessLookupError):
            os.kill(child_pid, 0)
    def test_backpressure_cancellation_has_bounded_nonzero_drain(self):
        proc = self.start("import os,signal,time;signal.signal(signal.SIGTERM,lambda *_:None);os.write(2,b'READY\\n');os.write(1,b'x'*1048576);time.sleep(30)")
        self.assertEqual(proc.stderr.readline(), b"READY\n")
        started = time.monotonic()
        proc.send_signal(signal.SIGTERM)
        proc.wait(timeout=5)
        self.assertNotEqual(proc.returncode, 0)
        self.assertLess(time.monotonic() - started, 4.5)
        for stream in (proc.stdin, proc.stdout, proc.stderr):
            stream.close()
    def test_completed_child_output_cannot_truncate_silently(self):
        proc = self.start("import os;os.write(1,b'x'*12000)")
        fcntl.fcntl(proc.stdout.fileno(), fcntl.F_SETPIPE_SZ, 4096)
        proc.wait(timeout=5)
        self.assertNotEqual(proc.returncode, 0)
        out, err = proc.communicate(timeout=2)
        self.assertLess(len(out), 12000)
        self.assertIn(b"output drain deadline exceeded", err)
    def test_broken_downstream_stops_child(self):
        proc = self.start("import os,time;os.write(2,b'READY\\n');time.sleep(.1);os.write(1,b'x'*1048576);time.sleep(30)")
        self.assertEqual(proc.stderr.readline(), b"READY\n")
        proc.stdout.close()
        proc.wait(timeout=5)
        self.assertNotEqual(proc.returncode, 0)
        proc.stdin.close()
        proc.stderr.close()

if __name__ == "__main__":
    unittest.main()
