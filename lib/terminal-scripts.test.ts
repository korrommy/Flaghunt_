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
});
