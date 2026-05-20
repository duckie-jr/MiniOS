## Mini OS Code Snippets

Paste any of these into the **Code Editor** app, select **JavaScript**, and hit **Run**.

All of these also work as **`.app` files** — create a new text file in the file manager, rename it to `something.app`, open it in Notepad, paste the code, close it, then double-click to run. The `.app` format uses the exact same `OS` API as the Code Editor.

---



---

### Window Control Panel

Demonstrates: `pinWindow` · `shakeWindow` · `flashWindow` · `tileWindows` · `minimizeAll` · `restoreAll` · `setWindowOpacity` · `moveWindow` · `resizeWindow` · `getScreenSize`

A pinned toolbar that sits above every other window and controls the whole desktop. Open a few other apps first so you have windows to play with.

```js
var w = OS.createWindow('Window Controls', 500, 52,
  '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;height:100%;padding:0 8px;background:#ece9d8">' +
    '<button id="btnPin"    style="padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit">📌 Unpin</button>' +
    '<button id="btnShake"  style="padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit">💥 Shake All</button>' +
    '<button id="btnFlash"  style="padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit">⚡ Flash All</button>' +
    '<button id="btnTile"   style="padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit">⊞ Tile</button>' +
    '<button id="btnMinAll" style="padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit">_ Min All</button>' +
    '<button id="btnResAll" style="padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit">⬜ Restore All</button>' +
    '<input  id="sldOpacity" type="range" min="20" max="100" value="100" style="width:70px" title="Opacity of other windows" />' +
    '<span   id="lblOpacity" style="font-size:11px;min-width:32px">100%</span>' +
  '</div>'
);

// Pin immediately so it always floats above everything else
OS.pinWindow(w);

// Center it at the top of the screen
var screen = OS.getScreenSize();
OS.moveWindow(w, (screen.width - 500) / 2, 4);
OS.resizeWindow(w, 500, 52);

// Toggle pin on button click
w.el.querySelector('#btnPin').addEventListener('click', function() {
  OS.pinWindow(w);
  this.textContent = w.pinned ? '📌 Unpin' : '📌 Pin';
});

w.el.querySelector('#btnShake').addEventListener('click', function() {
  OS.windows.forEach(function(win) { if (win !== w) OS.shakeWindow(win); });
});

w.el.querySelector('#btnFlash').addEventListener('click', function() {
  OS.windows.forEach(function(win) { if (win !== w) OS.flashWindow(win); });
});

w.el.querySelector('#btnTile').addEventListener('click',   function() { OS.tileWindows(); });
w.el.querySelector('#btnMinAll').addEventListener('click', function() { OS.minimizeAll(); });
w.el.querySelector('#btnResAll').addEventListener('click', function() { OS.restoreAll(); });

w.el.querySelector('#sldOpacity').addEventListener('input', function() {
  var pct = parseInt(this.value);
  w.el.querySelector('#lblOpacity').textContent = pct + '%';
  OS.windows.forEach(function(win) { if (win !== w) OS.setWindowOpacity(win, pct / 100); });
});

OS.showToast('Window Controls pinned at top', 2000);
```

---

### Desktop Widget Clock

Demonstrates: `addDesktopWidget` · `setTaskbarColor` · `setCursorStyle` · `getScreenSize`

Adds a live clock widget directly on the desktop and opens a small theme panel.

```js
var screen = OS.getScreenSize();

// Live clock widget — top-left corner
var clockEl = OS.addDesktopWidget(
  '<div id="wClk" style="background:rgba(0,0,0,.55);color:#fff;font-family:monospace;' +
    'font-size:22px;padding:6px 14px;border-radius:6px;pointer-events:none;' +
    'text-shadow:0 0 8px rgba(100,200,255,.7)"></div>',
  14, 14
);
function tickClock() {
  var el = clockEl.querySelector('#wClk');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
tickClock();
var clockIv = setInterval(tickClock, 1000);

// Window count badge — sits just above the taskbar
var badgeEl = OS.addDesktopWidget(
  '<div id="wBadge" style="background:rgba(0,0,0,.45);color:#0f0;font-family:monospace;' +
    'font-size:12px;padding:3px 10px;border-radius:4px;pointer-events:none"></div>',
  14, screen.height - 36
);
setInterval(function() {
  var el = badgeEl.querySelector('#wBadge');
  if (el) el.textContent = OS.windows.length + ' window' + (OS.windows.length !== 1 ? 's' : '') + ' open';
}, 600);

// Theme control window
var themes = [
  { label: 'XP Blue', bg: OS.wallpapers[0], bar: 'linear-gradient(180deg,#1f53d1,#102e8a)' },
  { label: 'Forest',  bg: OS.wallpapers[1], bar: '#1a3d1a' },
  { label: 'Night',   bg: OS.wallpapers[3], bar: '#0d0d1a' },
  { label: 'Sunset',  bg: 'linear-gradient(135deg,#4a0000,#cc4400)', bar: '#3a1500' }
];

var btns = themes.map(function(t, i) {
  return '<button style="padding:4px 10px;cursor:pointer;font-size:11px;font-family:inherit" ' +
         'onclick="(function(){' +
           'document.getElementById(\'desktop\').style.background=\'' + t.bg.replace(/'/g, "\\'") + '\';' +
           'OS.setTaskbarColor(\'' + t.bar + '\');' +
           'OS.showToast(\'' + t.label + ' applied\',1200);' +
         '})()">' + t.label + '</button>';
}).join('');

var tw = OS.createWindow('Desktop Widgets', 320, 120,
  '<div style="display:flex;flex-direction:column;gap:8px;padding:10px;background:#ece9d8">' +
    '<div style="font-size:11px;font-weight:700">Taskbar Theme:</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:4px">' + btns + '</div>' +
    '<div style="display:flex;gap:6px;margin-top:2px">' +
      '<button onclick="OS.setCursorStyle(\'crosshair\')" style="padding:3px 8px;font-size:10px;cursor:pointer;font-family:inherit">✛ Crosshair</button>' +
      '<button onclick="OS.setCursorStyle(\'none\')"      style="padding:3px 8px;font-size:10px;cursor:pointer;font-family:inherit">👻 Hide</button>' +
      '<button onclick="OS.setCursorStyle(\'default\')"   style="padding:3px 8px;font-size:10px;cursor:pointer;font-family:inherit">↖ Default</button>' +
    '</div>' +
  '</div>'
);

// Clean up intervals when control window closes
tw.el.querySelector('.btn-close').addEventListener('click', function() {
  clearInterval(clockIv);
  clockEl.remove();
  badgeEl.remove();
  OS.setCursorStyle('default');
});
```

