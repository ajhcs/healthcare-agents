import importlib.util
import json
import pathlib
import unittest
import sys
sys.dont_write_bytecode = True

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("workflow_tools", ROOT / "adapters/python/workflow_tools.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AdapterTest(unittest.TestCase):
    def setUp(self):
        self.tools = module.WorkflowTools(ROOT)

    def case(self, workflow):
        return json.loads((ROOT / "examples/admin-v2" / (workflow + ".json")).read_text())

    def test_denials(self):
        self.assertEqual(self.tools.run_case(self.case("denial-spike-workup"))["values"]["percentage_point_change"], 8)

    def test_access(self):
        self.assertEqual(self.tools.run_case(self.case("ambulatory-access-backlog"))["values"]["weeks_to_clear_backlog"], 5)

    def test_survey(self):
        self.assertEqual(self.tools.run_case(self.case("survey-readiness-gap-review"))["values"]["missing_evidence"], 1)

    def test_appeal(self):
        self.assertEqual(self.tools.run_case(self.case("prior-authorization-appeal-workup"))["values"]["missing_documents"], ["clinician statement"])

    def test_variance(self):
        self.assertEqual(self.tools.run_case(self.case("payer-contract-underpayment-review"))["values"]["net_variance"], 150)

    def test_discharge(self):
        self.assertEqual(self.tools.run_case(self.case("discharge-barrier-workplan"))["values"]["barrier_counts"], 6)

    def test_rejected_input_is_an_error(self):
        case = self.case("denial-spike-workup")
        case["data"]["current_claims"] = 0
        with self.assertRaises(ValueError):
            self.tools.run_case(case)

    def test_no_shell_interpolation(self):
        case = self.case("denial-spike-workup")
        case["human_owner"] = "Synthetic owner; $(exit 7)"
        self.assertEqual(self.tools.run_case(case)["human_owner"], case["human_owner"])

    def test_nonfinite_input_rejected(self):
        case = self.case("denial-spike-workup")
        case["data"]["denied_dollars"] = float("nan")
        with self.assertRaises(ValueError):
            self.tools.run_case(case)


if __name__ == "__main__":
    unittest.main()
