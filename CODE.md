## Mini OS Code Snippets

Paste any of these into the **Code Editor** app, select **JavaScript**, and hit **Run**.

All of these also work as **`.app` files** — create a new text file in the file manager, rename it to `something.app`, open it in Notepad, paste the code, close it, then double-click to run. The `.app` format uses the exact same `OS` API as the Code Editor.

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

---

### Snake Game

```js
var w = OS.createWindow("Snake", 320, 280, "<canvas id='snk' width='300' height='240' style='background:#111;display:block'></canvas>");
var c = w.el.querySelector('#snk'), ctx = c.getContext('2d'), sz = 15;
var snake = [{x:10,y:8}], dir = {x:1,y:0}, food = {x:5,y:5}, score = 0, alive = true;
function draw() {
  ctx.fillStyle='#111'; ctx.fillRect(0,0,300,240);
  ctx.fillStyle='#f44'; ctx.fillRect(food.x*sz,food.y*sz,sz-1,sz-1);
  snake.forEach(function(s,i){ ctx.fillStyle=i===0?'#0f0':'#0a0'; ctx.fillRect(s.x*sz,s.y*sz,sz-1,sz-1); });
  ctx.fillStyle='#fff'; ctx.font='10px monospace'; ctx.fillText('Score: '+score,5,236);
  if(!alive){ ctx.fillStyle='#f44'; ctx.font='20px sans-serif'; ctx.fillText('GAME OVER',90,120); }
}
var iv = setInterval(function(){
  if(!alive) return;
  var head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
  if(head.x<0||head.x>=20||head.y<0||head.y>=16||snake.some(function(s){return s.x===head.x&&s.y===head.y})){alive=false;draw();return;}
  snake.unshift(head);
  if(head.x===food.x&&head.y===food.y){score+=10;food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*16)};}
  else snake.pop();
  draw();
}, 120);
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowUp'&&dir.y!==1)dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y!==-1)dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x!==1)dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x!==-1)dir={x:1,y:0};
});
w.el.querySelector('.btn-close').addEventListener('click',function(){clearInterval(iv);});
draw();
```

---

### Etch-a-Sketch

```js
var w = OS.createWindow("Etch-a-Sketch", 320, 300, "<canvas id='etch' width='300' height='240' style='background:#c0d8a0;display:block;border:2px solid #888'></canvas><div style='display:flex;justify-content:center;padding:4px;background:#c44;gap:8px'><button id='etchClear' style='padding:2px 12px;cursor:pointer'>Shake to Clear</button></div>");
var c = w.el.querySelector('#etch'), ctx = c.getContext('2d');
var px = 150, py = 120;
ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py);
document.addEventListener('keydown', function(e) {
  if(e.key==='ArrowUp') py = Math.max(0, py-3);
  if(e.key==='ArrowDown') py = Math.min(240, py+3);
  if(e.key==='ArrowLeft') px = Math.max(0, px-3);
  if(e.key==='ArrowRight') px = Math.min(300, px+3);
  ctx.lineTo(px, py); ctx.stroke();
});
w.el.querySelector('#etchClear').addEventListener('click', function() {
  ctx.clearRect(0,0,300,240); ctx.beginPath(); ctx.moveTo(px,py);
});
```

---

### Todo List App

```js
var todos = [];
var w = OS.createWindow("Todo List", 300, 300, "<div style='display:flex;flex-direction:column;height:100%;background:#ece9d8'><div style='display:flex;gap:4px;padding:6px;border-bottom:1px solid #aca899;flex-shrink:0'><input id='todoinp' style='flex:1;padding:3px 6px;font-size:11px;border:2px inset #c8c4b8;font-family:inherit' placeholder='Add a task...' /><button id='todoadd' style='padding:3px 10px;font-size:11px;cursor:pointer;font-family:inherit'>Add</button></div><div id='todolist' style='flex:1;overflow-y:auto;padding:4px;background:#fff'></div><div id='todocount' style='padding:2px 8px;background:#ece9d8;border-top:1px solid #aca899;font-size:10px;color:#555;flex-shrink:0'></div></div>");
w.el.querySelector('.window-body').classList.add('window-body-flex');
var inp = w.el.querySelector('#todoinp'), list = w.el.querySelector('#todolist'), countEl = w.el.querySelector('#todocount');
function renderTodos() {
  list.innerHTML = '';
  countEl.textContent = todos.filter(function(t){return !t.done}).length + ' remaining';
  todos.forEach(function(todo, idx) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:11px;border-bottom:1px solid #eee';
    row.innerHTML = '<input type="checkbox" ' + (todo.done?'checked':'') + ' /><span style="flex:1;' + (todo.done?'text-decoration:line-through;color:#999':'') + '">' + OS.escapeHtml(todo.text) + '</span><button style="border:none;background:none;color:#c44;cursor:pointer;font-size:13px">x</button>';
    row.querySelector('input').addEventListener('change', function() { todo.done = !todo.done; renderTodos(); });
    row.querySelector('button').addEventListener('click', function() { todos.splice(idx, 1); renderTodos(); });
    list.appendChild(row);
  });
}
function addTodo() { var text = inp.value.trim(); if (text) { todos.push({text:text,done:false}); inp.value=''; renderTodos(); } }
w.el.querySelector('#todoadd').addEventListener('click', addTodo);
inp.addEventListener('keydown', function(e) { if(e.key==='Enter') addTodo(); });
renderTodos();
```

---

### Memory Card Game

