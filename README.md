# electron_viewer_for_OBS_Browser

A lightweight Electron-based "browser source" window for OBS Studio.  
If your OBS installation doesn’t have the built-in Browser Source feature, this app emulates it by creating an always-on-top, transparent window to display multiple web widgets, overlays, or alerts.

---

## ✨ Features

- Display multiple web sources in one transparent, draggable window.
- Saves window position and size between runs.
- Always-on-top for easy overlay use.
- Three display modes:
  1. **Framed look** (with draggable title bar)
  2. **Frameless look** (clean overlay)
  3. **Hidden**
- Simple configuration via config.json.
- Global shortcut: Ctrl + Shift + M to cycle modes.

---

## 📦 Installation

1. Clone this repository:
   git clone https://github.com/fentrabish/electron_viewer_for_OBS_Browser.git
   cd electron_viewer_for_OBS_Browser

2. Install dependencies:
   npm install

3. Edit configuration:
   Open config.json and set your desired sources:
   {
     "sources": [
       {
         "url": "https://streamlabs.com/widgets/chat-highlight?",
         "width": 800,
         "height": 200,
         "position": "top-left"
       },
       {
         "url": "https://streamlabs.com/alert-box/v3",
         "width": 300,
         "height": 200,
         "position": "top-left"
       }
     ]
   }

4. Run the app:
5. cd your/directory
   npm run start

---

## 🎯 Usage

- The window will appear on top of other apps, ready for OBS screen/window capture.
- Use Ctrl + Shift + M to cycle:
  1. Framed look → Frameless look → Hidden → back to Framed look.
- Position and resize the window — it will remember these settings next time.

---

## 🛑 Notes

- The window is transparent and designed for overlays in OBS.
- Built for quick setup with minimal dependencies.
- Works cross-platform where Electron is supported.
