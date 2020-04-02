#!/bin/bash
BRANCH="$(git symbolic-ref HEAD 2>/dev/null)"
BRANCH=${BRANCH##refs/heads/}
IS_DEV=$1

git add -A
git commit -m "Preparing the build of the mac version"

if [ "$IS_DEV" = true ]
then
    echo "Updating the patch number to make sure nucleus is happy"
    npm version patch
fi

git push --set-upstream origin "$BRANCH"