```js
var symbols = ['A','A','B','B','C','C','D','D','E','E','F','F','G','G','H','H'];
symbols.sort(function(){return Math.random()-0.5;});
var html = '<div style="display:flex;flex-direction:column;align-items:center;height:100%;background:#2a5a2a;padding:8px;gap:6px"><div id="memgrid" style="display:grid;grid-template-columns:repeat(4,50px);gap:4px"></div><div id="memstatus" style="color:#fff;font-size:12px">Find all pairs!</div></div>';
var w = OS.createWindow("Memory Game", 250, 310, html);
var grid = w.el.querySelector('#memgrid'), status = w.el.querySelector('#memstatus');
var flipped = [], matched = 0, moves = 0, locked = false;
symbols.forEach(function(sym, idx) {
  var card = document.createElement('div');
  card.style.cssText = 'width:50px;height:50px;background:#3a7a3a;border:2px solid #2a5a2a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#3a7a3a;cursor:pointer;user-select:none';
  card.dataset.sym = sym; card.dataset.idx = idx;
  card.addEventListener('click', function() {
    if (locked || card.dataset.found || flipped.indexOf(card) >= 0) return;
    card.style.background = '#fff'; card.style.color = '#333'; card.textContent = sym;
    flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      locked = true;
      if (flipped[0].dataset.sym === flipped[1].dataset.sym) {
        flipped[0].dataset.found = '1'; flipped[1].dataset.found = '1';
        flipped[0].style.background = '#8c8'; flipped[1].style.background = '#8c8';
        matched += 2; flipped = []; locked = false;
        if (matched === symbols.length) { status.textContent = 'You won in ' + moves + ' moves!'; OS.showNotification('Memory Game', 'Completed in ' + moves + ' moves!'); }
        else status.textContent = moves + ' moves';
      } else {
        setTimeout(function() { flipped.forEach(function(c){ c.style.background='#3a7a3a'; c.style.color='#3a7a3a'; c.textContent=''; }); flipped=[]; locked=false; }, 800);
        status.textContent = moves + ' moves';
      }
    }
  });
  grid.appendChild(card);
});
```

---

### Analog Clock

```js
var w = OS.createWindow("Analog Clock", 220, 240, "<canvas id='aclk' width='200' height='200' style='display:block;margin:5px auto;background:#fff;border-radius:50%'></canvas>");
var c = w.el.querySelector('#aclk'), ctx = c.getContext('2d');
function drawClock() {
  ctx.clearRect(0,0,200,200);
  ctx.save(); ctx.translate(100,100);
  // Face
  ctx.beginPath(); ctx.arc(0,0,95,0,Math.PI*2); ctx.fillStyle='#f8f8f8'; ctx.fill(); ctx.strokeStyle='#333'; ctx.lineWidth=3; ctx.stroke();
  // Numbers
  ctx.fillStyle='#333'; ctx.font='14px Tahoma'; ctx.textAlign='center'; ctx.textBaseline='middle';
  for(var n=1;n<=12;n++){ var a=n*Math.PI/6-Math.PI/2; ctx.fillText(n, Math.cos(a)*75, Math.sin(a)*75); }
  // Tick marks
  for(var t=0;t<60;t++){ var ta=t*Math.PI/30; ctx.beginPath(); ctx.moveTo(Math.cos(ta)*88,Math.sin(ta)*88); ctx.lineTo(Math.cos(ta)*(t%5===0?80:85),Math.sin(ta)*(t%5===0?80:85)); ctx.strokeStyle=t%5===0?'#333':'#aaa'; ctx.lineWidth=t%5===0?2:1; ctx.stroke(); }
  var now = new Date(), h=now.getHours()%12, m=now.getMinutes(), s=now.getSeconds();
  // Hour hand
  var ha=(h+m/60)*Math.PI/6-Math.PI/2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(ha)*50,Math.sin(ha)*50); ctx.strokeStyle='#333'; ctx.lineWidth=4; ctx.lineCap='round'; ctx.stroke();
  // Minute hand
  var ma=(m+s/60)*Math.PI/30-Math.PI/2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(ma)*70,Math.sin(ma)*70); ctx.strokeStyle='#555'; ctx.lineWidth=3; ctx.stroke();
  // Second hand
  var sa=s*Math.PI/30-Math.PI/2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(sa)*80,Math.sin(sa)*80); ctx.strokeStyle='#c00'; ctx.lineWidth=1; ctx.stroke();
  // Center dot
  ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fillStyle='#333'; ctx.fill();
  ctx.restore();
}
drawClock();
var iv = setInterval(drawClock, 1000);
w.el.querySelector('.btn-close').addEventListener('click', function(){ clearInterval(iv); });
```

---

### Color Picker

```js
var w = OS.createWindow("Color Picker", 280, 200, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8'><div id='cppreview' style='width:80px;height:80px;border:2px solid #888;border-radius:4px;background:#ff0000'></div><div style='display:flex;gap:4px;align-items:center;font-size:11px'><label>R</label><input id='cpr' type='range' min='0' max='255' value='255' style='width:60px'/><label>G</label><input id='cpg' type='range' min='0' max='255' value='0' style='width:60px'/><label>B</label><input id='cpb' type='range' min='0' max='255' value='0' style='width:60px'/></div><div id='cpvalue' style='font-family:monospace;font-size:13px;color:#003399'>#ff0000</div><button id='cpcopy' style='padding:3px 12px;font-size:11px;cursor:pointer;font-family:inherit'>Copy Hex</button></div>");
var preview = w.el.querySelector('#cppreview'), valueEl = w.el.querySelector('#cpvalue');
var rSlider = w.el.querySelector('#cpr'), gSlider = w.el.querySelector('#cpg'), bSlider = w.el.querySelector('#cpb');
function updateColor() {
  var r = +rSlider.value, g = +gSlider.value, b = +bSlider.value;
  var hex = '#' + [r,g,b].map(function(v){return v.toString(16).padStart(2,'0')}).join('');
  preview.style.background = hex; valueEl.textContent = hex;
}
rSlider.addEventListener('input', updateColor); gSlider.addEventListener('input', updateColor); bSlider.addEventListener('input', updateColor);
w.el.querySelector('#cpcopy').addEventListener('click', function() { OS.showNotification('Color Picker', 'Copied: ' + valueEl.textContent); });
```

