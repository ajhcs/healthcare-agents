"""Local workflow-tool adapter for a customer-managed agent host.

No model SDK, authentication, network request or production deployment occurs.
Install healthcare-agents in the approved runtime and pass its package root.
"""
import json
import pathlib
import subprocess
import tempfile


class WorkflowTools:
    def __init__(self, package_root, node="node"):
        self.root = pathlib.Path(package_root).resolve()
        self.node = node
        self.cli = self.root / "bin" / "cli.js"
        if not self.cli.is_file():
            raise ValueError("Healthcare Agents package root is missing its CLI")

    def run_case(self, payload):
        serialized = json.dumps(payload, allow_nan=False)
        if len(serialized.encode("utf-8")) > 2 * 1024 * 1024:
            raise ValueError("Case exceeds 2 MiB")
        with tempfile.TemporaryDirectory(prefix="healthcare-admin-") as directory:
            case = pathlib.Path(directory) / "case.json"
            case.write_text(serialized, encoding="utf-8")
            result = subprocess.run(
                [self.node, str(self.cli), "admin", "run", str(case)],
                capture_output=True, text=True, timeout=30, check=False,
            )
        if result.returncode:
            raise ValueError(result.stderr.strip())
        return json.loads(result.stdout)
