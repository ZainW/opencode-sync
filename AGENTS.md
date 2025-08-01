# Agent Guidelines for opencode-sync

## Build/Test Commands
- No build system required - pure bash implementation
- Test manually by running `./run-tui.sh` or `ocs`
- Verify shell scripts with `bash -n script.sh` for syntax checking

## Code Style & Conventions
- **Language**: Pure Bash shell scripting
- **Shell**: Bash 4.0+ compatible
- **Error Handling**: Use `set -e` and proper error checking with `|| { error "message"; exit 1; }`
- **Functions**: Use lowercase with underscores (e.g., `show_menu`, `switch_profile`)
- **Variables**: Use UPPERCASE for constants, lowercase for local variables
- **Input**: Use `read -r` for safe input reading
- **Output**: Use `printf` instead of `echo` for better portability
- **Colors**: Use ANSI color codes with proper NC (No Color) reset

## Architecture Notes
- Pure bash TUI application with no external dependencies beyond standard Unix tools
- Manages opencode profiles in `~/.local/share/opencode-sync/profiles/`
- Core functionality in `sync/sync.sh` script
- TUI interface in `tui/opencode-sync-tui-bash` with wrapper `run-tui.sh`
- Simple, reliable, and universally compatible across Unix-like systems