---

### Reaction Time Test

```js
var w = OS.createWindow("Reaction Test", 300, 200, "<div id='rtbox' style='display:flex;align-items:center;justify-content:center;height:100%;font-size:14px;cursor:pointer;background:#c44;color:#fff;user-select:none'>Click to start</div>");
var box = w.el.querySelector('#rtbox'), state = 'idle', startTime, timeout;
box.addEventListener('click', function() {
  if (state === 'idle') {
    state = 'waiting'; box.style.background = '#c44'; box.textContent = 'Wait for green...';
    timeout = setTimeout(function() { state = 'ready'; box.style.background = '#2a2'; box.textContent = 'CLICK NOW!'; startTime = Date.now(); }, 1000 + Math.random() * 3000);
  } else if (state === 'waiting') {
    clearTimeout(timeout); state = 'idle'; box.style.background = '#c44'; box.textContent = 'Too early! Click to retry';
  } else if (state === 'ready') {
    var reaction = Date.now() - startTime;
    box.style.background = '#28c'; box.textContent = reaction + 'ms! Click to retry';
    state = 'idle'; OS.showNotification('Reaction Test', reaction + 'ms reaction time');
  }
});
```

---

### Window Spawner Prank

```js
var count = 0;
function spawnWindow() {
  count++;
  if (count > 20) return;
  var w = OS.createWindow("Window #" + count, 150, 80, "<div style='display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;background:#ece9d8;cursor:pointer' id='spawner'>Click me for more</div>");
  w.el.style.left = Math.random() * (window.innerWidth - 180) + 'px';
  w.el.style.top = Math.random() * (window.innerHeight - 130) + 'px';
  w.el.querySelector('#spawner').addEventListener('click', function() { spawnWindow(); spawnWindow(); });
}
spawnWindow();
```

---

### Calculator History Tape

```js
var history = [];
var w = OS.createWindow("Quick Calc", 260, 280, "<div style='display:flex;flex-direction:column;height:100%;background:#ece9d8'><div id='qctape' style='flex:1;overflow-y:auto;padding:6px;background:#ffe;font-family:monospace;font-size:11px;border-bottom:1px solid #aca899'></div><div style='display:flex;gap:4px;padding:6px'><input id='qcinp' style='flex:1;padding:3px 6px;font-size:12px;font-family:monospace;border:2px inset #c8c4b8' placeholder='e.g. 42 * 3.14' /><button id='qcgo' style='padding:3px 10px;font-size:11px;cursor:pointer;font-family:inherit'>=</button></div></div>");
w.el.querySelector('.window-body').classList.add('window-body-flex');
var tape = w.el.querySelector('#qctape'), inp = w.el.querySelector('#qcinp');
function calc() {
  var expr = inp.value.trim(); if (!expr) return;
  try { var result = eval(expr); history.push(expr + ' = ' + result); }
  catch(e) { history.push(expr + ' = ERROR'); }
  tape.innerHTML = history.map(function(h,i){return '<div style="color:'+(h.indexOf('ERROR')>=0?'#c44':'#333')+'">'+OS.escapeHtml(h)+'</div>';}).join('');
  tape.scrollTop = tape.scrollHeight; inp.value = '';
}
w.el.querySelector('#qcgo').addEventListener('click', calc);
inp.addEventListener('keydown', function(e) { if(e.key==='Enter') calc(); });
inp.focus();
```

---

### Simon Says

```js
var colors = ['#c44','#4a4','#44c','#cc4'], sequence = [], playerIdx = 0, level = 0;
var w = OS.createWindow("Simon Says", 230, 260, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#222'><div style='display:grid;grid-template-columns:1fr 1fr;gap:6px' id='simonbtns'></div><div id='simonmsg' style='color:#fff;font-size:12px'>Press Start</div><button id='simonstart' style='padding:4px 16px;cursor:pointer;font-size:11px;font-family:inherit'>Start</button></div>");
var btnsDiv = w.el.querySelector('#simonbtns'), msg = w.el.querySelector('#simonmsg');
var buttons = [];
colors.forEach(function(color, idx) {
  var btn = document.createElement('div');
  btn.style.cssText = 'width:80px;height:80px;background:'+color+';border-radius:8px;cursor:pointer;opacity:0.6;transition:opacity .15s';
  btn.addEventListener('click', function() {
    if (playerIdx < 0) return;
    btn.style.opacity = '1'; setTimeout(function(){btn.style.opacity='0.6';},200);
    if (idx === sequence[playerIdx]) {
      playerIdx++;
      if (playerIdx >= sequence.length) { playerIdx = -1; level++; msg.textContent = 'Level ' + level + '!'; setTimeout(playSequence, 800); }
    } else { msg.textContent = 'Wrong! Score: ' + (level-1); level = 0; sequence = []; playerIdx = -1; }
  });
  btnsDiv.appendChild(btn); buttons.push(btn);
});
function playSequence() {
  sequence.push(Math.floor(Math.random()*4)); playerIdx = -1; msg.textContent = 'Watch...';
  sequence.forEach(function(s, i) {
    setTimeout(function(){ buttons[s].style.opacity='1'; setTimeout(function(){buttons[s].style.opacity='0.6';},300); }, i*500+200);
  });
  setTimeout(function(){ playerIdx = 0; msg.textContent = 'Your turn! Level ' + (level+1); }, sequence.length * 500 + 500);
}
w.el.querySelector('#simonstart').addEventListener('click', function(){ level=0; sequence=[]; playSequence(); });
```

