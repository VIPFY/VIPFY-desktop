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
APPLE_APP_PASSWORD=$(cat .env | grep APPLE_APP_PASSWORD)
APPLE_APP_PASSWORD=${APPLE_APP_PASSWORD##APPLE_APP_PASSWORD=}

# Login to the Apple and execute the script
ssh -t nilsvossebein@192.168.1.9 '
  set -e

  export BRANCH='"'$BRANCH'"';
  export NUCLEUS_PW='"'$NUCLEUS_PW'"'
  export MAC_PW='"'$MAC_PW'"'
  export CHANNEL_ID='"'$CHANNEL_ID'"';
  export BUILD_SERVER='"'$BUILD_SERVER'"'
  export APPLE_ID=nv@vipfy.com
  export APPLE_APP_PASSWORD='"'$APPLE_APP_PASSWORD'"'
  export DEVELOPMENT=true

  echo -e "\e[45m\e[39mSuccessfully logged into Mac\e[0m"
  cd Documents
  rm -rf vipfy-desktop
  git clone git@bitbucket.org:vipfymarketplace/vipfy-desktop.git

  cd vipfy-desktop
  git checkout $BRANCH
  git pull
  npm i

  echo -e "\e[96mCreate a custom tag for nucleus\e[0m"
  jq ".version = \"$(cat package.json | jq -r '.version')-dev-$(date +%Y-%m-%d)\" " package.json > package-temp.json && mv package-temp.json package.json

  echo -e "\e[45m\e[39mEditing config.json\e[0m"
  echo -e "\e[96mOld Version\e[0m"
  cat config.json
  ./set-dev-variables.sh "$CHANNEL_ID" "$BUILD_SERVER" true

  echo -e "\e[96mUnlocking the default keychain\e[0m"
  security unlock-keychain -p $MAC_PW /Users/nilsvossebein/Library/Keychains/login.keychain-db

  DEBUG=electron-osx-sign* npm run publish-js
  echo -e "\e[96mApp successfully built. Uploading now...\e[0m"
  chmod +x .circleci/release-nucleus.sh
  ./.circleci/release-nucleus.sh "$NUCLEUS_PW" "$CHANNEL_ID"

  echo -e "\e[96mSuccessfully uploaded the App to Nucleus\e[0m"
  exit
'