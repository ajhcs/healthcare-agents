"""
Anthropic API wrapper with prompt caching and cost tracking.

Zero network calls at import time. All API calls go through invoke_agent().
"""
from __future__ import annotations

from pathlib import Path

from anthropic import (
    Anthropic,
    APIConnectionError,
    APIStatusError,
    BadRequestError,
    RateLimitError,
)

from eval.harness.config import ANTHROPIC_MAX_RETRIES, ANTHROPIC_TIMEOUT, PRICING

_client = Anthropic(max_retries=ANTHROPIC_MAX_RETRIES, timeout=ANTHROPIC_TIMEOUT)


class CostTracker:
    """Accumulates API costs across multiple calls."""

    def __init__(self) -> None:
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cache_read_tokens = 0
        self.total_cache_create_tokens = 0
        self.total_cost = 0.0
        self.call_count = 0

    def record(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        cache_read: int = 0,
        cache_create: int = 0,
    ) -> float:
        """Record a call's tokens and compute cost. Returns cost for this call."""
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        self.total_cache_read_tokens += cache_read
        self.total_cache_create_tokens += cache_create
        self.call_count += 1

        prices = PRICING.get(model, list(PRICING.values())[0])
        uncached_input = max(0, input_tokens - cache_read - cache_create)
        cost = (
            (uncached_input / 1e6) * prices["input"]
            + (cache_read / 1e6) * prices["cache_read"]
            + (cache_create / 1e6) * prices["cache_create"]
            + (output_tokens / 1e6) * prices["output"]
        )
        self.total_cost += cost
        return cost


def invoke_agent(
    agent_md_path: Path,
    user_message: str,
    model: str,
    max_tokens: int = 4096,
    cost_tracker: CostTracker | None = None,
) -> dict:
    """Invoke Claude with a system prompt from .md file. Uses prompt caching.

    Returns a dict with keys:
        text, input_tokens, output_tokens, cache_read_tokens, cache_create_tokens,
        stop_reason, cost, error
    """
    system_prompt = agent_md_path.read_text(encoding="utf-8")
    try:
        message = _client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_message}],
        )
        cache_read = getattr(message.usage, "cache_read_input_tokens", 0) or 0
        cache_create = getattr(message.usage, "cache_creation_input_tokens", 0) or 0
        cost = 0.0
        if cost_tracker:
            cost = cost_tracker.record(
                model,
                message.usage.input_tokens,
                message.usage.output_tokens,
                cache_read,
                cache_create,
            )
        return {
            "text": message.content[0].text,
            "input_tokens": message.usage.input_tokens,
            "output_tokens": message.usage.output_tokens,
            "cache_read_tokens": cache_read,
            "cache_create_tokens": cache_create,
            "stop_reason": message.stop_reason,
            "cost": cost,
            "error": None,
        }
    except (RateLimitError, APIConnectionError, BadRequestError, APIStatusError) as e:
        return {
            "text": "",
            "input_tokens": 0,
            "output_tokens": 0,
            "cache_read_tokens": 0,
            "cache_create_tokens": 0,
            "stop_reason": "error",
            "cost": 0.0,
            "error": str(e),
        }