---

### Screen Saver (Bouncing Logo)

```js
var w = OS.createWindow("Screensaver", 400, 300, "<canvas id='sscanvas' width='400' height='270' style='background:#000;display:block'></canvas>");
var c = w.el.querySelector('#sscanvas'), ctx = c.getContext('2d');
var x = 50, y = 50, dx = 2.5, dy = 1.8, hue = 0;
var iv = setInterval(function() {
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0,0,400,270);
  x += dx; y += dy;
  if (x < 0 || x > 340) { dx = -dx; hue = (hue + 40) % 360; }
  if (y < 0 || y > 240) { dy = -dy; hue = (hue + 40) % 360; }
  ctx.fillStyle = 'hsl(' + hue + ',80%,60%)';
  ctx.font = '24px Tahoma'; ctx.fillText('Mini OS', x, y + 20);
}, 16);
w.el.querySelector('.btn-close').addEventListener('click', function(){ clearInterval(iv); });
```

---

### Weather Widget (Fake)

```js
var conditions = ['Sunny','Cloudy','Rainy','Stormy','Snowy','Windy','Foggy','Clear'];
var icons = ['*','~','/','!','o','<','=','.'];
var temp = Math.floor(Math.random()*35)+5;
var cond = Math.floor(Math.random()*conditions.length);
var w = OS.createWindow("Weather", 220, 160, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:linear-gradient(180deg,#4a8acc,#6ab0ff);color:#fff;gap:4px'><div style='font-size:48px'>"+icons[cond]+"</div><div style='font-size:24px;font-weight:700'>"+temp+"C</div><div style='font-size:13px'>"+conditions[cond]+"</div><div style='font-size:10px;opacity:.7'>Mini OS City</div></div>");
```

---

### Random Quote Generator

```js
var quotes = [
  ["The best way to predict the future is to invent it.", "Alan Kay"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["Any fool can write code that a computer can understand.", "Martin Fowler"],
  ["First, solve the problem. Then, write the code.", "John Johnson"],
  ["Code is like humor. When you have to explain it, its bad.", "Cory House"],
  ["Simplicity is the soul of efficiency.", "Austin Freeman"],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["The most disastrous thing that you can ever learn is your first programming language.", "Alan Kay"]
];
var q = quotes[Math.floor(Math.random()*quotes.length)];
var w = OS.createWindow("Quote", 340, 160, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;background:#ece9d8;text-align:center;gap:10px'><div style='font-size:13px;font-style:italic;color:#333;line-height:1.5'>\""+q[0]+"\"</div><div style='font-size:11px;color:#666'>- "+q[1]+"</div></div>");
```

---

### Morse Code Translator

```js
var morseMap = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.',' ':'/'};
var w = OS.createWindow("Morse Code", 350, 180, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8;padding:12px'><input id='morseinp' style='width:90%;padding:4px 8px;font-size:12px;border:2px inset #c8c4b8;font-family:inherit' placeholder='Type something...' /><div id='morseout' style='font-family:monospace;font-size:14px;color:#003399;word-break:break-all;text-align:center;min-height:20px'></div></div>");
w.el.querySelector('#morseinp').addEventListener('input', function() {
  var text = this.value.toUpperCase();
  var morse = text.split('').map(function(ch){ return morseMap[ch] || ''; }).join(' ');
  w.el.querySelector('#morseout').textContent = morse;
});
w.el.querySelector('#morseinp').focus();
```

---

### System Info Dashboard

```js
var w = OS.createWindow("System Info", 320, 240, "<div id='sysinfo' style='padding:12px;font-size:11px;font-family:monospace;background:#1a1a2e;color:#0f0;height:100%;overflow-y:auto'></div>");
var el = w.el.querySelector('#sysinfo');
function update() {
  var fileCount = 0, folderCount = 0;
  (function count(node) { if(!node||!node.children)return; Object.keys(node.children).forEach(function(k){ var c=node.children[k]; if(c.type==='folder'){folderCount++;count(c);}else fileCount++; }); })(OS.fileSystem['C:']);
  var lines = [
    'Mini OS System Dashboard',
    '========================',
    'User:      ' + (OS.getActiveUser ? OS.getActiveUser() : 'Unknown'),
    'Windows:   ' + OS.windows.length + ' open',
    'Files:     ' + fileCount,
    'Folders:   ' + folderCount,
    'Clipboard: ' + OS.clipboardHistory.length + ' items',
    'Storage:   ~' + Math.round(JSON.stringify(localStorage).length/1024) + ' KB used',
    'Screen:    ' + window.innerWidth + 'x' + window.innerHeight,
    'Time:      ' + new Date().toLocaleString(),
    'Uptime:    Since page load',
    '',
    'Refreshing every 2s...'
  ];
  el.innerHTML = lines.map(function(l){return '<div>'+l+'</div>';}).join('');
}
update();
var iv = setInterval(update, 2000);
w.el.querySelector('.btn-close').addEventListener('click', function(){ clearInterval(iv); });
```

