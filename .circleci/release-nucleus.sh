#!/bin/bash
# Create a file to save the cookies
touch cookies.txt

PASSWORD=$1
CHANNEL_ID=$2

# Log in to nucleus
curl -L -b cookies.txt -c cookies.txt -u jf:$PASSWORD http://release.vipfy.store:3030/rest/auth/login

# Get the previously built version and save the result in a Variable
VERSION_ID=$(curl -b cookies.txt http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases | jq '.[0].id')

# Trigger the Release
#curl -b cookies.txt -X POST http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/temporary_releases/$VERSION_ID/release

# Set Rollout to 100%
#curl -b cookies.txt --request POST http://release.vipfy.store:3030/rest/app/1/channel/$CHANNEL_ID/rollout --data "version=" --data "rollout=100"
