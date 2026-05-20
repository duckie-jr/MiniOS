## Mini OS Code Snippets

Paste any of these into the **Code Editor** app, select **JavaScript**, and hit **Run**.

---

### Digital Clock Window

```js
var w = OS.createWindow("Live Clock", 200, 80, "<div id='lclk' style='display:flex;align-items:center;justify-content:center;height:100%;font-size:28px;font-family:monospace;background:#1a1a2e;color:#0f0'></div>");
setInterval(function(){ var d=new Date(); w.el.querySelector('#lclk').textContent=d.toLocaleTimeString(); },1000);
```

---

### Rainbow Color Changing Window

```js
var w = OS.createWindow("Rainbow", 250, 150, "<div id='rbw' style='height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;transition:background .5s'>PARTY MODE</div>");
var hue = 0;
setInterval(function(){ hue = (hue + 5) % 360; w.el.querySelector('#rbw').style.background = 'hsl('+hue+',70%,60%)'; }, 100);
```

---

### Notification Flood

```js
for (var i = 0; i < 10; i++) {
  (function(n){ setTimeout(function(){ OS.showNotification("Alert #"+n, "You cannot escape the notifications"); }, n * 300); })(i);
}
```

---

### Window That Runs Away From Your Mouse

```js
var w = OS.createWindow("Catch Me", 150, 100, "<div style='display:flex;align-items:center;justify-content:center;height:100%;font-size:14px;background:#ece9d8'>You cant catch me</div>");
w.el.addEventListener('mouseenter', function() {
  w.el.style.left = Math.random() * (window.innerWidth - 200) + 'px';
  w.el.style.top = Math.random() * (window.innerHeight - 150) + 'px';
});
```

---

### Fake System Error Prank

```js
var w = OS.createWindow("CRITICAL ERROR", 350, 180, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;background:#c00;color:#fff;font-size:13px;padding:16px;text-align:center'><div style='font-size:18px;font-weight:700'>FATAL SYSTEM ERROR</div><div>Your hard drive has been formatted.</div><div style='font-size:10px;color:#faa'>(just kidding)</div></div>");
```

---

### Matrix Rain Effect

```js
var w = OS.createWindow("Matrix", 300, 250, "<canvas id='mtx' width='300' height='220' style='background:#000;display:block'></canvas>");
var c = w.el.querySelector('#mtx'), ctx = c.getContext('2d');
var cols = 30, drops = [];
for(var i=0;i<cols;i++) drops[i]=Math.random()*-20;
setInterval(function(){
  ctx.fillStyle='rgba(0,0,0,0.05)'; ctx.fillRect(0,0,300,220);
  ctx.fillStyle='#0f0'; ctx.font='10px monospace';
  for(var i=0;i<cols;i++){
    ctx.fillText(String.fromCharCode(0x30A0+Math.random()*96), i*10, drops[i]*10);
    if(drops[i]*10>220&&Math.random()>.975) drops[i]=0;
    drops[i]++;
  }
}, 50);
```

---

### Launch Every App At Once

```js
['notepad','calculator','files','terminal','browser','paint','clock','minesweeper','settings','codeeditor','findfiles','clipboardmanager','about'].forEach(function(app, i) {
  setTimeout(function(){ OS.openApp(app); }, i * 200);
});
```

---

### Custom Window Builder (with prompts)

```js
OS.prompt("Window title?", "My App", function(title) {
  if (!title) return;
  OS.prompt("Background color?", "#2a6ad4", function(color) {
    if (!color) return;
    OS.prompt("Message to display?", "Hello World", function(msg) {
      if (!msg) return;
      OS.createWindow(title, 300, 180, "<div style='display:flex;align-items:center;justify-content:center;height:100%;font-size:20px;color:#fff;background:"+color+"'>"+msg+"</div>");
    });
  });
});
```

---

### Bouncing Ball Animation

```js
var w = OS.createWindow("Bouncing Ball", 300, 200, "<canvas id='bnc' width='300' height='170' style='background:#222;display:block'></canvas>");
var c = w.el.querySelector('#bnc'), ctx = c.getContext('2d');
var x=150,y=85,dx=3,dy=2,r=12;
setInterval(function(){
  ctx.fillStyle='rgba(34,34,34,0.3)';ctx.fillRect(0,0,300,170);
  x+=dx;y+=dy;
  if(x+r>300||x-r<0)dx=-dx;
  if(y+r>170||y-r<0)dy=-dy;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle='#f44';ctx.fill();
},16);
```

---

### Create A File From Code

```js
OS.fileSystem['C:'].children['My Documents'].children['from-code.txt'] = {
  type: 'file',
  size: 28,
  modified: new Date().toISOString().slice(0,10),
  content: 'This file was made by code!'
};
OS.showNotification("File Created", "Check My Documents for from-code.txt");
```

---

