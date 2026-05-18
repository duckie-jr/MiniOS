## Mini OS

A fully functional desktop operating system that runs entirely in the browser. Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no server required.

### Demo

Open `index.html` in any modern browser. That's it.

### Features

#### Window Manager
- **Draggable, resizable windows** with minimize, maximize, and close buttons
- **Taskbar** with running app buttons, system tray (volume, network), and clock
- **Start menu** with app launcher, user panel, shutdown, and log off
- **Double-click titlebar** to maximize/restore
- **Animated boot screen** with progress bar
- **Keyboard shortcuts**: Shift+N (new notepad), Shift+W (close window), Shift+Tab (cycle windows), Shift+C (clipboard manager), Shift+F (find in notepad)
- **Window snapping** via drag and drop

#### User Profiles
- **Login screen** on startup — create, select, or delete user profiles
- Each user gets their own **separate filesystem and session** stored in localStorage
- **Auto-login** to the last user on reload (skips login screen unless you log off)
- **Log Off** saves everything and returns to the profile picker

#### 13 Built-in Apps
- **Notepad** — text editor with auto-save, find bar (Shift+F)
- **Calculator** — standard 4-function calculator with percent and sign toggle
- **My Documents** — full file explorer with detail view, drag-and-drop, right-click context menus, upload, cut/copy/paste/rename/delete
- **Command Prompt** — terminal with 25+ commands, tab completion, command history, pipe support
- **Internet** — embedded browser with address bar (loads sites via iframe)
- **Paint** — freehand drawing with color palette and brush size
- **Clock** — live digital clock with date display
- **Minesweeper** — classic 9x9 grid with timer, flags, and win detection
- **Control Panel** — wallpaper picker and system info
- **Code Editor** — VS Code-style syntax highlighting for JS/HTML/CSS with Run button
- **Find Files** — search by filename across the entire filesystem
- **Clipboard Manager** — shows history of everything you've cut/copied (Shift+C)
- **About Mini OS** — version info

#### Virtual File System
- **37+ files** across **10+ folders** with **14 file types** (`.txt`, `.md`, `.csv`, `.html`, `.json`, `.bat`, `.log`, `.cfg`, `.ini`, `.jpg`, `.png`, `.bmp`, `.m3u`, `.svg`, `.app`)
- Files open in **type-specific viewers**: HTML renders in iframe, CSV as table, SVG with checkerboard preview, images in viewer
- **Upload real files** from your computer (saved to Downloads)
- **Create, rename, delete** files and folders
- **Cut/Copy/Paste** files between folders
- **Drag and drop** files into folders visually
- **Recycle Bin** — deleted files go here instead of being permanently lost, can restore to original location or empty the bin
- **`.app` files** are executable — double-click runs custom JavaScript with full OS API access

#### Context Menus (different for each target)
- **Desktop background** — Refresh, New Folder, New Text Document, Change Wallpaper, Properties
- **Desktop icons** — Open, Open in New Window, Properties
- **Taskbar buttons** — Minimize/Restore, Maximize, Close
- **File manager items** — Open, Cut, Copy, Rename, Delete
- **File manager empty space** — Paste, New Folder, New Text File, Upload Files, Refresh
- **Recycle Bin items** — Restore to original location, Delete Permanently
- **Recycle Bin empty space** — Empty Recycle Bin, Restore All

#### Terminal Commands
The Command Prompt operates on the live virtual filesystem with **pipe support** (`|`):

| Command | Description |
|---------|-------------|
| `dir` / `ls` | List directory with sizes and dates |
| `cd <path>` | Change directory (`..` to go up) |
| `tree` | Show folder tree |
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
| `reset` | Wipe user data (double confirmation) |
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
- **Auto-saves** filesystem and window state every 15 seconds + on page close
- **Per-user storage** — each profile has separate data in localStorage
- **Export/Import** — download your entire filesystem as a `.json` backup, import it on another machine
- **Session restore** — open windows, positions, sizes, and wallpaper persist across reloads

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

**Available API:**
- `OS.createWindow(title, width, height, bodyHTML)` — open a window
- `OS.showNotification(title, message)` — show a toast
- `OS.prompt(message, default, callback)` — OS-style input dialog
- `OS.confirm(message, callback)` — OS-style yes/no dialog
- `OS.openApp(name)` — launch a built-in app
- `OS.windows` — array of open windows
- `OS.fileSystem` — the entire virtual filesystem
- `OS.escapeHtml(str)` / `OS.formatFileSize(bytes)` — utilities
- `OS.clipboardHistory` — array of clipboard history entries
- `OS.recycleBin()` — access the Recycle Bin folder
- `OS.saveFilesystem()` / `OS.exportFilesystem(name)` — persistence

### Project Structure

```
index.html    — HTML shell (login, boot, desktop, taskbar, start menu)
main.js       — OS core (window manager, boot, context menus, shortcuts, dialogs, API)
storage.js    — Persistence (per-user save/load, profiles, export/import, session restore)
apps.js       — All 13 apps (each self-registers via OS.registerApp)
style.css     — Full XP-inspired theme with dialog and login styles
```

### Tech

- **Zero dependencies** — pure HTML, CSS, vanilla JS
- **No build step** — open `index.html` and it works
- **~3000 lines** of JS split across three files
- All icons are inline SVGs — no external assets
- Original logo and branding (no copyrighted material)
