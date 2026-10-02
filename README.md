# OPD Token Live — Remote Patient & Hospital Sync Prototype

A high-fidelity frontend UI prototype connecting **patients sitting at home** with **hospital OPD reception & doctor rooms** in real time.

Designed specifically for **elderly and low-literacy users** with large buttons, large doctor profile photos, audio voice assistance (Hindi & English), visual icons, minimal text, and high-contrast status badges.

---

## 🌟 Core Product Idea

1. **Patient at Home**:
   - Opens the app on phone.
   - Selects Hospital (e.g. *City Care Hospital, Moga*).
   - Views large doctor photos (e.g. *Dr. Rajesh Sharma — Heart Specialist*).
   - Taps doctor photo or **"GET TOKEN"**.
   - Receives **OPD Token #25**.
   - Views real-time queue tracking (*"4 people before you"*, *~30 min wait*).
   - Reassured with clear guidance: *"You do not need to stand in the queue. Come to the hospital when your token is near."*
   - Status changes dynamically:
     - 🟢 **Your turn is coming** (when 2–3 people ahead)
     - 🟡 **Please start coming to the hospital** (when 1 person ahead)
     - 🔴 **YOUR TURN (Token #25 Active)** (triggers hospital bell chime + voice alert + room directions)

2. **Hospital OPD Desk**:
   - Sees today's queue update in real time when patient books from home.
   - Filter by Doctor (Dr. Rajesh Sharma, Dr. Neha Gupta, Dr. Amit Kumar).
   - Clicks **"CALL NEXT PATIENT"**:
     - Token changes: `21 → 22 → 23 → 24 → 25`
     - Plays hospital announcement chime (`C5 → E5 → G5`)
     - Patient's mobile screen simultaneously updates!
   - Controls:
     - ⏭️ **CALL NEXT TOKEN**
     - 🔁 **RECALL TOKEN** (re-announces token)
     - ⏸️ **PAUSE QUEUE**

3. **Platform Pricing Model**:
   - **First 3 Tokens**: 🟢 **100% FREE (मुफ़्त - ₹0)**
   - **From 4th Token Onwards**: 🪙 **₹10 / token** platform convenience charge.
   - Visual ledger displayed on hospital dashboard:
     ```
     1 — FREE
     2 — FREE
     3 — FREE
     4 — ₹10
     5 — ₹10
     6 — ₹10
     Today's Platform Charge: ₹30
     ```

---

## 📱 Patient Screens (Elderly & Low-Literacy Friendly)

- **Screen 1: Welcome Screen**: Large heading *"Book Your Doctor Token From Home"*, big action buttons: `🩺 Get Doctor Token`, `🏥 Find Hospital`, `📋 My Token`, `☎️ Help`.
- **Screen 2: Hospital Selection**: Large cards with photos, location (📍 *Moga*), `🟢 Open Now`, doctor counts, and large `VIEW DOCTORS` button.
- **Screen 3: Doctor Selection**: Giant doctor profile photos, symptom icons (❤️ Heart, 👶 Child, 🤒 Fever), `Current Token: 18`, `Waiting: 7`, `Next Available Token: 19`, and `GET TOKEN` button. Both photo and button are clickable.
- **Screen 4: Doctor Detail**: Large profile photo, room number (*Room 204*), OPD timings, today's metrics, and `🎟️ GET MY TOKEN` button.
- **Screen 5: Token Confirmation**: Dashed printable pass with giant `#25` numeral, current token `#18`, people before you `#6`, estimated wait time `30–45 mins`, `🟡 PLEASE WAIT`, and reassurance box.
- **Screen 6: Live Token Tracking**: Visual queue timeline showing tokens `21 → 22 → 23 → 24 → 25` with color-coded badges (`✅ Completed`, `🟢 Calling`, `🔵 YOUR TOKEN`, `⚪ Waiting`).
- **Screen 7: Token Called Screen**: Full-screen high-priority alert: `# 🔔 YOUR TURN`, `Token 25`, `Dr. Rajesh Sharma`, `Room 204`, with audio announcement and `VIEW HOSPITAL DETAILS`.
- **Screen 8: Help & Support**: 24/7 toll-free helpline `1800-22-4488` with simple answers.

---

## 🏥 Hospital Staff Screens

- **Screen 8: Hospital Login**: Clean staff login screen with Hospital ID and Password.
- **Screen 9: Hospital Dashboard**: Metrics cards for `Current Token`, `Total Tokens (48)`, `Waiting (12)`, `Completed (20)`, and big `📢 CALL NEXT PATIENT` button.
- **Screen 10: Live OPD Queue Table**: Real-time table showing Token #, Patient Name, Doctor, Status (`✅ Done`, `🟡 Current`, `⏳ Waiting`), and Platform Fee status (`FREE` vs `₹10 Paid`).
- **Screen 11: Doctor-wise Queue**: Instant switcher between Dr. Rajesh Sharma, Dr. Neha Gupta, and Dr. Amit Kumar with independent queues and token counters.
- **Screen 12: Real-Time Sync**: Instant two-way synchronization via reactive frontend state and `BroadcastChannel`.
- **Screen 13: Platform Pricing & Revenue**: Live ledger tracking free vs paid tokens and total platform charges.

---

## ⚡ Interactive Views & Demo Mode

1. **⚡ Dual Sync (Demo View)**:
   - Displays the **Patient Mobile Phone** on the left and the **Hospital Dashboard** on the right side-by-side.
   - Clicking on the left or right immediately reflects on the other side!
2. **📱 Patient App Only**: Focused smartphone view for patient testing.
3. **🏥 Hospital Dashboard Only**: Full-screen hospital staff console.
4. **🎬 RUN DEMO Button**:
   - An automated, guided walkthrough that showcases the complete user story in under 90 seconds:
     1. Patient opens app at home
     2. Selects City Care Hospital
     3. Clicks Dr. Rajesh Sharma
     4. Clicks "GET TOKEN" → Receives Token #25
     5. Opens Live Queue Tracker
     6. Hospital dashboard shows Token #25 synced
     7. Hospital staff clicks "CALL NEXT"
     8. Current token advances: 21 → 22 → 23 → 24 → 25
     9. Patient phone triggers **🔔 YOUR TURN** with hospital chime!

---

## 🔊 Accessibility & Low-Literacy Features

- **Web Audio Chime**: Synthesized hospital bell announcement chime (`C5 → E5 → G5`) using browser `AudioContext` (no MP3 files required, 100% offline).
- **Text-to-Speech (TTS)**: Dedicated voice button (`🔊 सुने / Listen`) speaks instructions and token status aloud in clear Hindi or Indian English.
- **High-Contrast Numerals**: 72px+ bold font sizes for token numbers.
- **Visual Color Indicators**:
  - 🟢 Green: Open, available, calling
  - 🟡 Yellow: Please wait, in queue
  - 🔴 Red: Active consultation, your turn alert
- **Language Switcher**: One-click toggle between **English** and **हिंदी** across all screens.

---

## 🚀 How to Run Locally

You can run this prototype directly in any web browser without installing dependencies or backend frameworks:

### Option 1: Python Local Server
```bash
cd /Users/sujal6067/Documents/healthcare
python3 -m http.server 8000
```
Then open your browser at:
`http://localhost:8000`

### Option 2: Direct File Open
Open `index.html` directly in Google Chrome, Safari, Edge, or Firefox.
