(function () {

// ── Shared OS Namespace ──
var MicroOS = {};
window.MicroOS = MicroOS;

// ── DOM References ──
var container = document.getElementById('windows-container');
var taskbarApps = document.getElementById('taskbar-apps');
var taskbarClock = document.getElementById('taskbar-clock');
var startMenu = document.getElementById('start-menu');
var startBtn = document.getElementById('start-btn');
var bootScreen = document.getElementById('boot-screen');
var bootBar = document.getElementById('boot-bar');
var desktop = document.getElementById('desktop');
var taskbar = document.getElementById('taskbar');
var contextMenu = document.getElementById('context-menu');

// ── OS State ──
var windows = [];
var topZ = 10;
var wallpapers = [
  'linear-gradient(180deg,#245edb 0%,#3a6ea5 30%,#3a6ea5 100%)',
  'linear-gradient(135deg,#2a6030,#4a8050,#2a5030)',
  'linear-gradient(135deg,#6a3040,#8a4050,#5a2030)',
  'linear-gradient(180deg,#1a1a3a,#2a2a5a,#1a1a3a)',
  'linear-gradient(180deg,#5a4a2a,#8a7a4a,#5a4a2a)',
  '#3a6ea5'
];
var currentWallpaper = 0;

// ── Virtual File System ──
var fileSystem = {
  'C:': { type: 'folder', children: {
    'My Documents': { type: 'folder', children: {
      'readme.md':          { type: 'file', size: 142, modified: '2024-01-15', content: '# Welcome to Mini OS\r\n\r\nA tiny desktop OS in your browser.\r\n\r\n## Getting Started\r\n\r\n- Double-click files to open them\r\n- Right-click the desktop for options\r\n- Files auto-save when you edit them' },
      'notes.txt':          { type: 'file', size: 72,  modified: '2024-03-22', content: 'Shopping list:\r\n- Coffee\r\n- Code\r\n- More coffee\r\n- Mechanical keyboard\r\n- Monitor arm' },
      'budget.csv':         { type: 'file', size: 185, modified: '2024-07-20', content: 'Category,Monthly,Annual\r\nRent,1200,14400\r\nFood,400,4800\r\nCoffee,150,1800\r\nInternet,80,960\r\nGadgets,300,3600\r\nSavings,0,0\r\nTotal,2130,25560' },
      'diary.txt':          { type: 'file', size: 210, modified: '2024-09-05', content: 'Sept 5, 2024\r\nFinally got the OS working in a browser.\r\nThe file manager has columns now.\r\nI can actually edit files and they save back.\r\n\r\nSept 3, 2024\r\nStarted working on MicroOS.\r\nHow hard can it be?' },
      'recipes.html':       { type: 'file', size: 320, modified: '2024-08-12', content: '<html><body style="font-family:Tahoma;padding:12px"><h2>Easy Pasta</h2><ol><li>Boil water</li><li>Add pasta</li><li>Wait 10 min</li><li>Drain</li><li>Add sauce from jar</li><li>Pretend you cooked</li></ol><h2>French Toast</h2><ol><li>Egg + milk + cinnamon</li><li>Dip bread</li><li>Fry in butter</li><li>Maple syrup</li></ol></body></html>' },
      'contacts.json':      { type: 'file', size: 230, modified: '2024-06-15', content: '{\r\n  "contacts": [\r\n    { "name": "Alice", "email": "alice@example.com" },\r\n    { "name": "Bob", "email": "bob@example.com" },\r\n    { "name": "Charlie", "email": "charlie@example.com" },\r\n    { "name": "Diana", "email": "diana@example.com" }\r\n  ]\r\n}' },
      'Projects':           { type: 'folder', children: {
        'todo.md':          { type: 'file', size: 170, modified: '2024-07-01', content: '# Project TODO\r\n\r\n- [ ] Build an OS in a browser\r\n- [x] Question life choices\r\n- [ ] Deploy to production\r\n- [ ] Write documentation\r\n- [x] Add minesweeper\r\n- [ ] Sleep at a normal hour' },
        'ideas.txt':        { type: 'file', size: 156, modified: '2024-08-14', content: 'App ideas:\r\n- Calculator with history tape\r\n- A game that is actually fun\r\n- Music player (needs audio API)\r\n- Chat app (talk to yourself)\r\n- Code editor with syntax highlight' },
        'changelog.md':     { type: 'file', size: 220, modified: '2024-09-10', content: '# Mini OS Changelog\r\n\r\n## v1.2\r\n- File manager with detail view\r\n- Multiple file type support\r\n\r\n## v1.1\r\n- Added minesweeper, paint, clock\r\n\r\n## v1.0\r\n- Initial release\r\n- Notepad, Calculator, Terminal\r\n- Window manager with drag/resize' },
        'bugs.log':         { type: 'file', size: 195, modified: '2024-09-08', content: '[2024-09-08 14:32] BUG: Paint canvas does not resize with window\r\n[2024-09-07 09:15] BUG: Terminal has no command history\r\n[2024-09-06 22:01] BUG: Clock app is too simple\r\n[2024-09-05 11:45] BUG: Browser might refuse to load some sites\r\n[2024-09-04 16:20] FIXED: File manager was text-only' },
        'build.bat':        { type: 'file', size: 85,  modified: '2024-08-20', content: '@echo off\r\necho Building Mini OS...\r\necho Compiling assets...\r\ntimeout /t 2\r\necho Build complete!\r\npause' },
        'config.json':      { type: 'file', size: 145, modified: '2024-08-22', content: '{\r\n  "appName": "Mini OS",\r\n  "version": "1.2.0",\r\n  "debug": false,\r\n  "theme": "xp-luna",\r\n  "bootTimeout": 3,\r\n  "defaultApps": ["notepad", "calculator", "files"]\r\n}' },
        'hello.app':        { type: 'file', size: 160, modified: '2024-09-12', content: 'OS.prompt("What is your name?", "User", function(name) {\n  if (name) {\n    OS.createWindow("Hello App", 280, 150, "<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:18px;font-weight:700;color:#003399;background:#ece9d8\'>Hello, " + name + "!</div>");\n    OS.showNotification("Hello App", "Greeted " + name);\n  }\n});' },
        'dice.app':         { type: 'file', size: 95,  modified: '2024-09-12', content: 'var roll = Math.floor(Math.random() * 6) + 1;\nOS.createWindow("Dice Roller", 200, 140, "<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:48px;background:#ece9d8\'>" + roll + "</div>");' }
      }},
      'Work':               { type: 'folder', children: {
        'meeting-notes.md': { type: 'file', size: 200, modified: '2024-08-28', content: '# Team Meeting - Aug 28\r\n\r\n**Attendees:** Me, myself, I\r\n\r\n## Agenda\r\n1. Review sprint progress\r\n2. Discuss new features\r\n3. Assign tasks\r\n\r\n## Action Items\r\n- Ship file manager by Friday\r\n- Fix browser iframe bug' },
        'invoice.csv':      { type: 'file', size: 165, modified: '2024-07-30', content: 'Item,Quantity,Rate,Total\r\nWebsite Redesign,40,75,3000\r\nLogo Design,1,500,500\r\nHosting Setup,2,100,200\r\n,,Subtotal,3700\r\n,,Tax (10%),370\r\n,,Grand Total,4070' },
        'report.html':      { type: 'file', size: 340, modified: '2024-06-10', content: '<html><body style="font-family:Tahoma;padding:12px"><h2>Quarterly Report - Q2</h2><p><strong>Summary:</strong> Q2 was productive.</p><table border="1" cellpadding="4" style="border-collapse:collapse"><tr><th>Metric</th><th>Value</th></tr><tr><td>Features Shipped</td><td>3</td></tr><tr><td>Bugs Fixed</td><td>12</td></tr><tr><td>Bugs Created</td><td>15</td></tr></table></body></html>' },
        'timesheet.csv':    { type: 'file', size: 120, modified: '2024-09-01', content: 'Date,Project,Hours,Notes\r\n2024-09-01,MicroOS,8,File manager rewrite\r\n2024-08-31,MicroOS,6,Browser iframe fix\r\n2024-08-30,MicroOS,7,Boot screen animation\r\n2024-08-29,Break,0,Mental health day' }
      }},
      'School':             { type: 'folder', children: {
        'essay.html':       { type: 'file', size: 380, modified: '2024-05-10', content: '<html><body style="font-family:Georgia;padding:16px;max-width:600px"><h1>The Impact of Technology</h1><p>Technology has transformed how we live, work, and communicate.</p><p>In this essay, I will argue that building an entire OS in a browser is a <em>perfectly normal</em> thing to do on a weekend.</p><p><strong>Grade: A+</strong> (self-assessed)</p></body></html>' },
        'homework.txt':     { type: 'file', size: 88,  modified: '2024-05-22', content: 'Math Homework - Chapter 7\r\n========================\r\n1. x = 42\r\n2. y = 7\r\n3. z = probably wrong\r\n4. See answer key' },
        'reading-list.md':  { type: 'file', size: 140, modified: '2024-04-18', content: '# Reading List\r\n\r\n- [x] Clean Code - Robert Martin\r\n- [ ] Design Patterns - GoF\r\n- [ ] SICP\r\n- [ ] The Pragmatic Programmer\r\n- [ ] Mythical Man-Month' },
        'grades.csv':       { type: 'file', size: 95,  modified: '2024-06-01', content: 'Subject,Grade,Credits\r\nMath,A,4\r\nEnglish,B+,3\r\nScience,A-,4\r\nHistory,B,3\r\nArt,A+,2\r\nGPA,,3.7' }
      }}
    }},
    'My Pictures': { type: 'folder', children: {
      'wallpaper-info.txt': { type: 'file', size: 35, modified: '2024-02-20', content: 'Change wallpaper in Control Panel!' },
      'Screenshots':        { type: 'folder', children: {
        'desktop.bmp':      { type: 'file', size: 2400, modified: '2024-08-01', content: '(Screenshot of the MicroOS desktop - 800x600 bitmap)' },
        'error.bmp':        { type: 'file', size: 1800, modified: '2024-08-15', content: '(Screenshot of a very helpful error message)' }
      }},
      'vacation.jpg':       { type: 'file', size: 48200, modified: '2024-07-15', content: '(JPEG image - Beach sunset, 1920x1080)' },
      'selfie.jpg':         { type: 'file', size: 32100, modified: '2024-07-16', content: '(JPEG image - Definitely not a stock photo)' },
      'cat.png':            { type: 'file', size: 15400, modified: '2024-08-20', content: '(PNG image - A very important cat picture)' }
    }},
    'My Music': { type: 'folder', children: {
      'playlist.m3u':       { type: 'file', size: 110, modified: '2024-05-18', content: '#EXTM3U\r\n#EXTINF:180,Lo-fi beats to code to\r\nlofi.mp3\r\n#EXTINF:240,Synthwave drive mix\r\nsynthwave.mp3\r\n#EXTINF:300,Coffee shop ambience\r\ncoffee.mp3' },
      'albums.txt':         { type: 'file', size: 85, modified: '2024-06-02', content: 'Albums to Listen:\r\n- Daft Punk - Discovery\r\n- Boards of Canada - MHTRTC\r\n- Tycho - Dive\r\n- Nujabes - Modal Soul' }
    }},
    'Downloads': { type: 'folder', children: {
      'readme.txt':         { type: 'file', size: 22,  modified: '2024-09-01', content: 'Your downloads go here.' },
      'install-notes.md':   { type: 'file', size: 95,  modified: '2024-09-02', content: '# Mini OS Installation\r\n\r\nNo installation needed!\r\nJust open index.html in a browser.\r\n\r\n> Works best in Chrome or Firefox.' },
      'data-export.json':   { type: 'file', size: 210, modified: '2024-09-03', content: '{\r\n  "exportDate": "2024-09-03",\r\n  "records": 42,\r\n  "format": "JSON",\r\n  "source": "Mini OS Database",\r\n  "checksum": "a1b2c3d4e5"\r\n}' },
      'setup.bat':          { type: 'file', size: 60,  modified: '2024-09-04', content: '@echo off\r\necho Installing Mini OS...\r\necho Done!\r\npause' },
      'counter.app':        { type: 'file', size: 200, modified: '2024-09-12', content: 'var w = OS.createWindow("Counter App", 240, 170, "<div style=\'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;background:#ece9d8\'><div class=\'cnt-display\' style=\'font-size:42px;color:#003399\'>0</div><div style=\'display:flex;gap:6px\'><button class=\'cnt-minus\' style=\'padding:4px 14px;cursor:pointer\'>-</button><button class=\'cnt-plus\' style=\'padding:4px 14px;cursor:pointer\'>+</button></div></div>");\nvar val = 0;\nvar display = w.el.querySelector(".cnt-display");\nw.el.querySelector(".cnt-plus").onclick = function() { display.textContent = ++val; };\nw.el.querySelector(".cnt-minus").onclick = function() { display.textContent = --val; };' }
    }},
    'Windows': { type: 'folder', children: {
      'system.ini':         { type: 'file', size: 78, modified: '2024-01-01', content: '[boot]\r\nshell=explorer.exe\r\n\r\n[display]\r\nresolution=1024x768\r\ncolors=32bit' },
      'config.cfg':         { type: 'file', size: 55, modified: '2024-01-01', content: 'BOOT_TIMEOUT=3\r\nDEFAULT_WALLPAPER=0\r\nSOUND=OFF\r\nTHEME=luna' },
      'boot.log':           { type: 'file', size: 245, modified: '2024-01-01', content: '[00.000] Mini OS Boot Loader v1.0\r\n[00.100] Checking hardware... OK\r\n[00.250] Loading kernel... OK\r\n[00.500] Initializing display... OK\r\n[00.800] Starting services... OK\r\n[01.200] Loading desktop... OK\r\n[01.500] Boot complete in 1.5s' },
      'license.txt':        { type: 'file', size: 90, modified: '2024-01-01', content: 'Mini OS License\r\n===============\r\nThis software is provided as-is.\r\nFree to use, modify, and share.\r\nNo warranty expressed or implied.' },
      'hosts.cfg':          { type: 'file', size: 70, modified: '2024-01-01', content: '127.0.0.1   localhost\r\n127.0.0.1   minios-pc\r\n192.168.1.1 gateway\r\n8.8.8.8     dns-primary' }
    }},
    'Recycle Bin': { type: 'folder', children: {} }
  }}
};

// ── SVG Icons ──
var btnMinSvg = '<svg class="btn-icon" viewBox="0 0 9 9"><line x1="1" y1="7" x2="8" y2="7" stroke="#fff" stroke-width="2"/></svg>';
var btnMaxSvg = '<svg class="btn-icon" viewBox="0 0 9 9"><rect x="1" y="1" width="7" height="7" fill="none" stroke="#fff" stroke-width="1.5"/></svg>';
var btnCloseSvg = '<svg class="btn-icon" viewBox="0 0 9 9"><line x1="1" y1="1" x2="8" y2="8" stroke="#fff" stroke-width="1.8"/><line x1="8" y1="1" x2="1" y2="8" stroke="#fff" stroke-width="1.8"/></svg>';
var folderSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M1 5V13a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3H2a1 1 0 00-1 1z" fill="#f5d76e" stroke="#c8a415" stroke-width=".8"/></svg>';
var fileSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><line x1="5" y1="5" x2="11" y2="5" stroke="#ccc" stroke-width=".7"/><line x1="5" y1="7" x2="11" y2="7" stroke="#ccc" stroke-width=".7"/><line x1="5" y1="9" x2="9" y2="9" stroke="#ccc" stroke-width=".7"/></svg>';
var htmlSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#fff" stroke="#e66" stroke-width=".8"/><text x="8" y="11" text-anchor="middle" fill="#d44" font-size="6" font-weight="700" font-family="sans-serif">&lt;/&gt;</text></svg>';
var logSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#f0f0e0" stroke="#998" stroke-width=".8"/><line x1="5" y1="5" x2="11" y2="5" stroke="#aa8" stroke-width=".7"/><line x1="5" y1="7" x2="11" y2="7" stroke="#aa8" stroke-width=".7"/><line x1="5" y1="9" x2="8" y2="9" stroke="#aa8" stroke-width=".7"/><line x1="5" y1="11" x2="10" y2="11" stroke="#aa8" stroke-width=".7"/></svg>';
var cfgSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#e8e8f8" stroke="#66a" stroke-width=".8"/><circle cx="8" cy="7" r="3" fill="none" stroke="#55a" stroke-width="1.2"/><line x1="8" y1="10" x2="8" y2="13" stroke="#55a" stroke-width="1"/></svg>';
var csvSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#e8f5e8" stroke="#4a4" stroke-width=".8"/><line x1="7" y1="3" x2="7" y2="13" stroke="#6a6" stroke-width=".5"/><line x1="5" y1="6" x2="11" y2="6" stroke="#6a6" stroke-width=".5"/><line x1="5" y1="9" x2="11" y2="9" stroke="#6a6" stroke-width=".5"/></svg>';
var jsonSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#fff8e0" stroke="#c90" stroke-width=".8"/><text x="8" y="10" text-anchor="middle" fill="#a80" font-size="7" font-weight="700" font-family="monospace">{ }</text></svg>';
var batSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#222" stroke="#555" stroke-width=".8"/><text x="8" y="10" text-anchor="middle" fill="#0c0" font-size="5" font-weight="700" font-family="monospace">&gt;_</text></svg>';
var mdSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#f5f5ff" stroke="#44a" stroke-width=".8"/><text x="8" y="11" text-anchor="middle" fill="#339" font-size="7" font-weight="700" font-family="sans-serif">M</text></svg>';
var imgSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#e8f0ff" stroke="#48c" stroke-width=".8"/><circle cx="6.5" cy="5.5" r="1.5" fill="#fc0"/><path d="M4 12l3-4 2 2 2-3 2 5z" fill="#4a8" opacity=".7"/></svg>';
var appSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="2" y="1" width="12" height="14" rx="2" fill="#4a8acc" stroke="#2a6a9a" stroke-width=".8"/><rect x="4" y="3" width="8" height="5" rx="1" fill="#fff" opacity=".9"/><rect x="4" y="10" width="3" height="1.5" rx=".5" fill="#fff" opacity=".5"/><rect x="8" y="10" width="4" height="1.5" rx=".5" fill="#fff" opacity=".5"/></svg>';
var svgIconSvg = '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1" fill="#fff0f5" stroke="#c4a" stroke-width=".8"/><circle cx="7" cy="6" r="2" fill="#e44" opacity=".7"/><rect x="5" y="9" width="6" height="3" rx="1" fill="#48c" opacity=".7"/></svg>';

// ── Utility ──
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(1) + ' KB';
}

// ── Boot Screen Animation ──
desktop.style.visibility = 'hidden';
taskbar.style.visibility = 'hidden';
startMenu.classList.add('hidden');

var bootProgress = 0;
var bootInterval = setInterval(function () {
  bootProgress += Math.random() * 12 + 3;
  if (bootProgress >= 100) {
    bootProgress = 100;
    bootBar.style.width = '100%';
    clearInterval(bootInterval);
    setTimeout(function () {
      bootScreen.classList.add('fade-out');
      setTimeout(function () {
        bootScreen.style.display = 'none';
        desktop.style.visibility = 'visible';
        taskbar.style.visibility = 'visible';
      }, 800);
    }, 400);
  } else {
    bootBar.style.width = bootProgress + '%';
  }
}, 200);

// ── Taskbar Clock ──
function tickClock() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  taskbarClock.textContent = (hours % 12 || 12) + ':' + (minutes < 10 ? '0' : '') + minutes + ' ' + ampm;
}
tickClock();
setInterval(tickClock, 10000);

