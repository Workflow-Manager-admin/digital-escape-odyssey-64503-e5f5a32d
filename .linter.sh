#!/bin/bash
cd /home/kavia/workspace/code-generation/digital-escape-odyssey-64503-e5f5a32d/digital_escape_odyssey
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

