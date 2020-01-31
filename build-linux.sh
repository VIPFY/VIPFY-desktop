#!/bin/bash
cat config.json | jq '.channelID = "92c1a89400e8f1153d46aa73ec4ce4d9"' config.json > config-temp.json && mv config-temp.json config.json

# 4e2105365ea5c7e823cb7af42450b29a