from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
AGENTS_DIR = PROJECT_ROOT / "agents"
EVAL_DIR = PROJECT_ROOT / "eval"
ITEMS_DIR = EVAL_DIR / "items"
RESULTS_DIR = EVAL_DIR / "results"
RUBRICS_DIR = EVAL_DIR / "rubrics"
SOURCES_DIR = EVAL_DIR / "sources"

# Verify model IDs against Anthropic API at implementation time
MODELS = {
    "generation": "claude-sonnet-4-5-20250929",
    "agent_under_test": "claude-sonnet-4-5-20250929",
    "judge": "claude-opus-4-6",
}

# Per million tokens. cache_read = 90% discount. cache_create = 25% surcharge.
PRICING = {
    "claude-sonnet-4-5-20250929": {"input": 3.00, "output": 15.00, "cache_read": 0.30, "cache_create": 3.75},
    "claude-opus-4-6": {"input": 15.00, "output": 75.00, "cache_read": 1.50, "cache_create": 18.75},
}

ANTHROPIC_MAX_RETRIES = 5
ANTHROPIC_TIMEOUT = 600.0
IMPROVEMENT_THRESHOLD = 0.5
CATEGORY_REGRESSION_MAX = 2.0
SECTION_REGRESSION_MAX = 5.0
FIELD_TEST_MIN_N = 30
IRT_3PL_MIN_N = 500
JUDGE_COUNT = 3
JUDGE_AGREEMENT_THRESHOLD = 0.70
GEPA_AUTO = "medium"
GENERATE_MAX_RETRIES = 3
GENERATE_REJECTION_THRESHOLD = 0.50
AGENT_TIMEOUT = 60
