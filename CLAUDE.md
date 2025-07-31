# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### TUI Development (Primary Interface)
- `cd tui && bun run dev` - Start development mode for the TUI
- `cd tui && bun run build` - Build the TUI application
- `cd tui && bun run tui` - Launch the TUI interface directly
- `ocs` - Launch TUI (requires shell integration)

### Profile Management CLI
- `./sync/sync.sh list` - List all available profiles
- `./sync/sync.sh switch <profile>` - Switch to a specific profile
- `./sync/sync.sh create <profile> [template]` - Create new profile
- `./sync/sync.sh sync` - Sync with remote git repository
- `./sync/sync.sh current` - Show current active profile

### Installation & Setup
- `./install.sh` - Automated installer for dependencies and shell integration
- No test framework configured - verify changes manually

## Architecture Overview

### Core Components
This is a profile management system for opencode with two main interfaces:

1. **Modern TUI (TypeScript/Bun)** - Primary interface using OpenTUI framework
2. **Shell Scripts (Bash)** - CLI interface and core functionality

### Directory Structure
- `tui/` - TypeScript TUI application using OpenTUI
- `sync/` - Bash scripts for core profile operations
- `profiles/` - Profile configurations (work, personal, default)
- `templates/` - Reusable profile templates

### TUI Architecture (tui/)
- **Main Entry**: `index.ts` - Initializes ProfileManager, ShellCommandExecutor, UIRenderer
- **ProfileManager**: Manages profile loading, switching, and operations
- **ShellCommandExecutor**: Interfaces with sync.sh bash script
- **UIRenderer**: Handles OpenTUI interface rendering and user interaction
- **Types**: Defined in `types.ts` (Profile, MenuItem, ViewType, StatusInfo)

### Profile System
- Profiles stored in `~/.local/share/opencode-sync/profiles/`
- Each profile contains: `config/opencode.json`, `config/agents/`, `projects/`, `scripts/`
- Active profile tracked in `.current-profile` file
- Profiles deployed to `~/.config/opencode/` when activated

### Git Synchronization
- Repository initialized in opencode-sync directory
- Remote sync via OPENCODE_SYNC_REPO environment variable
- Supports SSH and HTTPS git repositories
- Auto-commits changes with timestamps

## Technology Stack
- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript with strict mode
- **UI Framework**: OpenTUI with bash fallback
- **Shell Integration**: Bash scripts with cross-platform support
- **Version Control**: Git for profile synchronization

## Development Notes
- Uses ESNext modules with `.ts` extensions in Bun
- Class-based architecture with private method conventions
- Shell commands executed via execSync for synchronous operations
- Error handling with try-catch and console.error logging
- No build system needed for bash scripts - they're executable directly