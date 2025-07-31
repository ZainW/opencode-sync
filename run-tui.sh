#!/bin/bash
# Wrapper script to run TUI with proper terminal handling

cd "$(dirname "$0")"

# Ensure we're in a proper terminal
if [ ! -t 0 ] || [ ! -t 1 ]; then
    echo "This script must be run in a terminal"
    exit 1
fi

# Run the TUI with explicit terminal handling
exec bash ./tui/opencode-sync-tui-bash