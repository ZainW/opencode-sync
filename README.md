# opencode-sync

A comprehensive profile management and synchronization system for opencode, built with OpenTUI.

## Features

- **Profile Management**: Separate configurations for work, personal, and project-specific setups
- **Modern TUI**: Built with OpenTUI for a rich terminal interface experience
- **Git-based Sync**: Synchronize profiles across multiple machines using private repositories
- **Agent Integration**: Custom opencode agents for automated tasks
- **Template System**: Reusable configuration templates
- **Fallback Support**: Automatically falls back to bash TUI if OpenTUI isn't available
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

### Modern TUI Interface (OpenTUI)

The primary interface is built with OpenTUI, providing:
- Rich visual components with mouse support
- Smooth navigation and selection
- Real-time status updates
- Responsive layout

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

### Fallback TUI (Bash)

If OpenTUI isn't available, the system automatically falls back to a bash-based TUI with full functionality.

## Profile Structure

Each profile contains:

- `config/opencode.json` - Main opencode configuration
- `config/agents/` - Custom agent definitions
- `projects/` - Project-specific settings
- `scripts/` - Profile-specific automation scripts

## Synchronization

### Git-based Sync

The installer can set up remote sync, or you can configure it manually:

1. Create a private GitHub repository
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
- `bun` - JavaScript runtime for OpenTUI
- `fzf` - Fuzzy finder
- `tree` - Directory visualization
- `zig` - For OpenTUI native components (optional but recommended)

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
The system automatically falls back to bash TUI if OpenTUI fails. To enable OpenTUI:

```bash
# Install Zig if missing
sudo snap install zig --classic  # Ubuntu
brew install zig                 # macOS
sudo pacman -S zig               # Arch

# Rebuild OpenTUI components
cd ~/.local/share/opencode-sync/tui
bun install
cd node_modules/@opentui/core
bun run build:prod
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