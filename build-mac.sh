#!/bin/bash
# Get the current branch
BRANCH="$(git symbolic-ref HEAD 2>/dev/null)"
BRANCH=${BRANCH##refs/heads/}
NUCLEUS_PW=$(cat .env | grep NUCLEUS_PW)
NUCLEUS_PW=${NUCLEUS_PW##NUCLEUS_PW=}
MAC_PW=${MAC_PW##MAC_PW=}

# Login to the Apple and execute the script
ssh -t nilsvossebein@rotten-fruit.fritz.box '
  export BRANCH='"'$BRANCH'"';
  export NUCLEUS_PW='"'$NUCLEUS_PW'"';
  export MAC_PW='"'$MAC_PW'"';
  CHANNEL_ID=92c1a89400e8f1153d46aa73ec4ce4d9

  echo "Successfully logged into Mac"
  cd Documents
  rm -rf vipfy-desktop
  git clone git@bitbucket.org:vipfymarketplace/vipfy-desktop.git

  cd vipfy-desktop
  git checkout $BRANCH
  git pull
  npm i

  echo "Editing config.json"
  cat config.json

  ./set-dev-variables.sh

  cat config.json
  echo "Unlock the default keychain"
  security unlock-keychain -p "$MAC_PW" /Users/nilsvossebein/Library/Keychains/login.keychain-db

  DEBUG=electron-osx-sign* npm run publish-js
  # npm version prerelease -f
  # git add -A
  # git commit -m"Set Version"
  echo "App successfully built. Uploading now..."
  chmod +x .circleci/release-nucleus.sh
  ./.circleci/release-nucleus.sh "$NUCLEUS_PW" "$CHANNEL_ID"

  echo "Successfully uploaded the App to Nucleus"
  exit
'