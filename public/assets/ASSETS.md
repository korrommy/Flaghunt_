# 🎨 FlagHunt — Asset Manifest

รายการ asset ทั้งหมดที่ต้องเตรียม วางไฟล์ตาม path ด้านล่างได้เลย ระบบจะอ้างอิงตามชื่อนี้

> **หลักการ:** สิ่งที่เป็น **pixel-art / ภาพศิลป์** ต้องใช้ไฟล์รูป (PNG/SVG) · สิ่งที่เป็น **ไอคอน UI ทั่วไป** (กระดิ่ง, ลูกศร, gear, นาฬิกา) จะใช้ **Lucide React** ในโค้ด ไม่ต้องเตรียมไฟล์
>
> **ฟอร์แมต:** pixel-art ใช้ **PNG โปร่งใส** (เปิด nearest-neighbor / `image-rendering: pixelated`) · โลโก้/เวกเตอร์ใช้ **SVG**
> **สี theme:** bg `#0a0a0a`, neon `#00ff88`

---

## 1. Brand — `brand/`

> **โลโก้จริง:** แผนที่สมบัติ pixel-art ปักธงตราหมากรุก (checkered flag) น้ำเงิน-ขาว — สื่อถึง "FlagHunt / ล่าธง" (capture the flag)

| ไฟล์ | ขนาด | ใช้ที่ | หมายเหตุ |
|------|------|--------|----------|
| `logo-mark.png` | ผู้ใช้ส่งให้แล้ว | Navbar, favicon, mobile | แผนที่ + ธงหมากรุก (วางไฟล์ที่นี่) |
| `logo-full.svg` | ~180×40 | Navbar ทุกหน้า | logo-mark + ข้อความ "FlagHunt" (optional, สร้างในโค้ดได้) |
| `favicon.ico` | 32×32 | tab เบราว์เซอร์ | จากโลโก้แผนที่ธง |
| `og-image.png` | 1200×630 | แชร์ลิงก์ social | |

> **โทนสีโลโก้:** เขียวแผนที่ + น้ำเงิน/ขาวธง — accent หลักของแอปยังเป็น neon `#00ff88` ตาม theme

## 2. Scenes (pixel-art ใหญ่) — `scenes/`

| ไฟล์ | ขนาด | ใช้ที่ |
|------|------|--------|
| `hero-terminal.png` | 800×500 | Landing hero (จอคอม retro + หีบสมบัติในห้อง server) — *Image 5* |
| `featured-ctf.png` | 240×160 | การ์ด Featured CTF (Landing) |
| `leaderboard-trophy.png` | 320×260 | ถ้วยรางวัลใหญ่ฝั่งซ้าย Leaderboard — *Image 1* |

## 3. Islands (Learning Path Map) — `islands/` — *Image 4*

| ไฟล์ | ขนาด | เกาะ |
|------|------|------|
| `01-basic-training.png` | 200×180 | ปราสาท |
| `02-web-exploitation.png` | 200×180 | อาคาร server |
| `03-network-security.png` | 200×180 | จานดาวเทียม |
| `04-reverse-engineering.png` | 200×180 | |
| `05-binary-exploitation.png` | 200×180 | |
| `06-cryptography.png` | 200×180 | |
| `07-privilege-escalation.png` | 200×180 | |
| `08-advanced-ctf.png` | 200×180 | ปราสาทมืด/สูง |
| `map-background.png` | 1280×720 | พื้นน้ำทะเลกลางคืน (tileable ได้ยิ่งดี) |
| `path-node.png` | 16×16 | จุดไข่ปลาเส้นทางเชื่อมเกาะ |
| `flag-marker.png` | 24×24 | ธงเขียวปักบนเกาะที่ผ่านแล้ว |
| `lock.png` | 24×24 | ไอคอนล็อกเกาะ (หรือใช้ Lucide `Lock`) |

## 4. Avatars — `avatars/`

