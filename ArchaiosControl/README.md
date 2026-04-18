# ArchaiosControl (macOS App)

ArchaiosControl is a native SwiftUI macOS dashboard for operating local Archaios OS infrastructure.

## What It Does
- Runs the daily pipeline (`jobs/daily/run_daily.py`)
- Pushes Archaios OS changes to GitHub (`git add`, `git commit`, `git push`)
- Deploys the Cloudflare worker (`wrangler deploy`)
- Lists files in `logs/`
- Loads and displays `metrics/metrics.json`
- Stores executed interpreter/shell commands and outputs in an in-app console

## Project Settings
- App name: `ArchaiosControl`
- Platform: macOS
- Deployment target: macOS 13.0+
- Swift version: 5.9

## Default Archaios OS Path
The app defaults to:

`~/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS`

You can change this in the **Settings** tab.

## Open and Run
1. Open `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/ArchaiosControl/ArchaiosControl.xcodeproj` in Xcode.
2. Select the `ArchaiosControl` scheme.
3. Build and run.

## Required Local Tools
- `python3` (or configure custom command in Settings)
- `git`
- `wrangler` (Cloudflare CLI)

## How Task Triggers Work
- **Run Daily Pipeline**: executes `python3 jobs/daily/run_daily.py` in the Archaios OS repo.
- **Push to GitHub**: executes `git add .`, `git commit -m ...`, `git push` in the Archaios OS repo.
- **Deploy Cloudflare Worker**: executes `wrangler deploy` in `cloudflare_worker/`.
- **View Logs**: executes `ls -1 logs` and displays files.
- **Display Metrics**: reads `metrics/metrics.json` and updates dashboard cards.

## Error Handling
- Non-zero command exits are surfaced in the UI.
- stderr/stdout are written to the in-app console.
- Busy-state lock prevents overlapping task execution.

## Notes
- If `xcodebuild` asks for license acceptance on your machine, run:
  - `sudo xcodebuild -license`
