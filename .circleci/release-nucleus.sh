#!/bin/bash
# Create a file to save the cookies
touch cookies.txt

PASSWORD=$1
CHANNEL_ID=$2
VERSION=$(cat package.json | jq -r '.version')
echo "This is the created Version $VERSION"

# Log in to nucleus
echo "Logging into Nucleus"
curl -L -b cookies.txt -c cookies.txt -u jf:"$PASSWORD" http://release.vipfy.store:3030/rest/auth/login
sleep 3

# Get the previously built version and save the result in a Variable
VERSION_IDS=$(curl -b cookies.txt http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases | jq --arg VERSION "$VERSION" 'map(select(.version==$VERSION))')
echo "Found these Versions $VERSION_IDS"
VERSION_ID=$(echo $VERSION_IDS | jq '.[0].id')
sleep 1

# Trigger the Release
curl -b cookies.txt -X POST http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases/$VERSION_ID/release
sleep 5

# Set Rollout to 100%
curl -b cookies.txt -H "Content-Type: application/json" --request POST http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/rollout --data "{\"version\": $VERSION, \"rollout\": 100}" || true