---

### Click Speed Challenge

```js
var clicks = 0, timeLeft = 10, running = false, iv;
var w = OS.createWindow("Click Speed", 250, 180, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8'><div id='cstime' style='font-size:24px;color:#003399'>10s</div><div id='cscount' style='font-size:36px;font-weight:700'>0</div><button id='csbtn' style='padding:8px 24px;font-size:14px;cursor:pointer;font-family:inherit;background:#4a8acc;color:#fff;border:none;border-radius:4px'>Click Me!</button><div id='cscps' style='font-size:11px;color:#555'></div></div>");
var timeEl = w.el.querySelector('#cstime'), countEl = w.el.querySelector('#cscount'), cpsEl = w.el.querySelector('#cscps');
w.el.querySelector('#csbtn').addEventListener('click', function() {
  if (!running) { running = true; clicks = 0; timeLeft = 10; iv = setInterval(function(){ timeLeft--; timeEl.textContent = timeLeft + 's'; if(timeLeft<=0){ clearInterval(iv); running=false; cpsEl.textContent=clicks+' clicks = '+(clicks/10).toFixed(1)+' CPS'; OS.showNotification('Click Speed',(clicks/10).toFixed(1)+' clicks per second!'); } },1000); }
  if (running) { clicks++; countEl.textContent = clicks; }
});
w.el.querySelector('.btn-close').addEventListener('click', function(){ clearInterval(iv); });
```

---

### Fireworks Display

```js
var w = OS.createWindow("Fireworks", 400, 300, "<canvas id='fw' width='400' height='270' style='background:#000;display:block'></canvas>");
var c = w.el.querySelector('#fw'), ctx = c.getContext('2d');
var particles = [];
function explode(x, y) {
  var hue = Math.random() * 360;
  for (var i = 0; i < 40; i++) {
    var angle = Math.random() * Math.PI * 2, speed = Math.random() * 4 + 1;
    particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 60, hue: hue });
  }
}
setInterval(function() { if (Math.random() > 0.92) explode(Math.random() * 400, 50 + Math.random() * 100); }, 100);
var iv = setInterval(function() {
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 0, 400, 270);
  particles.forEach(function(p) { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = 'hsla(' + p.hue + ',100%,60%,' + (p.life / 60) + ')'; ctx.fill(); });
  particles = particles.filter(function(p) { return p.life > 0; });
}, 16);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Lava Lamp

```js
var w = OS.createWindow("Lava Lamp", 200, 350, "<canvas id='lava' width='200' height='320' style='display:block'></canvas>");
var c = w.el.querySelector('#lava'), ctx = c.getContext('2d');
var blobs = [];
for (var i = 0; i < 6; i++) blobs.push({ x: 60 + Math.random() * 80, y: 50 + Math.random() * 220, r: 15 + Math.random() * 25, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.8 });
var iv = setInterval(function() {
  ctx.fillStyle = '#1a0a2e'; ctx.fillRect(0, 0, 200, 320);
  blobs.forEach(function(b) {
    b.x += b.vx; b.y += b.vy;
    if (b.x < b.r || b.x > 200 - b.r) b.vx *= -1;
    if (b.y < b.r || b.y > 320 - b.r) b.vy *= -1;
    var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, 'rgba(255,60,120,0.9)'); g.addColorStop(1, 'rgba(255,60,120,0)');
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  });
}, 30);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Desktop Pet

```js
var pet = document.createElement('div');
pet.style.cssText = 'position:fixed;bottom:34px;left:100px;z-index:999;font-size:32px;cursor:grab;transition:bottom .3s;user-select:none';
pet.textContent = '🐱';
document.body.appendChild(pet);
var dragging = false, offsetX = 0;
pet.addEventListener('mousedown', function(e) { dragging = true; offsetX = e.clientX - pet.offsetLeft; pet.style.cursor = 'grabbing'; });
document.addEventListener('mousemove', function(e) { if (dragging) pet.style.left = (e.clientX - offsetX) + 'px'; });
document.addEventListener('mouseup', function() { dragging = false; pet.style.cursor = 'grab'; });
pet.addEventListener('dblclick', function() { pet.style.bottom = '120px'; setTimeout(function() { pet.style.bottom = '34px'; }, 500); });
var petIv = setInterval(function() { if (!dragging && Math.random() > 0.95) { pet.style.left = (parseInt(pet.style.left || 100) + (Math.random() > 0.5 ? 20 : -20)) + 'px'; } }, 1000);
OS.showNotification('Desktop Pet', 'Drag your cat! Double-click to make it jump.');
```

---

### Pong Game

