#!/usr/bin/env python3
"""
Generate .env files from config.json

This script reads config.json and generates .env files for:
- backend/.env
- frontend/.env
- mobile/.env

Usage:
    python3 generate_env_files.py
"""

import json
import sys
from pathlib import Path

def load_config() -> dict:
    """Load configuration from config.json"""
    # Get project root (parent of scripts directory)
    project_root = Path(__file__).parent.parent
    config_path = project_root / "config.json"
    
    if not config_path.exists():
        print("❌ config.json not found!")
        print("Run check_config.py first to create the template.")
        sys.exit(1)
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error reading config.json: {e}")
        sys.exit(1)

def generate_backend_env(config: dict) -> str:
    """Generate backend .env file content"""
    backend_config = config.get("backend", {})
    
    lines = [
        "# Server",
        f"PORT={backend_config.get('PORT', '3000')}",
        f"NODE_ENV={backend_config.get('NODE_ENV', 'development')}",
        "",
        "# AWS",
        f"AWS_REGION={backend_config.get('AWS_REGION', '')}",
        f"AWS_ACCESS_KEY_ID={backend_config.get('AWS_ACCESS_KEY_ID', '')}",
        f"AWS_SECRET_ACCESS_KEY={backend_config.get('AWS_SECRET_ACCESS_KEY', '')}",
        "",
        "# Cognito",
        f"COGNITO_USER_POOL_ID={backend_config.get('COGNITO_USER_POOL_ID', '')}",
        f"COGNITO_CLIENT_ID={backend_config.get('COGNITO_CLIENT_ID', '')}",
        "",
        "# Firebase",
        f"FIREBASE_PROJECT_ID={backend_config.get('FIREBASE_PROJECT_ID', '')}",
        f"FIREBASE_PRIVATE_KEY={backend_config.get('FIREBASE_PRIVATE_KEY', '')}",
        f"FIREBASE_CLIENT_EMAIL={backend_config.get('FIREBASE_CLIENT_EMAIL', '')}",
        "",
        "# SerpAPI (optional)",
        f"SERPAPI_KEY={backend_config.get('SERPAPI_KEY', '')}",
        "",
        "# CORS",
        f"ALLOWED_ORIGINS={backend_config.get('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')}",
        "",
        "# Bedrock",
        f"BEDROCK_MODEL_ID={backend_config.get('BEDROCK_MODEL_ID', 'amazon.nova-micro-v1:0')}",
        f"BEDROCK_MAX_TOKENS={backend_config.get('BEDROCK_MAX_TOKENS', '2000')}",
        f"BEDROCK_AGENT_ID={backend_config.get('BEDROCK_AGENT_ID', '')}",
        f"BEDROCK_AGENT_ALIAS_ID={backend_config.get('BEDROCK_AGENT_ALIAS_ID', '')}",
    ]
    
    return "\n".join(lines)

def generate_frontend_env(config: dict) -> str:
    """Generate frontend .env file content"""
    frontend_config = config.get("frontend", {})
    
    lines = [
        f"VITE_API_URL={frontend_config.get('VITE_API_URL', '')}",
        f"VITE_AWS_REGION={frontend_config.get('VITE_AWS_REGION', '')}",
        f"VITE_COGNITO_USER_POOL_ID={frontend_config.get('VITE_COGNITO_USER_POOL_ID', '')}",
        f"VITE_COGNITO_CLIENT_ID={frontend_config.get('VITE_COGNITO_CLIENT_ID', '')}",
    ]
    
    return "\n".join(lines)

def generate_mobile_env(config: dict) -> str:
    """Generate mobile .env file content"""
    mobile_config = config.get("mobile", {})
    
    lines = [
        f"API_URL={mobile_config.get('API_URL', '')}",
        f"AWS_REGION={mobile_config.get('AWS_REGION', '')}",
        f"COGNITO_USER_POOL_ID={mobile_config.get('COGNITO_USER_POOL_ID', '')}",
        f"COGNITO_CLIENT_ID={mobile_config.get('COGNITO_CLIENT_ID', '')}",
    ]
    
    return "\n".join(lines)

def main():
    """Main function"""
    print("Generating .env files from config.json...")
    
    config = load_config()
    
    # Get project root
    project_root = Path(__file__).parent.parent
    
    # Generate backend .env
    backend_env = generate_backend_env(config)
    backend_path = project_root / "backend/.env"
    backend_path.parent.mkdir(parents=True, exist_ok=True)
    with open(backend_path, 'w') as f:
        f.write(backend_env)
    print(f"✓ Generated {backend_path}")
    
    # Generate frontend .env
    frontend_env = generate_frontend_env(config)
    frontend_path = project_root / "frontend/.env"
    frontend_path.parent.mkdir(parents=True, exist_ok=True)
    with open(frontend_path, 'w') as f:
        f.write(frontend_env)
    print(f"✓ Generated {frontend_path}")
    
    # Generate mobile .env
    mobile_env = generate_mobile_env(config)
    mobile_path = project_root / "mobile/.env"
    mobile_path.parent.mkdir(parents=True, exist_ok=True)
    with open(mobile_path, 'w') as f:
        f.write(mobile_env)
    print(f"✓ Generated {mobile_path}")
    
    print("\n✅ All .env files generated successfully!")
    print("Note: .env files are gitignored and should not be committed.")

if __name__ == "__main__":
    main()