// ── Start Menu ──
startBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  startMenu.classList.toggle('hidden');
});
document.addEventListener('click', function () { startMenu.classList.add('hidden'); });
startMenu.addEventListener('click', function (e) { e.stopPropagation(); });

var startItems = startMenu.querySelectorAll('.start-item[data-app]');
for (var i = 0; i < startItems.length; i++) {
  startItems[i].addEventListener('click', function () {
    openApp(this.getAttribute('data-app'));
    startMenu.classList.add('hidden');
  });
}
document.getElementById('start-about').addEventListener('click', function () {
  openApp('about');
  startMenu.classList.add('hidden');
});
document.getElementById('logoff-btn').addEventListener('click', function () {
  while (windows.length) windows[0].el.querySelector('.btn-close').click();
  startMenu.classList.add('hidden');
});

// ── Desktop Icons ──
var deskIcons = document.querySelectorAll('.desktop-icon');
for (var i = 0; i < deskIcons.length; i++) {
  deskIcons[i].addEventListener('dblclick', function () { openApp(this.getAttribute('data-app')); });
  deskIcons[i].addEventListener('click', function () {
    document.querySelectorAll('.desktop-icon.selected').forEach(function (el) { el.classList.remove('selected'); });
    this.classList.add('selected');
  });
}
document.getElementById('desktop').addEventListener('click', function (e) {
  if (e.target.id === 'desktop' || e.target.id === 'desktop-icons')
    document.querySelectorAll('.desktop-icon.selected').forEach(function (el) { el.classList.remove('selected'); });
});

