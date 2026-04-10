"""
Deterministic regex-based claim extractor for healthcare agent .md files.

Reads a single agent .md file, identifies testable assertions, and returns a
structured list of Claim objects.  Results are cached to
eval/items/{agent-stem}/claims.json keyed on the SHA-256 of the file content.

Zero LLM calls — fully deterministic and free to run.
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Project layout helpers
# ---------------------------------------------------------------------------

def _project_root() -> Path:
    """Locate the project root two levels above eval/harness/."""
    return Path(__file__).resolve().parents[2]


def _cache_path(agent_path: Path) -> Path:
    """Return the canonical cache file path for a given agent .md file."""
    items_dir = _project_root() / "eval" / "items"
    return items_dir / agent_path.stem / "claims.json"


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class Claim:
    claim_id: str        # e.g. "K01", "R05", "X02", "E03"
    claim_text: str      # The assertion text (the matched line)
    claim_type: str      # "knowledge" | "reasoning" | "cross_domain" | "edge_case"
    source_section: Optional[str]  # e.g. "ICD-10-CM Section I.C.9.a.1" or None
    line_number: int     # 1-based line index in the .md file
    context: str         # 3 surrounding lines for generation context


# ---------------------------------------------------------------------------
# Regex pattern banks
# ---------------------------------------------------------------------------

# ---- Knowledge patterns ----
_KNOWLEDGE_PATTERNS: list[re.Pattern] = [
    # Guideline section citations
    re.compile(r"Section\s+I\.C\.\d+", re.IGNORECASE),
    re.compile(r"42\s+CFR\s+\d+", re.IGNORECASE),
    re.compile(r"45\s+CFR\s+\d+", re.IGNORECASE),
    re.compile(r"ICD-10-CM", re.IGNORECASE),
    re.compile(r"ICD-10-PCS", re.IGNORECASE),
    re.compile(r"\bCPT\b"),
    re.compile(r"\bHCPCS\b"),
    # ICD-10 code pattern: letter + 2 digits + dot + digit(s)
    re.compile(r"\b[A-Z]\d{2}\.\d+[xX]?\b"),
    # ICD-10 code ranges / bare codes without dot (e.g. J96.0x)
    re.compile(r"\b[A-Z]\d{2}\.\d[xX0-9]*\b"),
    # MS-DRG references
    re.compile(r"\bMS-DRG\b", re.IGNORECASE),
    re.compile(r"\bAPR-DRG\b", re.IGNORECASE),
    # MCC / CC classification
    re.compile(r"\b(?:MCC|CC)\b"),
    # Specific thresholds / values
    re.compile(r"\b\d+\s*%"),
    re.compile(r"\$\d[\d,]*"),
    # Obligation language for explicit rule statements
    re.compile(r"\b(?:must|shall|is required|Excludes1 means|Excludes2 means)\b", re.IGNORECASE),
]

# ---- Reasoning patterns ----
# Strong signals: explicit "You can/will/should" capability language.
# These take priority over cross_domain classification (see _classify_line).
_REASONING_STRONG_PATTERNS: list[re.Pattern] = [
    re.compile(r"\bYou\s+can\b", re.IGNORECASE),
    re.compile(r"\bYou\s+will\b", re.IGNORECASE),
    re.compile(r"\bYou\s+should\b", re.IGNORECASE),
    re.compile(r"\bYou\s+are\s+able\b", re.IGNORECASE),
]

_REASONING_PATTERNS: list[re.Pattern] = _REASONING_STRONG_PATTERNS + [
    re.compile(r"\b(?:assign|determine|identify|evaluate|recommend|calculate)\b", re.IGNORECASE),
    re.compile(r"\bHow\s+to\b", re.IGNORECASE),
    re.compile(r"\bstep[- ]by[- ]step\b", re.IGNORECASE),
    re.compile(r"\bworkflow\b", re.IGNORECASE),
]

# ---- Cross-domain patterns ----
# Two or more domain keywords on the same line, or explicit bridging language.
_CROSSDOMAIN_DOMAIN_WORDS = re.compile(
    r"\b(?:coding|compliance|revenue|clinical|financial|CDI|documentation|"
    r"billing|reimbursement|audit|risk\s+adjustment|quality|registry|"
    r"pharmacy|laboratory|imaging)\b",
    re.IGNORECASE,
)
_CROSSDOMAIN_BRIDGE_PATTERNS: list[re.Pattern] = [
    re.compile(r"\b(?:across|between|connecting|bridging|integration|integrate)\b", re.IGNORECASE),
]

# ---- Edge-case patterns ----
_EDGECASE_PATTERNS: list[re.Pattern] = [
    re.compile(r"\bhowever\b", re.IGNORECASE),
    re.compile(r"\bunless\b", re.IGNORECASE),
    re.compile(r"\bexcept\s+when\b", re.IGNORECASE),
    re.compile(r"\bdoes\s+not\s+apply\b", re.IGNORECASE),
    re.compile(r"\bnot\s+to\s+be\s+confused\b", re.IGNORECASE),
    re.compile(r"\bacute\s+vs\.?\s+chronic\b", re.IGNORECASE),
    re.compile(r"\binitial\s+vs\.?\s+subsequent\b", re.IGNORECASE),
    re.compile(r"\bExcludes1\b"),
    re.compile(r"\bExcludes2\b"),
    re.compile(r"\bcommonly\s+confused\b", re.IGNORECASE),
    re.compile(r"\bfrequently\s+(?:confused|miscoded)\b", re.IGNORECASE),
    re.compile(r"\bimportant\s+distinction\b", re.IGNORECASE),
    # Emphatic NOT in caps (but not at the very start of a typical sentence)
    re.compile(r"\bNOT\b"),
    # Trap / gotcha language
    re.compile(r"\b(?:trap|gotcha|pitfall|common\s+error)\b", re.IGNORECASE),
]

# ---- Source-section extraction ----
_SOURCE_SECTION_RE = re.compile(
    r"(?:"
    r"(?:ICD-10-CM\s+)?Section\s+([A-Z0-9]+(?:\.[A-Z0-9]+)+)"  # Section I.C.9.a.1
    r"|"
    r"(42|45)\s+CFR\s+(\d+(?:\.\d+)*)"                          # 42/45 CFR 164.514
    r")",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Classification helpers
# ---------------------------------------------------------------------------

def _is_knowledge(line: str) -> bool:
    return any(p.search(line) for p in _KNOWLEDGE_PATTERNS)


def _is_reasoning_strong(line: str) -> bool:
    """True when the line contains explicit 'You can/will/should' capability language."""
    return any(p.search(line) for p in _REASONING_STRONG_PATTERNS)


def _is_reasoning(line: str) -> bool:
    return any(p.search(line) for p in _REASONING_PATTERNS)


def _is_cross_domain(line: str) -> bool:
    # Must have bridging language OR two or more distinct domain words
    has_bridge = any(p.search(line) for p in _CROSSDOMAIN_BRIDGE_PATTERNS)
    domain_matches = _CROSSDOMAIN_DOMAIN_WORDS.findall(line)
    unique_domains = {m.lower().strip() for m in domain_matches}
    return has_bridge or len(unique_domains) >= 2


def _is_edge_case(line: str) -> bool:
    return any(p.search(line) for p in _EDGECASE_PATTERNS)


def _extract_source_section(line: str) -> Optional[str]:
    """Return a source section string if a guideline citation is found."""
    m = _SOURCE_SECTION_RE.search(line)
    if not m:
        return None
    if m.group(1):
        # Reconstruct with "Section" prefix — find the literal text in the line
        start = m.start()
        end = m.end()
        return line[start:end].strip()
    else:
        # CFR reference
        return line[m.start():m.end()].strip()


# ---------------------------------------------------------------------------
# Priority order: edge_case > cross_domain > reasoning > knowledge
# (more specific / rarer categories take priority)
# ---------------------------------------------------------------------------

def _classify_line(line: str) -> Optional[str]:
    """Return the claim type for a line, or None if no claim detected.

    Priority order (highest to lowest):
      1. edge_case       — exception / trap language (most specific)
      2. reasoning_strong — explicit "You can/will/should" beats cross_domain
      3. cross_domain    — multi-domain / bridging language
      4. reasoning       — other capability / action-verb language
      5. knowledge       — guideline citations, code references, rule statements
    """
    stripped = line.strip()
    if not stripped or stripped.startswith("#") or stripped.startswith("---"):
        return None

    if _is_edge_case(stripped):
        return "edge_case"
    # Explicit capability language beats cross-domain classification
    if _is_reasoning_strong(stripped):
        return "reasoning"
    if _is_cross_domain(stripped):
        return "cross_domain"
    if _is_reasoning(stripped):
        return "reasoning"
    if _is_knowledge(stripped):
        return "knowledge"
    return None


# ---------------------------------------------------------------------------
# Context builder
# ---------------------------------------------------------------------------

def _build_context(lines: list[str], idx: int, window: int = 1) -> str:
    """Return up to `window` lines before and after line at `idx` (0-based), joined."""
    start = max(0, idx - window)
    end = min(len(lines), idx + window + 1)
    return "\n".join(lines[start:end])


# ---------------------------------------------------------------------------
# Core extraction
# ---------------------------------------------------------------------------

def _find_frontmatter_end(lines: list[str]) -> int:
    """Return the 0-based index of the line AFTER the closing '---' of YAML frontmatter.

    If the file starts with '---', skip until the matching closing '---'.
    Returns 0 if no frontmatter is present.
    """
    if not lines or lines[0].strip() != "---":
        return 0
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return i + 1  # first line after closing fence
    return 0  # no closing fence found — treat whole file as content


def _extract_from_lines(lines: list[str]) -> list[Claim]:
    """
    Parse lines and return a list of Claim objects.

    Skips YAML frontmatter (the --- ... --- block at the top of .md files).
    Priority (to avoid double-counting): edge_case > reasoning_strong > cross_domain > reasoning > knowledge.
    IDs are assigned sequentially within each type after all lines are scanned.
    """
    raw: list[tuple[str, int, str]] = []  # (claim_type, 0-based-idx, stripped_text)

    content_start = _find_frontmatter_end(lines)

    for idx, line in enumerate(lines):
        if idx < content_start:
            continue
        ct = _classify_line(line)
        if ct is not None:
            raw.append((ct, idx, line.strip()))

    # Assign sequential IDs per type
    prefix_map = {
        "knowledge": "K",
        "reasoning": "R",
        "cross_domain": "X",
        "edge_case": "E",
    }
    counters: dict[str, int] = {k: 0 for k in prefix_map}

    claims: list[Claim] = []
    for ct, idx, text in raw:
        counters[ct] += 1
        claim_id = f"{prefix_map[ct]}{counters[ct]:02d}"
        source_section = _extract_source_section(text) if ct == "knowledge" else None
        context = _build_context(lines, idx, window=1)
        claims.append(
            Claim(
                claim_id=claim_id,
                claim_text=text,
                claim_type=ct,
                source_section=source_section,
                line_number=idx + 1,  # 1-based
                context=context,
            )
        )

    return claims


# ---------------------------------------------------------------------------
# Cache I/O
# ---------------------------------------------------------------------------

def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def _load_cache(cache_file: Path, content_hash: str) -> Optional[list[Claim]]:
    """Return cached claims if cache exists and hash matches, else None."""
    if not cache_file.exists():
        return None
    try:
        data = json.loads(cache_file.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    if data.get("hash") != content_hash:
        return None
    return [Claim(**item) for item in data["claims"]]


def _save_cache(cache_file: Path, content_hash: str, claims: list[Claim]) -> None:
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "hash": content_hash,
        "claims": [asdict(c) for c in claims],
    }
    cache_file.write_text(json.dumps(data, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_claims(agent_path: Path) -> list[Claim]:
    """
    Read an agent .md file and return a list of testable Claim objects.

    Results are cached to eval/items/{agent-stem}/claims.json.
    Re-runs with the same content are O(1) (cache hit).
    Re-runs after content changes regenerate the claims.
    """
    content = agent_path.read_text(encoding="utf-8")
    content_hash = _sha256(content)
    cache_file = _cache_path(agent_path)

    cached = _load_cache(cache_file, content_hash)
    if cached is not None:
        return cached

    lines = content.splitlines()
    claims = _extract_from_lines(lines)
    _save_cache(cache_file, content_hash, claims)
    return claims
