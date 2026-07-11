import { describe, expect, it } from "vitest";

import { executeTerminalCommand, getTerminalScript } from "@/lib/terminal-scripts";

describe("terminal scripts", () => {
  it("returns a Thai safe help message for an unknown command", () => {
    const result = executeTerminalCommand(getTerminalScript(1), "rm -rf /");

    expect(result.type).toBe("output");
    expect(result.lines.join(" ")).toContain("ไม่รองรับคำสั่งนี้");
  });

  it("returns only the matching scripted output for a known command", () => {
    const result = executeTerminalCommand(getTerminalScript(1), "metadata");

    expect(result).toEqual({
      type: "output",
      lines: ["EXIF: ตรวจสอบช่อง Comment และ Artist ของไฟล์ตัวอย่าง"],
    });
  });

  it("treats inherited file names as missing files", () => {
    const script = getTerminalScript(1);
    const missingFile = executeTerminalCommand(script, "cat missing.txt");

    expect(executeTerminalCommand(script, "cat toString")).toEqual(missingFile);
    expect(executeTerminalCommand(script, "cat constructor")).toEqual(missingFile);
  });

  it("treats inherited command names as harmless unknown commands", () => {
    const script = getTerminalScript(1);
    const unknownCommand = executeTerminalCommand(script, "not-a-command");

    expect(executeTerminalCommand(script, "toString")).toEqual(unknownCommand);
    expect(executeTerminalCommand(script, "constructor")).toEqual(unknownCommand);
  });
});
