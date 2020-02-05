#!/bin/bash
cat config.json | jq '.channelID = "92c1a89400e8f1153d46aa73ec4ce4d9"' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq '.server = "api.dev.vipfy.store"' config.json > config-temp.json && mv config-temp.json config.json
cat config.json | jq '.development = true' config.json > config-temp.json && mv config-temp.json config.json