// ── Desktop Icon Dragging ──
var iconArrangeMode = false;

function enableIconArrange() {
  iconArrangeMode = true;
  var iconsContainer = document.getElementById('desktop-icons');
  iconsContainer.style.position = 'relative';
  var savedPositions = JSON.parse(localStorage.getItem('minios-icon-positions') || '{}');

  for (var di = 0; di < deskIcons.length; di++) {
    (function (icon, idx) {
      icon.style.position = 'absolute';
      icon.style.cursor = 'move';
      icon.style.outline = '1px dashed rgba(255,255,255,.3)';
      var appName = icon.getAttribute('data-app');
      if (savedPositions[appName]) {
        icon.style.left = savedPositions[appName].left;
        icon.style.top = savedPositions[appName].top;
      } else {
        icon.style.left = '10px';
        icon.style.top = (10 + idx * 80) + 'px';
      }

      var draggingIcon = false, iconDragX, iconDragY;
      icon.addEventListener('mousedown', function (e) {
        if (!iconArrangeMode) return;
        draggingIcon = true;
        iconDragX = e.clientX - icon.offsetLeft;
        iconDragY = e.clientY - icon.offsetTop;
        e.preventDefault();
      });
      document.addEventListener('mousemove', function (e) {
        if (!draggingIcon) return;
        icon.style.left = Math.max(0, e.clientX - iconDragX) + 'px';
        icon.style.top = Math.max(0, e.clientY - iconDragY) + 'px';
      });
      document.addEventListener('mouseup', function () {
        if (draggingIcon) {
          draggingIcon = false;
          saveIconPositions();
        }
      });
    })(deskIcons[di], di);
  }
}

