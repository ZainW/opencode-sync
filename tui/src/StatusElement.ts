import { existsSync } from "fs";
import { join } from "path";
import { BufferedElement, RGBA } from "@opentui/core";
import { StatusInfo } from "./types.ts";
import { SYNC_DIR, COLORS } from "./constants.ts";
import { ProfileManager } from "./ProfileManager.ts";
import { ShellCommandExecutor } from "./ShellCommandExecutor.ts";

export class StatusElement extends BufferedElement {
  private profileManager: ProfileManager;
  private shellExecutor: ShellCommandExecutor;
  private statusInfo: StatusInfo = {
    currentProfile: "default",
    gitStatus: "Unknown"
  };

  constructor(id: string, options: any, profileManager: ProfileManager, shellExecutor: ShellCommandExecutor) {
    super(id, options);
    this.profileManager = profileManager;
    this.shellExecutor = shellExecutor;
    this.updateStatus();
  }

  private updateStatus(): void {
    try {
      // Get current profile
      this.statusInfo.currentProfile = this.profileManager.getCurrentProfile();

      // Get git status
      if (existsSync(join(SYNC_DIR, ".git"))) {
        const isClean = this.shellExecutor.checkGitStatus(SYNC_DIR);
        this.statusInfo.gitStatus = isClean ? "Clean" : "Modified";
      } else {
        this.statusInfo.gitStatus = "Not initialized";
      }
    } catch (error) {
      console.error("Error updating status:", error);
      this.statusInfo.gitStatus = "Error";
    }
  }

  getStatusInfo(): StatusInfo {
    return { ...this.statusInfo };
  }

  protected refreshContent(contentX: number, contentY: number, contentWidth: number, contentHeight: number): void {
    if (!this.frameBuffer) return;

    this.updateStatus();

    const statusColor = this.getStatusColor();

    this.frameBuffer.drawText(
      `Current Profile: ${this.statusInfo.currentProfile}`,
      contentX,
      contentY,
      RGBA.fromInts(...COLORS.BLUE),
      this.backgroundColor
    );

    this.frameBuffer.drawText(
      `Git Status: ${this.statusInfo.gitStatus}`,
      contentX,
      contentY + 1,
      statusColor,
      this.backgroundColor
    );
  }

  private getStatusColor(): RGBA {
    switch (this.statusInfo.gitStatus) {
      case "Clean":
        return RGBA.fromInts(...COLORS.GREEN);
      case "Modified":
        return RGBA.fromInts(...COLORS.YELLOW);
      default:
        return RGBA.fromInts(...COLORS.RED);
    }
  }
}