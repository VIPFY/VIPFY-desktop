#!/bin/bash
CHANNEL_ID=$1
BUILD_SERVER=$2
DEVELOPMENT=$3
WEBSOCKET_SERVER=$4

if [ -z "$CHANNEL_ID" ]
then
    echo "Using default Channelid from config.json"
else
    echo "Changing Channelid"
    cat config.json | jq --arg CHANNEL_ID "$CHANNEL_ID" '.channelID = $CHANNEL_ID' config.json > config-temp.json && mv config-temp.json config.json
fi

if [ -z "$BUILD_SERVER" ]
then
    echo "Using default Build server from config.json"
else
    echo "Changing Build server"
    cat config.json | jq --arg BUILD_SERVER "$BUILD_SERVER" '.server = $BUILD_SERVER' config.json > config-temp.json && mv config-temp.json config.json
fi

if [ -z "$DEVELOPMENT" ]
then
    echo "Development variable not set"
else
    echo "Setting development variable"
    cat config.json | jq --arg DEVELOPMENT "$DEVELOPMENT" '.development = $DEVELOPMENT' config.json > config-temp.json && mv config-temp.json config.json
fi

if [ -z "$WEBSOCKET_SERVER" ]
then
    echo "Using default Websocket server from config.json"
else
    echo "Changing Websocket server"
    cat config.json | jq --arg WEBSOCKET_SERVER "$WEBSOCKET_SERVER" '.websocketServer = $WEBSOCKET_SERVER' config.json > config-temp.json && mv config-temp.json config.json
fi

echo "\033[0;36mNew Version"
cat config.json