function disableIconArrange() {
  iconArrangeMode = false;
  for (var di = 0; di < deskIcons.length; di++) {
    deskIcons[di].style.cursor = 'default';
    deskIcons[di].style.outline = '';
  }
}

function saveIconPositions() {
  var positions = {};
  for (var di = 0; di < deskIcons.length; di++) {
    var appName = deskIcons[di].getAttribute('data-app');
    positions[appName] = { left: deskIcons[di].style.left, top: deskIcons[di].style.top };
  }
  localStorage.setItem('minios-icon-positions', JSON.stringify(positions));
}

function loadIconPositions() {
  var saved = localStorage.getItem('minios-icon-positions');
  if (!saved) return;
  var positions = JSON.parse(saved);
  var iconsContainer = document.getElementById('desktop-icons');
  iconsContainer.style.position = 'relative';
  for (var di = 0; di < deskIcons.length; di++) {
    var appName = deskIcons[di].getAttribute('data-app');
    if (positions[appName]) {
      deskIcons[di].style.position = 'absolute';
      deskIcons[di].style.left = positions[appName].left;
      deskIcons[di].style.top = positions[appName].top;
    }
  }
}

// Load saved positions on boot
setTimeout(loadIconPositions, 100);

// Load custom wallpaper on boot
setTimeout(function () {
  var savedCustomWallpaper = localStorage.getItem('minios-custom-wallpaper');
  if (savedCustomWallpaper) {
    document.getElementById('desktop').style.background = savedCustomWallpaper;
    document.getElementById('desktop').style.backgroundSize = 'cover';
  }
}, 200);

