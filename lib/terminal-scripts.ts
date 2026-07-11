import type { TerminalScript } from "@/lib/types";

export interface TerminalOutput {
  type: "clear" | "output";
  lines: string[];
}

const defaultScript: TerminalScript = {
  challengeId: 0,
  welcomeMessage: ["FlagHunt Safe Terminal", "พิมพ์ help เพื่อดูคำสั่งที่ใช้ได้"],
  files: {},
  commands: {},
};

const terminalScripts: Record<number, TerminalScript> = {
  1: {
    challengeId: 1,
    welcomeMessage: ["[Metadata Detective]", "พิมพ์ ls แล้วใช้ cat กับไฟล์ตัวอย่าง"],
    files: { "evidence.txt": "ไฟล์ภาพอาจเก็บข้อมูลไว้ใน EXIF metadata" },
    commands: { metadata: "EXIF: ตรวจสอบช่อง Comment และ Artist ของไฟล์ตัวอย่าง" },
  },
  2: { challengeId: 2, welcomeMessage: ["[Whispers in the Pixels]"], files: { "pixels.txt": "ลองสังเกต LSB ของแต่ละพิกเซล" }, commands: { lsb: "เริ่มจากแปลงบิตต่ำสุดให้เป็นข้อความ" } },
  3: { challengeId: 3, welcomeMessage: ["[Hail Caesar]"], files: { "cipher.txt": "KHOOR ZRUOG" }, commands: { rotate: "ลองเลื่อนอักษรย้อนกลับทีละตำแหน่ง" } },
  4: { challengeId: 4, welcomeMessage: ["[Base of Operations]"], files: { "message.txt": "ข้อความลงท้ายด้วย == มักเป็น Base64" }, commands: { base64: "ถอดรหัส Base64 เพื่ออ่านข้อความต้นฉบับ" } },
  5: { challengeId: 5, welcomeMessage: ["[XOR Marks the Spot]"], files: { "xor.txt": "คีย์มีขนาด 1 ไบต์" }, commands: { xor: "ลองไล่ค่าคีย์และมองหาข้อความที่อ่านได้" } },
  6: { challengeId: 6, welcomeMessage: ["[View Source, Luke]"], files: { "page.html": "ตรวจสอบ HTML comment ใน source" }, commands: { source: "เปิดดู source และค้นหา comment ที่ถูกซ่อนไว้" } },
  7: { challengeId: 7, welcomeMessage: ["[Robots Welcome]"], files: { "robots.txt": "User-agent: *\nDisallow: /archive" }, commands: { robots: "robots.txt สามารถบอกเส้นทางที่ไม่อยากให้ crawler เข้า" } },
  8: { challengeId: 8, welcomeMessage: ["[Command & Conquer]"], files: { "review.txt": "วิเคราะห์ input handling โดยไม่รันคำสั่งจริง" }, commands: { inspect: "มองหาจุดที่ input ถูกนำไปประกอบคำสั่งโดยไม่มีการตรวจสอบ" } },
  9: { challengeId: 9, welcomeMessage: ["[Digital Footprint]"], files: { "profile.txt": "ติดตามข้อมูลสาธารณะอย่างรับผิดชอบ" }, commands: { osint: "เริ่มจาก username ที่ซ้ำกันในหลายแหล่งข้อมูลสาธารณะ" } },
  10: { challengeId: 10, welcomeMessage: ["[Needle in the Logstack]"], files: { "access.log": "ค้นหาค่า status และ path ที่ผิดปกติ" }, commands: { analyze: "กรอง request ที่ผิดปกติแล้วเปรียบเทียบกับพฤติกรรมปกติ" } },
};

export const getTerminalScript = (challengeId: number): TerminalScript => terminalScripts[challengeId] ?? defaultScript;

const helpLines = (script: TerminalScript): string[] => [
  "คำสั่งที่ใช้ได้: help, clear, ls, cat <filename>",
  ...Object.keys(script.commands).map((command) => `คำสั่งโจทย์: ${command}`),
];

export const executeTerminalCommand = (script: TerminalScript, entered: string): TerminalOutput => {
  const command = entered.trim();
  if (command === "clear") return { type: "clear", lines: [] };
  if (command === "help") return { type: "output", lines: helpLines(script) };
  if (command === "ls") return { type: "output", lines: Object.keys(script.files).length ? Object.keys(script.files) : ["ไม่มีไฟล์สำหรับโจทย์นี้"] };
  if (command.startsWith("cat ")) {
    const filename = command.slice(4).trim();
    const file = script.files[filename];
    return file ? { type: "output", lines: file.split("\n") } : { type: "output", lines: ["ไม่พบไฟล์นี้ ใช้ ls เพื่อดูรายการไฟล์"] };
  }
  const output = script.commands[command];
  if (output) return { type: "output", lines: Array.isArray(output) ? output : [output] };
  return { type: "output", lines: ["ไม่รองรับคำสั่งนี้ ใช้ help เพื่อดูคำสั่งที่ปลอดภัย"] };
};
