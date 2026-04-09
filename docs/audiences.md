# Audiences

This repository serves three audiences with different contracts.

## User

Users copy `agents/*.md`, `references/examples/`, and `scenarios/` into their own toolchain. They should not need to understand the registry or calibration internals.

## Maintainer

Maintainers edit `registry.yaml`, `docs/lifecycle.md`, `docs/mcp-capabilities.md`, `references/style-guide.md`, and the calibration scaffolding under `calibration/` and `scripts/`.

## Researcher

Researchers inspect `docs/superpowers/specs/`, `calibration/`, and `eval/` to understand methodology, calibration outputs, and the simple self-improvement loop.

## Boundary

`registry.yaml` is repo-visible and authoritative for maintainer tooling, but it is not part of the install contract for users.
