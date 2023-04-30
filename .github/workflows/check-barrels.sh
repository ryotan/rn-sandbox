#! /usr/bin/env bash

set -exuo pipefail

# Generate barrel files
npm run barrels

# Check if all barrel files are up to date
git add -N .
set +e
git diff --exit-code
EXIT_CODE=$?
set -e

# Add suggest comments
SUGGEST_DIFF_FILE=$(mktemp)
git diff --diff-filter ad >"${SUGGEST_DIFF_FILE}"
git reset --keep && git stash -u && git stash clear
reviewdog -level=error -reporter=github-pr-review -f=diff -f.diff.strip=1 -filter-mode="diff_context" -name="Barrelsby" <"${SUGGEST_DIFF_FILE}"

# If there are changes, fail the build
exit $EXIT_CODE
