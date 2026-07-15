"use client";

import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import type { TerminalScript } from "@/lib/types";
import { executeTerminalCommand } from "@/lib/terminal-scripts";

interface TerminalEmulatorProps { script: TerminalScript; }

export function TerminalEmulator({ script }: TerminalEmulatorProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = (): void => undefined;
    const mountTerminal = async (): Promise<void> => {
      try {
        const [{ Terminal }, { FitAddon }] = await Promise.all([import("@xterm/xterm"), import("@xterm/addon-fit")]);
        if (disposed || !hostRef.current) return;
        const terminal = new Terminal({ convertEol: true, cursorBlink: !window.matchMedia("(prefers-reduced-motion: reduce)").matches, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, theme: { background: "#0a0a0a", foreground: "#e5e5e5", cursor: "#00ff88", green: "#00ff88" } });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(hostRef.current);
        fitAddon.fit();
        terminal.writeln(script.welcomeMessage.join("\r\n"));
        terminal.write("\r\nflaghunt> ");
        let line = "";
        const commandDisposable = terminal.onData((data) => {
          if (data === "\r") {
            terminal.write("\r\n");
            const result = executeTerminalCommand(script, line);
            if (result.type === "clear") terminal.clear(); else terminal.writeln(result.lines.join("\r\n"));
            line = "";
            terminal.write("flaghunt> ");
          } else if (data === "\u007f") {
            if (line.length > 0) { line = line.slice(0, -1); terminal.write("\b \b"); }
          } else if (/^[\x20-\x7e]$/.test(data)) { line += data; terminal.write(data); }
        });
        const observer = new ResizeObserver(() => fitAddon.fit());
        observer.observe(hostRef.current);
        cleanup = () => { observer.disconnect(); commandDisposable.dispose(); terminal.dispose(); };
      } catch { if (hostRef.current) hostRef.current.textContent = "ไม่สามารถเปิด Terminal ได้ กรุณาลองใหม่"; }
    };
    void mountTerminal();
    return () => { disposed = true; cleanup(); };
  }, [script]);

  return <div aria-label="Terminal จำลองสำหรับโจทย์" className="min-h-64 rounded-md border border-[#30291b] bg-[#0a0a0a] p-2 font-mono" ref={hostRef} role="region" tabIndex={0} />;
}
