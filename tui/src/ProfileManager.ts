import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { Profile } from "./types.ts";
import { SYNC_DIR } from "./constants.ts";
import { ShellCommandExecutor } from "./ShellCommandExecutor.ts";

export class ProfileManager {
  private shellExecutor: ShellCommandExecutor;

  constructor(shellExecutor: ShellCommandExecutor) {
    this.shellExecutor = shellExecutor;
  }

  loadProfiles(): Profile[] {
    try {
      const profilesDir = join(SYNC_DIR, "profiles");
      if (!existsSync(profilesDir)) {
        return [];
      }

      const currentProfile = this.getCurrentProfile();
      const dirs = readdirSync(profilesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      return dirs.map(name => ({
        name,
        active: name === currentProfile
      }));
    } catch (error) {
      console.error("Error loading profiles:", error);
      return [];
    }
  }

  getCurrentProfile(): string {
    try {
      const output = this.shellExecutor.executeSyncScript("current");
      return output.split(':')[1]?.trim() || "default";
    } catch (error) {
      console.error("Error getting current profile:", error);
      return "default";
    }
  }

  switchToProfile(profileName: string): void {
    try {
      this.shellExecutor.executeSyncScriptInherit("switch", profileName);
    } catch (error) {
      console.error("Error switching profile:", error);
      throw error;
    }
  }

  executeCommand(command: string): void {
    try {
      this.shellExecutor.executeSyncScriptInherit(command);
    } catch (error) {
      console.error(`Error executing ${command}:`, error);
      throw error;
    }
  }

  profileExists(profileName: string): boolean {
    const profilesDir = join(SYNC_DIR, "profiles", profileName);
    return existsSync(profilesDir);
  }
}