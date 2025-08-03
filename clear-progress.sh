#!/bin/bash

# Clear Nebby Neighbor progress script
# Usage: ./clear-progress.sh [chrome]
# Defaults to Safari, pass 'chrome' to use Chrome instead

BROWSER=${1:-safari}
URL="http://localhost:3000"

# JavaScript to clear the progress
CLEAR_SCRIPT="sessionStorage.removeItem('nebby-completed-puzzles'); alert('Progress cleared! Refresh the page to see changes.');"

case $BROWSER in
  chrome)
    echo "Opening Chrome and clearing progress..."
    open -a "Google Chrome" "$URL"
    sleep 2
    # Use AppleScript to execute JavaScript in Chrome
    osascript -e "
    tell application \"Google Chrome\"
      activate
      tell active tab of window 1
        execute javascript \"$CLEAR_SCRIPT\"
      end tell
    end tell
    "
    ;;
  safari|*)
    echo "Opening Safari and clearing progress..."
    open -a Safari "$URL"
    sleep 2
    # Use AppleScript to execute JavaScript in Safari
    osascript -e "
    tell application \"Safari\"
      activate
      tell document 1
        do JavaScript \"$CLEAR_SCRIPT\"
      end tell
    end tell
    "
    ;;
esac

echo "Done! Progress has been cleared."