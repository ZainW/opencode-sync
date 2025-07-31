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
  FlexDirection,
  Align,
  Justify
} from "@opentui/core";
import { getKeyHandler } from "@opentui/core/src/ui/lib/KeyHandler";
import { existsSync } from "fs";
import { Profile, MenuItem, ViewType } from "./types.ts";
import { SYNC_SCRIPT, COLORS, UI_CONFIG } from "./constants.ts";
import { ProfileManager } from "./ProfileManager.ts";
import { ShellCommandExecutor } from "./ShellCommandExecutor.ts";
import { StatusElement } from "./StatusElement.ts";

export class UIRenderer {
  private renderer: CliRenderer;
  private mainLayout: Layout;
  private currentView: ViewType = 'menu';
  private profileManager: ProfileManager;
  private shellExecutor: ShellCommandExecutor;

  // UI Elements
  private header: TextRenderable;
  private status: StatusElement;
  private menuSelect: SelectElement;
  private profileSelect: SelectElement | null = null;
  private instructions: TextRenderable;

  constructor(profileManager: ProfileManager, shellExecutor: ShellCommandExecutor) {
    this.profileManager = profileManager;
    this.shellExecutor = shellExecutor;
    this.renderer = null as any; // Will be initialized in init()
  }

  async init(): Promise<void> {
    // Check dependencies
    if (!existsSync(SYNC_SCRIPT)) {
      console.error("Sync script not found. Please ensure opencode-sync is properly installed.");
      process.exit(1);
    }

    try {
      this.renderer = await createCliRenderer({
        exitOnCtrlC: false,
        targetFps: UI_CONFIG.TARGET_FPS,
        useMouse: true
      });

      this.renderer.setBackgroundColor(UI_CONFIG.BACKGROUND_COLOR);
      this.setupUI();
      this.setupKeyHandling();
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

    this.createHeader();
    this.createStatus();
    this.createInstructions(height);
    this.createMenuSelect();
    this.setupResizeHandler();
  }

  private createHeader(): void {
    this.header = new TextRenderable("header", {
      x: 0,
      y: 0,
      content: "╔══════════════════════════════════════════════════════════════╗\n║                    opencode-sync TUI                        ║\n║              Manage your opencode profiles                   ║\n╚══════════════════════════════════════════════════════════════╝",
      fg: RGBA.fromInts(...COLORS.BLUE),
      zIndex: 2,
      width: "auto",
      height: UI_CONFIG.HEADER_HEIGHT
    });
    this.mainLayout.add(this.header);
  }

  private createStatus(): void {
    const width = this.renderer.terminalWidth;
    this.status = new StatusElement("status", {
      x: 0,
      y: UI_CONFIG.HEADER_HEIGHT + 1,
      width: width,
      height: UI_CONFIG.STATUS_HEIGHT,
      backgroundColor: RGBA.fromInts(...COLORS.DARK_BLUE),
      textColor: RGBA.fromInts(...COLORS.WHITE),
      zIndex: 2
    }, this.profileManager, this.shellExecutor);
    this.mainLayout.add(this.status);
  }

  private createInstructions(height: number): void {
    this.instructions = new TextRenderable("instructions", {
      x: 0,
      y: height - UI_CONFIG.INSTRUCTIONS_HEIGHT,
      content: "Use ↑↓ to navigate, Enter to select, Escape to go back, Ctrl+C to exit",
      fg: RGBA.fromInts(...COLORS.GRAY),
      zIndex: 2
    });
    this.mainLayout.add(this.instructions);
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

    const startY = UI_CONFIG.HEADER_HEIGHT + UI_CONFIG.STATUS_HEIGHT + 2;
    const availableHeight = this.renderer.terminalHeight - startY - UI_CONFIG.INSTRUCTIONS_HEIGHT - 1;

    this.menuSelect = new SelectElement("menu-select", {
      x: 2,
      y: startY,
      width: this.renderer.terminalWidth - 4,
      height: availableHeight,
      zIndex: 2,
      options: menuItems,
      backgroundColor: RGBA.fromInts(...COLORS.DARK_BLUE),
      selectedBackgroundColor: RGBA.fromInts(...COLORS.SELECTED_BG),
      textColor: RGBA.fromInts(...COLORS.WHITE),
      selectedTextColor: RGBA.fromInts(...COLORS.SELECTED_TEXT),
      descriptionColor: RGBA.fromInts(...COLORS.GRAY),
      selectedDescriptionColor: RGBA.fromInts(...COLORS.SELECTED_DESC),
      showDescription: true,
      borderStyle: "single",
      borderColor: RGBA.fromInts(...COLORS.WHITE),
      focusedBorderColor: RGBA.fromInts(...COLORS.FOCUSED_BORDER),
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
    const profiles = this.profileManager.loadProfiles();
    const profileOptions: SelectOption[] = profiles.map(profile => ({
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

    const startY = UI_CONFIG.HEADER_HEIGHT + UI_CONFIG.STATUS_HEIGHT + 2;
    const availableHeight = this.renderer.terminalHeight - startY - UI_CONFIG.INSTRUCTIONS_HEIGHT - 1;

    this.profileSelect = new SelectElement("profile-select", {
      x: 2,
      y: startY,
      width: this.renderer.terminalWidth - 4,
      height: availableHeight,
      zIndex: 2,
      options: profileOptions,
      backgroundColor: RGBA.fromInts(...COLORS.DARK_BLUE),
      selectedBackgroundColor: RGBA.fromInts(...COLORS.SELECTED_BG),
      textColor: RGBA.fromInts(...COLORS.WHITE),
      selectedTextColor: RGBA.fromInts(...COLORS.SELECTED_TEXT),
      descriptionColor: RGBA.fromInts(...COLORS.GRAY),
      selectedDescriptionColor: RGBA.fromInts(...COLORS.SELECTED_DESC),
      showDescription: true,
      borderStyle: "single",
      borderColor: RGBA.fromInts(...COLORS.WHITE),
      focusedBorderColor: RGBA.fromInts(...COLORS.FOCUSED_BORDER),
      title: "Available Profiles:",
      titleAlignment: "left"
    });

    this.profileSelect.on(SelectElementEvents.ITEM_SELECTED, (index: number, option: SelectOption) => {
      if (option.value) {
        this.profileManager.switchToProfile(option.value as string);
        this.showMenu();
      }
    });

    this.mainLayout.add(this.profileSelect);
    this.profileSelect.focus();
  }

  private setupResizeHandler(): void {
    this.renderer.on("resize", (newWidth: number, newHeight: number) => {
      this.mainLayout.resize(newWidth, newHeight);
      this.instructions.y = newHeight - UI_CONFIG.INSTRUCTIONS_HEIGHT;
    });
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
        this.profileManager.executeCommand("sync");
        break;
      case "deploy":
        this.profileManager.executeCommand("deploy");
        break;
      case "details":
        this.fallbackToBash("view_profile_details");
        break;
      case "init":
        this.profileManager.executeCommand("init");
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
  }

  private showProfiles(): void {
    this.currentView = 'profiles';
    
    this.menuSelect.visible = false;
    this.menuSelect.blur();
    
    this.createProfileSelect();
  }

  private fallbackToBash(command?: string): void {
    this.cleanup();
    this.shellExecutor.spawnBashTUI(command);
  }

  private cleanup(): void {
    if (this.renderer) {
      this.renderer.stop();
    }
  }
}