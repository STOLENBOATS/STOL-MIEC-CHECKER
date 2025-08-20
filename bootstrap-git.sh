#!/usr/bin/env bash
set -euo pipefail
REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  echo "Uso: ./bootstrap-git.sh <repo-url>"
  exit 1
fi

default_branch="main"
release_branch="release"

git init
git checkout -b "$default_branch"
git add .
git commit -m "MIEC v3.9 – initial import"
git remote add origin "$REPO_URL"
git push -u origin "$default_branch"

git checkout -b "$release_branch"
git push -u origin "$release_branch"

git tag v3.9
git push origin v3.9

echo "Pronto! Release criado ao enviar a tag. Veja as Actions no GitHub."
