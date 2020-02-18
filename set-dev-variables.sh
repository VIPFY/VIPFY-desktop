#!/bin/bash
echo "Make sure to have set CHANNEL_ID, SERVER and DEVELOPMENT in your .env file!"
CHANNEL_ID=$1
BUILD_SERVER=$2
DEVELOPMENT=$3

cat config.json | jq --arg CHANNEL_ID "$CHANNEL_ID" '.channelID = $CHANNEL_ID' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq '.server = $BUILD_SERVER' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq '.development = $DEVELOPMENT' config.json > config-temp.json && mv config-temp.json config.json

cat config.json