---

### Keyboard Shortcuts Suite

Demonstrates: `onKeyCombo` · `showToast` · `alert` · `tileWindows` · `minimizeAll` · `restoreAll` · `saveFilesystem` · `getScreenSize` · `getActiveUser`

Registers 6 global shortcuts and displays a cheat-sheet window. Shortcuts stay active until you reload the page.

```js
var shortcuts = [
  { combo: 'Ctrl+Shift+T', desc: 'Tile all open windows' },
  { combo: 'Ctrl+Shift+H', desc: 'Hide (minimize) all windows' },
  { combo: 'Ctrl+Shift+R', desc: 'Restore all minimized windows' },
  { combo: 'Ctrl+Shift+S', desc: 'Save filesystem to localStorage' },
  { combo: 'Ctrl+Shift+I', desc: 'Show system info dialog' },
  { combo: 'Ctrl+Shift+N', desc: 'Open a new Notepad' }
];

OS.onKeyCombo('Ctrl+Shift+T', function() {
  OS.tileWindows();
  OS.showToast('⊞ Tiled', 1000);
});

OS.onKeyCombo('Ctrl+Shift+H', function() {
  OS.minimizeAll();
  OS.showToast('_ All hidden', 1000);
});

OS.onKeyCombo('Ctrl+Shift+R', function() {
  OS.restoreAll();
  OS.showToast('⬜ All restored', 1000);
});

// allowTyping:true so it fires even inside a text box
OS.onKeyCombo('Ctrl+Shift+S', function() {
  OS.saveFilesystem();
  OS.showToast('💾 Saved', 1200);
}, { allowTyping: true });

OS.onKeyCombo('Ctrl+Shift+I', function() {
  var s = OS.getScreenSize();
  OS.alert('System Info',
    'User: '          + (OS.getActiveUser() || 'none') + '\n' +
    'Open windows: '  + OS.windows.length + '\n' +
    'Screen: '        + s.width + ' × ' + s.height + '\n' +
    'Clipboard items: '+ OS.clipboardHistory.length
  );
});

OS.onKeyCombo('Ctrl+Shift+N', function() { OS.openApp('notepad'); });

// Cheat-sheet window
var rows = shortcuts.map(function(s) {
  return '<tr>' +
    '<td style="padding:4px 12px;font-family:monospace;font-size:11px;color:#003399;white-space:nowrap">' + s.combo + '</td>' +
    '<td style="padding:4px 10px;font-size:11px">' + s.desc + '</td>' +
  '</tr>';
}).join('');

OS.createWindow('Keyboard Shortcuts', 380, 220,
  '<div style="overflow-y:auto;height:100%;background:#fff">' +
    '<div style="padding:6px 10px;background:#ece9d8;border-bottom:1px solid #ccc;font-size:11px;font-weight:700">' +
      'Active shortcuts — stay active until page reload' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse">' + rows + '</table>' +
  '</div>'
);
```

---

### Personal Notes App

Demonstrates: `readFile` · `writeFile` · `fileExists` · `listDir` · `deleteFile` · `confirm` · `showToast` · `onKeyCombo`

A minimal text editor that reads and writes real files in `C:/My Documents`. Changes persist across reloads.

