#!/bin/bash
echo "Make sure to have set CHANNEL_ID, SERVER and DEVELOPMENT in your .env file!"
CHANNEL_ID=${CHANNEL_ID##CHANNEL_ID=}
BUILD_SERVER=${BUILD_SERVER##BUILD_SERVER=}
DEVELOPMENT=${DEVELOPMENT##DEVELOPMENT=}

cat config.json | jq '.channelID = $CHANNEL_ID"' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq '.server = "$BUILD_SERVER"' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq '.development = "$DEVELOPMENT"' config.json > config-temp.json && mv config-temp.json config.json

cat config.json