// ── Window Manager ──
function createWindow(title, width, height, bodyHTML) {
  var winId = 'w' + (Date.now() + Math.random());
  var offset = windows.length % 10;
  var el = document.createElement('div');
  el.className = 'window focused';
  el.id = winId;
  el.style.cssText = 'left:' + (80 + offset * 24) + 'px;top:' + (40 + offset * 24) + 'px;width:' + width + 'px;height:' + height + 'px;z-index:' + (++topZ);
  el.innerHTML =
    '<div class="window-header"><span class="window-title">' + title + '</span>' +
    '<div class="window-btns"><button class="window-btn btn-minimize">' + btnMinSvg +
    '</button><button class="window-btn btn-maximize">' + btnMaxSvg +
    '</button><button class="window-btn btn-close">' + btnCloseSvg +
    '</button></div></div><div class="window-body">' + bodyHTML +
    '</div><div class="window-resize"></div>';
  container.appendChild(el);

  var winObj = { id: winId, el: el, title: title, minimized: false, maximized: false };
  windows.push(winObj);
  focusWindow(winObj);
  updateTaskbar();

  el.addEventListener('mousedown', function () { focusWindow(winObj); });

  var header = el.querySelector('.window-header');
  var dragging = false, dragOffsetX, dragOffsetY;

  header.addEventListener('dblclick', function (e) {
    if (e.target.closest('.window-btn')) return;
    winObj.maximized = !winObj.maximized;
    el.classList.toggle('maximized');
  });
  header.addEventListener('mousedown', function (e) {
    if (e.target.closest('.window-btn')) return;
    if (winObj.maximized) return;
    dragging = true;
    dragOffsetX = e.clientX - el.offsetLeft;
    dragOffsetY = e.clientY - el.offsetTop;
  });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    el.style.left = Math.max(0, e.clientX - dragOffsetX) + 'px';
    el.style.top = Math.max(0, e.clientY - dragOffsetY) + 'px';
  });
  document.addEventListener('mouseup', function () { dragging = false; });

  var resizeHandle = el.querySelector('.window-resize');
  var resizing = false, resizeStartX, resizeStartY, resizeStartW, resizeStartH;
  resizeHandle.addEventListener('mousedown', function (e) {
    if (winObj.maximized) return;
    e.stopPropagation();
    resizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = el.offsetWidth;
    resizeStartH = el.offsetHeight;
  });
  document.addEventListener('mousemove', function (e) {
    if (!resizing) return;
    el.style.width = Math.max(260, resizeStartW + (e.clientX - resizeStartX)) + 'px';
    el.style.height = Math.max(150, resizeStartH + (e.clientY - resizeStartY)) + 'px';
    el.dispatchEvent(new Event('windowresize'));
  });
  document.addEventListener('mouseup', function () { resizing = false; });

  el.querySelector('.btn-minimize').addEventListener('click', function () {
    winObj.minimized = true;
    el.classList.add('minimized');
    updateTaskbar();
  });
  el.querySelector('.btn-maximize').addEventListener('click', function () {
    winObj.maximized = !winObj.maximized;
    el.classList.toggle('maximized');
  });
  el.querySelector('.btn-close').addEventListener('click', function () {
    el.remove();
    windows = windows.filter(function (w) { return w.id !== winId; });
    updateTaskbar();
  });

  return winObj;
}

