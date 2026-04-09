#!/usr/bin/env bash
set -euo pipefail

: "${OPENROUTER_API_KEY:?Set OPENROUTER_API_KEY}"
: "${OPENROUTER_PROVIDER_MODEL:?Set OPENROUTER_PROVIDER_MODEL}"

PROMPT_FILE="$(mktemp)"
RESP_FILE="$(mktemp)"

cleanup() {
  rm -f "$PROMPT_FILE" "$RESP_FILE"
}
trap cleanup EXIT

cat > "$PROMPT_FILE"

python3 - "$PROMPT_FILE" "$RESP_FILE" <<'PY'
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


def extract_content(message_content: object) -> str:
    if isinstance(message_content, str):
        return message_content
    if isinstance(message_content, list):
        parts: list[str] = []
        for item in message_content:
            if isinstance(item, dict) and item.get("type") == "text" and isinstance(item.get("text"), str):
                parts.append(item["text"])
        return "\n".join(part for part in parts if part.strip())
    return ""


prompt_path = Path(sys.argv[1])
resp_path = Path(sys.argv[2])
prompt = prompt_path.read_text(encoding="utf-8")

body = {
    "model": os.environ["OPENROUTER_PROVIDER_MODEL"],
    "messages": [{"role": "user", "content": prompt}],
    "max_tokens": int(os.environ.get("OPENROUTER_PROVIDER_MAX_TOKENS", "12000")),
}

temperature = os.environ.get("OPENROUTER_PROVIDER_TEMPERATURE")
if temperature is not None:
    body["temperature"] = float(temperature)

headers = {
    "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
    "Content-Type": "application/json",
}

site_url = os.environ.get("OPENROUTER_HTTP_REFERER")
site_name = os.environ.get("OPENROUTER_X_TITLE")
if site_url:
    headers["HTTP-Referer"] = site_url
if site_name:
    headers["X-Title"] = site_name

request = urllib.request.Request(
    "https://openrouter.ai/api/v1/chat/completions",
    data=json.dumps(body).encode("utf-8"),
    headers=headers,
    method="POST",
)

timeout_secs = int(os.environ.get("OPENROUTER_PROVIDER_TIMEOUT_SECS", "600"))

try:
    with urllib.request.urlopen(request, timeout=timeout_secs) as response:
        payload = json.load(response)
except urllib.error.HTTPError as exc:
    detail = exc.read().decode("utf-8", errors="replace")
    print(detail, file=sys.stderr)
    raise SystemExit(1)
except urllib.error.URLError as exc:
    print(str(exc), file=sys.stderr)
    raise SystemExit(1)

choices = payload.get("choices") or []
if not choices:
    print("openrouter provider returned no choices", file=sys.stderr)
    raise SystemExit(1)

message = choices[0].get("message") or {}
content = extract_content(message.get("content"))
if not content.strip():
    print("openrouter provider returned empty content", file=sys.stderr)
    raise SystemExit(1)

resp_path.write_text(content, encoding="utf-8")
PY

if ! grep -q '[^[:space:]]' "$RESP_FILE"; then
  echo "openrouter provider returned empty output" >&2
  exit 1
fi

cat "$RESP_FILE"
