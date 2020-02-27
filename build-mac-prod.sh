#!/bin/bash
# Get the current branch, make sure that it is the Release!
BRANCH="$(git symbolic-ref HEAD 2>/dev/null)"
BRANCH=${BRANCH##refs/heads/}
NUCLEUS_PW=$(cat .env | grep NUCLEUS_PW)
NUCLEUS_PW=${NUCLEUS_PW##NUCLEUS_PW=}
MAC_PW=$(cat .env | grep MAC_PW)
MAC_PW=${MAC_PW##MAC_PW=}

# Login to the Mac and execute the script
ssh -t nilsvossebein@192.168.1.9 '
  export BRANCH='"'$BRANCH'"';
  export NUCLEUS_PW='"'$NUCLEUS_PW'"'
  export MAC_PW='"'$MAC_PW'"'

  echo "Successfully logged into Mac"
  cd Documents
  rm -rf vipfy-desktop
  git clone git@bitbucket.org:vipfymarketplace/vipfy-desktop.git

  cd vipfy-desktop
  git checkout $BRANCH
  git pull
  npm i

  echo "Unlock the default keychain"
  security unlock-keychain -p $MAC_PW /Users/nilsvossebein/Library/Keychains/login.keychain-db

  DEBUG=electron-osx-sign* npm run publish-js-obfuscated
  echo "App successfully built. Uploading now..."
  chmod +x .circleci/release-nucleus.sh
  ./.circleci/release-nucleus.sh "$NUCLEUS_PW" 4e2105365ea5c7e823cb7af42450b29a

  echo "Successfully uploaded the App to Nucleus"
  exit
'