function focusWindow(targetWindow) {
  windows.forEach(function (w) { w.el.classList.remove('focused'); });
  targetWindow.el.classList.add('focused');
  targetWindow.el.style.zIndex = ++topZ;
  if (targetWindow.minimized) {
    targetWindow.minimized = false;
    targetWindow.el.classList.remove('minimized');
  }
  updateTaskbar();
}

function updateTaskbar() {
  taskbarApps.innerHTML = '';
  windows.forEach(function (w) {
    var button = document.createElement('div');
    button.className = 'taskbar-app';
    if (w.el.classList.contains('focused') && !w.minimized) button.classList.add('active');
    if (w.minimized) button.classList.add('minimized');
    button.textContent = w.title;
    button.addEventListener('click', function () {
      if (w.el.classList.contains('focused') && !w.minimized) {
        w.minimized = true;
        w.el.classList.add('minimized');
        updateTaskbar();
      } else {
        focusWindow(w);
      }
    });
    taskbarApps.appendChild(button);
  });
}

// ── App Launcher ──
var appRegistry = {};

function registerApp(name, builderFunction) {
  appRegistry[name] = builderFunction;
}

function openApp(name) {
  if (appRegistry[name]) appRegistry[name]();
}

// ── Dynamic Context Menu ──
var clipboard = { mode: null, name: null, data: null, sourcePath: null };
var clipboardHistory = [];

function addToClipboardHistory(name, mode) {
  clipboardHistory.unshift({ name: name, mode: mode, time: new Date().toLocaleTimeString() });
  if (clipboardHistory.length > 20) clipboardHistory.pop();
}

function showContextMenu(mouseX, mouseY, items) {
  contextMenu.innerHTML = '';
  items.forEach(function (item) {
    if (item === '---') {
      var sep = document.createElement('div');
      sep.className = 'ctx-separator';
      contextMenu.appendChild(sep);
      return;
    }
    var el = document.createElement('div');
    el.className = 'ctx-item' + (item.disabled ? ' disabled' : '');
    el.innerHTML = (item.icon ? '<span class="ctx-icon">' + item.icon + '</span>' : '') + item.label;
    if (!item.disabled) {
      el.addEventListener('click', function () {
        contextMenu.classList.remove('visible');
        if (item.action) item.action();
      });
    }
    contextMenu.appendChild(el);
  });
  contextMenu.style.left = Math.min(mouseX, window.innerWidth - 180) + 'px';
  contextMenu.style.top = Math.min(mouseY, window.innerHeight - contextMenu.children.length * 24 - 10) + 'px';
  contextMenu.classList.add('visible');
}

document.addEventListener('click', function () { contextMenu.classList.remove('visible'); });
document.addEventListener('contextmenu', function (e) {
  if (!e.target.closest('#context-menu')) contextMenu.classList.remove('visible');
});

