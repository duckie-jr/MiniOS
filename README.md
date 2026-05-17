## MicroOS

A fully functional desktop operating system that runs entirely in the browser. Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no server required. Inspired by the Windows XP aesthetic.

### Demo

Open `index.html` in any modern browser. That's it.

### Features

#### Window Manager
- **Draggable, resizable windows** with minimize, maximize, and close buttons
- **Taskbar** with running app buttons, system tray (volume, network), and clock
- **Start menu** with app launcher, user panel, and shutdown/log off
- **Double-click titlebar** to maximize/restore
- **Animated boot screen** with progress bar

#### 10 Built-in Apps
- **Notepad** — text editor with auto-save to localStorage
- **Calculator** — standard 4-function calculator with percent and sign toggle
- **My Documents** — full file explorer with detail view (Name, Size, Type, Date)
- **Command Prompt** — terminal with 20+ commands that operate on the real virtual filesystem
- **Internet** — embedded browser with address bar (loads sites via iframe)
- **Paint** — freehand drawing with color palette and brush size
- **Clock** — live digital clock with date display
- **Minesweeper** — classic 9x9 grid with timer, flags, and win detection
- **Control Panel** — wallpaper picker and system info
- **About MicroOS** — version info

#### Virtual File System
- **37 files** across **10 folders** with **13 different file types** (`.txt`, `.md`, `.csv`, `.html`, `.json`, `.bat`, `.log`, `.cfg`, `.ini`, `.jpg`, `.png`, `.bmp`, `.m3u`, `.app`)
- Files open in **type-specific viewers**: HTML renders in an iframe, CSV displays as a table, images show a viewer, everything else opens in Notepad
- **Upload real files** from your computer into the filesystem
- **Create, rename, delete** files and folders
- **Cut/Copy/Paste** files between folders
- **`.app` files** are executable — double-click to run custom JavaScript apps

#### Context Menus
- **Desktop background** — New Folder, New Text Document, Change Wallpaper, Refresh, Properties
- **Desktop icons** — Open, Properties
- **Taskbar buttons** — Minimize/Restore, Maximize, Close
- **File manager items** — Open, Cut, Copy, Rename, Delete
- **File manager empty space** — Paste, New Folder, New Text File, Upload Files, Refresh

#### Terminal Commands
The Command Prompt operates on the live virtual filesystem:

| Command | Description |
|---------|-------------|
| `dir` / `ls` | List directory with sizes and dates |
| `cd <path>` | Change directory (`..` to go up) |
| `tree` | Show folder tree |
| `cat` / `type` | Print file contents |
| `mkdir` | Create folder |
| `mkfile` | Create empty file |
| `del` / `rm` | Delete file or empty folder |
| `move` / `ren` | Move or rename |
| `copy` | Duplicate a file |
| `echo` | Print text |
| `cls` | Clear screen |
| `calc <expr>` | Evaluate math (`calc 2+2`) |
| `tasklist` | List open windows |
| `systeminfo` | System details |
| `ipconfig` | Network info |
| `pwd` | Print working directory |
| `exit` | Close terminal |

Arrow keys navigate command history.

#### Creating Custom Apps

Any `.app` file is executable JavaScript. Create one in the file manager and double-click to run it. The code receives an `OS` object with access to the full API:

```js
// hello.app
var name = prompt("What is your name?", "User");
OS.createWindow("Greeting", 250, 120,
  "<div style='display:flex;align-items:center;justify-content:center;height:100%;font-size:16px;background:#ece9d8'>Hello, " + name + "!</div>");
```

**Available API:**
- `OS.createWindow(title, width, height, bodyHTML)` — open a window
- `OS.showNotification(title, message)` — show a toast
- `OS.openApp(name)` — launch a built-in app
- `OS.windows` — array of open windows
- `OS.fileSystem` — the entire virtual filesystem
- `OS.escapeHtml(str)` / `OS.formatFileSize(bytes)` — utilities

### Project Structure

```
index.html   — HTML shell (boot screen, desktop, taskbar, start menu)
main.js      — OS core (window manager, boot, taskbar, context menus, filesystem, API)
apps.js      — All 10 apps (each self-registers via OS.registerApp)
style.css    — Full XP Luna theme
```

### Tech

- **Zero dependencies** — pure HTML, CSS, vanilla JS
- **No build step** — open `index.html` and it works
- **~1000 lines** of JS split across two files
- All icons are inline SVGs — no external assets
- Virtual filesystem lives in memory (resets on refresh, uploads go to Downloads)
