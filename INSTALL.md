# opencode-sync Installation Guide

## Automated Install (Recommended)

```bash
# Clone or download opencode-sync to ~/.local/share/opencode-sync
# Then run the automated installer:
cd ~/.local/share/opencode-sync
./install.sh
```

The installer automatically:
- Detects your OS and package manager
- Installs all dependencies
- Sets up shell integration
- Configures the system
- Optionally sets up remote sync

## Manual Install

If you prefer manual installation:

## Dependencies

### Required
- `git` - Version control
- `bash` - Shell scripting
- `bun` - JavaScript runtime (for future OpenTUI support)

### Optional
- `fzf` - Fuzzy finder for enhanced TUI experience
- `tree` - Directory visualization
- `code` or `nvim` - For editing profiles

### Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install git fzf tree
curl -fsSL https://bun.sh/install | bash
```

**macOS:**
```bash
brew install git fzf tree
curl -fsSL https://bun.sh/install | bash
```

**Arch Linux:**
```bash
sudo pacman -S git fzf tree
curl -fsSL https://bun.sh/install | bash
```

## Setup Remote Sync

1. Create a private GitHub repository for your profiles (e.g., "opencode-profiles")
2. Set the environment variable (replace 'yourusername' with your GitHub username):
   ```bash
   export OPENCODE_SYNC_REPO="git@github.com:yourusername/opencode-profiles.git"
   echo 'export OPENCODE_SYNC_REPO="git@github.com:yourusername/opencode-profiles.git"' >> ~/.bashrc
   ```
3. Initialize and sync:
   ```bash
   sync.sh init
   sync.sh sync
   ```

## Cross-machine Setup

On a new machine:

1. Install dependencies (see above)
2. Clone your profiles (replace 'yourusername' with your GitHub username):
   ```bash
   git clone git@github.com:yourusername/opencode-profiles.git ~/.local/share/opencode-sync
   ```
3. Add to PATH:
   ```bash
   echo 'export PATH="$HOME/.local/share/opencode-sync/sync:$HOME/.local/share/opencode-sync/tui:$PATH"' >> ~/.bashrc
   echo 'alias ocs="opencode-sync-tui"' >> ~/.bashrc
   source ~/.bashrc
   ```
4. Deploy a profile:
   ```bash
   sync.sh switch work
   ```

## OpenTUI Support

The system includes a modern TypeScript-based TUI using OpenTUI. It requires Zig for native components:

1. Install Zig:
   ```bash
   # Ubuntu/Debian
   sudo snap install zig --classic
   
   # macOS
   brew install zig
   
   # Arch Linux
   sudo pacman -S zig
   ```

2. Build OpenTUI native components:
   ```bash
   cd ~/.local/share/opencode-sync/tui/node_modules/@opentui/core
   bun run build:prod
   ```

3. The TUI automatically uses OpenTUI when available, otherwise falls back to bash

## Troubleshooting

### Permission Issues
```bash
chmod +x ~/.local/share/opencode-sync/sync/sync.sh
chmod +x ~/.local/share/opencode-sync/tui/opencode-sync-tui
```

### Git Authentication
Set up SSH keys for GitHub (recommended for private repos):
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Add the public key to your GitHub account: Settings > SSH and GPG keys

# Test connection
ssh -T git@github.com
```

### Profile Not Found
```bash
# List available profiles
sync.sh list

# Create a new profile
sync.sh create my-profile work
```

### TUI Not Working
The system falls back to the bash TUI if OpenTUI isn't available. This provides full functionality while OpenTUI support is being developed.