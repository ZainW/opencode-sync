import { TextAttributes, createCliRenderer, RGBA, GroupRenderable, TextRenderable, BoxRenderable } from "../index"
import type { CliRenderer } from "../index"
import { setupStandaloneDemoKeys } from "./lib/standalone-keys"

export function run(renderer: CliRenderer): void {
  renderer.setBackgroundColor("#001122")

  const parentContainer = new GroupRenderable("parent-container", {
    x: 0,
    y: 0,
    zIndex: 10,
    visible: true,
  })
  renderer.add(parentContainer)

  const title = new TextRenderable("main-title", {
    content: "Alpha Transparency & Blending Demo",
    x: 10,
    y: 2,
    fg: "#FFFF00",
    attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
    zIndex: 1000,
  })
  parentContainer.add(title)

  const textUnderAlpha = new TextRenderable("text-under-alpha", {
    content: "This text should be visible through transparent boxes",
    x: 10,
    y: 6,
    fg: "#FFFF00",
    attributes: TextAttributes.BOLD,
    zIndex: 4,
  })
  parentContainer.add(textUnderAlpha)

  const moreTextUnder = new TextRenderable("more-text-under", {
    content: "More text to show character preservation",
    x: 15,
    y: 10,
    fg: "#00FFFF",
    attributes: TextAttributes.BOLD,
    zIndex: 4,
  })
  parentContainer.add(moreTextUnder)

  // First set of overlapping alpha boxes
  const alphaBox50 = new BoxRenderable("alpha-box-50", {
    x: 15,
    y: 5,
    width: 25,
    height: 8,
    bg: RGBA.fromValues(100 / 255, 100 / 255, 255 / 255, 128 / 255),
    zIndex: 50,
    borderStyle: "single",
    borderColor: "#FFFFFF",
  })
  parentContainer.add(alphaBox50)

  const alphaBox50Title = new TextRenderable("alpha-box-50-title", {
    content: "Alpha 50%",
    x: 20,
    y: 8,
    fg: "#FFFFFF",
    attributes: TextAttributes.BOLD,
    zIndex: 60,
  })
  parentContainer.add(alphaBox50Title)

  const alphaBox75 = new BoxRenderable("alpha-box-75", {
    x: 30,
    y: 7,
    width: 25,
    height: 8,
    bg: RGBA.fromValues(255 / 255, 100 / 255, 100 / 255, 192 / 255),
    zIndex: 30,
    borderStyle: "double",
    borderColor: "#FFFFFF",
  })
  parentContainer.add(alphaBox75)

  const alphaBox75Title = new TextRenderable("alpha-box-75-title", {
    content: "Alpha 75%",
    x: 35,
    y: 10,
    fg: "#FFFFFF",
    attributes: TextAttributes.BOLD,
    zIndex: 40,
  })
  parentContainer.add(alphaBox75Title)

  const alphaBox25 = new BoxRenderable("alpha-box-25", {
    x: 45,
    y: 9,
    width: 25,
    height: 8,
    bg: RGBA.fromValues(0, 0, 0, 64 / 255),
    zIndex: 10,
    borderStyle: "rounded",
    borderColor: "#FFFFFF",
  })
  parentContainer.add(alphaBox25)

  const alphaBox25Title = new TextRenderable("alpha-box-25-title", {
    content: "Alpha 25%",
    x: 50,
    y: 12,
    fg: "#FFFFFF",
    attributes: TextAttributes.BOLD,
    zIndex: 20,
  })
  parentContainer.add(alphaBox25Title)

  // Additional overlapping boxes to show more complex blending
  const alphaGreen = new BoxRenderable("alpha-green", {
    x: 20,
    y: 11,
    width: 30,
    height: 5,
    bg: RGBA.fromValues(0, 255 / 255, 0, 96 / 255),
    zIndex: 20,
    borderStyle: "single",
    borderColor: "#00FF00",
  })
  parentContainer.add(alphaGreen)

  const alphaYellow = new BoxRenderable("alpha-yellow", {
    x: 25,
    y: 13,
    width: 20,
    height: 6,
    bg: RGBA.fromValues(255 / 255, 255 / 255, 0, 128 / 255),
    zIndex: 40,
    borderStyle: "single",
    borderColor: "#FFFF00",
  })
  parentContainer.add(alphaYellow)

  // Very transparent overlay box
  const alphaOverlay = new BoxRenderable("alpha-overlay", {
    x: 10,
    y: 17,
    width: 65,
    height: 4,
    bg: RGBA.fromValues(255 / 255, 255 / 255, 255 / 255, 32 / 255),
    zIndex: 60,
    borderStyle: "single",
    borderColor: "#FFFFFF",
  })
  parentContainer.add(alphaOverlay)

  const alphaOverlayTitle = new TextRenderable("alpha-overlay-title", {
    content: "Very Transparent Overlay (Alpha 12%)",
    x: 15,
    y: 18,
    fg: "#000000",
    attributes: TextAttributes.BOLD,
    zIndex: 70,
  })
  parentContainer.add(alphaOverlayTitle)

  // Explanation and key concepts
  const explanation1 = new TextRenderable("explanation1", {
    content: "Key Concepts:",
    x: 10,
    y: 22,
    fg: "#FFFFFF",
    attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
    zIndex: 1000,
  })
  parentContainer.add(explanation1)

  const explanation2 = new TextRenderable("explanation2", {
    content: "• Alpha values range from 0 (fully transparent) to 1 (fully opaque)",
    x: 10,
    y: 23,
    fg: "#CCCCCC",
    zIndex: 1000,
  })
  parentContainer.add(explanation2)

  const explanation3 = new TextRenderable("explanation3", {
    content: "• Lower z-index elements show through higher z-index transparent elements",
    x: 10,
    y: 24,
    fg: "#CCCCCC",
    zIndex: 1000,
  })
  parentContainer.add(explanation3)

  const explanation4 = new TextRenderable("explanation4", {
    content: "• Colors blend additively when multiple transparent layers overlap",
    x: 10,
    y: 25,
    fg: "#CCCCCC",
    zIndex: 1000,
  })
  parentContainer.add(explanation4)

  const explanation5 = new TextRenderable("explanation5", {
    content: "• Text underneath transparent boxes remains readable",
    x: 10,
    y: 26,
    fg: "#CCCCCC",
    zIndex: 1000,
  })
  parentContainer.add(explanation5)
}

export function destroy(renderer: CliRenderer): void {
  renderer.clearFrameCallbacks()
  renderer.remove("parent-container")
  renderer.setCursorPosition(0, 0, false)
}

if (import.meta.main) {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  })

  run(renderer)
  setupStandaloneDemoKeys(renderer)
  renderer.start()
}
