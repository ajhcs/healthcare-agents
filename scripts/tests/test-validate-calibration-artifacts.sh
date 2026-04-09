#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

python3 scripts/validate-calibration-artifacts.py \
  scripts/test-fixtures/calibration/seed-valid.yaml \
  scripts/test-fixtures/calibration/lint-result-valid.yaml \
  scripts/test-fixtures/calibration/gap-report-valid.yaml \
  scripts/test-fixtures/calibration/synthesis-valid.yaml \
  scripts/test-fixtures/calibration/applied-trace-valid.yaml \
  scripts/test-fixtures/calibration/run-manifest-valid.yaml \
  >/dev/null

! python3 scripts/validate-calibration-artifacts.py scripts/test-fixtures/calibration/seed-invalid.yaml >/dev/null 2>&1
! python3 scripts/validate-calibration-artifacts.py scripts/test-fixtures/calibration/lint-result-invalid.yaml >/dev/null 2>&1
! python3 scripts/validate-calibration-artifacts.py scripts/test-fixtures/calibration/gap-report-invalid.yaml >/dev/null 2>&1
! python3 scripts/validate-calibration-artifacts.py scripts/test-fixtures/calibration/synthesis-invalid.yaml >/dev/null 2>&1
! python3 scripts/validate-calibration-artifacts.py scripts/test-fixtures/calibration/applied-trace-invalid.yaml >/dev/null 2>&1
! python3 scripts/validate-calibration-artifacts.py scripts/test-fixtures/calibration/run-manifest-invalid.yaml >/dev/null 2>&1
