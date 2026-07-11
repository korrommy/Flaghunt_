-- ============================================================================
-- FlagHunt — Seed data (ส่วนที่ 1)
-- 5 chapters + challenges (flag_hash = SHA-256 hex, คำนวณด้วย pgcrypto) + badges
-- รันซ้ำได้ (truncate + restart identity)
-- ============================================================================

truncate public.user_badges, public.user_progress, public.challenges,
         public.badges, public.chapters restart identity cascade;

-- ----------------------------------------------------------------------------
-- CHAPTERS
-- ----------------------------------------------------------------------------

insert into public.chapters (title, description, domain, order_num, icon, color_accent) values
  ('Hidden in Plain Sight', 'ค้นหาข้อมูลที่ซ่อนอยู่ใน Metadata และพิกเซลของไฟล์ภาพ', 'Steganography', 1, '🖼️', '#00ff88'),
  ('The Cipher Wars',       'ถอดรหัสคลาสสิก: Caesar Cipher, Base64 และ XOR',          'Cryptography',  2, '🔐', '#a855f7'),
  ('Web of Secrets',        'เจาะช่องโหว่เว็บ: View Source, robots.txt, Command Injection', 'Web Security', 3, '🕸️', '#38bdf8'),
  ('Ghost Protocol',        'สืบหาตัวตนจากข้อมูลสาธารณะออนไลน์ด้วยเทคนิค OSINT',       'OSINT',         4, '👻', '#f59e0b'),
  ('Trail of Evidence',     'วิเคราะห์ Access Log เพื่อหาร่องรอยการบุกรุก',           'Log Analysis',  5, '📜', '#ef4444');

-- ----------------------------------------------------------------------------
-- CHALLENGES
-- flag_hash values are precomputed SHA-256 hex and never include plaintext flags.
-- chapter_id อ้างอิงด้วย subselect (กันลำดับ id เปลี่ยน)
-- ----------------------------------------------------------------------------

insert into public.challenges (chapter_id, title, description, flag_hash, xp_reward, difficulty, max_hints, order_num)
values
  -- Chapter 1: Steganography
  ((select id from public.chapters where domain = 'Steganography'),
   'Metadata Detective',
   'รูปภาพนี้ดูธรรมดา แต่ผู้ส่งอาจลืมลบข้อมูลบางอย่างที่ฝังมากับไฟล์ ลองดูใน Metadata สิ',
   'eeef170d2ba88e46654ce757d01db8fba097edf0b030e1f098fea2a877c79a54',
   100, 'easy', 3, 1),

  ((select id from public.chapters where domain = 'Steganography'),
   'Whispers in the Pixels',
   'มีข้อความซ่อนอยู่ในระดับบิตต่ำสุดของแต่ละพิกเซล (LSB) ลองดึงมันออกมา',
   '183517caeb9c4b0c77079a5dffa5b60ef4beb8d5492aa8e5a034252c9ad0eb37',
   150, 'medium', 3, 2),

  -- Chapter 2: Cryptography
  ((select id from public.chapters where domain = 'Cryptography'),
   'Hail Caesar',
   'ข้อความถูกเลื่อนตัวอักษรไปจำนวนหนึ่ง ลองหาค่า shift ที่ถูกต้อง',
   'ac647c356970ab4e4d561dacd956818dae978b5a169374c7a7e297967ba20a10',
   100, 'easy', 3, 1),

  ((select id from public.chapters where domain = 'Cryptography'),
   'Base of Operations',
   'ข้อความหน้าตาแปลกๆ ลงท้ายด้วย == บ่อยครั้งหมายถึงการเข้ารหัสแบบหนึ่ง',
   'e83f90ee600acb195fa944d6eeda591d7a3328c520d9097417cf5b4cec66641f',
   100, 'easy', 3, 2),

  ((select id from public.chapters where domain = 'Cryptography'),
   'XOR Marks the Spot',
   'ไฟล์ถูก XOR ด้วยคีย์ขนาด 1 ไบต์ ลองทุกความเป็นไปได้เพื่อหาข้อความที่อ่านได้',
   '37108660ccb39ca0cb6707f42c37c58c37e9c7b47717d964126ee8cb88a670ca',
   150, 'medium', 3, 3),

  -- Chapter 3: Web Security
  ((select id from public.chapters where domain = 'Web Security'),
   'View Source, Luke',
   'คำตอบอาจซ่อนอยู่ในคอมเมนต์ของ HTML ลองเปิดดู Source ของหน้าเว็บ',
   '931f403ca6823e8ca3079ad7bcc6cd6bea8daba82c9249288c5c5806d2c5cc62',
   100, 'easy', 3, 1),

  ((select id from public.chapters where domain = 'Web Security'),
   'Robots Welcome',
   'เว็บมักบอกบอทว่าห้ามเข้าหน้าไหน ไฟล์นั้นอาจชี้ทางไปยังที่ลับ',
   '6c57f9355b0c3bf7243f70168e1540507c24b1776e917253b70b4b020fbbcc9a',
   100, 'easy', 3, 2),

  ((select id from public.chapters where domain = 'Web Security'),
   'Command & Conquer',
   'แอปกรอง input แต่ยังไม่รัดกุมพอ มีทางลัดให้ inject คำสั่ง OS เพื่ออ่าน flag',
   '736a1d47438fae95f5c63b9ba8824531aaaca3ed50c2820a20b214736f60ad8e',
   200, 'hard', 3, 3),

  -- Chapter 4: OSINT
  ((select id from public.chapters where domain = 'OSINT'),
   'Digital Footprint',
   'เป้าหมายใช้ชื่อผู้ใช้เดียวกันในหลายแพลตฟอร์ม ตามรอยจนเจอข้อมูลที่หลุดออกมา',
   '21a9be089e97d7196798ed1b634a376d62f2881aad57829cdeb11aef32ca1686',
   150, 'medium', 3, 1),

  -- Chapter 5: Log Analysis
  ((select id from public.chapters where domain = 'Log Analysis'),
   'Needle in the Logstack',
   'Access log เต็มไปด้วย request ปกติ แต่มีร่องรอยการเดารหัสผ่านซ่อนอยู่',
   '2c271da599d7978164ee1c0fad4b271d3584163b0423b40a49d4e55accb312f1',
   150, 'medium', 3, 1);

