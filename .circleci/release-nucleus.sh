#!/bin/bash
# Create a file to save the cookies
touch cookies.txt

PASSWORD=$1

# Log in to nucleus
curl -L -b cookies.txt -c cookies.txt -u jf:$PASSWORD http://release.vipfy.store:3030/rest/auth/login

# Get the previously built version and save the result in a Variable
VERSION_ID=$(curl -b cookies.txt http://release.vipfy.store:3030/rest/app/1/channel/92c1a89400e8f1153d46aa73ec4ce4d9/temporary_releases | jq '.[0].id')

# Trigger the Release
curl -b cookies.txt -X POST http://release.vipfy.store:3030/rest/app/1/channel/92c1a89400e8f1153d46aa73ec4ce4d9/temporary_releases/$VERSION_ID/release
