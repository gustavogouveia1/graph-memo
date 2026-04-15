#!/usr/bin/env bash
set -euo pipefail

FIXTURE_ROOT="tests/fixtures/sample-workspace"

rm -rf "$FIXTURE_ROOT/.graphmemo"
rm -rf "$FIXTURE_ROOT/knowledge/imports"
mkdir -p "$FIXTURE_ROOT/knowledge/imports"
