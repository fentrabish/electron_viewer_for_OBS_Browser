const { app, BrowserWindow, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const statePath = path.join(__dirname, 'window-state.json'); // store position/size here
let mainWin;
let toggleState = 0; // 0 = framed-look, 1 = frameless-look, 2 = hidden

function loadConfig() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading config.json at ${configPath}:`, err);
    process.exit(1);
  }
}

// --- Window state persistence ---
function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return { width: 1920, height: 1080, x: undefined, y: undefined }; // default
  }
}

function saveWindowState(bounds) {
  fs.writeFileSync(statePath, JSON.stringify(bounds));
}

function getPositionStyle(pos, width, height) {
  if (typeof pos === 'string') {
    switch (pos) {
      case 'top-left': return `top:0; left:0;`;
      case 'top-right': return `top:0; right:0;`;
      case 'bottom-left': return `bottom:0; left:0;`;
      case 'bottom-right': return `bottom:0; right:0;`;
      default: return `top:0; left:0;`;
    }
  } else if (typeof pos === 'object' && pos.x !== undefined && pos.y !== undefined) {
    return `top:${pos.y}px; left:${pos.x}px;`;
  }
  return `top:0; left:0;`;
}

function buildHtml(sources) {
  const iframes = sources.map(src => {
    const posStyle = getPositionStyle(src.position, src.width, src.height);
    return `<iframe
              src="${src.url}"
              width="${src.width || 300}"
              height="${src.height || 300}"
              style="position:absolute; ${posStyle} -webkit-app-region:no-drag;"
            ></iframe>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          overflow: hidden;
          background: transparent;
          width: 100%;
          height: 100%;
          position: relative;
          -webkit-app-region: drag;
        }
        iframe {
          border: none;
        }
        #titlebar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 30px;
          background: rgba(50,50,50,0.8);
          color: white;
          font-family: sans-serif;
          font-size: 14px;
          line-height: 30px;
          padding-left: 10px;
          box-sizing: border-box;
          -webkit-app-region: drag;
        }
        .hidden {
          display: none;
        }
      </style>
    </head>
    <body>
      <div id="titlebar">My App</div>
      ${iframes}
      <script>
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('toggle-frame-look', (event, show) => {
          document.getElementById('titlebar').classList.toggle('hidden', !show);
        });
      </script>
    </body>
    </html>
  `;
}

function createWindow(html) {
  const state = loadWindowState();

  mainWin = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    resizable: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const htmlData = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html);
  mainWin.loadURL(htmlData);

  // Save state when moved or resized
  const saveState = () => {
    if (!mainWin.isMinimized() && !mainWin.isMaximized()) {
      saveWindowState(mainWin.getBounds());
    }
  };

  mainWin.on('resize', saveState);
  mainWin.on('move', saveState);
}

function setupShortcuts() {
  const actions = [
    () => { // Framed-look → Frameless-look
      mainWin.webContents.send('toggle-frame-look', false);
      toggleState = 1;
      console.log('Frameless look');
    },
    () => { // Frameless-look → Hidden
      mainWin.hide();
      toggleState = 2;
      console.log('Hidden');
    },
    () => { // Hidden → Framed-look
      mainWin.show();
      mainWin.webContents.send('toggle-frame-look', true);
      toggleState = 0;
      console.log('Framed look');
    }
  ];

  globalShortcut.register('Control+Shift+M', () => {
    actions[toggleState]?.();
  });
}

app.whenReady().then(() => {
  const config = loadConfig();
  const html = buildHtml(config.sources || []);
  createWindow(html);
  setupShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
