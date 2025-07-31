#!/bin/bash

# opencode-sync installer
# Automatically installs dependencies and sets up the system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[opencode-sync]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Detect OS and package manager
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    elif [[ -f /etc/arch-release ]]; then
        OS="arch"
        # Detect AUR helper
        if command -v paru >/dev/null 2>&1; then
            PACKAGE_MANAGER="paru"
        elif command -v yay >/dev/null 2>&1; then
            PACKAGE_MANAGER="yay"
        else
            PACKAGE_MANAGER="pacman"
        fi
    elif [[ -f /etc/debian_version ]]; then
        OS="debian"
        PACKAGE_MANAGER="apt"
    elif [[ -f /etc/redhat-release ]]; then
        OS="redhat"
        if command -v dnf >/dev/null 2>&1; then
            PACKAGE_MANAGER="dnf"
        else
            PACKAGE_MANAGER="yum"
        fi
    else
        OS="unknown"
        PACKAGE_MANAGER="unknown"
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install packages based on OS
install_packages() {
    local packages=("$@")
    
    case "$PACKAGE_MANAGER" in
        "brew")
            log "Installing packages with Homebrew: ${packages[*]}"
            brew install "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        "paru")
            log "Installing packages with paru: ${packages[*]}"
            paru -S --needed --noconfirm "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        "yay")
            log "Installing packages with yay: ${packages[*]}"
            yay -S --needed --noconfirm "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        "pacman")
            log "Installing packages with pacman: ${packages[*]}"
            sudo pacman -S --needed --noconfirm "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        "apt")
            log "Installing packages with apt: ${packages[*]}"
            sudo apt update
            sudo apt install -y "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        "dnf")
            log "Installing packages with dnf: ${packages[*]}"
            sudo dnf install -y "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        "yum")
            log "Installing packages with yum: ${packages[*]}"
            sudo yum install -y "${packages[@]}" || warn "Some packages may have failed to install"
            ;;
        *)
            error "Unknown package manager. Please install packages manually:"
            echo "  Required: git fzf tree"
            echo "  Optional: zig"
            return 1
            ;;
    esac
}

# Install Bun
install_bun() {
    if command_exists bun; then
        success "Bun is already installed"
        return 0
    fi
    
    log "Installing Bun JavaScript runtime..."
    if curl -fsSL https://bun.sh/install | bash; then
        # Add bun to PATH for current session
        export PATH="$HOME/.bun/bin:$PATH"
        success "Bun installed successfully"
    else
        error "Failed to install Bun"
        return 1
    fi
}

# Install Zig (optional but recommended for OpenTUI)
install_zig() {
    if command_exists zig; then
        success "Zig is already installed"
        return 0
    fi
    
    log "Installing Zig compiler (for OpenTUI native components)..."
    
    case "$OS" in
        "macos")
            if command_exists brew; then
                brew install zig
            else
                warn "Homebrew not found. Please install Zig manually from https://ziglang.org/"
                return 1
            fi
            ;;
        "arch")
            case "$PACKAGE_MANAGER" in
                "paru"|"yay")
                    $PACKAGE_MANAGER -S --needed --noconfirm zig
                    ;;
                "pacman")
                    sudo pacman -S --needed --noconfirm zig
                    ;;
            esac
            ;;
        "debian")
            # Zig is not in standard repos for older Ubuntu/Debian
            if sudo snap install zig --classic 2>/dev/null; then
                success "Zig installed via snap"
            else
                warn "Could not install Zig via snap. Please install manually from https://ziglang.org/"
                return 1
            fi
            ;;
        *)
            warn "Please install Zig manually from https://ziglang.org/ for enhanced OpenTUI performance"
            return 1
            ;;
    esac
    
    if command_exists zig; then
        success "Zig installed successfully"
    else
        warn "Zig installation may have failed. OpenTUI will use fallback mode."
        return 1
    fi
}

