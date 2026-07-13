#!/usr/bin/env bash
set -euo pipefail
export FILTER_BRANCH_SQUELCH_WARNING=1
cd "$(dirname "$0")/.."
git filter-branch -f --msg-filter './scripts/msg-filter.sh' HEAD~3..HEAD
echo "===="
git log -3 --format='%h%n%B----'
