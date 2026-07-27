#!/usr/bin/env bash
# Restore wiki/raw/schemas after an AI Studio publish wiped them.
# Prefers origin/knowledge; falls back to last local commit that had wiki/index.md.
set -euo pipefail
cd "$(dirname "$0")/.."

REF="${1:-}"
if [[ -z "$REF" ]]; then
  if git rev-parse --verify origin/knowledge >/dev/null 2>&1; then
    REF="origin/knowledge"
  elif git rev-parse --verify knowledge >/dev/null 2>&1; then
    REF="knowledge"
  else
    REF="$(git log -1 --format=%H -- wiki/index.md 2>/dev/null || true)"
  fi
fi

if [[ -z "$REF" ]]; then
  echo "No knowledge ref found. Pass a commit: $0 <sha-or-branch>" >&2
  exit 1
fi

echo "Restoring knowledge layer from: $REF"
git checkout "$REF" -- wiki/ raw/ schemas/ .agent-wiki.yaml README.md scripts/restore-knowledge.sh 2>/dev/null \
  || git checkout "$REF" -- wiki/ raw/ schemas/ .agent-wiki.yaml README.md

echo "Done. Review with: git status"
echo "Then commit + push so main keeps agent wiki until the next Studio overwrite."
