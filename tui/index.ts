#!/usr/bin/env bun

import {
  createCliRenderer,
  CliRenderer,
  TextRenderable,
  SelectElement,
  SelectElementEvents,
  type SelectOption,
  type ParsedKey,
  RGBA,
  Layout,
  ContainerElement,
  BufferedElement,
  FlexDirection,
  Align,
  Justify
} from "@opentui/core";
import { getKeyHandler } from "@opentui/core/ui/lib/KeyHandler";
import { execSync, spawn } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const SYNC_DIR = join(homedir(), ".local/share/opencode-sync");
const SYNC_SCRIPT = join(SYNC_DIR, "sync/sync.sh");
const BASH_TUI = join(SYNC_DIR, "tui/opencode-sync-tui-bash");

interface Profile {
  name: string;
  active: boolean;
}

interface MenuItem {
  name: string;
  description: string;
  value: string;
}

class StatusElement extends BufferedElement {
  private currentProfile: string = "default";
  private gitStatus: string = "Unknown";

  constructor(id: string, options: any) {
    super(id, options);
    this.updateStatus();
  }

  private updateStatus(): void {
    try {
      // Get current profile
      const profileOutput = execSync(`"${SYNC_SCRIPT}" current`, { encoding: 'utf8' });
      this.currentProfile = profileOutput.split(':')[1]?.trim() || "default";

      // Get git status
      if (existsSync(join(SYNC_DIR, ".git"))) {
        try {
          execSync("git diff --quiet && git diff --cached --quiet", {
            cwd: SYNC_DIR,
            stdio: 'ignore'
          });
          this.gitStatus = "Clean";
        } catch {
          this.gitStatus = "Modified";
        }
      } else {
        this.gitStatus = "Not initialized";
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  protected refreshContent(contentX: number, contentY: number, contentWidth: number, contentHeight: number): void {
    if (!this.frameBuffer) return;

    this.updateStatus();

    const statusColor = this.gitStatus === "Clean" ? RGBA.fromInts(34, 197, 94, 255) :
                       this.gitStatus === "Modified" ? RGBA.fromInts(234, 179, 8, 255) :
                       RGBA.fromInts(239, 68, 68, 255);

    this.frameBuffer.drawText(
      `Current Profile: ${this.currentProfile}`,
      contentX,
      contentY,
      RGBA.fromInts(59, 130, 246, 255),
      this.backgroundColor
    );

    this.frameBuffer.drawText(
      `Git Status: ${this.gitStatus}`,
      contentX,
      contentY + 1,
      statusColor,
      this.backgroundColor
    );
  }
}

class OpenCodeSyncTUI {
  private renderer: CliRenderer;
  private mainLayout: Layout;
  private currentView: 'menu' | 'profiles' | 'create' = 'menu';
  private profiles: Profile[] = [];

  // UI Elements
  private header: TextRenderable;
  private status: StatusElement;
  private menuSelect: SelectElement;
  private profileSelect: SelectElement | null = null;
  private instructions: TextRenderable;

  constructor() {
    this.renderer = null as any; // Will be initialized in init()
    this.init();
  }

  private async init(): Promise<void> {
    // Check dependencies
    if (!existsSync(SYNC_SCRIPT)) {
      console.error("Sync script not found. Please ensure opencode-sync is properly installed.");
      process.exit(1);
    }

    try {
      this.renderer = await createCliRenderer({
        exitOnCtrlC: false,
        targetFps: 30,
        useMouse: true
      });

      this.renderer.setBackgroundColor("#001122");
      this.setupUI();
      this.setupKeyHandling();
      this.loadProfiles();
      this.renderer.start();
    } catch (error) {
      console.error("Failed to initialize OpenTUI. Falling back to bash TUI...");
      console.error("Error:", error);
      this.fallbackToBash();
    }
  }

  private setupUI(): void {
    const width = this.renderer.terminalWidth;
    const height = this.renderer.terminalHeight;

    // Main layout container
    this.mainLayout = new Layout("main-layout", {
      x: 0,
      y: 0,
      width,
      height,
      zIndex: 1
    });
    this.renderer.add(this.mainLayout);

    // Header
    this.header = new TextRenderable("header", {
      x: 0,
      y: 0,
      content: "╔══════════════════════════════════════════════════════════════╗\n║                    opencode-sync TUI                        ║\n║              Manage your opencode profiles                   ║\n╚══════════════════════════════════════════════════════════════╝",
      fg: RGBA.fromInts(59, 130, 246, 255),
      zIndex: 2,
      width: "auto",
      height: 4
    });
    this.mainLayout.add(this.header);

    // Status
    this.status = new StatusElement("status", {
      x: 0,
      y: 5,
      width: width,
      height: 3,
      backgroundColor: RGBA.fromInts(0, 17, 34, 255),
      textColor: RGBA.fromInts(255, 255, 255, 255),
      zIndex: 2
    });
    this.mainLayout.add(this.status);

    // Instructions
    this.instructions = new TextRenderable("instructions", {
      x: 0,
      y: height - 2,
      content: "Use ↑↓ to navigate, Enter to select, Escape to go back, Ctrl+C to exit",
      fg: RGBA.fromInts(156, 163, 175, 255),
      zIndex: 2
    });
    this.mainLayout.add(this.instructions);

    // Menu
    this.createMenuSelect();

    // Handle resize
    this.renderer.on("resize", (newWidth: number, newHeight: number) => {
      this.mainLayout.resize(newWidth, newHeight);
      this.instructions.y = newHeight - 2;
    });
  }

  private createMenuSelect(): void {
    const menuItems: SelectOption[] = [
      { name: "Switch Profile", description: "Change to a different profile", value: "switch" },
      { name: "Create Profile", description: "Create a new profile", value: "create" },
      { name: "Sync with Remote", description: "Synchronize with remote repository", value: "sync" },
      { name: "Deploy Current Profile", description: "Deploy current profile to opencode config", value: "deploy" },
      { name: "View Profile Details", description: "View detailed profile information", value: "details" },
      { name: "Initialize Git Repository", description: "Initialize git repository for sync", value: "init" },
      { name: "Open Profile Directory", description: "Open profile directory in editor", value: "open" },
      { name: "Exit", description: "Exit the application", value: "exit" }
    ];

    this.menuSelect = new SelectElement("menu-select", {
      x: 2,
      y: 9,
      width: this.renderer.terminalWidth - 4,
      height: this.renderer.terminalHeight - 12,
      zIndex: 2,
      options: menuItems,
      backgroundColor: RGBA.fromInts(0, 17, 34, 255),
      selectedBackgroundColor: RGBA.fromInts(51, 68, 85, 255),
      textColor: RGBA.fromInts(255, 255, 255, 255),
      selectedTextColor: RGBA.fromInts(255, 255, 0, 255),
      descriptionColor: RGBA.fromInts(156, 163, 175, 255),
      selectedDescriptionColor: RGBA.fromInts(204, 204, 204, 255),
      showDescription: true,
      borderStyle: "single",
      borderColor: RGBA.fromInts(255, 255, 255, 255),
      focusedBorderColor: RGBA.fromInts(0, 170, 255, 255),
      title: "Choose an action:",
      titleAlignment: "left"
    });

    this.menuSelect.on(SelectElementEvents.ITEM_SELECTED, (index: number, option: SelectOption) => {
      this.handleMenuSelection(option.value as string);
    });

    this.mainLayout.add(this.menuSelect);
    this.menuSelect.focus();
  }

  private createProfileSelect(): void {
    const profileOptions: SelectOption[] = this.profiles.map(profile => ({
      name: profile.name,
      description: profile.active ? "(currently active)" : "",
      value: profile.name
    }));

    if (profileOptions.length === 0) {
      profileOptions.push({
        name: "No profiles found",
        description: "Create a profile first",
        value: ""
      });
    }

    this.profileSelect = new SelectElement("profile-select", {
      x: 2,
      y: 9,
      width: this.renderer.terminalWidth - 4,
      height: this.renderer.terminalHeight - 12,
      zIndex: 2,
      options: profileOptions,
      backgroundColor: RGBA.fromInts(0, 17, 34, 255),
      selectedBackgroundColor: RGBA.fromInts(51, 68, 85, 255),
      textColor: RGBA.fromInts(255, 255, 255, 255),
      selectedTextColor: RGBA.fromInts(255, 255, 0, 255),
      descriptionColor: RGBA.fromInts(156, 163, 175, 255),
      selectedDescriptionColor: RGBA.fromInts(204, 204, 204, 255),
      showDescription: true,
      borderStyle: "single",
      borderColor: RGBA.fromInts(255, 255, 255, 255),
      focusedBorderColor: RGBA.fromInts(0, 170, 255, 255),
      title: "Available Profiles:",
      titleAlignment: "left"
    });

    this.profileSelect.on(SelectElementEvents.ITEM_SELECTED, (index: number, option: SelectOption) => {
      if (option.value) {
        this.switchToProfile(option.value as string);
      }
    });

    this.mainLayout.add(this.profileSelect);
    this.profileSelect.focus();
  }

  private loadProfiles(): void {
    try {
      const profilesDir = join(SYNC_DIR, "profiles");
      if (!existsSync(profilesDir)) return;

      const currentProfile = execSync(`"${SYNC_SCRIPT}" current`, { encoding: 'utf8' })
        .split(':')[1]?.trim() || "default";

      const dirs = readdirSync(profilesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      this.profiles = dirs.map(name => ({
        name,
        active: name === currentProfile
      }));
    } catch (error) {
      console.error("Error loading profiles:", error);
      this.profiles = [];
    }
  }

  private setupKeyHandling(): void {
    getKeyHandler().on("keypress", (key: ParsedKey) => {
      switch (key.raw) {
        case "\u0003": // Ctrl+C
          this.cleanup();
          process.exit(0);
          break;
        case "\u001b": // Escape
          if (this.currentView !== 'menu') {
            this.showMenu();
          }
          break;
      }
    });
  }

  private handleMenuSelection(action: string): void {
    switch (action) {
      case "switch":
        this.showProfiles();
        break;
      case "create":
        this.fallbackToBash("create_profile");
        break;
      case "sync":
        this.executeCommand("sync");
        break;
      case "deploy":
        this.executeCommand("deploy");
        break;
      case "details":
        this.fallbackToBash("view_profile_details");
        break;
      case "init":
        this.executeCommand("init");
        break;
      case "open":
        this.fallbackToBash("open_profile_dir");
        break;
      case "exit":
        this.cleanup();
        process.exit(0);
        break;
    }
  }

  private showMenu(): void {
    this.currentView = 'menu';
    
    if (this.profileSelect) {
      this.profileSelect.blur();
      this.mainLayout.remove("profile-select");
      this.profileSelect = null;
    }

    this.menuSelect.visible = true;
    this.menuSelect.focus();
    this.loadProfiles(); // Refresh status
  }

  private showProfiles(): void {
    this.currentView = 'profiles';
    this.loadProfiles();
    
    this.menuSelect.visible = false;
    this.menuSelect.blur();
    
    this.createProfileSelect();
  }

  private switchToProfile(profileName: string): void {
    try {
      execSync(`"${SYNC_SCRIPT}" switch "${profileName}"`, { stdio: 'inherit' });
      this.showMenu();
    } catch (error) {
      console.error("Error switching profile:", error);
    }
  }

  private executeCommand(command: string): void {
    try {
      execSync(`"${SYNC_SCRIPT}" ${command}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing ${command}:`, error);
    }
  }

  private fallbackToBash(command?: string): void {
    this.cleanup();
    const args = command ? [BASH_TUI, command] : [BASH_TUI];
    spawn('bash', args, { stdio: 'inherit' });
    process.exit(0);
  }

  private cleanup(): void {
    if (this.renderer) {
      this.renderer.stop();
    }
  }
}

// Start the TUI
new OpenCodeSyncTUI();