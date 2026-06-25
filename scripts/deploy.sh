#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMMIT_MESSAGE=""
DO_PUSH=0

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy.sh
  scripts/deploy.sh --commit "Commit message"
  scripts/deploy.sh --commit "Commit message" --push

Runs the local deployment checks every time. With --commit, stages the dashboard
files and creates a commit. With --push, pushes the current branch after commit.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --commit)
      COMMIT_MESSAGE="${2:-}"
      shift 2
      ;;
    --push)
      DO_PUSH=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

echo "==> Validate manifest"
python3 -m json.tool data/manifest.json >/tmp/golf_manifest_check.json

if [[ -d data/events ]]; then
  echo "==> Validate event JSON"
  find data/events -name '*.json' -print0 | sort -z | while IFS= read -r -d '' file; do
    python3 -m json.tool "$file" >/tmp/golf_event_check.json
  done
fi

if [[ -d data/rules ]]; then
  echo "==> Validate rules JSON"
  find data/rules -name '*.json' -print0 | sort -z | while IFS= read -r -d '' file; do
    python3 -m json.tool "$file" >/tmp/golf_rules_check.json
  done
fi

echo "==> Check JavaScript"
node --check app.js

echo "==> Check whitespace"
git diff --check

APP_VERSION="$(grep -o 'app\.js?v=[0-9]\+' index.html | head -1 || true)"
if [[ -z "$APP_VERSION" ]]; then
  echo "Could not find app.js cache version in index.html" >&2
  exit 1
fi
echo "==> Cache version: $APP_VERSION"

if [[ -z "$COMMIT_MESSAGE" ]]; then
  echo "Checks passed. No commit or push requested."
  git status --short
  exit 0
fi

echo "==> Stage dashboard files"
git add app.js index.html README.md scripts data

echo "==> Commit"
git commit -m "$COMMIT_MESSAGE"

if [[ "$DO_PUSH" -eq 1 ]]; then
  BRANCH="$(git branch --show-current)"
  echo "==> Push $BRANCH"
  git push origin "$BRANCH"
else
  echo "Commit created. Push skipped."
fi
