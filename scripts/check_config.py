#!/usr/bin/env python3
"""
Configuration Checker for Quiz The Best Application

This script validates that all required configuration values are present.
Run this script to check what configuration values are missing.

Usage:
    python check_config.py

The script will:
1. Check for a config.json file (gitignored)
2. Validate all required configuration values
3. Report what's missing or invalid
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_success(message: str):
    print(f"{Colors.GREEN}✓{Colors.RESET} {message}")

def print_error(message: str):
    print(f"{Colors.RED}✗{Colors.RESET} {message}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {message}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {message}")

def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

# Configuration requirements
REQUIRED_CONFIG = {
    "backend": {
        "required": {
            "AWS_REGION": {
                "description": "AWS Region (e.g., us-east-1)",
                "pattern": r"^[a-z0-9-]+$",
                "example": "us-east-1"
            },
            "AWS_ACCESS_KEY_ID": {
                "description": "AWS Access Key ID",
                "pattern": r"^[A-Z0-9]{20}$",
                "example": "AKIAIOSFODNN7EXAMPLE"
            },
            "AWS_SECRET_ACCESS_KEY": {
                "description": "AWS Secret Access Key",
                "pattern": r"^.{40,}$",
                "example": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
            },
            "COGNITO_USER_POOL_ID": {
                "description": "AWS Cognito User Pool ID",
                "pattern": r"^[a-z0-9-]+_[a-zA-Z0-9]+$",
                "example": "us-east-1_XXXXXXXXX"
            },
            "COGNITO_CLIENT_ID": {
                "description": "AWS Cognito App Client ID",
                "pattern": r"^[a-zA-Z0-9]+$",
                "example": "1234567890abcdefghijklmn"
            },
            "FIREBASE_PROJECT_ID": {
                "description": "Firebase Project ID",
                "pattern": r"^[a-z0-9-]+$",
                "example": "quiz-the-best-12345"
            },
            "FIREBASE_PRIVATE_KEY": {
                "description": "Firebase Private Key (full key with BEGIN/END markers)",
                "pattern": r"-----BEGIN PRIVATE KEY-----",
                "example": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
            },
            "FIREBASE_CLIENT_EMAIL": {
                "description": "Firebase Service Account Email",
                "pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
                "example": "firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com"
            },
            "BEDROCK_AGENT_ID": {
                "description": "AWS Bedrock Agent ID",
                "pattern": r"^[A-Z0-9]+$",
                "example": "2DNZCRAKF9"
            },
            "BEDROCK_AGENT_ALIAS_ID": {
                "description": "AWS Bedrock Agent Alias ID",
                "pattern": r"^[A-Z0-9]+$",
                "example": "OQNLDGNQDS"
            }
        },
        "optional": {
            "BEDROCK_MODEL_ID": {
                "description": "AWS Bedrock Model ID (default: amazon.nova-micro-v1:0)",
                "pattern": r"^[a-z0-9.:-]+$",
                "example": "amazon.nova-micro-v1:0",
                "default": "amazon.nova-micro-v1:0"
            },
            "BEDROCK_MAX_TOKENS": {
                "description": "Max tokens for Bedrock (default: 2000)",
                "pattern": r"^\d+$",
                "example": "2000",
                "default": "2000"
            },
            "SERPAPI_KEY": {
                "description": "SerpAPI Key (optional, for enhanced search)",
                "pattern": r"^[a-zA-Z0-9]+$",
                "example": "your-serpapi-key"
            },
            "PORT": {
                "description": "Backend server port (default: 3000)",
                "pattern": r"^\d+$",
                "example": "3000",
                "default": "3000"
            },
            "NODE_ENV": {
                "description": "Node environment (default: development)",
                "pattern": r"^(development|production|test)$",
                "example": "development",
                "default": "development"
            },
            "ALLOWED_ORIGINS": {
                "description": "CORS allowed origins (comma-separated)",
                "pattern": r"^.+$",
                "example": "http://localhost:5173,http://localhost:3000"
            }
        }
    },
    "frontend": {
        "required": {
            "VITE_API_URL": {
                "description": "Backend API URL",
                "pattern": r"^https?://.+$",
                "example": "http://localhost:3000/api"
            },
            "VITE_AWS_REGION": {
                "description": "AWS Region (should match backend)",
                "pattern": r"^[a-z0-9-]+$",
                "example": "us-east-1"
            },
            "VITE_COGNITO_USER_POOL_ID": {
                "description": "AWS Cognito User Pool ID (should match backend)",
                "pattern": r"^[a-z0-9-]+_[a-zA-Z0-9]+$",
                "example": "us-east-1_XXXXXXXXX"
            },
            "VITE_COGNITO_CLIENT_ID": {
                "description": "AWS Cognito App Client ID (should match backend)",
                "pattern": r"^[a-zA-Z0-9]+$",
                "example": "1234567890abcdefghijklmn"
            }
        },
        "optional": {}
    },
    "mobile": {
        "required": {
            "API_URL": {
                "description": "Backend API URL",
                "pattern": r"^https?://.+$",
                "example": "http://localhost:3000/api"
            },
            "AWS_REGION": {
                "description": "AWS Region (should match backend)",
                "pattern": r"^[a-z0-9-]+$",
                "example": "us-east-1"
            },
            "COGNITO_USER_POOL_ID": {
                "description": "AWS Cognito User Pool ID (should match backend)",
                "pattern": r"^[a-z0-9-]+_[a-zA-Z0-9]+$",
                "example": "us-east-1_XXXXXXXXX"
            },
            "COGNITO_CLIENT_ID": {
                "description": "AWS Cognito App Client ID (should match backend)",
                "pattern": r"^[a-zA-Z0-9]+$",
                "example": "1234567890abcdefghijklmn"
            }
        },
        "optional": {}
    }
}

def load_config() -> Dict:
    """Load configuration from config.json file"""
    # Get project root (parent of scripts directory)
    project_root = Path(__file__).parent.parent
    config_path = project_root / "config.json"
    
    if not config_path.exists():
        return {}
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON in config.json: {e}")
        return {}
    except Exception as e:
        print_error(f"Error reading config.json: {e}")
        return {}

def validate_value(key: str, value: str, config_spec: Dict) -> Tuple[bool, Optional[str]]:
    """Validate a configuration value against its specification"""
    if not value or value.strip() == "":
        return False, "Value is empty"
    
    # Check pattern if provided
    if "pattern" in config_spec:
        pattern = config_spec["pattern"]
        if not re.search(pattern, value):
            return False, f"Value doesn't match expected pattern: {pattern}"
    
    return True, None

def check_config_section(section_name: str, section_config: Dict, config: Dict) -> Tuple[int, int]:
    """Check a configuration section (backend, frontend, mobile)"""
    required = section_config.get("required", {})
    optional = section_config.get("optional", {})
    
    missing_required = []
    invalid_required = []
    missing_optional = []
    invalid_optional = []
    
    # Check required values
    for key, spec in required.items():
        value = config.get(key)
        if not value:
            missing_required.append((key, spec))
        else:
            is_valid, error = validate_value(key, str(value), spec)
            if not is_valid:
                invalid_required.append((key, spec, error))
    
    # Check optional values
    for key, spec in optional.items():
        value = config.get(key)
        if value:
            is_valid, error = validate_value(key, str(value), spec)
            if not is_valid:
                invalid_optional.append((key, spec, error))
    
    # Print results
    print_header(f"{section_name.upper()} Configuration")
    
    if missing_required:
        print_error(f"Missing {len(missing_required)} required configuration value(s):")
        for key, spec in missing_required:
            print(f"  • {key}: {spec['description']}")
            print(f"    Example: {spec['example']}")
    
    if invalid_required:
        print_error(f"Invalid {len(invalid_required)} required configuration value(s):")
        for key, spec, error in invalid_required:
            print(f"  • {key}: {error}")
            print(f"    Expected format: {spec.get('example', 'N/A')}")
    
    if missing_required or invalid_required:
        print()
    
    if not missing_required and not invalid_required:
        print_success(f"All required {section_name} configuration values are present and valid!")
    
    if invalid_optional:
        print_warning(f"Invalid optional configuration value(s):")
        for key, spec, error in invalid_optional:
            print(f"  • {key}: {error}")
    
    total_required = len(required)
    valid_required = total_required - len(missing_required) - len(invalid_required)
    
    return valid_required, total_required

def generate_config_template():
    """Generate a config.json template file"""
    # Get project root (parent of scripts directory)
    project_root = Path(__file__).parent.parent
    template = {
        "backend": {},
        "frontend": {},
        "mobile": {}
    }
    
    for section_name, section_config in REQUIRED_CONFIG.items():
        required = section_config.get("required", {})
        optional = section_config.get("optional", {})
        
        for key, spec in required.items():
            template[section_name][key] = spec.get("example", "")
        
        for key, spec in optional.items():
            if "default" in spec:
                template[section_name][key] = spec["default"]
            else:
                template[section_name][key] = spec.get("example", "")
    
    # Write template to project root
    project_root = Path(__file__).parent.parent
    config_path = project_root / "config.json"
    with open(config_path, 'w') as f:
        json.dump(template, f, indent=2)
    
    return template

def main():
    """Main function"""
    print_header("Quiz The Best - Configuration Checker")
    
    # Check if config.json exists
    project_root = Path(__file__).parent.parent
    config_path = project_root / "config.json"
    if not config_path.exists():
        print_warning("config.json file not found!")
        print_info("Creating config.json template...")
        
        generate_config_template()
        
        print_success("Created config.json template file")
        print_info("Please fill in your configuration values in config.json")
        print_info("Then run this script again to validate your configuration")
        return 1
    
    # Load configuration
    config = load_config()
    if not config:
        print_error("Failed to load configuration")
        return 1
    
    # Check each section
    total_valid = 0
    total_required = 0
    
    for section_name, section_config in REQUIRED_CONFIG.items():
        section_data = config.get(section_name, {})
        valid, required = check_config_section(section_name, section_config, section_data)
        total_valid += valid
        total_required += required
    
    # Summary
    print_header("Summary")
    
    if total_valid == total_required:
        print_success(f"All {total_required} required configuration values are present and valid!")
        print_info("Your configuration is complete and ready to use.")
        return 0
    else:
        missing_count = total_required - total_valid
        print_error(f"{missing_count} required configuration value(s) are missing or invalid")
        print_info("Please update config.json with the missing values and run this script again.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
