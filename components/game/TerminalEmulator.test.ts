import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

test("loads xterm base styles with the client terminal component", () => {
  const componentPath = resolve(process.cwd(), "components/game/TerminalEmulator.tsx");
  const source = readFileSync(componentPath, "utf8");

  expect(source).toContain('import "@xterm/xterm/css/xterm.css";');
});
