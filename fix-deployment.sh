#!/bin/bash

# Add all the fixed files
git add src/utils/sessionNotesImproved.js
git add src/utils/fetchSession.js  
git add src/styles/features/session-notes.css
git add src/styles/index.css

# Commit with a descriptive message
git commit -m "fix: resolve session notes updateStatus error and add localStorage fallbacks

- Replace sessionNotesImproved.js with clean implementation
- Fix all updateStatus method calls 
- Add comprehensive localStorage fallbacks for API failures
- Add proper CSS styles for session notes
- Ensure app works completely offline"

# Push to trigger new deployment
git push origin main

echo "✅ Fixes committed and pushed - new deployment will start automatically"