# Setup shell integration
setup_shell_integration() {
    local shell_rc=""
    local shell_name=""
    
    # Detect shell
    if [[ -n "$ZSH_VERSION" ]] || [[ "$SHELL" == *"zsh"* ]]; then
        shell_rc="$HOME/.zshrc"
        shell_name="zsh"
    elif [[ -n "$BASH_VERSION" ]] || [[ "$SHELL" == *"bash"* ]]; then
        shell_rc="$HOME/.bashrc"
        shell_name="bash"
    else
        shell_rc="$HOME/.profile"
        shell_name="shell"
    fi
    
    log "Setting up $shell_name integration..."
    
    # Create backup
    if [[ -f "$shell_rc" ]]; then
        cp "$shell_rc" "$shell_rc.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Add to PATH and aliases
    cat >> "$shell_rc" << 'EOF'

# opencode-sync integration
export PATH="$HOME/.local/share/opencode-sync/sync:$HOME/.local/share/opencode-sync/tui:$PATH"
alias ocs="opencode-sync-tui"
alias ocss="sync.sh"

# Add bun to PATH if it exists
if [[ -d "$HOME/.bun/bin" ]]; then
    export PATH="$HOME/.bun/bin:$PATH"
fi
EOF
    
    success "Shell integration added to $shell_rc"
    info "Run 'source $shell_rc' or restart your terminal to use the new commands"
}

# Install TUI dependencies
install_tui_dependencies() {
    local tui_dir="$HOME/.local/share/opencode-sync/tui"
    
    if [[ ! -d "$tui_dir" ]]; then
        error "TUI directory not found at $tui_dir"
        return 1
    fi
    
    log "Installing TUI dependencies..."
    cd "$tui_dir"
    
    if command_exists bun; then
        if bun install; then
            success "TUI dependencies installed"
            
            # Try to build OpenTUI native components if Zig is available
            if command_exists zig; then
                log "Building OpenTUI native components..."
                cd node_modules/@opentui/core 2>/dev/null || {
                    warn "OpenTUI core not found, skipping native build"
                    return 0
                }
                
                if bun run build:prod 2>/dev/null; then
                    success "OpenTUI native components built successfully"
                else
                    warn "Failed to build OpenTUI native components. Fallback mode will be used."
                fi
            else
                info "Zig not available. OpenTUI will use JavaScript fallback."
            fi
        else
            error "Failed to install TUI dependencies"
            return 1
        fi
    else
        error "Bun not found. Cannot install TUI dependencies."
        return 1
    fi
}

# Initialize git repository
initialize_git() {
    local sync_dir="$HOME/.local/share/opencode-sync"
    local sync_script="$sync_dir/sync/sync.sh"
    
    if [[ ! -f "$sync_script" ]]; then
        error "Sync script not found at $sync_script"
        return 1
    fi
    
    log "Initializing git repository..."
    if "$sync_script" init; then
        success "Git repository initialized"
    else
        warn "Failed to initialize git repository"
        return 1
    fi
}