```js
var FOLDER = 'C:/My Documents';
var currentFile = null;

var w = OS.createWindow('Notes', 540, 360,
  '<div style="display:flex;height:100%">' +
    '<div style="width:148px;flex-shrink:0;border-right:1px solid #ccc;display:flex;flex-direction:column;background:#f5f5f5">' +
      '<div style="padding:4px 8px;background:#ece9d8;border-bottom:1px solid #ccc;font-size:11px;font-weight:700">Files</div>' +
      '<div id="noteFiles" style="flex:1;overflow-y:auto"></div>' +
      '<button id="btnNew" style="margin:6px;padding:3px;font-size:11px;cursor:pointer;font-family:inherit">+ New File</button>' +
    '</div>' +
    '<div style="flex:1;display:flex;flex-direction:column">' +
      '<div id="noteTitle" style="padding:4px 8px;background:#ece9d8;border-bottom:1px solid #ccc;font-size:11px;font-weight:700;color:#003399">No file open</div>' +
      '<textarea id="noteBody" style="flex:1;width:100%;border:none;outline:none;resize:none;padding:6px 8px;font-family:Consolas,monospace;font-size:12px;line-height:1.5" placeholder="Open or create a file..."></textarea>' +
      '<div style="padding:2px 8px;background:#ece9d8;border-top:1px solid #ccc;font-size:10px;color:#777">Ctrl+S to save</div>' +
    '</div>' +
  '</div>'
);
w.el.querySelector('.window-body').classList.add('window-body-flex');

var fileList  = w.el.querySelector('#noteFiles');
var titleBar  = w.el.querySelector('#noteTitle');
var bodyArea  = w.el.querySelector('#noteBody');

function refreshFileList() {
  var entries = (OS.listDir(FOLDER) || []).filter(function(n) {
    return n.endsWith('.txt') || n.endsWith('.md') || n.endsWith('.log');
  });
  fileList.innerHTML = entries.length === 0
    ? '<div style="padding:8px;font-size:10px;color:#999">No files found</div>'
    : entries.map(function(name) {
        var active = name === currentFile ? 'background:#dde8ff;' : '';
        return '<div style="' + active + 'display:flex;align-items:center;justify-content:space-between;padding:4px 6px;font-size:11px;cursor:pointer;border-bottom:1px solid #eee"' +
               ' data-name="' + OS.escapeHtml(name) + '">' +
               '<span class="fName">' + OS.escapeHtml(name) + '</span>' +
               '<span class="fDel" style="color:#c44;font-size:10px;padding:0 2px">✕</span>' +
               '</div>';
      }).join('');

  fileList.querySelectorAll('[data-name]').forEach(function(row) {
    row.querySelector('.fName').addEventListener('click', function() {
      openFile(row.getAttribute('data-name'));
    });
    row.querySelector('.fDel').addEventListener('click', function() {
      var name = row.getAttribute('data-name');
      OS.confirm('Delete "' + name + '"?', function(yes) {
        if (!yes) return;
        OS.deleteFile(FOLDER + '/' + name);
        if (currentFile === name) { currentFile = null; titleBar.textContent = 'No file open'; bodyArea.value = ''; }
        refreshFileList();
      });
    });
  });
}

function openFile(name) {
  currentFile = name;
  titleBar.textContent = name;
  bodyArea.value = OS.readFile(FOLDER + '/' + name) || '';
  bodyArea.focus();
  refreshFileList();
}

function saveFile() {
  if (!currentFile) return;
  OS.writeFile(FOLDER + '/' + currentFile, bodyArea.value);
  OS.showToast('Saved ✓', 800);
  refreshFileList();
}

w.el.querySelector('#btnNew').addEventListener('click', function() {
  OS.prompt('File name:', 'notes.txt', function(name) {
    if (!name) return;
    var path = FOLDER + '/' + name;
    if (!OS.fileExists(path)) OS.writeFile(path, '');
    refreshFileList();
    openFile(name);
  });
});

OS.onKeyCombo('Ctrl+S', saveFile, { allowTyping: true });
refreshFileList();
```

---

### App Activity Monitor

Demonstrates: `onAppOpen` · `onAppClose` · `showToast` · `alert` · `writeFile` · `readFile`

Watches every app launch and window close in real time. Logs entries in the terminal-style feed and writes them to a file in `C:/My Documents`.

