## Mini OS Code Snippets

Paste any of these into the **Code Editor** app, select **JavaScript**, and hit **Run**.

All of these also work as **`.app` files** — create a new text file in the file manager, rename it to `something.app`, open it in Notepad, paste the code, close it, then double-click to run. The `.app` format uses the exact same `OS` API as the Code Editor.

---

---

### Hacker Attack Simulation

```js
var allTimeouts = [], allIntervals = [];
function hkTimeout(fn, ms) { var t = setTimeout(fn, ms); allTimeouts.push(t); return t; }
function hkInterval(fn, ms) { var t = setInterval(fn, ms); allIntervals.push(t); return t; }

// ── PHASE 0: Fullscreen terminal ──
var w = OS.createWindow("SECURITY BREACH DETECTED", 600, 400, "<div id='hackterm' style='background:#000;color:#0f0;font-family:Consolas,monospace;font-size:11px;height:100%;padding:8px;overflow-y:auto;white-space:pre-wrap'></div>");
w.el.style.left='40px'; w.el.style.top='20px';
var term = w.el.querySelector('#hackterm');
var fakeIPs = ['194.32.78.'+Math.floor(Math.random()*255),'103.45.192.'+Math.floor(Math.random()*255),'77.91.68.'+Math.floor(Math.random()*255)];
var attackIP = fakeIPs[Math.floor(Math.random()*3)];
var fakeMAC = 'DE:AD:BE:EF:'+('0'+Math.floor(Math.random()*255).toString(16)).slice(-2).toUpperCase()+':'+('0'+Math.floor(Math.random()*255).toString(16)).slice(-2).toUpperCase();

function addLine(text, color, delay) {
  hkTimeout(function() {
    var el = document.createElement('div');
    el.style.color = color || '#0f0';
    el.textContent = text;
    term.appendChild(el);
    term.scrollTop = term.scrollHeight;
  }, delay);
}

// ── Fake scrolling hex dump in background ──
var hexOverlay = document.createElement('div');
hexOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;overflow:hidden;pointer-events:none;opacity:0.06;font-family:monospace;font-size:10px;color:#0f0;line-height:12px;white-space:pre';
document.body.appendChild(hexOverlay);
var hexIv = hkInterval(function() {
  var line = '';
  for (var i = 0; i < 80; i++) line += ('0'+Math.floor(Math.random()*256).toString(16)).slice(-2) + ' ';
  hexOverlay.textContent += line + '\n';
  if (hexOverlay.textContent.length > 20000) hexOverlay.textContent = hexOverlay.textContent.slice(-10000);
}, 30);

// ── PHASE 1: Initial breach ──
addLine('[' + new Date().toISOString() + '] INTRUSION DETECTION SYSTEM v4.2.1', '#888', 0);
addLine('[CRITICAL] Incoming SYN flood detected — 14,382 packets/sec', '#f44', 300);
addLine('[CRITICAL] Source: ' + attackIP + ' (MAC: ' + fakeMAC + ')', '#f44', 600);
addLine('[CRITICAL] GeoIP: Undisclosed — routing through 7 proxies', '#f44', 900);
addLine('[WARNING] Port scan detected: 21,22,23,25,80,443,445,3306,3389,8080', '#ff0', 1300);
addLine('[ALERT] Port 445 (SMB) — VULNERABLE. EternalBlue exploit matched.', '#f44', 1700);
addLine('[SYSTEM] Firewall rule #4471 BYPASSED', '#f44', 2000);
addLine('[SYSTEM] Firewall rule #4472 BYPASSED', '#f44', 2100);
addLine('[SYSTEM] Firewall rule #4473 BYPASSED', '#f44', 2200);
addLine('[SYSTEM] ALL FIREWALL RULES DISABLED', '#f00', 2400);
addLine('', '#0f0', 2500);

// ── PHASE 2: Payload delivery ──
addLine('> Injecting payload: trojan_rootkit_x64.dll (348 KB)', '#0f0', 2800);
addLine('  [████████████████████████████████] 100% — INJECTED', '#0f0', 3400);
addLine('> Escalating privileges... NT AUTHORITY\\SYSTEM acquired', '#f84', 3800);
addLine('> Disabling Windows Defender... DONE', '#f84', 4200);
addLine('> Disabling Event Log... DONE', '#f84', 4400);
addLine('> Installing keylogger on HID input stream... ACTIVE', '#f84', 4700);
addLine('', '#0f0', 4900);

// ── Notification spam starts ──
hkTimeout(function() { OS.showNotification('⚠ FIREWALL DISABLED', 'All inbound rules have been deleted'); }, 2400);
hkTimeout(function() { OS.showNotification('⚠ SECURITY BREACH', 'Remote connection from ' + attackIP); }, 3000);
hkTimeout(function() { OS.showNotification('☠ ROOT ACCESS', 'NT AUTHORITY\\SYSTEM privileges granted to remote host'); }, 4000);

// ── PHASE 3: File exfiltration — scan REAL filesystem ──
addLine('> Enumerating filesystem for sensitive data...', '#0f0', 5000);
var fileList = [];
(function scanFS(node, path) {
  if (!node || !node.children) return;
  Object.keys(node.children).forEach(function(name) {
    var child = node.children[name];
    if (child.type === 'file') fileList.push({ name: name, path: path + '\\' + name, size: child.size || 0 });
    if (child.type === 'folder') scanFS(child, path + '\\' + name);
  });
})(OS.fileSystem['C:'], 'C:');
var exfilDelay = 5400;
var exfilCount = Math.min(fileList.length, 18);
for (var fi = 0; fi < exfilCount; fi++) {
  (function(f, d) {
    var tag = f.name.match(/\.(csv|json|txt|md|html|cfg|ini)$/i) ? 'EXFILTRATING' : 'SCANNING';
    var color = tag === 'EXFILTRATING' ? '#ff0' : '#0f0';
    addLine('  ' + f.path + (' ').repeat(Math.max(1, 48 - f.path.length)) + tag, color, d);
  })(fileList[fi], exfilDelay + fi * 250);
}
exfilDelay += exfilCount * 250 + 300;
addLine('> ' + fileList.length + ' files indexed. ' + exfilCount + ' files queued for upload.', '#ff0', exfilDelay);
hkTimeout(function() { OS.showNotification('⚠ DATA EXFILTRATION', fileList.length + ' files found — uploading to ' + attackIP); }, exfilDelay);
exfilDelay += 500;

// ── PHASE 4: Credential dump ──
addLine('', '#0f0', exfilDelay);
addLine('> Dumping SAM database...', '#0f0', exfilDelay += 300);
addLine('  Administrator:500:aad3b435b51404eeaad3b435b51404ee:fc525c9683e8fe067095ba2ddc971889:::', '#f84', exfilDelay += 500);
addLine('  Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::', '#f84', exfilDelay += 300);
addLine('  User:1001:aad3b435b51404eeaad3b435b51404ee:e19ccf75ee54e06b06a5907af13cef42:::', '#f84', exfilDelay += 300);
addLine('> Cracking hashes with rainbow tables...', '#0f0', exfilDelay += 400);
addLine('  Administrator : P@ssw0rd123!    [CRACKED in 0.4s]', '#f44', exfilDelay += 600);
addLine('  User          : ilovecats       [CRACKED in 0.1s]', '#f44', exfilDelay += 400);
hkTimeout(function() { OS.showNotification('☠ CREDENTIALS STOLEN', 'Administrator password cracked: P@ssw0rd123!'); }, exfilDelay);
exfilDelay += 500;

// ── PHASE 5: Reverse shell ──
addLine('', '#0f0', exfilDelay);
addLine('> Establishing encrypted reverse shell to ' + attackIP + ':4444', '#0f0', exfilDelay += 300);
addLine('  TLS handshake... OK', '#0f0', exfilDelay += 400);
addLine('  Tunnel established (AES-256-GCM)', '#0f0', exfilDelay += 300);
addLine('', '#0f0', exfilDelay += 200);
addLine('remote@' + attackIP + ':~# whoami', '#0f0', exfilDelay += 500);
addLine('root', '#fff', exfilDelay += 400);
addLine('remote@' + attackIP + ':~# uname -a', '#0f0', exfilDelay += 500);
addLine('MiniOS 1.0.2600 x86_64 Browser/JS kernel', '#fff', exfilDelay += 300);
addLine('remote@' + attackIP + ':~# cat /etc/shadow', '#0f0', exfilDelay += 500);
addLine('root:$6$xZpKl$9j3kF8dHq2mNpL:19422:0:99999:7:::', '#fff', exfilDelay += 300);
addLine('remote@' + attackIP + ':~# ls /home/user/.ssh/', '#0f0', exfilDelay += 500);
addLine('id_rsa  id_rsa.pub  authorized_keys  known_hosts', '#fff', exfilDelay += 300);
addLine('remote@' + attackIP + ':~# cat /home/user/.ssh/id_rsa', '#0f0', exfilDelay += 400);
addLine('-----BEGIN RSA PRIVATE KEY-----', '#f84', exfilDelay += 300);
addLine('MIIEpAIBAAKCAQEA7v3b8x0fN2r+jK0qB5tv2mRhFOqPX3IRGK', '#f84', exfilDelay += 100);
addLine('kD9sD7k3HxVFBc0r+ENCRYPTED+STOLEN+LOL+n7G8x0Kj3vB', '#f84', exfilDelay += 100);
addLine('-----END RSA PRIVATE KEY-----', '#f84', exfilDelay += 100);
exfilDelay += 400;

// ── Screen starts shaking ──
var shakeIv;
hkTimeout(function() {
  shakeIv = hkInterval(function() {
    var x = (Math.random()-0.5)*8, y = (Math.random()-0.5)*8;
    document.body.style.transform = 'translate('+x+'px,'+y+'px)';
  }, 50);
}, exfilDelay);

// ── PHASE 6: Webcam prank ──
addLine('', '#0f0', exfilDelay);
addLine('remote@' + attackIP + ':~# enable_webcam --silent --stream', '#0f0', exfilDelay += 500);
addLine('[WEBCAM] Device 0 activated — streaming to ' + attackIP + ':8443', '#f44', exfilDelay += 500);
hkTimeout(function() { OS.showNotification('📷 WEBCAM ACTIVE', 'Your camera is being streamed to a remote server'); }, exfilDelay);
addLine('[MIC] Audio input device activated — recording started', '#f44', exfilDelay += 400);
hkTimeout(function() { OS.showNotification('🎤 MICROPHONE ACTIVE', 'Audio is being recorded and transmitted'); }, exfilDelay);
exfilDelay += 600;

// ── Glitch effects get worse ──
var glitchIv = hkInterval(function() {
  if (Math.random() > 0.5) {
    document.body.style.filter = 'hue-rotate('+Math.floor(Math.random()*360)+'deg) saturate(3) brightness('+(0.5+Math.random())+')';;
    hkTimeout(function(){ document.body.style.filter=''; }, 60 + Math.random()*100);
  }
}, 300);

// ── PHASE 7: Fake file deletion ──
addLine('', '#0f0', exfilDelay);
addLine('remote@' + attackIP + ':~# rm -rf / --no-preserve-root', '#f00', exfilDelay += 500);
addLine('[SYSTEM] DELETING SYSTEM FILES...', '#f00', exfilDelay += 400);
var delFiles = ['C:\\Windows\\system.ini','C:\\Windows\\config.cfg','C:\\Windows\\boot.log','C:\\My Documents\\diary.txt','C:\\My Documents\\budget.csv','C:\\My Documents\\contacts.json','C:\\My Documents\\Work\\invoice.csv','C:\\My Documents\\Projects\\todo.md'];
for (var di = 0; di < delFiles.length; di++) {
  (function(f, d) { addLine('  DELETED: ' + f, '#f44', d); })(delFiles[di], exfilDelay + 200 + di * 200);
}
exfilDelay += delFiles.length * 200 + 500;
hkTimeout(function() { OS.showNotification('💀 FILES DESTROYED', 'System files are being permanently deleted'); }, exfilDelay - 800);

// ── PHASE 8: Popup storm — fake error windows ──
var popupMessages = [
  'KERNEL PANIC: Fatal exception at 0x0000DEAD',
  'MEMORY CORRUPT: Heap overflow in svchost.exe',
  'DISK FAILURE: Bad sectors detected on C:\\',
  'NETWORK: All traffic redirected to ' + attackIP,
  'RANSOMWARE: Encryption module loaded',
  'BIOS FLASH: Firmware write in progress...'
];
for (var pi = 0; pi < popupMessages.length; pi++) {
  (function(msg, d) {
    hkTimeout(function() {
      var popup = OS.createWindow('⚠ SYSTEM ERROR', 280, 100, "<div style='display:flex;align-items:center;justify-content:center;height:100%;background:#c00;color:#fff;font-size:11px;font-weight:700;text-align:center;padding:10px'>" + msg + "</div>");
      popup.el.style.left = (50 + Math.random() * 300) + 'px';
      popup.el.style.top = (30 + Math.random() * 200) + 'px';
    }, d);
  })(popupMessages[pi], exfilDelay + pi * 600);
}
exfilDelay += popupMessages.length * 600 + 400;

// ── PHASE 9: HACKED banner + ransomware ──
addLine('', '#0f0', exfilDelay);
addLine('  ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ ', '#f00', exfilDelay += 200);
addLine('  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗', '#f00', exfilDelay += 50);
addLine('  ███████║███████║██║     █████╔╝ █████╗  ██║  ██║', '#f00', exfilDelay += 50);
addLine('  ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██║  ██║', '#f00', exfilDelay += 50);
addLine('  ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██████╔╝', '#f00', exfilDelay += 50);
addLine('  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ ', '#f00', exfilDelay += 50);
addLine('', '#0f0', exfilDelay += 200);
addLine('> ENCRYPTING ALL FILES WITH AES-256-CBC + RSA-4096...', '#f00', exfilDelay += 300);
addLine('  [██                              ]   6%', '#f44', exfilDelay += 500);
addLine('  [███████                         ]  22%', '#f44', exfilDelay += 500);
addLine('  [█████████████                   ]  41%', '#f44', exfilDelay += 500);
addLine('  [████████████████████            ]  63%', '#f44', exfilDelay += 500);
addLine('  [██████████████████████████      ]  81%', '#f44', exfilDelay += 500);
addLine('  [██████████████████████████████  ]  95%', '#f44', exfilDelay += 500);
addLine('  [████████████████████████████████] 100% — COMPLETE', '#f00', exfilDelay += 500);
addLine('', '#0f0', exfilDelay += 300);
addLine('> ALL YOUR FILES HAVE BEEN ENCRYPTED.', '#f00', exfilDelay += 200);
addLine('> Send 2.5 BTC to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', '#ff0', exfilDelay += 300);
addLine('> You have 48 hours. After that, your data is gone forever.', '#f00', exfilDelay += 300);

// ── Fullscreen red flash ──
hkTimeout(function() {
  var flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(255,0,0,0.3);pointer-events:none;animation:hackFlash 0.5s ease 4';
  var style = document.createElement('style');
  style.textContent = '@keyframes hackFlash{0%,100%{opacity:0}50%{opacity:1}}';
  document.head.appendChild(style);
  document.body.appendChild(flash);
  hkTimeout(function() { flash.remove(); style.remove(); }, 2500);
}, exfilDelay - 800);

// ── Desktop background goes red ──
hkTimeout(function() {
  document.getElementById('desktop').style.background = '#200000';
}, exfilDelay);

// ── PHASE 10: The reveal ──
exfilDelay += 2500;
addLine('', '#0f0', exfilDelay);
addLine('', '#0f0', exfilDelay += 300);
addLine('  ............................................................', '#0f0', exfilDelay += 200);
addLine('', '#0f0', exfilDelay += 500);
addLine('  relax. none of that was real. 😄', '#0f0', exfilDelay += 400);
addLine('  your files are fine. your webcam is off.', '#0f0', exfilDelay += 300);
addLine('  this was just a Mini OS code snippet.', '#0f0', exfilDelay += 300);
addLine('  close this window to restore everything.', '#0f0', exfilDelay += 300);

// ── Stop the shaking after reveal ──
hkTimeout(function() {
  if (shakeIv) clearInterval(shakeIv);
  document.body.style.transform = '';
}, exfilDelay);

// ── CLEANUP on close ──
w.el.querySelector('.btn-close').addEventListener('click', function() {
  allTimeouts.forEach(clearTimeout);
  allIntervals.forEach(clearInterval);
  document.body.style.filter = '';
  document.body.style.transform = '';
  if (hexOverlay.parentNode) hexOverlay.remove();
  var savedWp = localStorage.getItem('minios-custom-wallpaper');
  if (savedWp) { document.getElementById('desktop').style.background = savedWp; }
  else { document.getElementById('desktop').style.background = OS.wallpapers[OS.getCurrentWallpaper()]; }
});
```

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
