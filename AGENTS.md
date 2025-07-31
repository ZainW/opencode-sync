# Agent Guidelines for opencode-sync

## Build/Test Commands
- `bun run dev` - Run development server
- `bun run build` - Build the project
- `bun run start` - Start the application
- `bun run tui` - Launch the TUI interface
- No test framework configured - verify changes manually

## Code Style & Conventions
- **Language**: TypeScript with strict mode enabled
- **Runtime**: Bun (not Node.js)
- **Module System**: ESNext modules with `.ts` extensions allowed
- **Imports**: Use named imports from `@opentui/core`, Node.js built-ins (child_process, fs, path, os)
- **Types**: Explicit interface definitions for data structures (Profile, MenuItem, etc.)
- **Classes**: Use class-based architecture with private methods prefixed with `private`
- **Error Handling**: Try-catch blocks with console.error for logging
- **Async**: Use execSync for shell commands, async/await for UI operations
- **Naming**: camelCase for variables/methods, PascalCase for classes/interfaces
- **File Structure**: Single main file (index.ts) with modular class organization

## Architecture Notes
- TUI application using OpenTUI framework with fallback to bash scripts
- Manages opencode profiles in `~/.local/share/opencode-sync/profiles/`
- Integrates with shell script at `sync/sync.sh` for profile operations
- Uses custom StatusElement extending BufferedElement for real-time updates