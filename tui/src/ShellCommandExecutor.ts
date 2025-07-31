import { execSync, spawn } from "child_process";
import { SYNC_SCRIPT, BASH_TUI } from "./constants.ts";

export class ShellCommandExecutor {
  executeSync(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8' });
    } catch (error) {
      console.error(`Error executing command: ${command}`, error);
      throw error;
    }
  }

  executeSyncScript(action: string, ...args: string[]): string {
    const command = `"${SYNC_SCRIPT}" ${action} ${args.map(arg => `"${arg}"`).join(' ')}`;
    return this.executeSync(command);
  }

  executeSyncScriptInherit(action: string, ...args: string[]): void {
    try {
      const command = `"${SYNC_SCRIPT}" ${action} ${args.map(arg => `"${arg}"`).join(' ')}`;
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      throw error;
    }
  }

  checkGitStatus(cwd: string): boolean {
    try {
      execSync("git diff --quiet && git diff --cached --quiet", {
        cwd,
        stdio: 'ignore'
      });
      return true; // Clean
    } catch {
      return false; // Modified
    }
  }

  spawnBashTUI(command?: string): void {
    const args = command ? [BASH_TUI, command] : [BASH_TUI];
    spawn('bash', args, { stdio: 'inherit' });
    process.exit(0);
  }
}