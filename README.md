## Mini OS

A fully functional desktop operating system that runs entirely in the browser. Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no server required.

### Demo

Open `https://duckie-jr.github.io/MiniOS/` in any modern browser. That's it.

### Features

#### Window Manager
- **Draggable, resizable windows** with minimize, maximize, and close buttons
- **Taskbar** with running app buttons, system tray (volume, network), and clock
- **Start menu** with app launcher, user panel, shutdown, and log off
- **Double-click titlebar** to maximize/restore
- **Animated boot screen** with progress bar
- **Draggable desktop icons** — right-click desktop or press Shift+M to enter arrange mode, drag icons anywhere, positions saved to localStorage
- **Keyboard shortcuts**: Shift+N (new notepad), Shift+W (close window), Shift+Q (close ALL windows), Shift+Tab (cycle windows), Shift+C (clipboard manager), Shift+F (find in notepad), Shift+M (desktop menu)
- **Gear button** in bottom-right corner of desktop — click to open desktop menu if right-click doesn't work in your environment

#### User Profiles
- **Login screen** on startup — create, select, or delete user profiles
- Each user gets their own **separate filesystem and session** stored in localStorage
- **Auto-login** to the last user on reload (skips login screen unless you log off)
- **Log Off** saves everything and returns to the profile picker

#### 13 Built-in Apps
- **Notepad** — text editor with auto-save, find bar (Shift+F when not typing in the editor)
- **Calculator** — standard 4-function calculator with percent and sign toggle
- **My Documents** — full file explorer with detail view (Name, Size, Type, Date), drag-and-drop files into folders, right-click context menus, file upload, cut/copy/paste/rename/delete
- **Command Prompt** — terminal with 25+ commands, tab completion, command history, pipe support, grep
- **Internet** — embedded browser with address bar (loads sites via iframe, fills the full window)
- **Paint** — freehand drawing with color palette and brush size
- **Clock** — live digital clock with date display
- **Minesweeper** — classic 9x9 grid with timer, flags, and win detection
- **Control Panel** — wallpaper presets, custom wallpaper from uploaded image / filesystem image / solid color, system info
- **Code Editor** — VS Code-style dark theme with syntax highlighting for JS/HTML/CSS, Run button that executes code or previews HTML/CSS
- **Find Files** — search by filename across the entire filesystem
- **Clipboard Manager** — shows history of everything you've cut/copied (Shift+C to open)
- **About Mini OS** — version info with custom logo

#### Virtual File System
- **37+ files** across **10+ folders** with **15 file types** (`.txt`, `.md`, `.csv`, `.html`, `.json`, `.bat`, `.log`, `.cfg`, `.ini`, `.jpg`, `.png`, `.bmp`, `.m3u`, `.svg`, `.app`)
- Files open in **type-specific viewers**:
  - `.html` renders in an iframe
  - `.csv` displays as a formatted table
  - `.svg` opens in a full viewer with zoom controls, background toggle (checkerboard/white/black/gray), and an Edit button to modify the SVG source live
  - `.jpg/.png/.bmp` show in an image viewer
  - `.app` files **execute as JavaScript** with full OS API access
  - Everything else opens in Notepad (editable, auto-saves back)
- **Upload real files** from your computer (saved to Downloads)
- **Create, rename, delete** files and folders
- **Cut/Copy/Paste** files between folders
- **Drag and drop** files into folders visually
- **Recycle Bin** — deleted files go here with their original path remembered. Right-click items to restore to original location or permanently delete. Right-click empty space for Empty Bin and Restore All.

#### Context Menus (different for each target)
- **Desktop background** — Arrange/Lock Icons, Reset Icon Positions, Refresh, New Folder, New Text Document, Change Wallpaper, Properties
- **Desktop icons** — Open, Open in New Window, Properties
- **Taskbar buttons** — Minimize/Restore, Maximize, Close
- **File manager items** — Open, Cut, Copy, Rename, Delete
- **File manager empty space** — Paste, New Folder, New Text File, Upload Files, Refresh
- **Recycle Bin items** — Restore to original location, Delete Permanently
- **Recycle Bin empty space** — Empty Recycle Bin, Restore All

#### OS-Style Dialogs
- All prompts and confirmations use **custom OS dialog windows** instead of browser `prompt()`/`confirm()` — immovable, centered, dark overlay background, closeable with X button, Enter/Escape keyboard support

#### Terminal Commands
The Command Prompt operates on the live virtual filesystem with **pipe support** (`|`):

| Command | Description |
|---------|-------------|
| `dir` / `ls` | List directory with sizes and dates |
| `cd <path>` | Change directory (`..` to go up) |
| `tree` | Show folder tree with unicode box-drawing |
| `cat` / `type` | Print file contents |
| `mkdir` | Create folder |
| `mkfile` | Create empty file |
| `write <file> <text>` | Create file with content |
| `del` / `rm` | Delete (moves to Recycle Bin) |
| `move` / `ren` | Move or rename |
| `copy` | Duplicate a file |
| `grep <term>` | Filter piped input (`cat file \| grep word`) |
| `echo` | Print text |
| `cls` | Clear screen |
| `calc <expr>` | Evaluate math (`calc 2+2`) |
| `tasklist` | List open windows |
| `systeminfo` | System details |
| `ipconfig` | Network info |
| `emptybin` | Permanently delete Recycle Bin contents |
| `restore <name>` | Restore file from Recycle Bin |
| `save` | Save filesystem to localStorage |
| `load` | Load filesystem from localStorage |
| `export [file]` | Download filesystem as .json |
| `import` | Load filesystem from .json file |
| `reset` | Wipe user data (double confirmation, then reload) |
| `pwd` | Print working directory |
| `exit` | Close terminal |

**Tab** autocompletes file/folder names. **Arrow keys** navigate command history.

#### Pipes & Grep

The terminal supports **Unix-style pipes** using `|`. The output of one command feeds as input into the next. `grep` filters that input to only show lines matching your search term (case-insensitive).

**Basic syntax:**
```
command | grep <search term>
```

**Examples:**

```bash
# Show only lines containing "coffee" from a file
cat notes.txt | grep coffee

# List only .csv files in the current directory
dir | grep .csv

# Find which open windows have "Notepad" in the title
tasklist | grep Notepad

# Search the folder tree for .app files
tree | grep .app

# Pull just OS-related lines from system info
systeminfo | grep OS

# Chain multiple filters — find .txt files containing "notes"
dir | grep .txt | grep notes

# Write a file then immediately search it
write todo.txt Buy milk and eggs
cat todo.txt | grep milk
```