| ไฟล์ | ขนาด | ใช้ที่ |
|------|------|--------|
| `hacker-default.png` | 256×256 | โปรไฟล์ตัวละครหลัก (ฮู้ดดำตาเขียว) — *Image 2* |
| `player-sprite.png` | 48×48 | ตัวเดินบนแผนที่ — *Image 4* |
| `avatar-frame.png` | 64×64 | กรอบ avatar มุมขวาบน navbar (optional) |

> avatar ผู้เล่นคนอื่นใน leaderboard ใช้รูปเดียวกัน/สุ่มสี หรือทำเป็นชุดเล็กๆ ก็ได้

## 5. Badges (36 อัน) — `badges/` — *Image 2*

ขนาดละ **64×64 PNG** ตั้งชื่อแบบ kebab-case ระบบจะแสดง state locked โดยทำเป็น grayscale + opacity เองในโค้ด (ไม่ต้องส่งไฟล์ locked แยก)

**Unlocked group (8):**
`web-cracker` · `hash-master` · `packet-sniffer` · `sqli-hunter` · `xss-exploit` · `buffer-overlord` · `privilege-escalation` · `crypto-analyst`

**Locked group (10+):**
`root-access` · `zero-day` · `social-engineer` · `ctf-champion` · `malware-dev` · `reverse-engineer` · `memory-forensics` · `network-ninja` · `exploit-developer` · `cyber-legend`

> รวมในสเปคโปรเจ็คคือ **36 badges** — ที่เหลือเติมภายหลังได้ ถ้าทำเป็น **spritesheet** (`badges-sheet.png` + `badges-map.json`) ก็รับได้ บอกมาได้เลย

## 6. CTF Ranks — `ranks/` — *Image 1*

ตรายศ pixel รูปโล่/ปีก ขนาดละ **48×48 PNG**

`legend.png` (ม่วง) · `elite.png` (ฟ้า) · `master.png` (เหลือง) · `pro.png` (เขียว) · `expert.png` (ฟ้าอ่อน)

เหรียญอันดับ 1-3: `medal-gold.png` · `medal-silver.png` · `medal-bronze.png` (40×40)

## 7. Items / Rewards — `items/` — *Image 1-5*

| ไฟล์ | ขนาด | ความหมาย |
|------|------|----------|
| `coin.png` | 24×24 | เหรียญทอง (currency) — เลข 2450 บน navbar |
| `gem.png` | 24×24 | เพชรม่วง — เลข 620 บน navbar |
| `energy.png` | 24×24 | สายฟ้าเขียว (พลังงาน) — 120/120 |
| `xp-orb.png` | 20×20 | สัญลักษณ์ XP |
| `flag.png` | 24×24 | ธง (flags captured) |
| `crate.png` | 80×80 | หีบรางวัล "Cyber Crate" — *Image 2* |

## 8. Choose Your Path cards — `paths/` — *Image 5*

ภาพ pixel ขนาด **120×120 PNG** ต่อการ์ด

`beginner.png` (ฮู้ด) · `blue-team.png` (โล่) · `web-hacking.png` (`</>`) · `reverse-eng.png` (terminal) · `pwn.png` (คลื่นสัญญาณ)

---

## ไอคอนที่ใช้ Lucide (ไม่ต้องเตรียมไฟล์)

- Navbar/Sidebar: terminal, book-open, flag, trophy, bar-chart, network, settings, mail, bell
- การ์ด How It Works: ใช้ pixel `paths/` หรือ Lucide ก็ได้
- ปุ่ม, ลูกศร, external-link, search (Clue), checkmark (task done)

## สรุปลำดับความสำคัญ (ส่งทีหลังได้)

1. **จำเป็นสุด (MVP):** `brand/logo-mark.svg`, `avatars/hacker-default.png`, 8 `islands/`, `map-background.png`, 8 badge unlocked, `items/{coin,gem,energy,flag}`
2. **รองลงมา:** `scenes/`, ranks, paths, crate
3. **เติมภายหลัง:** badge ครบ 36, sprite เดิน, frame

> ถ้ายังไม่มีไฟล์ ผมจะใช้ **placeholder** (สี่เหลี่ยม neon + Lucide icon) ไปก่อน แล้วค่อยสลับเป็นรูปจริงเมื่อนายวางไฟล์ตาม path นี้ได้เลย