// ── Desktop background right-click ──
document.getElementById('desktop').addEventListener('contextmenu', function (e) {
  if (e.target.closest('.window') || e.target.closest('#taskbar')) return;
  if (e.target.closest('.desktop-icon')) return;
  e.preventDefault();
  showContextMenu(e.clientX, e.clientY, [
    { label: iconArrangeMode ? 'Lock Icons' : 'Arrange Icons', action: function () {
      if (iconArrangeMode) { disableIconArrange(); showNotification('Desktop', 'Icons locked'); }
      else { enableIconArrange(); showNotification('Desktop', 'Drag icons to rearrange. Right-click to lock.'); }
    } },
    { label: 'Reset Icon Positions', action: function () {
      localStorage.removeItem('minios-icon-positions');
      location.reload();
    } },
    '---',
    { label: 'Refresh', action: function () { location.reload(); } },
    '---',
    { label: 'New Folder', icon: folderSvg, action: function () { openApp('files'); } },
    { label: 'New Text Document', icon: fileSvg, action: function () { openApp('notepad'); } },
    '---',
    { label: 'Change Wallpaper', action: function () { openApp('settings'); } },
    { label: 'Properties', action: function () { openApp('about'); } }
  ]);
});

// ── Desktop icon right-click ──
for (var iconIdx = 0; iconIdx < deskIcons.length; iconIdx++) {
  (function (iconElement) {
    iconElement.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.desktop-icon.selected').forEach(function (el) { el.classList.remove('selected'); });
      iconElement.classList.add('selected');
      var appName = iconElement.getAttribute('data-app');
      var iconLabel = iconElement.querySelector('span').textContent;
      showContextMenu(e.clientX, e.clientY, [
        { label: 'Open', action: function () { openApp(appName); } },
        '---',
        { label: 'Open in New Window', action: function () { openApp(appName); } },
        '---',
        { label: 'Pin to Start Menu', disabled: true },
        '---',
        { label: 'Properties', action: function () {
          showNotification(iconLabel, 'Type: Application shortcut');
        }}
      ]);
    });
  })(deskIcons[iconIdx]);
}

// ── Taskbar app button right-click ──
var origUpdateTaskbar = updateTaskbar;
updateTaskbar = function () {
  origUpdateTaskbar();
  var taskbarButtons = taskbarApps.querySelectorAll('.taskbar-app');
  taskbarButtons.forEach(function (button, index) {
    button.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var targetWindow = windows[index];
      if (!targetWindow) return;
      showContextMenu(e.clientX, e.clientY, [
        { label: targetWindow.minimized ? 'Restore' : 'Minimize', action: function () {
          if (targetWindow.minimized) { focusWindow(targetWindow); }
          else { targetWindow.minimized = true; targetWindow.el.classList.add('minimized'); updateTaskbar(); }
        }},
        { label: targetWindow.maximized ? 'Restore Size' : 'Maximize', action: function () {
          targetWindow.maximized = !targetWindow.maximized;
          targetWindow.el.classList.toggle('maximized');
        }},
        '---',
        { label: 'Close', action: function () {
          targetWindow.el.querySelector('.btn-close').click();
        }}
      ]);
    });
  });
};

// ── Notification Toasts ──
function showNotification(title, message) {
  var area = document.getElementById('notification-area');
  var toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML =
    '<div class="toast-icon"><svg viewBox="0 0 20 20" width="20" height="20">' +
    '<circle cx="10" cy="10" r="9" fill="#4a8acc"/>' +
    '<text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">i</text></svg></div>' +
    '<div class="toast-content"><div class="toast-title">' + title +
    '</div><div class="toast-msg">' + message + '</div></div>';
  area.appendChild(toast);
  toast.addEventListener('click', function () { toast.classList.add('fade-out'); setTimeout(function () { toast.remove(); }, 300); });
  setTimeout(function () { toast.classList.add('fade-out'); setTimeout(function () { toast.remove(); }, 300); }, 5000);
}

// ── Keyboard Shortcuts ──
document.addEventListener('keydown', function (e) {
  // Don't trigger shortcuts when typing in inputs/textareas
  var activeTag = document.activeElement ? document.activeElement.tagName : '';
  var isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement.isContentEditable;

  if (e.shiftKey && e.key === 'N' && !isTyping) {
    e.preventDefault();
    openApp('notepad');
  }

  if (e.shiftKey && e.key === 'W' && !isTyping) {
    e.preventDefault();
    // Close the focused (topmost) window
    for (var i = windows.length - 1; i >= 0; i--) {
      if (windows[i].el.classList.contains('focused') && !windows[i].minimized) {
        windows[i].el.querySelector('.btn-close').click();
        break;
      }
    }
  }

  if (e.shiftKey && e.key === 'C' && !isTyping) {
    e.preventDefault();
    openApp('clipboardmanager');
  }

  if (e.shiftKey && e.key === 'Tab' && !isTyping) {
    e.preventDefault();
    // Cycle to next window
    if (windows.length < 2) return;
    var focusedIndex = -1;
    for (var j = 0; j < windows.length; j++) {
      if (windows[j].el.classList.contains('focused')) { focusedIndex = j; break; }
    }
    var nextIndex = (focusedIndex + 1) % windows.length;
    focusWindow(windows[nextIndex]);
  }
});

// ── Shutdown ──
document.getElementById('shutdown-btn').addEventListener('click', function () {
  startMenu.classList.add('hidden');
  while (windows.length) windows[0].el.querySelector('.btn-close').click();
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-family:Tahoma,sans-serif;opacity:0;transition:opacity 1s';
  overlay.textContent = 'Mini OS is shutting down...';
  document.body.appendChild(overlay);
  requestAnimationFrame(function () { overlay.style.opacity = '1'; });
  setTimeout(function () {
    overlay.innerHTML = '<div style="text-align:center"><div style="font-size:14px;color:#aaa">It is now safe to turn off your computer.</div></div>';
  }, 2500);
});

