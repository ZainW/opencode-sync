import type { CliRenderer, ParsedKey } from "../.."
import { getKeyHandler } from "../../ui/lib/KeyHandler"

export function setupStandaloneDemoKeys(renderer: CliRenderer) {
  getKeyHandler().on("keypress", (key: ParsedKey) => {
    if (key.name === "`") {
      renderer.console.toggle()
    } else if (key.name === "t") {
      renderer.toggleDebugOverlay()
    }
  })
}