```js
var LOG_PATH = 'C:/My Documents/activity.log';
var entryCount = 0;

// Start the log file fresh for this session
OS.writeFile(LOG_PATH, '=== Session started ' + new Date().toLocaleString() + ' ===\n');

var w = OS.createWindow('Activity Monitor', 380, 280,
  '<div style="display:flex;flex-direction:column;height:100%;background:#0c0c0c">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:#1a1a1a;border-bottom:1px solid #333">' +
      '<span style="color:#0f0;font-family:monospace;font-size:11px">App Activity Log</span>' +
      '<div style="display:flex;gap:6px">' +
        '<button id="btnView" style="padding:1px 8px;font-size:10px;cursor:pointer;background:#333;color:#ccc;border:1px solid #555;font-family:inherit">View File</button>' +
        '<button id="btnClear" style="padding:1px 8px;font-size:10px;cursor:pointer;background:#333;color:#ccc;border:1px solid #555;font-family:inherit">Clear</button>' +
      '</div>' +
    '</div>' +
    '<div id="actFeed" style="flex:1;overflow-y:auto;padding:6px 8px;font-family:Consolas,monospace;font-size:11px;line-height:1.6"></div>' +
    '<div style="padding:2px 8px;background:#1a1a1a;border-top:1px solid #333;font-size:10px;color:#555">Monitoring all app events...</div>' +
  '</div>'
);
w.el.querySelector('.window-body').classList.add('window-body-flex');

var feed = w.el.querySelector('#actFeed');

function addLogEntry(type, name) {
  entryCount++;
  var time  = new Date().toLocaleTimeString();
  var isOpen = type === 'OPEN';
  var color  = isOpen ? '#69db7c' : '#ff6b6b';
  var line   = time + '  [' + type + ']  ' + name;

  // DOM entry
  var div = document.createElement('div');
  div.style.color = color;
  div.textContent = line;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;

  // Trim DOM to last 150 entries
  while (feed.children.length > 150) feed.removeChild(feed.firstChild);

  // Append to file (read → concat → write)
  var existing = OS.readFile(LOG_PATH) || '';
  OS.writeFile(LOG_PATH, existing + line + '\n');
}

// Set the hooks — these persist until reassigned or page reload
OS.onAppOpen  = function(appName)     { addLogEntry('OPEN',  appName); };
OS.onAppClose = function(windowTitle) { addLogEntry('CLOSE', windowTitle); };

w.el.querySelector('#btnView').addEventListener('click', function() {
  OS.alert('activity.log (' + entryCount + ' entries)',
    OS.readFile(LOG_PATH) || '(empty)');
});

w.el.querySelector('#btnClear').addEventListener('click', function() {
  feed.innerHTML = '';
  entryCount = 0;
  OS.writeFile(LOG_PATH, '=== Cleared ' + new Date().toLocaleTimeString() + ' ===\n');
  OS.showToast('Log cleared', 1000);
});

// Restore hooks to null when this monitor is closed
w.el.querySelector('.btn-close').addEventListener('click', function() {
  OS.onAppOpen  = null;
  OS.onAppClose = null;
  OS.showToast('Activity monitoring stopped', 1500);
});

OS.showNotification('Activity Monitor', 'Now watching all app events.');
```

---

### Bouncing Windows

Demonstrates: `moveWindow` · `setWindowOpacity` · `resizeWindow` · `getScreenSize` · `showToast`

Opens 4 coloured windows and bounces them around the desktop in real time. Each window has its own velocity and fades as it moves. Click Stop to end the animation.

```js
var screen = OS.getScreenSize();
var balls = [];
var animIv = null;

var colors = [
  { bg: '#c0392b', label: 'Red' },
  { bg: '#2980b9', label: 'Blue' },
  { bg: '#27ae60', label: 'Green' },
  { bg: '#8e44ad', label: 'Purple' }
];

// Spawn the bouncing windows
colors.forEach(function(c) {
  var win = OS.createWindow(c.label, 140, 80,
    '<div style="height:100%;background:' + c.bg + ';display:flex;align-items:center;' +
    'justify-content:center;color:#fff;font-size:18px;font-weight:700">' + c.label + '</div>'
  );
  balls.push({
    win: win,
    x: Math.random() * (screen.width  - 160),
    y: Math.random() * (screen.height - 100),
    vx: (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1),
    vy: (Math.random() * 3 + 1) * (Math.random() > 0.5 ? 1 : -1)
  });
});

animIv = setInterval(function() {
  balls.forEach(function(b) {
    b.x += b.vx;
    b.y += b.vy;

    // Bounce off edges
    if (b.x < 0)                  { b.x = 0;                  b.vx = Math.abs(b.vx); }
    if (b.x > screen.width - 150) { b.x = screen.width - 150; b.vx = -Math.abs(b.vx); }
    if (b.y < 0)                  { b.y = 0;                  b.vy = Math.abs(b.vy); }
    if (b.y > screen.height - 90) { b.y = screen.height - 90; b.vy = -Math.abs(b.vy); }

    // Speed = opacity (faster = more opaque)
    var speed   = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    var opacity = Math.min(1, 0.3 + speed / 10);

    OS.moveWindow(b.win, Math.round(b.x), Math.round(b.y));
    OS.setWindowOpacity(b.win, opacity);
  });
}, 16);

// Control panel
var ctrl = OS.createWindow('Bounce Controls', 240, 110,
  '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
  'height:100%;gap:8px;background:#ece9d8">' +
    '<div style="font-size:11px;color:#555">4 windows bouncing around the desktop</div>' +
    '<div style="display:flex;gap:8px">' +
      '<button id="btnStop"  style="padding:4px 18px;cursor:pointer;font-family:inherit">Stop</button>' +
      '<button id="btnFast"  style="padding:4px 18px;cursor:pointer;font-family:inherit">Speed Up</button>' +
      '<button id="btnSlow"  style="padding:4px 18px;cursor:pointer;font-family:inherit">Slow Down</button>' +
    '</div>' +
  '</div>'
);
OS.pinWindow(ctrl);

ctrl.el.querySelector('#btnStop').addEventListener('click', function() {
  clearInterval(animIv);
  balls.forEach(function(b) { OS.setWindowOpacity(b.win, 1); });
  OS.showToast('Animation stopped', 1000);
  this.disabled = true;
});

ctrl.el.querySelector('#btnFast').addEventListener('click', function() {
  balls.forEach(function(b) { b.vx *= 1.4; b.vy *= 1.4; });
});

ctrl.el.querySelector('#btnSlow').addEventListener('click', function() {
  balls.forEach(function(b) { b.vx *= 0.7; b.vy *= 0.7; });
});

ctrl.el.querySelector('.btn-close').addEventListener('click', function() {
  clearInterval(animIv);
  balls.forEach(function(b) { b.win.el.querySelector('.btn-close').click(); });
});
```

