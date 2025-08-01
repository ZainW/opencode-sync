# opencode-sync

A comprehensive profile management and synchronization system for opencode, built with OpenTUI.

## Features

- **Profile Management**: Separate configurations for work, personal, and project-specific setups
- **Simple Bash TUI**: Reliable terminal interface that works everywhere
- **Git-based Sync**: Synchronize profiles across multiple machines using private repositories
- **Agent Integration**: Custom opencode agents for automated tasks
- **Template System**: Reusable configuration templates
- **Universal Compatibility**: Pure bash implementation works on any Unix-like system
- **Cross-platform**: Works on macOS, Linux (Arch, Ubuntu, etc.)

## Quick Install

```bash
# Clone or download opencode-sync to ~/.local/share/opencode-sync
# Then run the installer:
cd ~/.local/share/opencode-sync
./install.sh
```

The installer will:
- Detect your OS and package manager
- Install required dependencies (git, fzf, tree, bun, zig)
- Set up shell integration with aliases
- Install TUI dependencies
- Initialize git repository
- Optionally configure remote sync

## Manual Installation

See [INSTALL.md](INSTALL.md) for detailed manual installation instructions.

## Directory Structure

```
~/.local/share/opencode-sync/
├── profiles/
│   ├── work/           # Work profile with enterprise settings
│   ├── personal/       # Personal profile with relaxed permissions
│   └── default/        # Default fallback profile
├── templates/          # Profile templates
├── sync/              # Sync scripts and utilities
├── tui/               # Terminal user interface (OpenTUI + bash fallback)
└── install.sh         # Automated installer
```

## Usage

### Quick Commands (after installation)

```bash
ocs                    # Launch TUI interface
ocss list              # List profiles
ocss switch work       # Switch to work profile
ocss sync              # Sync with remote
```

### Bash TUI Interface

The interface is a reliable bash-based TUI, providing:
- Simple number-based navigation (1-8)
- Real-time status updates
- Universal compatibility
- No dependencies beyond bash

Launch with:
```bash
ocs  # or opencode-sync-tui
```

### Command Line Interface

```bash
# List available profiles
ocss list  # or sync.sh list

# Switch to a profile
ocss switch work

# Create new profile
ocss create my-project work

# Sync with remote
ocss sync
```



## Profile Structure

Each profile contains:

- `config/opencode.json` - Main opencode configuration
- `config/agents/` - Custom agent definitions
- `projects/` - Project-specific settings
- `scripts/` - Profile-specific automation scripts

## Synchronization

### Git-based Sync

The installer can set up remote sync, or you can configure it manually:

1. Create a NEW EMPTY private GitHub repository (don't initialize with README)
2. Set up SSH key authentication (recommended):
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to SSH agent
   ssh-add ~/.ssh/id_ed25519
   
   # Copy public key and add to GitHub
   cat ~/.ssh/id_ed25519.pub
   ```
3. Set the environment variable (replace 'yourusername' with your GitHub username):
   ```bash
   export OPENCODE_SYNC_REPO="git@github.com:yourusername/opencode-profiles.git"
   ```
4. Sync:
   ```bash
   ocss sync
   ```

### Cross-machine Setup

On a new machine:

1. Clone your profiles repository (replace 'yourusername' with your GitHub username):
   ```bash
   git clone git@github.com:yourusername/opencode-profiles.git ~/.local/share/opencode-sync
   ```

2. Run the installer:
   ```bash
   cd ~/.local/share/opencode-sync
   ./install.sh
   ```

3. Deploy a profile:
   ```bash
   ocss switch work
   ```

## Agents

The system includes specialized agents:

- **sync-manager**: Automates profile operations and conflict resolution
- **work-reviewer**: Enterprise-focused code review agent
- **personal-helper**: Relaxed assistant for personal projects

## Environment Variables

- `OPENCODE_SYNC_REPO`: Remote git repository URL
- `OPENCODE_SYNC_PROFILE`: Default profile to use

## Dependencies

### Automatically Installed
- `git` - Version control
- `fzf` - Fuzzy finder
- `tree` - Directory visualization

### Platform Support
- **macOS**: Homebrew
- **Arch Linux**: paru, yay, or pacman
- **Ubuntu/Debian**: apt
- **RHEL/CentOS**: dnf or yum

## Troubleshooting

### Installation Issues
```bash
# Re-run installer
cd ~/.local/share/opencode-sync
./install.sh

# Check dependencies
which git bun fzf zig
```

### TUI Not Working
If the TUI has issues, try the direct wrapper:

```bash
cd ~/.local/share/opencode-sync
./run-tui.sh
```

### Profile Issues
```bash
# List profiles
ocss list

# Create new profile
ocss create my-profile work

# Reset to default
ocss switch default
```

## Security

- Profiles are stored locally and synced via private repositories
- Sensitive data should use opencode's variable substitution: `{env:API_KEY}`
- Agent permissions are configurable per profile
- Git history provides audit trail for configuration changes

## Contributing

This project is designed to work seamlessly with opencode. Feel free to submit issues and pull requests.

## License

Same as opencode project.