#!/bin/bash
echo "Make sure to pass CHANNEL_ID, SERVER and DEVELOPMENT!"
CHANNEL_ID=$1
BUILD_SERVER=$2
DEVELOPMENT=$3

cat config.json | jq --arg CHANNEL_ID "$CHANNEL_ID" '.channelID = $CHANNEL_ID' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq --arg BUILD_SERVER "$BUILD_SERVER" '.server = $BUILD_SERVER' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq --arg DEVELOPMENT "$DEVELOPMENT" '.development = $DEVELOPMENT' config.json > config-temp.json && mv config-temp.json config.json

cat config.json