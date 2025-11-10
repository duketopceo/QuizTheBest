# Scripts

This directory contains utility scripts for the Quiz The Best project.

## Configuration Management

### check_config.py

Validates that all required configuration values are present in `config.json`.

**Usage:**
```bash
python3 scripts/check_config.py
```

**What it does:**
- Checks if `config.json` exists (creates template if missing)
- Validates all required configuration values
- Checks value formats against expected patterns
- Reports missing or invalid values

### generate_env_files.py

Generates `.env` files for backend, frontend, and mobile from `config.json`.

**Usage:**
```bash
python3 scripts/generate_env_files.py
```

**What it does:**
- Reads `config.json` from project root
- Generates `backend/.env`
- Generates `frontend/.env`
- Generates `mobile/.env`

**Note:** Run `check_config.py` first to ensure `config.json` is valid.

## Setup Workflow

1. **First time setup:**
   ```bash
   # Create and validate config.json
   python3 scripts/check_config.py
   
   # Edit config.json with your values
   # Then validate again
   python3 scripts/check_config.py
   
   # Generate .env files
   python3 scripts/generate_env_files.py
   ```

2. **After updating config.json:**
   ```bash
   # Validate changes
   python3 scripts/check_config.py
   
   # Regenerate .env files
   python3 scripts/generate_env_files.py
   ```
