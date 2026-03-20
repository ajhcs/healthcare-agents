"""
Tests for invoker.py — written FIRST per TDD.

All tests are fully mocked — no real API calls are made.

Run from project root:
    python3 -m pytest eval/harness/test_invoker.py -v
"""
from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from eval.harness.invoker import CostTracker, invoke_agent
from eval.harness.config import PRICING

# ---------------------------------------------------------------------------
# Fixtures & helpers
# ---------------------------------------------------------------------------

FIXTURE_MD = Path(__file__).parent / "test_fixtures" / "sample_agent.md"


def _mock_message(
    input_tokens: int = 100,
    output_tokens: int = 50,
    cache_read: int = 80,
    cache_create: int = 0,
) -> MagicMock:
    msg = MagicMock()
    msg.content = [MagicMock(text="Mock response")]
    msg.usage.input_tokens = input_tokens
    msg.usage.output_tokens = output_tokens
    msg.usage.cache_read_input_tokens = cache_read
    msg.usage.cache_creation_input_tokens = cache_create
    msg.stop_reason = "end_turn"
    msg.model = "claude-sonnet-4-5-20250929"
    msg.id = "msg_test"
    return msg


# ---------------------------------------------------------------------------
# Test 1 — invoke_agent returns expected dict structure
# ---------------------------------------------------------------------------

def test_invoke_agent_returns_expected_structure():
    """invoke_agent must return a dict with all expected keys and no error."""
    mock_msg = _mock_message(input_tokens=100, output_tokens=50, cache_read=80, cache_create=0)

    with patch("eval.harness.invoker._client") as mock_client:
        mock_client.messages.create.return_value = mock_msg
        result = invoke_agent(
            agent_md_path=FIXTURE_MD,
            user_message="What is I11.0?",
            model="claude-sonnet-4-5-20250929",
        )

    required_keys = {
        "text", "input_tokens", "output_tokens",
        "cache_read_tokens", "cache_create_tokens",
        "stop_reason", "cost", "error",
    }
    assert required_keys == set(result.keys()), (
        f"Missing or extra keys. Got: {set(result.keys())}"
    )
    assert result["text"] == "Mock response"
    assert result["input_tokens"] == 100
    assert result["output_tokens"] == 50
    assert result["cache_read_tokens"] == 80
    assert result["cache_create_tokens"] == 0
    assert result["stop_reason"] == "end_turn"
    assert result["error"] is None
    assert isinstance(result["cost"], float)


# ---------------------------------------------------------------------------
# Test 2 — cost accounts for cache_read at discounted rate
# ---------------------------------------------------------------------------

def test_cost_accounts_for_cache_read():
    """cache_read tokens must be billed at the cache_read price, not input price."""
    model = "claude-sonnet-4-5-20250929"
    prices = PRICING[model]

    # 0 uncached input tokens, 0 output tokens — only cache_read
    mock_msg = _mock_message(input_tokens=80, output_tokens=0, cache_read=80, cache_create=0)
    tracker = CostTracker()

    with patch("eval.harness.invoker._client") as mock_client:
        mock_client.messages.create.return_value = mock_msg
        result = invoke_agent(
            agent_md_path=FIXTURE_MD,
            user_message="test",
            model=model,
            cost_tracker=tracker,
        )

    expected_cost = (80 / 1e6) * prices["cache_read"]
    assert abs(result["cost"] - expected_cost) < 1e-9, (
        f"Expected cache_read cost {expected_cost}, got {result['cost']}"
    )


# ---------------------------------------------------------------------------
# Test 3 — cost accounts for cache_create at surcharge rate
# ---------------------------------------------------------------------------

def test_cost_accounts_for_cache_create():
    """cache_create tokens must be billed at the cache_create price."""
    model = "claude-sonnet-4-5-20250929"
    prices = PRICING[model]

    # input_tokens == cache_create (all tokens are being cached for first time)
    # cache_read == 0, output == 0
    mock_msg = _mock_message(input_tokens=200, output_tokens=0, cache_read=0, cache_create=200)
    tracker = CostTracker()

    with patch("eval.harness.invoker._client") as mock_client:
        mock_client.messages.create.return_value = mock_msg
        result = invoke_agent(
            agent_md_path=FIXTURE_MD,
            user_message="test",
            model=model,
            cost_tracker=tracker,
        )

    expected_cost = (200 / 1e6) * prices["cache_create"]
    assert abs(result["cost"] - expected_cost) < 1e-9, (
        f"Expected cache_create cost {expected_cost}, got {result['cost']}"
    )