---

### File Browser with Preview

Demonstrates: `listDir` · `readFile` · `fileExists` · `formatFileSize` · `escapeHtml` · `fileSystem`

A two-pane browser: left side navigates the folder tree, right side previews the selected file's content. Uses the filesystem helpers for navigation and raw `OS.fileSystem` for size/date metadata.

```js
var currentPath = 'C:';

var w = OS.createWindow('File Browser', 560, 380,
  '<div style="display:flex;height:100%">' +
    '<div style="width:180px;flex-shrink:0;border-right:1px solid #bbb;display:flex;flex-direction:column;background:#f8f8f8">' +
      '<div style="padding:4px 8px;background:#ece9d8;border-bottom:1px solid #ccc;font-size:10px;color:#555;font-weight:700" id="pathBar">C:</div>' +
      '<div id="dirList" style="flex:1;overflow-y:auto"></div>' +
    '</div>' +
    '<div style="flex:1;display:flex;flex-direction:column">' +
      '<div id="previewTitle" style="padding:4px 8px;background:#ece9d8;border-bottom:1px solid #ccc;font-size:11px;font-weight:700;color:#003399">Select a file to preview</div>' +
      '<div id="previewBody"  style="flex:1;overflow:auto;padding:8px;font-family:Consolas,monospace;font-size:11px;white-space:pre-wrap;line-height:1.5;color:#222"></div>' +
      '<div id="previewMeta"  style="padding:3px 8px;background:#ece9d8;border-top:1px solid #ccc;font-size:10px;color:#777"></div>' +
    '</div>' +
  '</div>'
);
w.el.querySelector('.window-body').classList.add('window-body-flex');

var pathBar    = w.el.querySelector('#pathBar');
var dirList    = w.el.querySelector('#dirList');
var prevTitle  = w.el.querySelector('#previewTitle');
var prevBody   = w.el.querySelector('#previewBody');
var prevMeta   = w.el.querySelector('#previewMeta');

function getNode(path) {
  var parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
  var node  = OS.fileSystem[parts[0]];
  for (var i = 1; i < parts.length; i++) {
    if (!node || !node.children) return null;
    node = node.children[parts[i]];
  }
  return node;
}

function navigate(path) {
  currentPath = path;
  pathBar.textContent = path;
  prevTitle.textContent = 'Select a file to preview';
  prevBody.textContent  = '';
  prevMeta.textContent  = '';

  var entries = OS.listDir(path) || [];
  var node    = getNode(path);

  dirList.innerHTML = '';

  // Back button (except at root)
  if (path !== 'C:') {
    var backRow = document.createElement('div');
    backRow.style.cssText = 'padding:4px 8px;font-size:11px;cursor:pointer;border-bottom:1px solid #eee;color:#003399';
    backRow.textContent = '← ..';
    backRow.addEventListener('click', function() {
      var parts = path.replace(/\\/g, '/').split('/');
      parts.pop();
      navigate(parts.join('/'));
    });
    dirList.appendChild(backRow);
  }

  entries.forEach(function(name) {
    var childNode  = node && node.children && node.children[name];
    var isFolder   = childNode && childNode.type === 'folder';
    var row        = document.createElement('div');
    row.style.cssText = 'padding:4px 8px;font-size:11px;cursor:pointer;border-bottom:1px solid #eee;' +
                        'display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    row.innerHTML = (isFolder ? '📁 ' : '📄 ') + OS.escapeHtml(name);
    row.title = name;

    row.addEventListener('mouseenter', function() { this.style.background = '#dde8ff'; });
    row.addEventListener('mouseleave', function() { this.style.background = ''; });

    row.addEventListener('click', function() {
      if (isFolder) {
        navigate(path + '/' + name);
      } else {
        var content = OS.readFile(path + '/' + name);
        prevTitle.textContent = name;
        if (content === null) {
          prevBody.textContent = '(cannot read this file type)';
        } else {
          prevBody.textContent = content.length > 4000 ? content.slice(0, 4000) + '\n...(truncated)' : content;
        }
        var size = childNode ? OS.formatFileSize(childNode.size || 0) : '?';
        var mod  = childNode ? (childNode.modified || '?') : '?';
        prevMeta.textContent = 'Size: ' + size + '   Modified: ' + mod;
      }
    });
    dirList.appendChild(row);
  });
}

navigate('C:');
```

---

### Clipboard & Recycle Bin Viewer

Demonstrates: `clipboardHistory` · `recycleBin()` · `formatFileSize` · `escapeHtml` · `showToast` · `confirm`

A two-tab utility that shows exactly what's in the clipboard history and the Recycle Bin. You can empty the bin from here without opening the file manager.