```js
var w = OS.createWindow("Pong", 400, 280, "<canvas id='pong' width='400' height='250' style='background:#111;display:block'></canvas>");
var c = w.el.querySelector('#pong'), ctx = c.getContext('2d');
var paddle = 100, ballX = 200, ballY = 125, dx = 3, dy = 2, cpuY = 100, score = [0, 0];
document.addEventListener('mousemove', function(e) { var r = c.getBoundingClientRect(); paddle = Math.max(0, Math.min(210, e.clientY - r.top - 20)); });
var iv = setInterval(function() {
  cpuY += (ballY - cpuY - 20) * 0.06;
  ballX += dx; ballY += dy;
  if (ballY < 0 || ballY > 250) dy = -dy;
  if (ballX < 15 && ballY > paddle && ballY < paddle + 40) { dx = Math.abs(dx); }
  if (ballX > 385 && ballY > cpuY && ballY < cpuY + 40) { dx = -Math.abs(dx); }
  if (ballX < 0) { score[1]++; ballX = 200; ballY = 125; }
  if (ballX > 400) { score[0]++; ballX = 200; ballY = 125; }
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 400, 250);
  ctx.setLineDash([4, 4]); ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(200, 250); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#fff'; ctx.fillRect(5, paddle, 10, 40); ctx.fillRect(385, cpuY, 10, 40);
  ctx.beginPath(); ctx.arc(ballX, ballY, 5, 0, Math.PI * 2); ctx.fill();
  ctx.font = '20px monospace'; ctx.fillText(score[0], 170, 30); ctx.fillText(score[1], 210, 30);
}, 16);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Music Visualizer (Fake)

```js
var w = OS.createWindow("Visualizer", 320, 200, "<canvas id='viz' width='320' height='170' style='background:#000;display:block'></canvas>");
var c = w.el.querySelector('#viz'), ctx = c.getContext('2d');
var bars = 32, values = [];
for (var i = 0; i < bars; i++) values[i] = 0;
var iv = setInterval(function() {
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, 320, 170);
  for (var i = 0; i < bars; i++) {
    values[i] += (Math.random() * 100 - values[i]) * 0.2;
    var h = values[i]; var hue = (i / bars) * 280;
    ctx.fillStyle = 'hsl(' + hue + ',90%,55%)';
    ctx.fillRect(i * 10, 170 - h, 8, h);
  }
}, 50);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Flappy Bird Clone

```js
var w = OS.createWindow("Flappy", 240, 320, "<canvas id='flap' width='240' height='290' style='display:block;background:#70c5ce'></canvas>");
var c = w.el.querySelector('#flap'), ctx = c.getContext('2d');
var bird = { y: 145, vy: 0 }, pipes = [], score = 0, alive = true, frame = 0;
function addPipe() { var gap = 70, top = 30 + Math.random() * 150; pipes.push({ x: 250, top: top, bot: top + gap }); }
addPipe();
c.addEventListener('click', function() { if (alive) bird.vy = -5; else { bird = { y: 145, vy: 0 }; pipes = []; score = 0; alive = true; frame = 0; addPipe(); } });
var iv = setInterval(function() {
  if (!alive) { ctx.fillStyle = '#fff'; ctx.font = '16px Tahoma'; ctx.fillText('Game Over! Score: ' + score, 40, 150); ctx.font = '11px Tahoma'; ctx.fillText('Click to restart', 75, 170); return; }
  ctx.fillStyle = '#70c5ce'; ctx.fillRect(0, 0, 240, 290);
  bird.vy += 0.3; bird.y += bird.vy;
  if (bird.y > 280 || bird.y < 0) alive = false;
  frame++;
  if (frame % 90 === 0) addPipe();
  pipes.forEach(function(p) {
    p.x -= 2;
    ctx.fillStyle = '#3cbf3c'; ctx.fillRect(p.x, 0, 30, p.top); ctx.fillRect(p.x, p.bot, 30, 290 - p.bot);
    if (p.x < 30 && p.x > 0 && (bird.y < p.top || bird.y > p.bot)) alive = false;
    if (p.x === 14) score++;
  });
  pipes = pipes.filter(function(p) { return p.x > -30; });
  ctx.fillStyle = '#f7dc6f'; ctx.beginPath(); ctx.arc(20, bird.y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '14px monospace'; ctx.fillText(score, 115, 20);
}, 20);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Binary Clock

```js
var w = OS.createWindow("Binary Clock", 220, 160, "<canvas id='bclk' width='200' height='130' style='display:block;margin:auto;background:#1a1a2e'></canvas>");
var c = w.el.querySelector('#bclk'), ctx = c.getContext('2d');
var iv = setInterval(function() {
  var now = new Date();
  var vals = [Math.floor(now.getHours() / 10), now.getHours() % 10, Math.floor(now.getMinutes() / 10), now.getMinutes() % 10, Math.floor(now.getSeconds() / 10), now.getSeconds() % 10];
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 200, 130);
  ctx.font = '9px monospace'; ctx.fillStyle = '#446'; ctx.fillText('H  H  M  M  S  S', 20, 120);
  for (var col = 0; col < 6; col++) {
    for (var row = 0; row < 4; row++) {
      var bit = (vals[col] >> (3 - row)) & 1;
      ctx.beginPath(); ctx.arc(30 + col * 28, 20 + row * 24, 8, 0, Math.PI * 2);
      ctx.fillStyle = bit ? (col < 2 ? '#0ff' : col < 4 ? '#0f0' : '#f44') : '#222'; ctx.fill();
    }
  }
}, 1000);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Window Cascade Art

```js
var colors = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c','#e84393'];
for (var i = 0; i < 8; i++) {
  (function(n, color) {
    setTimeout(function() {
      var w = OS.createWindow("Layer " + (n + 1), 180, 120, "<div style='height:100%;background:" + color + ";display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700;text-shadow:1px 1px 3px rgba(0,0,0,.4)'>" + (n + 1) + "</div>");
      w.el.style.left = (40 + n * 30) + 'px';
      w.el.style.top = (30 + n * 30) + 'px';
    }, n * 150);
  })(i, colors[i]);
}
```

---

### Password Generator

