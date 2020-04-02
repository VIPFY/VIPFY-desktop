#!/bin/bash
# Get the current branch
BRANCH="$(git symbolic-ref HEAD 2>/dev/null)"
BRANCH=${BRANCH##refs/heads/}
NUCLEUS_PW=$(cat .env | grep NUCLEUS_PW)
NUCLEUS_PW=${NUCLEUS_PW##NUCLEUS_PW=}
MAC_PW=$(cat .env | grep MAC_PW)
MAC_PW=${MAC_PW##MAC_PW=}
CHANNEL_ID=$(cat .env | grep CHANNEL_ID)
CHANNEL_ID=${CHANNEL_ID##CHANNEL_ID=}
BUILD_SERVER=$(cat .env | grep BUILD_SERVER)
BUILD_SERVER=${BUILD_SERVER##BUILD_SERVER=}
DEVELOPMENT=$(cat .env | grep DEVELOPMENT)
DEVELOPMENT=${DEVELOPMENT##DEVELOPMENT=}
# fxvw-rsye-xguu-pgur
# Login to the Apple and execute the script
ssh -t nilsvossebein@192.168.1.9 '
  export BRANCH='"'$BRANCH'"';
  export NUCLEUS_PW='"'$NUCLEUS_PW'"'
  export MAC_PW='"'$MAC_PW'"'
  export CHANNEL_ID='"'$CHANNEL_ID'"';
  export BUILD_SERVER='"'$BUILD_SERVER'"'
  export DEVELOPMENT='"'$DEVELOPMENT'"'
  CHANNEL_ID=92c1a89400e8f1153d46aa73ec4ce4d9

  echo "Successfully logged into Mac"
  cd Documents
  rm -rf vipfy-desktop
  git clone git@bitbucket.org:vipfymarketplace/vipfy-desktop.git

  cd vipfy-desktop
  git checkout $BRANCH
  git pull
  npm i

  echo "Create a custom tag for nucleus"
  jq ".version = \"$(cat package.json | jq -r '.version')-dev-$(date +%Y-%m-%d)\" " package.json > package-temp.json && mv package-temp.json package.json

  echo "Editing config.json"
  cat config.json
  ./set-dev-variables.sh "$CHANNEL_ID" "$BUILD_SERVER" "$DEVELOPMENT"

  echo "Unlock the default keychain"
  security unlock-keychain -p $MAC_PW /Users/nilsvossebein/Library/Keychains/login.keychain-db

  DEBUG=electron-osx-sign* npm run publish-js
  echo "App successfully built. Uploading now..."
  chmod +x .circleci/release-nucleus.sh
  ./.circleci/release-nucleus.sh "$NUCLEUS_PW" "$CHANNEL_ID"

  echo "Successfully uploaded the App to Nucleus"
  exit
'