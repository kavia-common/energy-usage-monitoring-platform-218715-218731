#!/bin/bash
cd /home/kavia/workspace/code-generation/energy-usage-monitoring-platform-218715-218731/energy_dashboard_ui
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

