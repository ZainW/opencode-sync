import { join } from "path";
import { homedir } from "os";

export const SYNC_DIR = join(homedir(), ".local/share/opencode-sync");
export const SYNC_SCRIPT = join(SYNC_DIR, "sync/sync.sh");
export const BASH_TUI = join(SYNC_DIR, "tui/opencode-sync-tui-bash");

export const COLORS = {
  BLUE: [59, 130, 246, 255] as const,
  GREEN: [34, 197, 94, 255] as const,
  YELLOW: [234, 179, 8, 255] as const,
  RED: [239, 68, 68, 255] as const,
  WHITE: [255, 255, 255, 255] as const,
  GRAY: [156, 163, 175, 255] as const,
  DARK_BLUE: [0, 17, 34, 255] as const,
  SELECTED_BG: [51, 68, 85, 255] as const,
  SELECTED_TEXT: [255, 255, 0, 255] as const,
  SELECTED_DESC: [204, 204, 204, 255] as const,
  FOCUSED_BORDER: [0, 170, 255, 255] as const,
} as const;

export const UI_CONFIG = {
  TARGET_FPS: 30,
  BACKGROUND_COLOR: "#001122",
  HEADER_HEIGHT: 4,
  STATUS_HEIGHT: 3,
  INSTRUCTIONS_HEIGHT: 2,
} as const;