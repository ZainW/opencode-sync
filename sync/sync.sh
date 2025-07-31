#!/bin/bash

# opencode-sync: Synchronize opencode profiles across machines
# Usage: ./sync.sh [profile] [action]

set -e

SYNC_DIR="$HOME/.local/share/opencode-sync"
PROFILES_DIR="$SYNC_DIR/profiles"
CURRENT_PROFILE_FILE="$SYNC_DIR/.current-profile"
REPO_URL="${OPENCODE_SYNC_REPO:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[opencode-sync]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Initialize git repo if not exists
init_repo() {
    if [ ! -d "$SYNC_DIR/.git" ]; then
        log "Initializing git repository..."
        cd "$SYNC_DIR"
        git init
        echo "# opencode-sync profiles" > README.md
        echo ".current-profile" > .gitignore
        echo "*.log" >> .gitignore
        git add .
        git commit -m "Initial commit: opencode-sync setup"
        
        if [ -n "$REPO_URL" ]; then
            git remote add origin "$REPO_URL"
            log "Added remote origin: $REPO_URL"
        fi
    fi
}

# Get current active profile
get_current_profile() {
    if [ -f "$CURRENT_PROFILE_FILE" ]; then
        cat "$CURRENT_PROFILE_FILE"
    else
        echo "default"
    fi
}

# Set active profile
set_profile() {
    local profile="$1"
    if [ ! -d "$PROFILES_DIR/$profile" ]; then
        error "Profile '$profile' does not exist"
    fi
    
    echo "$profile" > "$CURRENT_PROFILE_FILE"
    deploy_profile "$profile"
    success "Switched to profile: $profile"
}

# Deploy profile to opencode config locations
deploy_profile() {
    local profile="$1"
    local profile_dir="$PROFILES_DIR/$profile"
    
    log "Deploying profile: $profile"
    
    # Backup current config
    if [ -f "$HOME/.config/opencode/opencode.json" ]; then
        cp "$HOME/.config/opencode/opencode.json" "$HOME/.config/opencode/opencode.json.backup"
    fi
    
    # Deploy config
    mkdir -p "$HOME/.config/opencode"
    if [ -f "$profile_dir/config/opencode.json" ]; then
        cp "$profile_dir/config/opencode.json" "$HOME/.config/opencode/opencode.json"
    fi
    
    # Deploy agents
    if [ -d "$profile_dir/config/agents" ]; then
        mkdir -p "$HOME/.config/opencode/agent"
        cp -r "$profile_dir/config/agents/"* "$HOME/.config/opencode/agent/" 2>/dev/null || true
    fi
    
    success "Profile '$profile' deployed"
}

# Sync with remote repository
sync_remote() {
    if [ -z "$REPO_URL" ]; then
        warn "No remote repository configured. Set OPENCODE_SYNC_REPO environment variable."
        return
    fi
    
    cd "$SYNC_DIR"
    
    # Check if we have a remote
    if ! git remote get-url origin >/dev/null 2>&1; then
        git remote add origin "$REPO_URL"
    fi
    
    log "Syncing with remote repository..."
    
    # Commit local changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        git add .
        git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" || true
    fi
    
    # Pull and push
    git pull origin main --rebase || warn "Failed to pull from remote"
    git push origin main || warn "Failed to push to remote"
    
    success "Sync completed"
}

# List available profiles
list_profiles() {
    log "Available profiles:"
    current=$(get_current_profile)
    
    for profile in "$PROFILES_DIR"/*; do
        if [ -d "$profile" ]; then
            profile_name=$(basename "$profile")
            if [ "$profile_name" = "$current" ]; then
                echo -e "  ${GREEN}* $profile_name${NC} (active)"
            else
                echo "    $profile_name"
            fi
        fi
    done
}

# Create new profile
create_profile() {
    local profile="$1"
    local template="${2:-default}"
    
    if [ -d "$PROFILES_DIR/$profile" ]; then
        error "Profile '$profile' already exists"
    fi
    
    log "Creating profile: $profile"
    
    # Copy from template
    if [ -d "$PROFILES_DIR/$template" ]; then
        cp -r "$PROFILES_DIR/$template" "$PROFILES_DIR/$profile"
    else
        mkdir -p "$PROFILES_DIR/$profile/config/agents"
        mkdir -p "$PROFILES_DIR/$profile/projects"
        mkdir -p "$PROFILES_DIR/$profile/scripts"
        
        # Create basic config
        cat > "$PROFILES_DIR/$profile/config/opencode.json" << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-20250514",
  "autoupdate": true
}
EOF
    fi
    
    success "Profile '$profile' created"
}

# Main command handling
case "${1:-help}" in
    "init")
        init_repo
        ;;
    "list"|"ls")
        list_profiles
        ;;
    "switch"|"use")
        [ -z "$2" ] && error "Profile name required"
        set_profile "$2"
        ;;
    "create")
        [ -z "$2" ] && error "Profile name required"
        create_profile "$2" "$3"
        ;;
    "sync")
        sync_remote
        ;;
    "deploy")
        profile="${2:-$(get_current_profile)}"
        deploy_profile "$profile"
        ;;
    "current")
        echo "Current profile: $(get_current_profile)"
        ;;
    "help"|*)
        echo "opencode-sync - Synchronize opencode profiles across machines"
        echo ""
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  init                 Initialize git repository"
        echo "  list, ls             List available profiles"
        echo "  switch <profile>     Switch to a profile"
        echo "  create <profile>     Create new profile"
        echo "  sync                 Sync with remote repository"
        echo "  deploy [profile]     Deploy profile to opencode config"
        echo "  current              Show current active profile"
        echo "  help                 Show this help"
        echo ""
        echo "Environment variables:"
        echo "  OPENCODE_SYNC_REPO   Remote git repository URL"
        ;;
esac