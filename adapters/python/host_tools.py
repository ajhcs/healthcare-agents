"""Local callback bridge for customer-owned host loops; no cloud SDK or model call."""
import json
import pathlib
import subprocess

class HostBridgeError(RuntimeError):
    pass

def _execute(arguments, payload=None, package_root=None, node="node", timeout=15):
    root = pathlib.Path(package_root) if package_root else pathlib.Path(__file__).resolve().parents[2]
    encoded = None if payload is None else json.dumps(payload)
    if encoded is not None and len(encoded.encode("utf-8")) > 2 * 1024 * 1024:
        raise HostBridgeError("Host bridge input exceeds 2 MiB")
    try:
        completed = subprocess.run([node, str(root / "bin/host-tool-bridge.js"), *arguments],
            input=encoded, text=True, capture_output=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired as error:
        raise HostBridgeError("Host bridge deadline exceeded") from error
    except OSError as error:
        raise HostBridgeError("Host bridge runtime unavailable") from error
    if completed.returncode != 0 or len(completed.stdout.encode("utf-8")) > 2 * 1024 * 1024:
        raise HostBridgeError("Host bridge request rejected")
    try:
        return json.loads(completed.stdout)
    except ValueError as error:
        raise HostBridgeError("Host bridge returned an invalid result") from error

def tool_definitions(target, **runtime):
    return _execute(["--list", target], **runtime)

def run_host_call(target, normalized_call, **runtime):
    return _execute([], {"target": target, "call": normalized_call}, **runtime)
