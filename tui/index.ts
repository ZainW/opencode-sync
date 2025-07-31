#!/usr/bin/env bun

import { ProfileManager } from "./src/ProfileManager.ts";
import { ShellCommandExecutor } from "./src/ShellCommandExecutor.ts";
import { UIRenderer } from "./src/UIRenderer.ts";

class OpenCodeSyncTUI {
  private profileManager: ProfileManager;
  private shellExecutor: ShellCommandExecutor;
  private uiRenderer: UIRenderer;

  constructor() {
    this.shellExecutor = new ShellCommandExecutor();
    this.profileManager = new ProfileManager(this.shellExecutor);
    this.uiRenderer = new UIRenderer(this.profileManager, this.shellExecutor);
    this.init();
  }

  private async init(): Promise<void> {
    await this.uiRenderer.init();
  }
}

// Start the TUI
new OpenCodeSyncTUI();