// ── System Tray ──
var speakerSvg = '<svg viewBox="0 0 16 16" width="12" height="12" style="vertical-align:middle"><path d="M2 5v6h3l4 4V1L5 5H2z" fill="#555"/><path d="M11 4c.8.8 1.2 1.9 1.2 3s-.4 2.2-1.2 3" fill="none" stroke="#555" stroke-width="1.2"/></svg>';
document.getElementById('tray-volume').addEventListener('click', function () {
  showNotification('Volume', 'Volume: 75% ' + speakerSvg);
});
document.getElementById('tray-network').addEventListener('click', function () {
  showNotification('Network', 'Connected to Mini OS Network');
});

// ── OS Dialog Windows ──
function createDialog(title, bodyHTML, dialogWidth) {
  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  var dialogEl = document.createElement('div');
  dialogEl.className = 'dialog-box';
  dialogEl.style.width = (dialogWidth || 320) + 'px';
  dialogEl.innerHTML =
    '<div class="dialog-header"><span class="dialog-title">' + title + '</span>' +
    '<button class="dialog-close-btn">' + btnCloseSvg + '</button></div>' +
    '<div class="dialog-body">' + bodyHTML + '</div>';
  overlay.appendChild(dialogEl);
  document.body.appendChild(overlay);
  function closeDialog() { overlay.remove(); }
  dialogEl.querySelector('.dialog-close-btn').addEventListener('click', closeDialog);
  return { overlay: overlay, el: dialogEl, close: closeDialog };
}

function osPrompt(message, defaultValue, callback) {
  var inputId = 'dlg-input-' + Date.now();
  var dialog = createDialog('Mini OS', 
    '<div class="dialog-message">' + escapeHtml(message) + '</div>' +
    '<input class="dialog-input" id="' + inputId + '" value="' + escapeHtml(defaultValue || '') + '" />' +
    '<div class="dialog-buttons">' +
    '<button class="dialog-btn dialog-btn-ok">OK</button>' +
    '<button class="dialog-btn dialog-btn-cancel">Cancel</button></div>');
  var inputEl = dialog.el.querySelector('.dialog-input');
  inputEl.focus();
  inputEl.select();
  dialog.el.querySelector('.dialog-btn-ok').addEventListener('click', function () {
    var value = inputEl.value;
    dialog.close();
    if (callback) callback(value);
  });
  dialog.el.querySelector('.dialog-btn-cancel').addEventListener('click', function () {
    dialog.close();
    if (callback) callback(null);
  });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { dialog.close(); if (callback) callback(inputEl.value); }
    if (e.key === 'Escape') { dialog.close(); if (callback) callback(null); }
  });
}

function osConfirm(message, callback) {
  var dialog = createDialog('Mini OS',
    '<div class="dialog-message">' + escapeHtml(message) + '</div>' +
    '<div class="dialog-buttons">' +
    '<button class="dialog-btn dialog-btn-ok">Yes</button>' +
    '<button class="dialog-btn dialog-btn-cancel">No</button></div>');
  dialog.el.querySelector('.dialog-btn-ok').addEventListener('click', function () {
    dialog.close();
    if (callback) callback(true);
  });
  dialog.el.querySelector('.dialog-btn-cancel').addEventListener('click', function () {
    dialog.close();
    if (callback) callback(false);
  });
  dialog.el.querySelector('.dialog-btn-ok').focus();
}

// ── Expose API for apps.js ──
MicroOS.createWindow = createWindow;
MicroOS.prompt = osPrompt;
MicroOS.confirm = osConfirm;
MicroOS.showContextMenu = showContextMenu;
MicroOS.clipboard = clipboard;
MicroOS.clipboardHistory = clipboardHistory;
MicroOS.addToClipboardHistory = addToClipboardHistory;
MicroOS.registerApp = registerApp;
MicroOS.openApp = openApp;
MicroOS.showNotification = showNotification;
MicroOS.escapeHtml = escapeHtml;
MicroOS.formatFileSize = formatFileSize;
MicroOS.windows = windows;
MicroOS.wallpapers = wallpapers;
MicroOS.getCurrentWallpaper = function () { return currentWallpaper; };
MicroOS.setCurrentWallpaper = function (index) { currentWallpaper = index; };
MicroOS.fileSystem = fileSystem;
MicroOS.folderSvg = folderSvg;
MicroOS.fileSvg = fileSvg;
MicroOS.htmlSvg = htmlSvg;
MicroOS.logSvg = logSvg;
MicroOS.cfgSvg = cfgSvg;
MicroOS.csvSvg = csvSvg;
MicroOS.jsonSvg = jsonSvg;
MicroOS.batSvg = batSvg;
MicroOS.mdSvg = mdSvg;
MicroOS.imgSvg = imgSvg;
MicroOS.appSvg = appSvg;
MicroOS.svgIconSvg = svgIconSvg;
MicroOS.recycleBin = function () { return fileSystem['C:'].children['Recycle Bin']; };

})();