### Count All Files On The System

```js
var count = 0;
function scan(node, path) {
  if (!node || !node.children) return;
  Object.keys(node.children).forEach(function(name) {
    var child = node.children[name];
    if (child.type === 'file') { count++; }
    if (child.type === 'folder') scan(child, path + '\\' + name);
  });
}
scan(OS.fileSystem['C:'], 'C:');
OS.showNotification("File Scanner", "Found " + count + " files on C:");
```

---

### Stopwatch App

```js
var seconds = 0, running = false, iv;
var w = OS.createWindow("Stopwatch", 220, 140, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8'><div id='swtimer' style='font-size:36px;font-family:monospace;color:#003399'>00:00</div><div style='display:flex;gap:6px'><button id='swstart' style='padding:4px 14px;cursor:pointer'>Start</button><button id='swreset' style='padding:4px 14px;cursor:pointer'>Reset</button></div></div>");
var display = w.el.querySelector('#swtimer');
w.el.querySelector('#swstart').addEventListener('click', function() {
  if (running) { clearInterval(iv); running = false; this.textContent = 'Start'; }
  else { iv = setInterval(function(){ seconds++; var m = Math.floor(seconds/60), s = seconds%60; display.textContent = (m<10?'0':'')+m+':'+(s<10?'0':'')+s; },1000); running = true; this.textContent = 'Stop'; }
});
w.el.querySelector('#swreset').addEventListener('click', function(){ seconds=0; display.textContent='00:00'; });
w.el.querySelector('.btn-close').addEventListener('click', function(){ clearInterval(iv); });
```

---

### Typing Speed Test

```js
var testWords = "the quick brown fox jumps over the lazy dog";
var startTime;
var w = OS.createWindow("Typing Test", 400, 180, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;background:#ece9d8;padding:12px'><div style='font-size:14px;font-family:monospace;color:#555;letter-spacing:1px'>" + testWords + "</div><input id='ttinput' style='width:90%;padding:4px 8px;font-size:13px;font-family:monospace;border:2px inset #c8c4b8' placeholder='Start typing...' /><div id='ttresult' style='font-size:12px;color:#003399'></div></div>");
var inp = w.el.querySelector('#ttinput');
inp.focus();
inp.addEventListener('input', function() {
  if (!startTime) startTime = Date.now();
  if (inp.value === testWords) {
    var elapsed = (Date.now() - startTime) / 1000;
    var wpm = Math.round((testWords.split(' ').length / elapsed) * 60);
    w.el.querySelector('#ttresult').textContent = 'Done! ' + elapsed.toFixed(1) + 's — ' + wpm + ' WPM';
    startTime = null;
  }
});
```

---

### Pixel Art Canvas

```js
var size = 16, px = 12;
var color = '#ff0000';
var w = OS.createWindow("Pixel Art", size*px+20, size*px+60, "<div style='display:flex;flex-direction:column;align-items:center;height:100%;background:#ece9d8;padding:4px;gap:4px'><div style='display:flex;gap:3px'><div class='pxc' style='width:16px;height:16px;background:#ff0000;border:2px solid #000;cursor:pointer'></div><div class='pxc' style='width:16px;height:16px;background:#00aa00;border:1px solid #888;cursor:pointer'></div><div class='pxc' style='width:16px;height:16px;background:#0000ff;border:1px solid #888;cursor:pointer'></div><div class='pxc' style='width:16px;height:16px;background:#ffff00;border:1px solid #888;cursor:pointer'></div><div class='pxc' style='width:16px;height:16px;background:#000000;border:1px solid #888;cursor:pointer'></div><div class='pxc' style='width:16px;height:16px;background:#ffffff;border:1px solid #888;cursor:pointer'></div></div><canvas id='pxcanvas' width='"+(size*px)+"' height='"+(size*px)+"' style='border:1px solid #888;cursor:crosshair;background:#fff'></canvas></div>");
var canvas = w.el.querySelector('#pxcanvas'), ctx = canvas.getContext('2d');
w.el.querySelectorAll('.pxc').forEach(function(el){ el.addEventListener('click', function(){ w.el.querySelectorAll('.pxc').forEach(function(e){e.style.borderWidth='1px';e.style.borderColor='#888';}); el.style.borderWidth='2px';el.style.borderColor='#000'; color=el.style.background; }); });
var painting = false;
canvas.addEventListener('mousedown', function(e){ painting=true; paint(e); });
canvas.addEventListener('mousemove', function(e){ if(painting) paint(e); });
canvas.addEventListener('mouseup', function(){ painting=false; });
function paint(e){ var r=canvas.getBoundingClientRect(); var gx=Math.floor((e.clientX-r.left)/px); var gy=Math.floor((e.clientY-r.top)/px); ctx.fillStyle=color; ctx.fillRect(gx*px,gy*px,px,px); }
```