```js
var w = OS.createWindow('Clipboard & Recycle Bin', 380, 300,
  '<div style="display:flex;flex-direction:column;height:100%;background:#fff">' +
    '<div style="display:flex;border-bottom:2px solid #ccc;background:#ece9d8">' +
      '<div id="tabClip" style="padding:5px 18px;font-size:11px;font-weight:700;cursor:pointer;border-bottom:2px solid #003399;margin-bottom:-2px;color:#003399">📋 Clipboard History</div>' +
      '<div id="tabBin"  style="padding:5px 18px;font-size:11px;cursor:pointer;color:#555">🗑 Recycle Bin</div>' +
    '</div>' +
    '<div id="panelClip" style="flex:1;overflow-y:auto"></div>' +
    '<div id="panelBin"  style="flex:1;overflow-y:auto;display:none"></div>' +
    '<div style="padding:3px 8px;background:#ece9d8;border-top:1px solid #ccc;font-size:10px;color:#777" id="statusBar">Ready</div>' +
  '</div>'
);
w.el.querySelector('.window-body').classList.add('window-body-flex');

var panelClip = w.el.querySelector('#panelClip');
var panelBin  = w.el.querySelector('#panelBin');
var statusBar = w.el.querySelector('#statusBar');
var tabClip   = w.el.querySelector('#tabClip');
var tabBin    = w.el.querySelector('#tabBin');

function switchTab(showClip) {
  panelClip.style.display = showClip ? '' : 'none';
  panelBin.style.display  = showClip ? 'none' : '';
  tabClip.style.fontWeight = showClip ? '700' : '400';
  tabClip.style.color      = showClip ? '#003399' : '#555';
  tabClip.style.borderBottom = showClip ? '2px solid #003399' : 'none';
  tabBin.style.fontWeight  = showClip ? '400' : '700';
  tabBin.style.color       = showClip ? '#555' : '#003399';
  tabBin.style.borderBottom = showClip ? 'none' : '2px solid #003399';
  if (showClip) renderClipboard(); else renderBin();
}

function renderClipboard() {
  var history = OS.clipboardHistory;
  if (history.length === 0) {
    panelClip.innerHTML = '<div style="padding:16px;text-align:center;color:#999;font-size:11px">Nothing copied yet.<br>Cut or copy files in My Documents first.</div>';
    statusBar.textContent = '0 clipboard entries';
    return;
  }
  panelClip.innerHTML = history.map(function(entry, i) {
    var modeColor = entry.mode === 'cut' ? '#c0392b' : '#2980b9';
    return '<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid #eee;font-size:11px">' +
      '<span style="background:' + modeColor + ';color:#fff;padding:1px 6px;border-radius:3px;font-size:10px;flex-shrink:0">' + entry.mode.toUpperCase() + '</span>' +
      '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + OS.escapeHtml(entry.name) + '</span>' +
      '<span style="color:#999;flex-shrink:0">' + entry.time + '</span>' +
    '</div>';
  }).join('');
  statusBar.textContent = history.length + ' clipboard ' + (history.length === 1 ? 'entry' : 'entries');
}

function renderBin() {
  var bin     = OS.recycleBin();
  var entries = Object.keys(bin.children);
  if (entries.length === 0) {
    panelBin.innerHTML = '<div style="padding:16px;text-align:center;color:#999;font-size:11px">Recycle Bin is empty.</div>';
    statusBar.textContent = 'Recycle Bin: empty';
    return;
  }
  var totalSize = entries.reduce(function(sum, name) {
    return sum + (bin.children[name].size || 0);
  }, 0);
  panelBin.innerHTML =
    '<div style="padding:4px 10px;background:#fff8e1;border-bottom:1px solid #eee;font-size:10px;color:#555">' +
      entries.length + ' item' + (entries.length !== 1 ? 's' : '') + ' — ' + OS.formatFileSize(totalSize) +
      ' <span id="emptyBinBtn" style="color:#c00;cursor:pointer;margin-left:8px;text-decoration:underline">Empty Bin</span>' +
    '</div>' +
    entries.map(function(name) {
      var node = bin.children[name];
      return '<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid #eee;font-size:11px">' +
        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🗑 ' + OS.escapeHtml(name) + '</span>' +
        '<span style="color:#999;font-size:10px">' + OS.formatFileSize(node.size || 0) + '</span>' +
      '</div>';
    }).join('');
  statusBar.textContent = 'Recycle Bin: ' + entries.length + ' item' + (entries.length !== 1 ? 's' : '');

  panelBin.querySelector('#emptyBinBtn').addEventListener('click', function() {
    OS.confirm('Permanently delete all ' + entries.length + ' item(s)?', function(yes) {
      if (!yes) return;
      entries.forEach(function(name) { delete bin.children[name]; });
      OS.saveFilesystem();
      OS.showToast('Recycle Bin emptied', 1500);
      renderBin();
    });
  });
}

tabClip.addEventListener('click', function() { switchTab(true); });
tabBin.addEventListener('click',  function() { switchTab(false); });
switchTab(true);

// Refresh every 2 seconds so new clipboard entries appear live
setInterval(function() {
  if (panelClip.style.display !== 'none') renderClipboard();
  else renderBin();
}, 2000);
```

---

### Spotlight Quick Launcher

Demonstrates: `onKeyCombo` · `openApp` · `alert` · `showToast` · `windows` · `getScreenSize` · `moveWindow`