# Setup remote repository
setup_remote() {
    echo
    info "Optional: Set up remote repository for profile synchronization"
    echo "This allows you to sync your opencode profiles across multiple machines."
    echo
    read -p "Do you want to set up a remote repository? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please create a NEW EMPTY private repository on GitHub (or your preferred Git host)"
        echo "Important: Do NOT initialize with README, .gitignore, or license"
        echo
        echo "Examples:"
        echo "  SSH format (recommended):  git@github.com:yourusername/opencode-profiles.git"
        echo "  HTTPS format:              https://github.com/yourusername/opencode-profiles.git"
        echo
        echo "Replace 'yourusername' with your actual GitHub username"
        echo
        read -p "Enter your repository URL: " repo_url
        
        if [[ -n "$repo_url" ]]; then
            # Validate SSH format and suggest SSH key setup if needed
            if [[ "$repo_url" == git@* ]]; then
                info "Using SSH format - this requires SSH key authentication"
                
                # Test SSH connection to GitHub
                if [[ "$repo_url" == git@github.com:* ]]; then
                    log "Testing SSH connection to GitHub..."
                    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
                        success "SSH key authentication working"
                    else
                        warn "SSH key authentication may not be set up"
                        echo "To set up SSH keys for GitHub:"
                        echo "  1. Generate key: ssh-keygen -t ed25519 -C \"your_email@example.com\""
                        echo "  2. Add to agent: ssh-add ~/.ssh/id_ed25519"
                        echo "  3. Copy public key: cat ~/.ssh/id_ed25519.pub"
                        echo "  4. Add to GitHub: Settings > SSH and GPG keys > New SSH key"
                        echo
                        read -p "Continue anyway? (y/N): " -n 1 -r
                        echo
                        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                            return 0
                        fi
                    fi
                fi
            elif [[ "$repo_url" == https://* ]]; then
                warn "HTTPS format will require username/password authentication"
                warn "Consider using SSH format instead: git@github.com:username/repo.git"
            fi
            
            export OPENCODE_SYNC_REPO="$repo_url"
            
            # Add to shell rc
            local shell_rc=""
            if [[ -n "$ZSH_VERSION" ]] || [[ "$SHELL" == *"zsh"* ]]; then
                shell_rc="$HOME/.zshrc"
            elif [[ -n "$BASH_VERSION" ]] || [[ "$SHELL" == *"bash"* ]]; then
                shell_rc="$HOME/.bashrc"
            else
                shell_rc="$HOME/.profile"
            fi
            
            echo "export OPENCODE_SYNC_REPO=\"$repo_url\"" >> "$shell_rc"
            success "Remote repository configured: $repo_url"
            
            # Try initial sync
            log "Attempting initial sync..."
            local sync_script="$HOME/.local/share/opencode-sync/sync/sync.sh"
            if "$sync_script" sync; then
                success "Initial sync completed"
            else
                warn "Initial sync failed. You can try again later with: ocss sync"
                if [[ "$repo_url" == git@* ]]; then
                    info "If using SSH, make sure your SSH key is added to your Git host"
                fi
            fi
        fi
    fi
}

# Main installation function
main() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    ${CYAN}opencode-sync installer${PURPLE}                     ║${NC}"
    echo -e "${PURPLE}║              Profile management for opencode                 ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Detect OS
    detect_os
    info "Detected OS: $OS"
    info "Package manager: $PACKAGE_MANAGER"
    echo
    
    # Check if we're in the right directory
    if [[ ! -f "$(dirname "$0")/sync/sync.sh" ]]; then
        error "Please run this script from the opencode-sync directory"
        exit 1
    fi
    
    # Install system dependencies
    log "Installing system dependencies..."
    case "$OS" in
        "macos")
            install_packages git fzf tree
            ;;
        "arch")
            install_packages git fzf tree
            ;;
        "debian")
            install_packages git fzf tree
            ;;
        "redhat")
            install_packages git tree
            # fzf might not be available in standard repos
            ;;
        *)
            warn "Unknown OS. Please install git, fzf, and tree manually"
            ;;
    esac
    
    # Install Bun
    install_bun
    
    # Install Zig (optional)
    install_zig
    
    # Make scripts executable
    log "Making scripts executable..."
    chmod +x "$HOME/.local/share/opencode-sync/sync/sync.sh"
    chmod +x "$HOME/.local/share/opencode-sync/tui/opencode-sync-tui"
    
    # Make bash TUI executable if it exists
    if [[ -f "$HOME/.local/share/opencode-sync/tui/opencode-sync-tui-bash" ]]; then
        chmod +x "$HOME/.local/share/opencode-sync/tui/opencode-sync-tui-bash"
    fi
    
    # Install TUI dependencies
    install_tui_dependencies
    
    # Setup shell integration
    setup_shell_integration
    
    # Initialize git
    initialize_git
    
    # Setup remote (optional)
    setup_remote
    
    echo
    success "Installation completed successfully!"
    echo
    info "Next steps:"
    echo "  1. Restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
    echo "  2. Launch the TUI: ocs"
    echo "  3. Or use CLI: ocss list"
    echo
    info "Commands available:"
    echo "  ocs                    - Launch TUI interface"
    echo "  ocss <command>         - Use CLI interface"
    echo "  sync.sh list           - List profiles"
    echo "  sync.sh switch <name>  - Switch profiles"
    echo
    
    if command_exists zig; then
        success "OpenTUI with native components is ready!"
    else
        info "OpenTUI will use fallback mode (still fully functional)"
        info "Install Zig later for enhanced performance"
    fi
}

# Run main function
main "$@"