#!/bin/bash
BRANCH="$(git symbolic-ref HEAD 2>/dev/null)"
BRANCH=${BRANCH##refs/heads/}

git add -A
git commit -m "Preparing the build of the mac version"
git push --set-upstream origin "$BRANCH"