Press **Alt+Space** anywhere to open a centred launcher. Type an app name or window title and hit Enter. Supports fuzzy matching against built-in apps and currently open window titles.

```js
var APPS = [
  { name: 'notepad',        label: 'Notepad' },
  { name: 'calculator',     label: 'Calculator' },
  { name: 'files',          label: 'My Documents' },
  { name: 'terminal',       label: 'Command Prompt' },
  { name: 'browser',        label: 'Internet' },
  { name: 'paint',          label: 'Paint' },
  { name: 'clock',          label: 'Clock' },
  { name: 'minesweeper',    label: 'Minesweeper' },
  { name: 'settings',       label: 'Control Panel' },
  { name: 'codeeditor',     label: 'Code Editor' },
  { name: 'findfiles',      label: 'Find Files' },
  { name: 'clipboardmanager', label: 'Clipboard Manager' },
  { name: 'about',          label: 'About Mini OS' }
];

var launcherWin = null;

function openLauncher() {
  // Don't open twice
  if (launcherWin && OS.windows.indexOf(launcherWin) >= 0) {
    launcherWin.el.querySelector('#spotInput').focus();
    return;
  }

  var screen = OS.getScreenSize();

  launcherWin = OS.createWindow('Quick Launch', 340, 260,
    '<div style="display:flex;flex-direction:column;height:100%;background:#fff">' +
      '<input id="spotInput" style="padding:8px 12px;font-size:14px;border:none;border-bottom:2px solid #3a89e5;outline:none;font-family:inherit" placeholder="Search apps or windows..." />' +
      '<div id="spotResults" style="flex:1;overflow-y:auto"></div>' +
      '<div style="padding:3px 10px;background:#ece9d8;border-top:1px solid #ccc;font-size:10px;color:#888">↑↓ navigate · Enter launch · Esc close</div>' +
    '</div>'
  );
  w  = launcherWin;
  w.el.querySelector('.window-body').classList.add('window-body-flex');

  // Center it on screen
  OS.moveWindow(w, (screen.width - 340) / 2, Math.floor(screen.height * 0.25));

  var input   = w.el.querySelector('#spotInput');
  var results = w.el.querySelector('#spotResults');
  var selected = 0;

  function getMatches(query) {
    var q = query.toLowerCase();
    var matches = [];

    // Open windows first
    OS.windows.forEach(function(win) {
      if (win === w) return;
      if (!q || win.title.toLowerCase().includes(q)) {
        matches.push({ label: '🪟 ' + win.title, action: function() {
          win.el.querySelector('.window-header').click();
        }});
      }
    });

    // Built-in apps
    APPS.forEach(function(app) {
      if (!q || app.label.toLowerCase().includes(q) || app.name.includes(q)) {
        matches.push({ label: '▶ ' + app.label, action: function() {
          OS.openApp(app.name);
          OS.showToast('Opened ' + app.label, 1000);
        }});
      }
    });

    return matches.slice(0, 8);
  }

  function render(query) {
    var matches = getMatches(query);
    selected = 0;
    results.innerHTML = matches.length === 0
      ? '<div style="padding:12px;text-align:center;color:#999;font-size:12px">No match found</div>'
      : matches.map(function(m, i) {
          return '<div class="spotRow" data-i="' + i + '" style="padding:8px 12px;font-size:12px;cursor:pointer;border-bottom:1px solid #f0f0f0;' +
                 (i === 0 ? 'background:#e8f0ff;' : '') + '">' + m.label + '</div>';
        }).join('');

    results.querySelectorAll('.spotRow').forEach(function(row) {
      row.addEventListener('mouseenter', function() {
        results.querySelectorAll('.spotRow').forEach(function(r) { r.style.background = ''; });
        row.style.background = '#e8f0ff';
        selected = parseInt(row.getAttribute('data-i'));
      });
      row.addEventListener('click', function() {
        matches[parseInt(row.getAttribute('data-i'))].action();
        w.el.querySelector('.btn-close').click();
      });
    });
    return matches;
  }

  input.addEventListener('input', function() { render(input.value); });

  input.addEventListener('keydown', function(e) {
    var matches = getMatches(input.value);
    if (e.key === 'ArrowDown') { selected = Math.min(selected + 1, matches.length - 1); }
    if (e.key === 'ArrowUp')   { selected = Math.max(selected - 1, 0); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      results.querySelectorAll('.spotRow').forEach(function(r, i) {
        r.style.background = i === selected ? '#e8f0ff' : '';
      });
      e.preventDefault();
    }
    if (e.key === 'Enter' && matches[selected]) {
      matches[selected].action();
      w.el.querySelector('.btn-close').click();
    }
    if (e.key === 'Escape') { w.el.querySelector('.btn-close').click(); }
  });

  render('');
  input.focus();
}

OS.onKeyCombo('Alt+ ', openLauncher);

// Show a toast so the user knows the shortcut is active
OS.showToast('Spotlight ready — press Alt+Space to open', 2500);
```

---

### Backup & Restore Tool

Demonstrates: `exportFilesystem` · `saveFilesystem` · `readFile` · `writeFile` · `fileExists` · `confirm` · `alert` · `showToast` · `getActiveUser` · `formatFileSize`