```js
var w = OS.createWindow("Password Gen", 300, 160, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8;padding:12px'><div id='pwout' style='font-family:monospace;font-size:16px;color:#003399;background:#fff;padding:6px 12px;border:2px inset #c8c4b8;letter-spacing:1px;word-break:break-all;text-align:center;width:90%'>Click Generate</div><div style='display:flex;gap:6px;align-items:center'><label style='font-size:11px'>Length:</label><input id='pwlen' type='range' min='8' max='32' value='16' style='width:80px'/><span id='pwlenval' style='font-size:11px;min-width:20px'>16</span></div><button id='pwbtn' style='padding:4px 18px;cursor:pointer;font-family:inherit;font-size:11px'>Generate</button></div>");
var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
var lenSlider = w.el.querySelector('#pwlen'), lenVal = w.el.querySelector('#pwlenval');
lenSlider.addEventListener('input', function() { lenVal.textContent = lenSlider.value; });
w.el.querySelector('#pwbtn').addEventListener('click', function() {
  var len = +lenSlider.value, pw = '';
  for (var i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  w.el.querySelector('#pwout').textContent = pw;
  OS.showNotification('Password Gen', 'Generated ' + len + '-char password');
});
```

---

### Breakout Game

```js
var w = OS.createWindow("Breakout", 320, 320, "<canvas id='brk' width='320' height='290' style='display:block;background:#111'></canvas>");
var c = w.el.querySelector('#brk'), ctx = c.getContext('2d');
var px = 130, bx = 160, by = 250, bdx = 2.5, bdy = -2.5, score = 0;
var bricks = [];
for (var row = 0; row < 5; row++) for (var col = 0; col < 8; col++) bricks.push({ x: 5 + col * 39, y: 10 + row * 18, w: 36, h: 14, alive: true, color: 'hsl(' + (row * 50) + ',70%,55%)' });
c.addEventListener('mousemove', function(e) { var r = c.getBoundingClientRect(); px = Math.max(0, Math.min(260, e.clientX - r.left - 30)); });
var iv = setInterval(function() {
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 320, 290);
  bx += bdx; by += bdy;
  if (bx < 4 || bx > 316) bdx = -bdx;
  if (by < 4) bdy = -bdy;
  if (by > 275 && bx > px && bx < px + 60) { bdy = -Math.abs(bdy); bdx += (bx - px - 30) * 0.08; }
  if (by > 290) { ctx.fillStyle = '#fff'; ctx.font = '16px Tahoma'; ctx.fillText('Game Over! Score: ' + score, 80, 150); clearInterval(iv); return; }
  bricks.forEach(function(b) { if (b.alive && bx > b.x && bx < b.x + b.w && by > b.y && by < b.y + b.h) { b.alive = false; bdy = -bdy; score += 10; } });
  bricks.forEach(function(b) { if (b.alive) { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); } });
  ctx.fillStyle = '#4af'; ctx.fillRect(px, 276, 60, 8);
  ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.fillText('Score: ' + score, 5, 288);
}, 16);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Starfield Warp

```js
var w = OS.createWindow("Starfield", 400, 300, "<canvas id='stars' width='400' height='270' style='display:block;background:#000'></canvas>");
var c = w.el.querySelector('#stars'), ctx = c.getContext('2d');
var stars = [];
for (var i = 0; i < 200; i++) stars.push({ x: Math.random() * 400 - 200, y: Math.random() * 270 - 135, z: Math.random() * 400 });
var iv = setInterval(function() {
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 0, 400, 270);
  stars.forEach(function(s) {
    s.z -= 4;
    if (s.z <= 0) { s.x = Math.random() * 400 - 200; s.y = Math.random() * 270 - 135; s.z = 400; }
    var sx = (s.x / s.z) * 200 + 200, sy = (s.y / s.z) * 135 + 135;
    var r = Math.max(0.5, (1 - s.z / 400) * 3);
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + (1 - s.z / 400) + ')'; ctx.fill();
  });
}, 16);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(iv); });
```

---

### Sticky Notes Board

```js
var w = OS.createWindow("Sticky Notes", 440, 320, "<div id='stickyboard' style='position:relative;height:100%;background:#5a4a3a;overflow:hidden'></div>");
var board = w.el.querySelector('#stickyboard');
var noteColors = ['#fff740','#ff7eb3','#7afcff','#98fb98','#ffa07a'];
function addNote(text, x, y) {
  var note = document.createElement('div');
  note.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;width:120px;min-height:80px;padding:8px;font-size:11px;font-family:Comic Sans MS,cursive;box-shadow:2px 2px 6px rgba(0,0,0,.3);cursor:move;background:'+noteColors[Math.floor(Math.random()*noteColors.length)];
  note.contentEditable = true;
  note.textContent = text;
  var dragging = false, ox, oy;
  note.addEventListener('mousedown', function(e) { if (e.target === note) { dragging = true; ox = e.offsetX; oy = e.offsetY; } });
  document.addEventListener('mousemove', function(e) { if (dragging) { var r = board.getBoundingClientRect(); note.style.left = (e.clientX - r.left - ox) + 'px'; note.style.top = (e.clientY - r.top - oy) + 'px'; } });
  document.addEventListener('mouseup', function() { dragging = false; });
  board.appendChild(note);
}
addNote('Double-click board to add notes!', 20, 20);
addNote('Drag me around', 180, 80);
addNote('Edit this text', 40, 150);
board.addEventListener('dblclick', function(e) { if (e.target === board) addNote('New note', e.offsetX - 60, e.offsetY - 40); });
```

---

### Disk Usage Pie Chart

```js
var w = OS.createWindow("Disk Usage", 280, 260, "<canvas id='pie' width='260' height='220' style='display:block;margin:auto;background:#ece9d8'></canvas>");
var c = w.el.querySelector('#pie'), ctx = c.getContext('2d');
var folders = {}, total = 0;
function scan(node, folder) {
  if (!node || !node.children) return;
  Object.keys(node.children).forEach(function(name) {
    var child = node.children[name];
    if (child.type === 'file') { folders[folder] = (folders[folder] || 0) + (child.size || 0); total += (child.size || 0); }
    if (child.type === 'folder') scan(child, folder);
  });
}
var root = OS.fileSystem['C:'].children;
Object.keys(root).forEach(function(name) { if (root[name].type === 'folder') scan(root[name], name); });
var colors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e'];
var angle = 0, idx = 0;
ctx.font = '10px Tahoma';
Object.keys(folders).forEach(function(name) {
  var slice = (folders[name] / total) * Math.PI * 2;
  ctx.beginPath(); ctx.moveTo(110, 100); ctx.arc(110, 100, 80, angle, angle + slice);
  ctx.fillStyle = colors[idx % colors.length]; ctx.fill();
  ctx.fillRect(210, 20 + idx * 16, 10, 10);
  ctx.fillStyle = '#000'; ctx.fillText(name, 224, 29 + idx * 16);
  angle += slice; idx++;
});
ctx.fillStyle = '#333'; ctx.font = '11px Tahoma'; ctx.fillText('Total: ' + (total / 1024).toFixed(1) + ' KB', 80, 210);
```

---

### Whack-a-Mole

```js
var w = OS.createWindow("Whack-a-Mole", 310, 280, "<div style='display:flex;flex-direction:column;align-items:center;height:100%;background:#4a8c3f;padding:8px;gap:6px'><div id='wamscore' style='color:#fff;font-size:14px;font-weight:700'>Score: 0 | Time: 20s</div><div id='wamgrid' style='display:grid;grid-template-columns:repeat(3,80px);gap:6px'></div></div>");
var grid = w.el.querySelector('#wamgrid'), scoreEl = w.el.querySelector('#wamscore');
var holes = [], score = 0, timeLeft = 20;
for (var i = 0; i < 9; i++) {
  var hole = document.createElement('div');
  hole.style.cssText = 'width:80px;height:60px;background:#3a2a1a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;border:3px solid #2a1a0a;user-select:none';
  hole.addEventListener('click', (function(h) { return function() { if (h.textContent === '🐹') { score++; h.textContent = ''; h.style.background = '#3a2a1a'; } }; })(hole));
  grid.appendChild(hole);
  holes.push(hole);
}
var moleIv = setInterval(function() {
  holes.forEach(function(h) { h.textContent = ''; h.style.background = '#3a2a1a'; });
  var idx = Math.floor(Math.random() * 9);
  holes[idx].textContent = '🐹'; holes[idx].style.background = '#6a4a2a';
}, 800);
var timerIv = setInterval(function() {
  timeLeft--;
  scoreEl.textContent = 'Score: ' + score + ' | Time: ' + timeLeft + 's';
  if (timeLeft <= 0) { clearInterval(moleIv); clearInterval(timerIv); OS.showNotification('Whack-a-Mole', 'Final score: ' + score); }
}, 1000);
w.el.querySelector('.btn-close').addEventListener('click', function() { clearInterval(moleIv); clearInterval(timerIv); });
```

---

### ASCII Art Generator

```js
var w = OS.createWindow("ASCII Art", 320, 200, "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;background:#ece9d8;padding:12px'><input id='asciiinp' style='width:90%;padding:4px 8px;font-size:12px;border:2px inset #c8c4b8;font-family:inherit;text-align:center' placeholder='Type a word...' /><pre id='asciiout' style='font-size:6px;line-height:6px;font-family:monospace;color:#003399;text-align:center'></pre></div>");
var bigLetters = {A:'  #  \\n # # \\n#####\\n#   #\\n#   #',B:'#### \\n#   #\\n#### \\n#   #\\n#### ',C:' ### \\n#    \\n#    \\n#    \\n ### ',D:'#### \\n#   #\\n#   #\\n#   #\\n#### ',E:'#####\\n#    \\n###  \\n#    \\n#####',F:'#####\\n#    \\n###  \\n#    \\n#    ',G:' ### \\n#    \\n# ## \\n#  # \\n ### ',H:'#   #\\n#   #\\n#####\\n#   #\\n#   #',I:' ### \\n  #  \\n  #  \\n  #  \\n ### ',L:'#    \\n#    \\n#    \\n#    \\n#####',M:'#   #\\n## ##\\n# # #\\n#   #\\n#   #',N:'#   #\\n##  #\\n# # #\\n#  ##\\n#   #',O:' ### \\n#   #\\n#   #\\n#   #\\n ### ',P:'#### \\n#   #\\n#### \\n#    \\n#    ',R:'#### \\n#   #\\n#### \\n# #  \\n#  ##',S:' ####\\n#    \\n ### \\n    #\\n#### ',T:'#####\\n  #  \\n  #  \\n  #  \\n  #  ',W:'#   #\\n#   #\\n# # #\\n## ##\\n#   #',Y:'#   #\\n # # \\n  #  \\n  #  \\n  #  ',' ':'     \\n     \\n     \\n     \\n     '};
w.el.querySelector('#asciiinp').addEventListener('input', function() {
  var text = this.value.toUpperCase(), lines = ['','','','',''];
  for (var i = 0; i < text.length; i++) {
    var letter = bigLetters[text[i]] || bigLetters[' '];
    var rows = letter.split('\\n');
    for (var r = 0; r < 5; r++) lines[r] += (rows[r] || '     ') + ' ';
  }
  w.el.querySelector('#asciiout').textContent = lines.join('\\n');
});
```

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