-- ----------------------------------------------------------------------------
-- BADGES
-- icon = ชื่อไฟล์ asset (kebab-case) → /assets/badges/<icon>.png
-- chapter_id = badge ที่ได้เมื่อจบ chapter นั้น; required_level = badge ตามเลเวล
-- ----------------------------------------------------------------------------

insert into public.badges (chapter_id, name, description, icon, required_level) values
  ((select id from public.chapters where domain = 'Steganography'),
   'Packet Sniffer', 'ค้นพบข้อมูลที่ซ่อนอยู่ในไฟล์ได้สำเร็จ', 'packet-sniffer', 1),
  ((select id from public.chapters where domain = 'Cryptography'),
   'Crypto Analyst', 'ถอดรหัสคลาสสิกได้ครบทุกข้อในบท', 'crypto-analyst', 1),
  ((select id from public.chapters where domain = 'Cryptography'),
   'Hash Master',    'เชี่ยวชาญการเข้ารหัสและถอดรหัส', 'hash-master', 5),
  ((select id from public.chapters where domain = 'Web Security'),
   'Web Cracker',    'เจาะช่องโหว่เว็บพื้นฐานได้สำเร็จ', 'web-cracker', 1),
  ((select id from public.chapters where domain = 'Web Security'),
   'SQLi Hunter',    'เข้าใจการโจมตีฝั่งเว็บอย่างลึกซึ้ง', 'sqli-hunter', 8),
  ((select id from public.chapters where domain = 'Web Security'),
   'XSS Exploit',    'ค้นพบและใช้ช่องโหว่ XSS', 'xss-exploit', 10),
  ((select id from public.chapters where domain = 'OSINT'),
   'Social Engineer', 'สืบหาข้อมูลจากแหล่งสาธารณะได้สำเร็จ', 'social-engineer', 1),
  ((select id from public.chapters where domain = 'Log Analysis'),
   'Privilege Escalation', 'วิเคราะห์ log จับร่องรอยผู้บุกรุกได้', 'privilege-escalation', 1),
  (null, 'Buffer Overlord', 'ไต่ถึงเลเวล 15 — นักล่าธงตัวจริง', 'buffer-overlord', 15);