A practical backup utility. Lets you download a full JSON export, save a named checkpoint to the filesystem itself, and restore from it.

```js
var CHECKPOINT_PATH = 'C:/My Documents/checkpoint.json';

var w = OS.createWindow('Backup & Restore', 360, 280,
  '<div style="display:flex;flex-direction:column;gap:0;height:100%;background:#fff">' +

    '<div style="padding:8px 12px;background:#ece9d8;border-bottom:1px solid #ccc;font-size:11px;font-weight:700;color:#003399">💾 Backup Options</div>' +

    '<div style="padding:10px 12px;border-bottom:1px solid #eee;display:flex;flex-direction:column;gap:6px">' +
      '<div style="font-size:11px;font-weight:700">Download full backup (.json file):</div>' +
      '<div style="font-size:10px;color:#666">Saves everything — files, folders, wallpaper. Use this to move your data to another machine.</div>' +
      '<button id="btnExport" style="padding:4px 14px;font-size:11px;cursor:pointer;font-family:inherit;align-self:flex-start">⬇ Download Backup</button>' +
    '</div>' +

    '<div style="padding:10px 12px;border-bottom:1px solid #eee;display:flex;flex-direction:column;gap:6px">' +
      '<div style="font-size:11px;font-weight:700">Save checkpoint inside Mini OS:</div>' +
      '<div style="font-size:10px;color:#666">Writes a snapshot to <code style="background:#f0f0f0;padding:0 3px">C:/My Documents/checkpoint.json</code>.</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button id="btnSaveCheck"    style="padding:4px 14px;font-size:11px;cursor:pointer;font-family:inherit">📸 Save Checkpoint</button>' +
        '<button id="btnRestoreCheck" style="padding:4px 14px;font-size:11px;cursor:pointer;font-family:inherit">↩ Restore Checkpoint</button>' +
      '</div>' +
      '<div id="checkpointInfo" style="font-size:10px;color:#888">Checking...</div>' +
    '</div>' +

    '<div style="padding:10px 12px;display:flex;flex-direction:column;gap:6px">' +
      '<div style="font-size:11px;font-weight:700">Force-save to localStorage now:</div>' +
      '<div style="font-size:10px;color:#666">The OS auto-saves on window close, but you can force it here.</div>' +
      '<button id="btnForceSave" style="padding:4px 14px;font-size:11px;cursor:pointer;font-family:inherit;align-self:flex-start">💾 Force Save</button>' +
    '</div>' +

  '</div>'
);

var infoEl = w.el.querySelector('#checkpointInfo');

function updateCheckpointInfo() {
  if (OS.fileExists(CHECKPOINT_PATH)) {
    try {
      var data = JSON.parse(OS.readFile(CHECKPOINT_PATH));
      infoEl.textContent = 'Checkpoint saved on ' + (data.savedAt || 'unknown date') +
        ' · ' + OS.formatFileSize(OS.readFile(CHECKPOINT_PATH).length);
    } catch (e) {
      infoEl.textContent = 'Checkpoint exists (unreadable)';
    }
  } else {
    infoEl.textContent = 'No checkpoint saved yet';
  }
}
updateCheckpointInfo();

w.el.querySelector('#btnExport').addEventListener('click', function() {
  var user = OS.getActiveUser() || 'user';
  var date = new Date().toISOString().slice(0, 10);
  OS.exportFilesystem('minios-backup-' + user + '-' + date + '.json');
  OS.showToast('Downloading backup...', 2000);
});

w.el.querySelector('#btnSaveCheck').addEventListener('click', function() {
  var snapshot = {
    savedAt: new Date().toLocaleString(),
    user: OS.getActiveUser(),
    fileSystem: OS.fileSystem
  };
  OS.writeFile(CHECKPOINT_PATH, JSON.stringify(snapshot));
  OS.showToast('Checkpoint saved ✓', 1500);
  updateCheckpointInfo();
});

w.el.querySelector('#btnRestoreCheck').addEventListener('click', function() {
  if (!OS.fileExists(CHECKPOINT_PATH)) {
    OS.alert('No Checkpoint', 'No checkpoint file found. Save one first.');
    return;
  }
  OS.confirm('Restore from checkpoint? This overwrites all current files.', function(yes) {
    if (!yes) return;
    try {
      var data = JSON.parse(OS.readFile(CHECKPOINT_PATH));
      if (data.fileSystem && data.fileSystem['C:']) {
        OS.fileSystem['C:'] = data.fileSystem['C:'];
        OS.saveFilesystem();
        OS.alert('Restored', 'Filesystem restored from checkpoint saved on ' + data.savedAt + '.\n\nReopen My Documents to see the changes.');
      } else {
        OS.alert('Error', 'Checkpoint file is invalid or corrupted.');
      }
    } catch (e) {
      OS.alert('Error', 'Could not parse checkpoint: ' + e.message);
    }
  });
});

w.el.querySelector('#btnForceSave').addEventListener('click', function() {
  var ok = OS.saveFilesystem();
  OS.showToast(ok ? '💾 Saved to localStorage ✓' : '⚠ Save failed (no active user?)', 2000);
});