**Any command that prints output can be piped:** `dir`, `cat`, `type`, `tree`, `echo`, `tasklist`, `systeminfo`, `ipconfig`, `ver`, `whoami`, `hostname`.

Without a pipe, `grep` will tell you it needs piped input. It only works as the receiving end of a `|`.

#### Persistence
- **Auto-saves** filesystem every 15 seconds + on page close
- **Session saves instantly** when you close any window — closing all windows and reloading gives you a clean desktop
- **Per-user storage** — each profile has separate data in localStorage
- **Export/Import** — download your entire filesystem as a `.json` backup, import it on another machine
- **Wallpaper and icon positions** persist across reloads

#### Creating Custom Apps

Any `.app` file is executable JavaScript. Create one in the file manager and double-click to run it. The code receives an `OS` object with access to the full API:

```js
// hello.app
OS.prompt("What is your name?", "User", function(name) {
  if (name) {
    OS.createWindow("Greeting", 250, 120,
      "<div style='display:flex;align-items:center;justify-content:center;height:100%;background:#ece9d8'>Hello, " + name + "!</div>");
  }
});
```

**Quick API Reference** — full documentation with examples in the [API Reference](#api-reference) section below.

| Category | Functions |
|---|---|
| **Core** | `createWindow` · `openApp` · `showNotification` · `prompt` · `confirm` |
| **Data** | `windows` · `fileSystem` · `clipboardHistory` · `recycleBin()` · `getActiveUser()` |
| **Persistence** | `saveFilesystem()` · `exportFilesystem(name)` · `importFilesystem(cb)` |
| **Utilities** | `escapeHtml(str)` · `formatFileSize(bytes)` |
| **Window Behaviors** | `pinWindow` · `shakeWindow` · `flashWindow` · `moveWindow` · `tileWindows` · `minimizeAll` · `restoreAll` · `setWindowOpacity` · `resizeWindow` |
| **Notifications & Dialogs** | `alert` · `showToast` |
| **Input** | `onKeyCombo` |
| **Filesystem** | `readFile` · `writeFile` · `deleteFile` · `listDir` · `fileExists` |
| **Desktop & System** | `addDesktopWidget` · `setTaskbarColor` · `setCursorStyle` · `getScreenSize` · `onAppOpen` · `onAppClose` |

See **[CODE.md](CODE.md)** for ready-to-run code examples including games, animations, and demos of every API.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Shift+N | New Notepad |
| Shift+W | Close focused window |
| Shift+Q | Close ALL windows |
| Shift+Tab | Cycle to next window |
| Shift+C | Open Clipboard Manager |
| Shift+F | Find in Notepad (when not typing) |
| Shift+M | Open desktop menu |

### Project Structure

```
index.html     — HTML shell (login, boot, desktop, taskbar, start menu)
main.js        — OS core (window manager, boot, context menus, shortcuts, dialogs, icon dragging, API)
storage.js     — Persistence (per-user save/load, profiles, export/import, session restore)
apps.js        — All 13 apps (each self-registers via OS.registerApp)
style.css      — Full XP-inspired theme with dialog and login styles
SNIPPETS.md    — 14 ready-to-run code snippets for the Code Editor
README.md      — This file
```

### Tech

- **Zero dependencies** — pure HTML, CSS, vanilla JS
- **No build step** — open `https://duckie-jr.github.io/MiniOS/` and it works
- **~3500 lines** of JS split across three files
- All icons are inline SVGs — no external assets
- Original logo and branding (no copyrighted material)
- Works in Chrome, Firefox, Edge, Safari

---

## API Reference

Every function available on the `OS` object is documented here. All examples are copy-pasteable into the **Code Editor** app or saved as a `.app` file. The `OS` variable is the same object as `window.MicroOS` — both names refer to the same thing.

---

### Core

---

#### `OS.createWindow(title, width, height, bodyHTML)`

Creates and opens a new window on the desktop. This is the fundamental building block of every app — everything you build lives inside a window.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `title` | string | Text shown in the title bar |
| `width` | number | Initial width in pixels |
| `height` | number | Initial height in pixels |
| `bodyHTML` | string | Raw HTML string injected into the window body |

**Returns** — a `winObj` (window object) with these properties:
- `winObj.el` — the raw `HTMLElement` of the entire window (use this to `querySelector` for your own elements)
- `winObj.title` — the title string
- `winObj.minimized` — boolean, whether the window is currently minimized
- `winObj.maximized` — boolean, whether the window is currently maximized
- `winObj.pinned` — boolean, whether the window is pinned on top

**How it works in a real app**

The `bodyHTML` is a normal HTML string. Put whatever you want in there — inputs, canvases, divs. After calling `createWindow`, use `winObj.el.querySelector(...)` to grab your elements and attach events.

```js
// A fully interactive notes window
var w = OS.createWindow('My App', 400, 300,
  '<div style="display:flex;flex-direction:column;height:100%">' +
    '<input id="inp" style="padding:6px;border-bottom:1px solid #ccc" placeholder="Type here..." />' +
    '<div id="output" style="flex:1;padding:8px;overflow-y:auto"></div>' +
  '</div>'
);

// Wire up events AFTER calling createWindow
var input = w.el.querySelector('#inp');
var output = w.el.querySelector('#output');

input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && input.value.trim()) {
    var line = document.createElement('div');
    line.textContent = input.value;
    output.appendChild(line);
    input.value = '';
  }
});
```

**Notes**
- The window body has a white background and inset border by default. Override with inline styles on your root element.
- Add the class `window-body-flex` to `winObj.el.querySelector('.window-body')` if you need flex layout that fills the body (required for apps where inner content should scroll, like the file manager).
- Windows stack — each new one gets a higher `z-index`. The user can click any window to bring it forward.
- Minimum size is 260×150px enforced by the resize handle.

---

#### `OS.openApp(name)`

Launches a registered built-in app by its internal name. This is exactly what happens when you double-click a desktop icon or click a Start Menu item. If the app is already open, calling this again opens a second instance (every app can run multiple times simultaneously).

**Parameters**

| Param | Type | Description |
|---|---|---|
| `name` | string | The internal app name (see list below) |

**Returns** — `undefined`

**Valid app names**

| Name | Opens |
|---|---|
| `notepad` | Notepad text editor |
| `calculator` | Calculator |
| `files` | My Documents file explorer |
| `terminal` | Command Prompt |
| `browser` | Internet browser |
| `paint` | Paint |
| `clock` | Clock |
| `minesweeper` | Minesweeper |
| `settings` | Control Panel |
| `codeeditor` | Code Editor |
| `findfiles` | Find Files |
| `clipboardmanager` | Clipboard Manager |
| `about` | About Mini OS |

**Real-world example** — launching apps in sequence with a delay:

```js
// Open every app one by one, 300ms apart
var apps = ['notepad', 'calculator', 'paint', 'clock', 'minesweeper'];
apps.forEach(function(name, i) {
  setTimeout(function() { OS.openApp(name); }, i * 300);
});
```

---

#### `OS.showNotification(title, message)`

Shows a toast notification in the bottom-right corner with a blue info icon, a bold title, and a message line. Auto-dismisses after 5 seconds. The user can also click it to dismiss early. Multiple notifications stack vertically.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `title` | string | Bold heading line |
| `message` | string | Secondary text (HTML is allowed here) |

**Returns** — `undefined`

**Real-world example** — used to confirm background actions the user didn't explicitly trigger:

```js
// After saving a file in your app, confirm it
OS.writeFile('C:/My Documents/log.txt', 'Saved at ' + new Date().toLocaleTimeString());
OS.showNotification('Auto-Save', 'Your work was saved to log.txt');
```

---

#### `OS.prompt(message, defaultValue, callback)`

Opens a modal OS-style dialog with a text input. Unlike the browser's built-in `prompt()`, this is styled to match the OS, blocks the UI with a dark overlay, and is keyboard-accessible (Enter confirms, Escape cancels). The result is delivered asynchronously through `callback`.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `message` | string | The question or instruction shown above the input |
| `defaultValue` | string | Pre-filled value in the input field |
| `callback(value)` | function | Called with the string the user typed, or `null` if they cancelled |

**Returns** — `undefined`

**Real-world example** — chain multiple prompts to collect several pieces of information:

```js
OS.prompt('Enter your name:', 'Player 1', function(name) {
  if (!name) return; // user cancelled
  OS.prompt('Enter your score:', '0', function(score) {
    if (!score) return;
    OS.writeFile('C:/My Documents/highscores.txt',
      name + ': ' + score + ' points\n');
    OS.showNotification('Score Saved', name + ' scored ' + score);
  });
});
```

---

#### `OS.confirm(message, callback)`

Opens a modal OS-style yes/no dialog. The OK button is auto-focused so Enter confirms and Escape/N cancels. Useful for any destructive action that needs user confirmation.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `message` | string | The question to ask |
| `callback(result)` | function | Called with `true` (Yes) or `false` (No/Escape) |

**Returns** — `undefined`

**Real-world example** — guard a delete action:

```js
function deleteUserData() {
  OS.confirm('Are you sure? This cannot be undone.', function(confirmed) {
    if (!confirmed) return;
    OS.deleteFile('C:/My Documents/savedata.json');
    OS.showNotification('Data Cleared', 'All save data has been deleted.');
  });
}
```

---

#### `OS.windows`

A live array of all currently open window objects. Every entry is the same `winObj` returned by `createWindow`. The array is mutated in place — windows are pushed when opened and spliced out when closed, so a reference to `OS.windows` always reflects the current state.

**Type** — `winObj[]`

**Real-world example** — find and focus a specific window by title:

```js
// Bring the Calculator to the front if it's open
var calc = OS.windows.find(function(w) { return w.title === 'Calculator'; });
if (calc) {
  // Click its header to focus it
  calc.el.querySelector('.window-header').click();
} else {
  OS.openApp('calculator');
}
```

---

#### `OS.fileSystem`

The entire virtual filesystem as a live JavaScript object. The root is `OS.fileSystem['C:']`. Every node has a `type` of either `'file'` or `'folder'`. Folders have a `children` object keyed by filename. Files have `content`, `size`, and `modified` fields.

**Structure**
```
OS.fileSystem
  └── 'C:'
        └── children
              ├── 'My Documents'  { type: 'folder', children: { ... } }
              │     └── children
              │           ├── 'notes.txt'  { type: 'file', size: 72, modified: '2024-03-22', content: '...' }
              │           └── 'Projects'  { type: 'folder', children: { ... } }
              ├── 'My Pictures'   { type: 'folder', children: { ... } }
              └── 'Recycle Bin'   { type: 'folder', children: { ... } }
```

**Real-world example** — scan every file and build a search index:

```js
var results = [];

function scanFolder(node, path) {
  if (!node.children) return;
  Object.keys(node.children).forEach(function(name) {
    var child = node.children[name];
    var fullPath = path + '/' + name;
    if (child.type === 'file') {
      if (child.content && child.content.includes('coffee')) {
        results.push(fullPath);
      }
    }
    if (child.type === 'folder') scanFolder(child, fullPath);
  });
}

scanFolder(OS.fileSystem['C:'], 'C:');
OS.alert('Search Results', results.join('\n') || 'Nothing found');
```

> **Tip:** Prefer `OS.readFile()`, `OS.writeFile()` etc. for simple access. Use `OS.fileSystem` directly only when you need to traverse or restructure the tree.

---

#### `OS.escapeHtml(str)`

Converts `&`, `<`, `>`, and `"` to their HTML entity equivalents. Always use this before injecting user-provided text into HTML strings — without it, a file named `<script>` could break your window's DOM.

**Returns** — `string`

```js
var userInput = '<b>Hello & "World"</b>';
var safeHtml = OS.escapeHtml(userInput);
// → '&lt;b&gt;Hello &amp; &quot;World&quot;&lt;/b&gt;'

OS.createWindow('Safe Display', 300, 120,
  '<div style="padding:12px">' + safeHtml + '</div>'
);
```

---

#### `OS.formatFileSize(bytes)`

Converts a raw byte count to a human-readable string. Under 1024 bytes returns `"N B"`, otherwise returns `"N.N KB"`.

**Returns** — `string`

```js
OS.formatFileSize(72);    // → "72 B"
OS.formatFileSize(2048);  // → "2.0 KB"
OS.formatFileSize(48200); // → "47.1 KB"
```

---

#### `OS.clipboardHistory`

A live array of the last 20 cut/copy operations performed in the file manager. Each entry has `{ name, mode, time }` where `mode` is `'cut'` or `'copy'`.

**Real-world example** — display what was recently copied:

```js
var recent = OS.clipboardHistory.slice(0, 5);
var lines = recent.map(function(entry) {
  return entry.time + '  [' + entry.mode + ']  ' + entry.name;
});
OS.alert('Recent Clipboard', lines.join('\n') || 'Nothing copied yet');
```

---

#### `OS.recycleBin()`

Returns a direct reference to the Recycle Bin folder node (`OS.fileSystem['C:'].children['Recycle Bin']`). Useful for checking what's in the bin or clearing it programmatically.

**Returns** — `{ type: 'folder', children: { ... } }`

```js
var bin = OS.recycleBin();
var count = Object.keys(bin.children).length;
OS.showNotification('Recycle Bin', count + ' item(s) in the bin');
```

---

#### `OS.saveFilesystem()`

Immediately writes the current state of `OS.fileSystem` to localStorage under the active user's key. The OS auto-saves periodically and on window close, but call this manually after any programmatic changes you make directly to `OS.fileSystem` to guarantee they persist.

**Returns** — `true` on success, `false` if no user is logged in

```js
// Manually create a folder, then save
OS.fileSystem['C:'].children['My Documents'].children['AppData'] = {
  type: 'folder', children: {}
};
OS.saveFilesystem();
OS.showNotification('Done', 'AppData folder created and saved');
```

---

#### `OS.exportFilesystem(filename)`

Triggers a browser download of the entire filesystem as a `.json` file. The file includes the filesystem tree, current wallpaper setting, and the active username. Can be reimported later via the terminal's `import` command or `OS.importFilesystem()`.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `filename` | string | Optional. Name of the downloaded file. Defaults to `'minios-backup.json'` |

```js
OS.exportFilesystem('my-backup-' + new Date().toISOString().slice(0,10) + '.json');
```

---

#### `OS.getActiveUser()`

Returns the username string of the currently logged-in profile, or `null` if no user is active (which shouldn't normally happen during app execution).

**Returns** — `string | null`

```js
OS.alert('Hello!', 'Welcome back, ' + OS.getActiveUser() + '!');
```

---

### Window Behaviors

These functions control how windows look, move, and behave after they've been created. Every one of them takes a `winObj` returned by `OS.createWindow()` as its first argument.

---

#### `OS.pinWindow(winObj)`

Toggles "always on top" for a window. A pinned window gets a 📌 prefix in its title bar and its `z-index` is forced to `9999`, which places it above every other unpinned window — permanently, even when the user clicks on other windows. Calling `pinWindow` again on the same window unpins it and returns it to normal stacking order.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `winObj` | winObj | The window to pin or unpin |

**Returns** — `undefined`

**Real-world example** — a floating toolbar that must always be visible:

```js
var toolbar = OS.createWindow('Toolbar', 300, 60,
  '<div style="display:flex;gap:6px;align-items:center;height:100%;padding:0 10px;background:#ece9d8">' +
    '<button onclick="OS.minimizeAll()">Hide All</button>' +
    '<button onclick="OS.restoreAll()">Show All</button>' +
    '<button onclick="OS.tileWindows()">Tile</button>' +
  '</div>'
);
OS.pinWindow(toolbar); // stays visible above every other window
```

**Notes**
- `winObj.pinned` is `true` while pinned, `false` when not.
- Pinned windows can still be dragged, resized, minimized, and closed normally.
- If you open so many windows that `topZ` climbs past 9999, newly opened windows could theoretically cover pinned ones. This is extremely unlikely in normal use.

---

#### `OS.shakeWindow(winObj)`

Rapidly jerks the window left and right over 500ms — 7 oscillations with decreasing intensity, like a real "error shake". The animation is CSS-driven and re-triggers correctly even if called while already shaking (it forces a reflow to restart the animation from the beginning).

**Parameters**

| Param | Type | Description |
|---|---|---|
| `winObj` | winObj | The window to shake |

**Returns** — `undefined`

**Real-world example** — shake a form window when the user submits invalid input:

```js
var w = OS.createWindow('Login', 280, 160,
  '<div style="display:flex;flex-direction:column;gap:8px;padding:16px;background:#ece9d8">' +
    '<input id="user" placeholder="Username" style="padding:4px 8px;border:2px inset #c8c4b8" />' +
    '<input id="pass" type="password" placeholder="Password" style="padding:4px 8px;border:2px inset #c8c4b8" />' +
    '<button id="loginBtn" style="padding:4px;cursor:pointer">Log In</button>' +
  '</div>'
);

w.el.querySelector('#loginBtn').addEventListener('click', function() {
  var user = w.el.querySelector('#user').value;
  var pass = w.el.querySelector('#pass').value;
  if (user !== 'admin' || pass !== '1234') {
    OS.shakeWindow(w); // wrong credentials — shake the window
    OS.showToast('Invalid credentials', 2000);
  } else {
    OS.alert('Welcome', 'Logged in as ' + user);
  }
});
```

---

#### `OS.flashWindow(winObj)`

Pulses the window's title bar 4 times with a brightness and hue-rotate animation over ~1.4 seconds. This is the programmatic equivalent of Windows' "flashing taskbar button" — a polite attention signal that doesn't interrupt the user's current focus. Good for alerting when a background process finishes.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `winObj` | winObj | The window to flash |

**Returns** — `undefined`

**Real-world example** — flash a window when a simulated download completes:

```js
var w = OS.createWindow('Downloader', 300, 120,
  '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8">' +
    '<div id="status">Starting download...</div>' +
    '<div id="bar" style="width:80%;height:14px;background:#ddd;border:1px solid #aaa"><div id="fill" style="height:100%;width:0%;background:#4a8acc;transition:width .1s"></div></div>' +
  '</div>'
);

var progress = 0;
var iv = setInterval(function() {
  progress += 4;
  w.el.querySelector('#fill').style.width = progress + '%';
  if (progress >= 100) {
    clearInterval(iv);
    w.el.querySelector('#status').textContent = 'Download complete!';
    OS.flashWindow(w); // flash to get attention even if user switched away
    OS.showNotification('Downloader', 'Your file is ready.');
  }
}, 80);
```

---

#### `OS.moveWindow(winObj, x, y)`

Teleports a window to exact coordinates on the desktop. `x` is the distance in pixels from the left edge of the screen, `y` from the top. Does nothing if the window is currently maximized (use `winObj.el.classList.remove('maximized')` first if needed).

**Parameters**

| Param | Type | Description |
|---|---|---|
| `winObj` | winObj | The window to move |
| `x` | number | Horizontal position from the left edge, in pixels |
| `y` | number | Vertical position from the top edge, in pixels |

**Returns** — `undefined`

**Real-world example** — center a window precisely using `OS.getScreenSize()`:

```js
var w = OS.createWindow('Centered Dialog', 360, 200,
  '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:18px;background:#ece9d8">I am centered!</div>'
);

var screen = OS.getScreenSize();
OS.moveWindow(w, (screen.width - 360) / 2, (screen.height - 200) / 2);
```

**Real-world example** — animate a window sliding in from off-screen:

```js
var w = OS.createWindow('Slide In', 300, 180,
  '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#ece9d8;font-size:16px">Sliding in!</div>'
);

// Start off-screen to the right
OS.moveWindow(w, window.innerWidth + 50, 100);

// Animate across the screen
var targetX = window.innerWidth - 320;
var currentX = window.innerWidth + 50;
var slideIv = setInterval(function() {
  currentX -= 20;
  OS.moveWindow(w, currentX, 100);
  if (currentX <= targetX) clearInterval(slideIv);
}, 16);
```

---

#### `OS.tileWindows()`

Arranges all currently visible (non-minimized) windows into a grid that fills the entire desktop. The grid dimensions are calculated as `ceil(√n)` columns × `ceil(n / columns)` rows. Maximized windows are un-maximized first. Minimized windows are ignored and left minimized.

**Grid layout by window count**

| Open windows | Grid |
|---|---|
| 1 | Full screen (1×1) |
| 2 | Side by side (2×1) |
| 3–4 | 2×2 |
| 5–6 | 3×2 |
| 7–9 | 3×3 |

**Parameters** — none

**Returns** — `undefined`

**Real-world example** — add a keyboard shortcut to tile:

```js
OS.onKeyCombo('Ctrl+Shift+T', function() {
  OS.tileWindows();
  OS.showToast('Windows tiled', 1200);
});
```

---

#### `OS.minimizeAll()`

Minimizes every open window at once, clearing the desktop. Equivalent to "Show Desktop" on the taskbar. All windows remain accessible by clicking their buttons in the taskbar. Minimized windows are unaffected (they stay minimized).

**Parameters** — none

**Returns** — `undefined`

```js
// Show desktop shortcut
OS.onKeyCombo('Ctrl+D', function() { OS.minimizeAll(); });
```

---

#### `OS.restoreAll()`

The counterpart to `minimizeAll()`. Restores every minimized window back to the desktop at their previous positions and sizes. Windows that were already visible are unaffected.

**Parameters** — none

**Returns** — `undefined`

```js
// Toggle desktop visibility
var desktopShowing = true;
OS.onKeyCombo('Ctrl+D', function() {
  if (desktopShowing) { OS.minimizeAll(); }
  else { OS.restoreAll(); }
  desktopShowing = !desktopShowing;
});
```

---

#### `OS.setWindowOpacity(winObj, opacity)`

Sets how transparent the entire window is. `1.0` is fully opaque (normal), `0.1` is nearly invisible. Values outside `[0.1, 1.0]` are clamped. The transparency affects the title bar, body, and all content inside the window. The window is still interactive at any opacity — the user can still click and type in it.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `winObj` | winObj | The window to adjust |
| `opacity` | number | A value from `0.1` (nearly invisible) to `1.0` (fully opaque) |

**Returns** — `undefined`

**Real-world example** — an opacity slider control panel:

```js
var w = OS.createWindow('Transparency', 300, 120,
  '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;background:#ece9d8">' +
    '<label style="font-size:11px">Window opacity: <span id="opval">100%</span></label>' +
    '<input id="opslider" type="range" min="10" max="100" value="100" style="width:200px" />' +
  '</div>'
);

w.el.querySelector('#opslider').addEventListener('input', function() {
  var pct = parseInt(this.value);
  w.el.querySelector('#opval').textContent = pct + '%';
  OS.setWindowOpacity(w, pct / 100);
});
```

---

#### `OS.resizeWindow(winObj, width, height)`

Programmatically sets a window's size. Width is clamped to a minimum of 260px and height to 150px — the same limits enforced when the user drags the resize handle. After resizing it fires a `windowresize` DOM event on the window element, which apps like Paint listen to in order to redraw their canvas. Has no effect if the window is maximized.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `winObj` | winObj | The window to resize |
| `width` | number | New width in pixels (minimum 260) |
| `height` | number | New height in pixels (minimum 150) |

**Returns** — `undefined`

**Real-world example** — expand a window when the user wants more room:

```js
var w = OS.createWindow('Compact View', 280, 180,
  '<div style="display:flex;flex-direction:column;height:100%;background:#ece9d8;padding:8px;gap:6px">' +
    '<div style="font-size:11px">Showing compact view.</div>' +
    '<button id="expandBtn" style="padding:4px 10px;cursor:pointer;font-size:11px">Expand to Full View</button>' +
  '</div>'
);

w.el.querySelector('#expandBtn').addEventListener('click', function() {
  OS.resizeWindow(w, 600, 450);
  OS.moveWindow(w, 60, 40);
  this.style.display = 'none';
  OS.showToast('Expanded!', 1000);
});
```

---

### Notifications & Dialogs

---

#### `OS.alert(title, message)`

Opens a blocking modal dialog with an info icon, a title, and a message. The user must click OK (or press Enter/Escape) before they can interact with anything else. Unlike `OS.showNotification()`, which is non-blocking and auto-dismisses, `alert` demands attention and waits. Message text is automatically HTML-escaped so it's safe to pass user-generated content.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `title` | string | The dialog window title |
| `message` | string | The message body text |

**Returns** — `undefined`

**Difference from `OS.showNotification`**

| | `showNotification` | `alert` |
|---|---|---|
| Blocks UI | No | Yes |
| Auto-dismisses | Yes (5s) | No |
| Has icon | Yes (info) | Yes (info) |
| Safe for errors | Not ideal | Yes |
| Use when | Background info | Must read this |

**Real-world example** — report an error the user needs to act on:

```js
var content = OS.readFile('C:/My Documents/config.json');
if (content === null) {
  OS.alert('Missing Config', 'config.json was not found.\nCreating a default one now.');
  OS.writeFile('C:/My Documents/config.json', '{"theme":"default","version":"1.0"}');
} else {
  // continue normally
}
```

---

#### `OS.showToast(message, durationMs)`

Displays a lightweight notification in the bottom-right corner — just a message, no title, no icon. It's the minimal version of `showNotification`: less visual weight, shorter by default, good for quick confirmations ("Saved", "Copied", "Done"). Clicking it dismisses it early. Duration defaults to `3000`ms if omitted or invalid.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `message` | string | The text to show (HTML is allowed) |
| `durationMs` | number | How long to show it in milliseconds. Optional, default `3000` |

**Returns** — `undefined`

**Real-world example** — acknowledge fast user actions without interrupting them:

```js
OS.onKeyCombo('Ctrl+S', function() {
  OS.saveFilesystem();
  OS.showToast('Saved ✓', 1500); // brief, doesn't demand attention
}, { allowTyping: true });

OS.onKeyCombo('Ctrl+Shift+T', function() {
  OS.tileWindows();
  OS.showToast('Windows tiled', 1200);
});
```

---

### Input

---

#### `OS.onKeyCombo(combo, callback, options)`

Registers a global keyboard shortcut that fires anywhere in the OS. You specify the combo as a `+`-separated string — modifier names followed by the key name. All parts are case-insensitive. The single shared `keydown` listener is attached the first time this is called and never again (idempotent). Multiple calls stack independently — every registered combo checks independently.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `combo` | string | A `+`-separated combo like `"Ctrl+Shift+K"`, `"Alt+F"`, `"Meta+Z"` |
| `callback(event)` | function | Called when the combo fires. Receives the native `KeyboardEvent`. The default browser action is always prevented. |
| `options` | object | Optional configuration object |
| `options.allowTyping` | bool | If `true`, the shortcut fires even when the user is typing in an `<input>` or `<textarea>`. Default: `false` |

**Valid modifier names:** `ctrl`, `shift`, `alt`, `meta` (⌘ on Mac / Win key on Windows). The non-modifier part is matched against `event.key.toLowerCase()` — so use `"enter"`, `"escape"`, `"arrowup"`, `"f5"`, `" "` (space), etc.

**Returns** — `undefined`

**Real-world examples**

```js
// Global tile shortcut
OS.onKeyCombo('Ctrl+Shift+T', function() {
  OS.tileWindows();
  OS.showToast('Tiled', 1000);
});

// Shortcut that works even inside a text box (allowTyping: true)
OS.onKeyCombo('Ctrl+S', function() {
  OS.saveFilesystem();
  OS.showToast('Saved ✓', 1200);
}, { allowTyping: true });

// Open a quick launcher with Alt+Space
OS.onKeyCombo('Alt+ ', function() {
  OS.prompt('Open app:', '', function(name) {
    if (name) OS.openApp(name.toLowerCase().replace(/\s/g, ''));
  });
});

// Escape key to minimize all (useful in games)
OS.onKeyCombo('Escape', function() {
  OS.minimizeAll();
});
```

**Notes**
- There is no way to unregister a combo once registered. If you need toggle behaviour, manage state yourself inside the callback.
- Combos that match existing OS shortcuts (Shift+N, Shift+W, etc.) will both fire — the built-in handler and yours — because they use separate `keydown` listeners. Avoid reusing the OS's own shortcuts unless intentional.
- The `meta` key is the ⌘ key on Mac and the Windows key on Windows. Combos using it may be intercepted by the operating system itself before the browser sees them.

---

### Filesystem Helpers

These five functions give you a clean, path-based API for reading and writing the virtual filesystem without having to navigate `OS.fileSystem` object trees manually. All paths use `C:` as the root and accept both `/` and `\` as separators.

**Path format**
```
C:/My Documents/Projects/todo.md
C:\Windows\boot.log
C:/Downloads/setup.bat
```

---

#### `OS.readFile(path)`

Reads the content of a file and returns it as a string. Returns `null` if the path doesn't exist, points to a folder, or is malformed. This is the simplest way to load data your app previously saved.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `path` | string | Full path to the file |

**Returns** — `string | null`

**Real-world example** — load app settings from a config file, creating defaults if missing:

```js
var configPath = 'C:/My Documents/myapp-config.json';
var config;

if (OS.fileExists(configPath)) {
  try {
    config = JSON.parse(OS.readFile(configPath));
  } catch (e) {
    config = { theme: 'light', fontSize: 12 };
  }
} else {
  config = { theme: 'light', fontSize: 12 };
  OS.writeFile(configPath, JSON.stringify(config, null, 2));
}

OS.alert('Config Loaded', 'Theme: ' + config.theme);
```

**Notes**
- Returns `null` for folders — use `OS.listDir()` on folders instead.
- Content is always returned as a raw string — parse JSON with `JSON.parse()`, split lines with `.split('\n')`, etc.

---

#### `OS.writeFile(path, content)`

Creates a new file or completely overwrites an existing one at the given path. The parent folder **must already exist** — `writeFile` won't create intermediate directories. After writing, it automatically persists the change to localStorage by calling `OS.saveFilesystem()`. The file's `size` is set to `content.length` and `modified` is set to today's date in `YYYY-MM-DD` format.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `path` | string | Full path including the filename |
| `content` | string | The complete content to write |

**Returns** — `bool` — `true` on success, `false` if the parent folder doesn't exist, the path points to a folder, or the path is invalid

**Real-world example** — an autosave app that writes a log entry every 10 seconds:

```js
var logPath = 'C:/My Documents/activity.log';
var sessionStart = new Date().toLocaleTimeString();

// Make sure the file starts fresh for this session
OS.writeFile(logPath, 'Session started: ' + sessionStart + '\n');

var counter = 0;
var autosaveIv = setInterval(function() {
  counter++;
  var existing = OS.readFile(logPath) || '';
  OS.writeFile(logPath, existing + 'Ping #' + counter + ' at ' + new Date().toLocaleTimeString() + '\n');
}, 10000);

var w = OS.createWindow('Auto Logger', 280, 100,
  '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#ece9d8;font-size:12px">Logging to activity.log every 10s</div>'
);
w.el.querySelector('.btn-close').addEventListener('click', function() {
  clearInterval(autosaveIv);
});
```

**Notes**
- Overwrites completely — it doesn't append. To append, `readFile` first and concatenate the strings before calling `writeFile`.
- Returns `false` silently if the parent path doesn't exist. Always check with `OS.fileExists()` first if unsure.

---

#### `OS.deleteFile(path)`

Permanently removes a file or folder (and all its contents recursively) from the virtual filesystem. **This bypasses the Recycle Bin** — unlike the file manager's Delete key which moves items there, `OS.deleteFile()` removes them immediately and irreversibly. Automatically saves the filesystem afterward.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `path` | string | The path to delete |

**Returns** — `bool` — `true` if deleted, `false` if the path didn't exist or couldn't be resolved

**Real-world example** — clean up temp files when an app closes:

```js
var tempPath = 'C:/My Documents/~temp-session.json';

// Write temp data while app is running
OS.writeFile(tempPath, JSON.stringify({ step: 1, data: 'in progress' }));

var w = OS.createWindow('My App', 400, 300, '<div>Working...</div>');
w.el.querySelector('.btn-close').addEventListener('click', function() {
  // Clean up on exit
  if (OS.fileExists(tempPath)) {
    OS.deleteFile(tempPath);
  }
});
```

**Notes**
- Deleting a folder removes everything inside it — files, subfolders, all descendants. There is no confirmation.
- Always guard with `OS.fileExists()` if you're not certain the path exists, to avoid swallowing silent `false` returns.

---

#### `OS.listDir(path)`

Returns an array of the names of all direct children of a folder — both files and subfolders. It is a flat, non-recursive listing. Returns `null` if the path is a file or doesn't exist.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `path` | string | Path to a folder |

**Returns** — `string[] | null` — array of entry names, or `null` if the path is not a folder

**Real-world example** — build a simple file picker UI:

```js
var folder = 'C:/My Documents';
var entries = OS.listDir(folder);

if (!entries) {
  OS.alert('Error', folder + ' is not a valid folder');
} else {
  var html = entries.map(function(name) {
    var isFolder = OS.fileExists(folder + '/' + name) &&
                   !OS.readFile(folder + '/' + name); // null means it's a folder
    return '<div style="padding:3px 8px;font-size:11px;cursor:pointer;border-bottom:1px solid #eee" ' +
           'onclick="OS.alert(\'' + name + '\', \'Selected: ' + name + '\')">' +
           (isFolder ? '📁 ' : '📄 ') + OS.escapeHtml(name) + '</div>';
  }).join('');

  OS.createWindow('Pick a File', 280, 300,
    '<div style="overflow-y:auto;height:100%">' + html + '</div>'
  );
}
```

**Notes**
- Returns only the names (strings), not full paths. Prepend the parent path yourself: `folder + '/' + name`.
- To distinguish files from folders in the result, use `OS.readFile()` — it returns `null` for folders — or check `OS.fileSystem` directly.

---

#### `OS.fileExists(path)`

Checks whether a path resolves to anything in the virtual filesystem. Returns `true` for both files and folders. The fastest and safest way to guard any `readFile`, `writeFile`, or `deleteFile` call.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `path` | string | Any path to test |

**Returns** — `bool`

**Real-world example** — a reliable settings loader that never crashes:

```js
var settingsPath = 'C:/My Documents/app-settings.json';
var defaultSettings = { volume: 80, theme: 'blue', username: 'Player' };

function loadSettings() {
  if (!OS.fileExists(settingsPath)) return defaultSettings;
  try {
    return JSON.parse(OS.readFile(settingsPath));
  } catch (e) {
    return defaultSettings;
  }
}

function saveSettings(settings) {
  OS.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

var settings = loadSettings();
OS.alert('Settings', 'Playing as: ' + settings.username);
```

**Notes**
- Returns `true` for folders too — it checks existence, not file-ness.
- Use `OS.readFile(path) !== null` if you specifically need to confirm something is a file (since `readFile` returns `null` for folders).

---

### Desktop & System

These functions let you reach outside of windows and affect the OS environment itself — the desktop, the taskbar, the cursor, and global app lifecycle events.

---

#### `OS.addDesktopWidget(html, x, y)`

Creates a freely positioned HTML element directly on the desktop, outside of any window. Widgets sit above the desktop background but below all windows (`z-index: 5`). They persist until the page is reloaded or you manually remove the element. The function returns the widget's `div` so you can update, animate, or remove it after creation.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `html` | string | Inner HTML of the widget |
| `x` | number | Distance from the left edge of the desktop, in pixels. Optional, default `10` |
| `y` | number | Distance from the top edge of the desktop, in pixels. Optional, default `10` |

**Returns** — `HTMLDivElement` — the created widget element

**Real-world example** — a persistent live clock widget in the corner of the desktop:

```js
var clockWidget = OS.addDesktopWidget(
  '<div id="deskclk" style="' +
    'background:rgba(0,0,0,0.5);color:#fff;font-family:monospace;' +
    'font-size:20px;padding:6px 12px;border-radius:4px;' +
    'text-shadow:1px 1px 2px #000;pointer-events:none' +
  '"></div>',
  10, 10
);

function updateDeskClock() {
  var el = clockWidget.querySelector('#deskclk');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
updateDeskClock();
setInterval(updateDeskClock, 1000);
```

**Real-world example** — a removable sticky note widget:

```js
var note = OS.addDesktopWidget(
  '<div style="background:#fff740;padding:8px;font-size:11px;font-family:Tahoma;' +
    'box-shadow:2px 2px 6px rgba(0,0,0,.3);min-width:120px;cursor:move">' +
    '<div style="font-weight:700;margin-bottom:4px">📌 Reminder</div>' +
    '<div>Pick up groceries</div>' +
    '<div>Call dentist</div>' +
    '<div style="margin-top:6px;color:#888;font-size:10px;cursor:pointer" id="closeNote">✕ dismiss</div>' +
  '</div>',
  window.innerWidth - 160, 40
);

note.querySelector('#closeNote').addEventListener('click', function() {
  note.remove();
});
```

**Notes**
- Widgets are positioned with `position: absolute` on the `#desktop` element.
- Unlike windows, widgets have no drag handle, title bar, or close button by default. Build those yourself if needed.
- `pointer-events: none` on child elements is useful for purely decorative widgets that shouldn't block click-through to the desktop.

---

#### `OS.setTaskbarColor(css)`

Replaces the taskbar's background with any valid CSS `background` value. This affects the entire bar including the start button area, the app buttons strip, and the system tray. The change is live and immediate but not persisted — it resets on page reload.

**Parameters**

| Param | Type | Description |
|---|---|---|
| `css` | string | Any CSS `background` value — solid color, gradient, or image |

**Returns** — `undefined`

**Real-world examples**

```js
// Dark mode taskbar
OS.setTaskbarColor('#1a1a1a');

// Danger red
OS.setTaskbarColor('linear-gradient(180deg, #8b0000, #550000)');

// Rainbow gradient
OS.setTaskbarColor('linear-gradient(90deg, red, orange, yellow, green, blue, purple)');

// Semi-transparent (works over custom wallpapers)
OS.setTaskbarColor('rgba(0, 0, 0, 0.4)');

// Restore the original XP blue
OS.setTaskbarColor('linear-gradient(180deg,#1f53d1 0%,#3165d4 4%,#2e5bc6 8%,#1845b0 92%,#102e8a 100%)');
```

**Real-world example** — a theme selector app that changes both wallpaper and taskbar together:

```js
var themes = [
  { name: 'XP Blue',  wallpaper: OS.wallpapers[0], taskbar: 'linear-gradient(180deg,#1f53d1 0%,#3165d4 4%,#2e5bc6 8%,#1845b0 92%,#102e8a 100%)' },
  { name: 'Forest',   wallpaper: OS.wallpapers[1], taskbar: '#1a3d1a' },
  { name: 'Night',    wallpaper: OS.wallpapers[3], taskbar: '#0d0d1a' },
  { name: 'Desert',   wallpaper: OS.wallpapers[4], taskbar: '#5a3a00' }
];

var html = themes.map(function(t, i) {
  return '<button onclick="applyTheme(' + i + ')" style="padding:6px 12px;margin:4px;cursor:pointer;font-size:11px">' + t.name + '</button>';
}).join('');

OS.createWindow('Theme Selector', 280, 100,
  '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;height:100%;background:#ece9d8">' + html + '</div>'
);

function applyTheme(index) {
  var theme = themes[index];
  document.getElementById('desktop').style.background = theme.wallpaper;
  OS.setTaskbarColor(theme.taskbar);
  OS.showToast(theme.name + ' theme applied', 1500);
}
```

---

#### `OS.setCursorStyle(css)`

Sets the mouse cursor globally for the entire page. Accepts any CSS `cursor` value. The cursor reverts to normal only if you call `OS.setCursorStyle('default')` or the user reloads. Useful for games, immersive experiences, or signaling application state (loading, drawing mode, etc.).

**Parameters**

| Param | Type | Description |
|---|---|---|
| `css` | string | Any CSS `cursor` value |

**Returns** — `undefined`

**Common cursor values**

| Value | Appearance |
|---|---|
| `default` | Standard arrow |
| `crosshair` | Fine crosshair |
| `pointer` | Hand / clickable |
| `move` | Four-arrow move |
| `wait` | Spinning loader |
| `text` | I-beam text cursor |
| `none` | Completely hidden |
| `grab` / `grabbing` | Hand for dragging |
| `not-allowed` | Red circle-slash |
| `zoom-in` / `zoom-out` | Magnifier |

**Real-world example** — hide the cursor during a fullscreen game and restore it on exit:

```js
var w = OS.createWindow('Focus Game', 400, 300, '<canvas id="gc" width="400" height="270" style="display:block;background:#111"></canvas>');

// Hide cursor when the game window is focused
w.el.addEventListener('mouseenter', function() { OS.setCursorStyle('none'); });
w.el.addEventListener('mouseleave', function() { OS.setCursorStyle('default'); });
w.el.querySelector('.btn-close').addEventListener('click', function() {
  OS.setCursorStyle('default'); // always restore on close
});
```

---

#### `OS.getScreenSize()`

Returns the usable desktop area as `{ width, height }`. The height is `window.innerHeight - 30` to account for the fixed 30px taskbar at the bottom. Use this instead of `window.innerWidth` / `window.innerHeight` directly whenever you need to position or size things relative to the available desktop space.

**Parameters** — none

**Returns** — `{ width: number, height: number }`

**Real-world example** — spawn windows arranged in a perfect row across the desktop:

```js
var screen = OS.getScreenSize();
var appNames = ['notepad', 'calculator', 'clock', 'paint'];
var winWidth = Math.floor(screen.width / appNames.length);

appNames.forEach(function(name, i) {
  OS.openApp(name);
  var newWin = OS.windows[OS.windows.length - 1];
  OS.resizeWindow(newWin, winWidth, screen.height);
  OS.moveWindow(newWin, i * winWidth, 0);
});
```

---

#### `OS.onAppOpen`

An assignable hook property — set it to a function and it will be called every time `OS.openApp()` successfully launches an app. The callback receives the internal app name string (e.g. `'notepad'`, `'calculator'`). Initially `null` (disabled). Set back to `null` to disable.

**Type** — `function(appName: string) | null`

**Called by** — `OS.openApp()`, desktop icon double-click, Start Menu clicks

**Real-world examples**

```js
// Log every app launch to a file
OS.onAppOpen = function(appName) {
  var logPath = 'C:/My Documents/app-log.txt';
  var existing = OS.readFile(logPath) || '';
  var line = new Date().toLocaleTimeString() + '  OPEN  ' + appName + '\n';
  OS.writeFile(logPath, existing + line);
};

// Show a welcome toast the first time each app is opened this session
var openedThisSession = {};
OS.onAppOpen = function(appName) {
  if (!openedThisSession[appName]) {
    openedThisSession[appName] = true;
    OS.showToast('Opening ' + appName + ' for the first time this session', 2000);
  }
};

// Block specific apps (note: the app opens first, then the hook fires — use confirm to warn)
OS.onAppOpen = function(appName) {
  if (appName === 'minesweeper') {
    OS.showToast('⚠ Minesweeper is distracting you!', 3000);
  }
};

// Clear the hook
OS.onAppOpen = null;
```

**Notes**
- The hook fires **after** the app is already open. It cannot prevent an app from opening.
- This is a single slot — assigning a new function replaces the previous one. If you need multiple listeners, call them manually from within one function.

---

#### `OS.onAppClose`

The counterpart to `OS.onAppOpen`. Set it to a function and it will be called every time a window's close button (×) is clicked. The callback receives the `title` string of the closed window — the same string originally passed to `OS.createWindow()`. Initially `null`.

**Type** — `function(windowTitle: string) | null`

**Called by** — the ✕ button on any window, `logoff-btn` (which clicks all close buttons), `shutdown-btn`

**Real-world examples**

```js
// Show a confirmation toast whenever any window closes
OS.onAppClose = function(title) {
  OS.showToast(title + ' closed', 1500);
};

// Keep a session log of everything that was closed
var sessionClosedLog = [];
OS.onAppClose = function(title) {
  sessionClosedLog.push({ title: title, time: new Date().toLocaleTimeString() });
};

// Auto-save the filesystem whenever the user closes any window
OS.onAppClose = function(title) {
  OS.saveFilesystem();
  // Filesystem is already auto-saved by OS on close, but this guarantees it
};

// Clear the hook
OS.onAppClose = null;
```

**Notes**
- The hook fires **after** the window element has already been removed from the DOM.
- The `title` parameter is the window title, not an app name. If you create a window with `OS.createWindow('My Custom Window', ...)`, the hook receives `'My Custom Window'`.
- This is a single slot, same as `onAppOpen`. Wrap multiple callbacks in one function if needed.
