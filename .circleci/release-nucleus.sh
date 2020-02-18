#!/bin/bash
# Create a file to save the cookies
touch cookies.txt

PASSWORD=$1
CHANNEL_ID=$2
VERSION=$(cat package.json | jq -r '.version')
echo "This is the created VERSION $VERSION"

# Log in to nucleus
echo "Logging into Nucleus"
curl -L -b cookies.txt -c cookies.txt -u jf:"$PASSWORD" http://release.vipfy.store:3030/rest/auth/login
sleep 3

# Get the previously built version and save the result in a Variable
VERSION_IDS=$(curl -b cookies.txt http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases | jq --arg VERSION "$VERSION" 'map(select(.version==$VERSION))')
echo "Found this Versions $VERSION_IDS"
sleep 1

VERSION_ID=$(echo $VERSION_IDS | jq '.[0].id')
echo "$VERSION_ID"

# VERSION_NAME=$(curl -b cookies.txt http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases | jq '.[0].version')
# echo "New Version will be called $VERSION_NAME"
# sleep 2

# # Trigger the Release
# curl -b cookies.txt -X POST http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases/$VERSION_ID/release
# sleep 5

# # Set Rollout to 100%
# curl -b cookies.txt -H "Content-Type: application/json" --request POST http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/rollout --data "{\"version\": $VERSION_NAME, \"rollout\": 100}" || true