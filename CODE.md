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