# ---------------------------------------------------------------------------
# Test 4 — CostTracker accumulates across multiple record() calls
# ---------------------------------------------------------------------------

def test_cost_tracker_accumulates():
    """CostTracker.total_* fields must sum across multiple record() calls."""
    model = "claude-sonnet-4-5-20250929"
    tracker = CostTracker()

    cost1 = tracker.record(model, input_tokens=100, output_tokens=50, cache_read=80, cache_create=0)
    cost2 = tracker.record(model, input_tokens=200, output_tokens=100, cache_read=0, cache_create=150)

    assert tracker.total_input_tokens == 300
    assert tracker.total_output_tokens == 150
    assert tracker.total_cache_read_tokens == 80
    assert tracker.total_cache_create_tokens == 150
    assert abs(tracker.total_cost - (cost1 + cost2)) < 1e-9, (
        f"total_cost {tracker.total_cost} != sum of individual costs {cost1 + cost2}"
    )


# ---------------------------------------------------------------------------
# Test 5 — API errors return error dict, not exception
# ---------------------------------------------------------------------------

def test_api_error_returns_error_dict_not_exception():
    """When the API raises an error, invoke_agent must return error dict, not re-raise."""
    from anthropic import RateLimitError

    with patch("eval.harness.invoker._client") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.headers = {}
        mock_response.text = "rate limited"
        mock_client.messages.create.side_effect = RateLimitError(
            message="rate limit exceeded",
            response=mock_response,
            body={"error": {"message": "rate limit exceeded"}},
        )
        result = invoke_agent(
            agent_md_path=FIXTURE_MD,
            user_message="test",
            model="claude-sonnet-4-5-20250929",
        )

    assert result["error"] is not None, "error field must be set on API failure"
    assert result["text"] == ""
    assert result["input_tokens"] == 0
    assert result["output_tokens"] == 0
    assert result["stop_reason"] == "error"
    assert result["cost"] == 0.0


# ---------------------------------------------------------------------------
# Test 6 — system prompt uses cache_control ephemeral
# ---------------------------------------------------------------------------

def test_system_prompt_uses_cache_control_ephemeral():
    """The messages.create call must include cache_control ephemeral on the system block."""
    mock_msg = _mock_message()

    with patch("eval.harness.invoker._client") as mock_client:
        mock_client.messages.create.return_value = mock_msg
        invoke_agent(
            agent_md_path=FIXTURE_MD,
            user_message="test",
            model="claude-sonnet-4-5-20250929",
        )

    call_kwargs = mock_client.messages.create.call_args.kwargs
    system = call_kwargs.get("system", [])

    assert isinstance(system, list), "system must be a list of blocks"
    assert len(system) == 1, f"expected 1 system block, got {len(system)}"

    block = system[0]
    assert block.get("type") == "text", f"system block type must be 'text', got {block.get('type')}"
    assert block.get("cache_control") == {"type": "ephemeral"}, (
        f"cache_control must be {{'type': 'ephemeral'}}, got {block.get('cache_control')}"
    )
    # Verify the system prompt text is the actual file content
    expected_text = FIXTURE_MD.read_text(encoding="utf-8")
    assert block.get("text") == expected_text, "system block text must match file contents"


# ---------------------------------------------------------------------------
# Test 7 — CostTracker.call_count increments correctly
# ---------------------------------------------------------------------------

def test_cost_tracker_call_count():
    """CostTracker.call_count must increment by 1 for each record() call."""
    model = "claude-sonnet-4-5-20250929"
    tracker = CostTracker()

    assert tracker.call_count == 0

    tracker.record(model, input_tokens=10, output_tokens=5)
    assert tracker.call_count == 1

    tracker.record(model, input_tokens=20, output_tokens=10)
    assert tracker.call_count == 2

    tracker.record(model, input_tokens=30, output_tokens=15)
    assert tracker.call_count == 3
