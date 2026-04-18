# Ai-Assassins

## Description
Ai-Assassins is a 0700 automated briefing execution system that generates daily operational briefing files.

## Installation

```bash
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

## Run

```bash
python -m ai_assassins_local
```

or

```bash
ai-assassins
```

## Scheduling

### Cron (Linux/macOS)

Edit your crontab:

```bash
crontab -e
```

Run every day at 07:00 (update paths for your environment):

```cron
0 7 * * * /absolute/path/to/venv/bin/python -m ai_assassins_local >> /absolute/path/to/project/logs/cron.log 2>&1
```

### launchd (macOS)

Create `~/Library/LaunchAgents/com.aiassassins.briefing.plist` with a daily 07:00 trigger and your virtualenv Python path, then load it:

```bash
launchctl load ~/Library/LaunchAgents/com.aiassassins.briefing.plist
```

## Output

Generated briefing files are written to:

- `briefings/YYYY-MM-DD.txt`

## Contributing

1. Create a branch for your change.
2. Keep changes focused and documented.
3. Add or update tests where appropriate.
4. Open a pull request with a clear summary.

## Testing

```bash
pytest
```
