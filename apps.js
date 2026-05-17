(function () {

var OS = window.MicroOS;

// ── Notepad ──
OS.registerApp('notepad', function buildNotepad() {
  var savedContent = localStorage.getItem('micro-notepad') || 'Welcome to Mini OS Notepad!';
  var windowObj = OS.createWindow('Untitled - Notepad', 480, 340,
    '<div class="notepad-menu"><span>File</span><span>Edit</span><span>Format</span><span>View</span><span>Help</span></div>' +
    '<textarea class="notepad-body">' + OS.escapeHtml(savedContent) + '</textarea>');
  windowObj.el.querySelector('.notepad-body').addEventListener('input', function () {
    localStorage.setItem('micro-notepad', this.value);
  });
});

// ── Calculator ──
OS.registerApp('calculator', function buildCalculator() {
  var buttonLabels = 'C,CE,%,/,7,8,9,*,4,5,6,-,1,2,3,+,0,.,+/-,='.split(',');
  var html = '<div class="calc-wrap"><div class="calc-display">0</div><div class="calc-grid">';
  buttonLabels.forEach(function (label) {
    var className = 'calc-btn';
    if ('/*-+%'.indexOf(label) >= 0 && label.length === 1) className += ' op';
    if (label === '=') className += ' eq';
    html += '<button class="' + className + '" data-v="' + label + '">' + label + '</button>';
  });
  html += '</div></div>';

  var windowObj = OS.createWindow('Calculator', 220, 320, html);
  var display = windowObj.el.querySelector('.calc-display');
  var currentValue = '0', previousValue = '', operator = '', shouldReset = false;

  function calculate(operandA, operandB, op) {
    if (op === '/') return operandB ? operandA / operandB : 0;
    if (op === '*') return operandA * operandB;
    if (op === '-') return operandA - operandB;
    return operandA + operandB;
  }

  windowObj.el.querySelector('.calc-grid').addEventListener('click', function (e) {
    var value = e.target.getAttribute('data-v');
    if (!value) return;

    if (value === 'C' || value === 'CE') {
      currentValue = '0'; previousValue = ''; operator = '';
      display.textContent = '0';
      return;
    }
    if (value === '+/-') {
      currentValue = String(-parseFloat(currentValue));
      display.textContent = currentValue;
      return;
    }
    if (value === '%') {
      currentValue = String(parseFloat(currentValue) / 100);
      display.textContent = currentValue;
      return;
    }
    if ('/*-+'.indexOf(value) >= 0 && value.length === 1) {
      if (previousValue && operator && !shouldReset)
        currentValue = String(calculate(parseFloat(previousValue), parseFloat(currentValue), operator));
      previousValue = currentValue;
      operator = value;
      shouldReset = true;
      display.textContent = currentValue;
      return;
    }
    if (value === '=') {
      if (previousValue && operator) {
        currentValue = String(calculate(parseFloat(previousValue), parseFloat(currentValue), operator));
        previousValue = '';
        operator = '';
        shouldReset = true;
        display.textContent = currentValue;
      }
      return;
    }
    if (shouldReset) { currentValue = ''; shouldReset = false; }
    if (value === '.' && currentValue.indexOf('.') >= 0) return;
    currentValue = (currentValue === '0' && value !== '.') ? value : currentValue + value;
    display.textContent = currentValue;
  });
});

// ── File Explorer ──
OS.registerApp('files', function buildFiles() {
  var windowObj = OS.createWindow('My Documents', 560, 380,
    '<div class="files-toolbar">' +
      '<button class="files-back-btn">Back</button>' +
      '<button class="files-upload-btn">Upload</button>' +
      '<div class="files-path">C:</div>' +
    '</div>' +
    '<div class="files-header">' +
      '<span class="files-col-name" style="padding-left:24px">Name</span>' +
      '<span class="files-col-size">Size</span>' +
      '<span class="files-col-type">Type</span>' +
      '<span class="files-col-date">Modified</span>' +
    '</div>' +
    '<div class="files-list"></div>' +
    '<div class="files-statusbar"></div>');

  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');

  var pathElement = windowObj.el.querySelector('.files-path');
  var listElement = windowObj.el.querySelector('.files-list');
  var statusBar = windowObj.el.querySelector('.files-statusbar');
  var currentPath = ['C:'];

  function getFileType(name) {
    var extensionMap = {
      '.txt': 'Text File', '.md': 'Markdown', '.log': 'Log File',
      '.cfg': 'Config', '.ini': 'Config', '.csv': 'Spreadsheet',
      '.json': 'JSON File', '.html': 'Web Page', '.htm': 'Web Page',
      '.bat': 'Batch File', '.cmd': 'Batch File',
      '.jpg': 'JPEG Image', '.jpeg': 'JPEG Image', '.png': 'PNG Image',
      '.bmp': 'Bitmap', '.gif': 'GIF Image',
      '.mp3': 'Audio', '.wav': 'Audio', '.m3u': 'Playlist',
      '.app': 'Application',
      '.svg': 'SVG Image'
    };
    var dotIndex = name.lastIndexOf('.');
    if (dotIndex >= 0) {
      var extension = name.substring(dotIndex).toLowerCase();
      if (extensionMap[extension]) return extensionMap[extension];
    }
    return 'File';
  }

  function getFileIcon(name) {
    var lower = name.toLowerCase();
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return OS.htmlSvg;
    if (lower.endsWith('.log')) return OS.logSvg;
    if (lower.endsWith('.cfg') || lower.endsWith('.ini')) return OS.cfgSvg;
    if (lower.endsWith('.csv')) return OS.csvSvg;
    if (lower.endsWith('.json')) return OS.jsonSvg;
    if (lower.endsWith('.bat') || lower.endsWith('.cmd')) return OS.batSvg;
    if (lower.endsWith('.md')) return OS.mdSvg;
    if (lower.match(/\.(jpg|jpeg|png|bmp|gif)$/)) return OS.imgSvg;
    if (lower.endsWith('.svg')) return OS.svgIconSvg;
    if (lower.endsWith('.app')) return OS.appSvg;
    return OS.fileSvg;
  }

  function getCurrentNode() {
    var node = OS.fileSystem;
    for (var i = 0; i < currentPath.length; i++)
      node = i === 0 ? node[currentPath[i]] : node.children[currentPath[i]];
    return node;
  }

  function todayString() {
    var now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  }

  function openFile(name, fileData) {
    var content = fileData.content || '';
    var lowerName = name.toLowerCase();

    if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
      var htmlWin = OS.createWindow(name + ' - Browser', 500, 380,
        '<div class="browser-bar" style="flex-shrink:0"><span class="browser-label">' + OS.escapeHtml(name) + '</span></div>' +
        '<iframe class="browser-frame" sandbox="allow-same-origin" style="flex:1;width:100%;border:none"></iframe>');
      htmlWin.el.querySelector('.window-body').classList.add('window-body-flex');
      htmlWin.el.querySelector('.browser-frame').srcdoc = content;
      return;
    }
    if (lowerName.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
      OS.createWindow(name + ' - Image Viewer', 340, 240,
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#222;color:#aaa;font-size:11px;gap:8px">' +
        OS.imgSvg.replace('width="16"','width="64"').replace('height="16"','height="64"') +
        '<div>' + OS.escapeHtml(name) + '</div>' +
        '<div style="color:#666">' + OS.formatFileSize(fileData.size || 0) + '</div>' +
        '<div style="color:#555;font-style:italic">' + OS.escapeHtml(content) + '</div></div>');
      return;
    }
    if (lowerName.endsWith('.csv')) {
      var rows = content.split(/\r?\n/).filter(function(r){return r.trim();});
      var tableHtml = '<div style="padding:6px;overflow:auto;height:100%;background:#fff"><table style="border-collapse:collapse;font-size:11px;width:100%">';
      rows.forEach(function(row, idx) {
        var cells = row.split(',');
        var tag = idx === 0 ? 'th' : 'td';
        tableHtml += '<tr>';
        cells.forEach(function(cell) {
          tableHtml += '<' + tag + ' style="border:1px solid #ccc;padding:3px 6px;background:' + (idx===0?'#e8e8f0':'#fff') + '">' + OS.escapeHtml(cell.trim()) + '</' + tag + '>';
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</table></div>';
      OS.createWindow(name + ' - Spreadsheet', 460, 300, tableHtml);
      return;
    }

    if (lowerName.endsWith('.svg')) {
      var svgContent = content.trim();
      var svgValid = svgContent.indexOf('<svg') >= 0;
      if (svgValid) {
        var svgWindow = OS.createWindow(name + ' - SVG Viewer', 420, 380,
          '<div style="display:flex;flex-direction:column;height:100%;background:#f8f8f8">' +
          '<div style="padding:4px 8px;background:#ece9d8;border-bottom:1px solid #aca899;font-size:10px;color:#555;flex-shrink:0">' + OS.escapeHtml(name) + ' - ' + OS.formatFileSize(fileData.size || 0) + '</div>' +
          '<div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;padding:16px;background:repeating-conic-gradient(#e0e0e0 0% 25%,#fff 0% 50%) 0 0/16px 16px">' +
          '<div class="svg-render-area">' + svgContent + '</div></div></div>');
        svgWindow.el.querySelector('.window-body').classList.add('window-body-flex');
      } else {
        OS.showNotification('SVG Viewer', 'File does not contain valid SVG markup.');
      }
      return;
    }

    if (lowerName.endsWith('.app')) {
      try {
        var appFunction = new Function('OS', content);
        appFunction(OS);
      } catch (appError) {
        OS.showNotification('Error', 'Failed to run ' + name + ': ' + appError.message);
      }
      return;
    }

    var editWindow = OS.createWindow(name + ' - Notepad', 460, 320,
      '<div class="notepad-menu"><span>File</span><span>Edit</span></div>' +
      '<textarea class="notepad-body">' + OS.escapeHtml(content) + '</textarea>');
    editWindow.el.querySelector('.notepad-body').addEventListener('input', function () {
      fileData.content = this.value;
      fileData.size = this.value.length;
    });
  }

  // ── Upload from real computer ──
  var hiddenFileInput = document.createElement('input');
  hiddenFileInput.type = 'file';
  hiddenFileInput.multiple = true;
  hiddenFileInput.style.display = 'none';
  document.body.appendChild(hiddenFileInput);

  windowObj.el.querySelector('.files-upload-btn').addEventListener('click', function () {
    hiddenFileInput.click();
  });

  hiddenFileInput.addEventListener('change', function () {
    var downloadsFolder = OS.fileSystem['C:'].children['Downloads'];
    if (!downloadsFolder || !downloadsFolder.children) return;
    var parentNode = downloadsFolder;
    Array.from(hiddenFileInput.files).forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        parentNode.children[file.name] = {
          type: 'file',
          size: file.size,
          modified: todayString(),
          content: reader.result
        };
        render();
        OS.showNotification('Upload', 'Uploaded ' + file.name);
      };
      if (file.size > 500000) {
        parentNode.children[file.name] = {
          type: 'file',
          size: file.size,
          modified: todayString(),
          content: '(File too large to preview: ' + file.name + ', ' + OS.formatFileSize(file.size) + ')'
        };
        render();
        OS.showNotification('Upload', file.name + ' added (too large to read)');
      } else {
        reader.readAsText(file);
      }
    });
    hiddenFileInput.value = '';
  });

  windowObj.el.querySelector('.btn-close').addEventListener('click', function () {
    if (hiddenFileInput.parentNode) hiddenFileInput.parentNode.removeChild(hiddenFileInput);
  });

  // ── Right-click on file list or items ──
  function showFileContextMenu(mouseX, mouseY, selectedName, selectedChild) {
    var parentNode = getCurrentNode();
    var menuItems = [];

    if (selectedName) {
      var isFolder = selectedChild.type === 'folder';
      menuItems.push({ label: 'Open', icon: isFolder ? OS.folderSvg : getFileIcon(selectedName), action: function () {
        if (isFolder) { currentPath.push(selectedName); render(); }
        else openFile(selectedName, selectedChild);
      }});
      menuItems.push('---');
      menuItems.push({ label: 'Cut', action: function () {
        OS.clipboard.mode = 'cut'; OS.clipboard.name = selectedName;
        OS.clipboard.data = selectedChild; OS.clipboard.sourcePath = currentPath.slice();
        OS.showNotification('File Manager', 'Cut: ' + selectedName);
      }});
      menuItems.push({ label: 'Copy', action: function () {
        OS.clipboard.mode = 'copy'; OS.clipboard.name = selectedName;
        OS.clipboard.data = selectedChild; OS.clipboard.sourcePath = currentPath.slice();
      }});
      menuItems.push('---');
      menuItems.push({ label: 'Rename', action: function () {
        OS.prompt('Rename "' + selectedName + '" to:', selectedName, function (newName) {
          if (newName && newName !== selectedName && !parentNode.children[newName]) {
            parentNode.children[newName] = parentNode.children[selectedName];
            delete parentNode.children[selectedName];
            render();
          }
        });
      }});
      menuItems.push({ label: 'Delete', action: function () {
        OS.confirm('Delete "' + selectedName + '"?', function (yes) {
          if (yes) {
            delete parentNode.children[selectedName];
            render();
          }
        });
      }});
    } else {
      // Clicked on empty space in the file list
      var hasPaste = OS.clipboard.mode && OS.clipboard.name;
      menuItems.push({ label: 'Paste', disabled: !hasPaste, action: function () {
        if (!hasPaste) return;
        var destName = OS.clipboard.name;
        // Avoid overwrite: append (copy) if name exists
        while (parentNode.children[destName]) destName = destName.replace(/(\.[^.]+)?$/, ' (copy)$1');

        if (OS.clipboard.mode === 'copy') {
          parentNode.children[destName] = JSON.parse(JSON.stringify(OS.clipboard.data));
        } else {
          // Cut: remove from source
          var sourceNode = OS.fileSystem;
          var sp = OS.clipboard.sourcePath;
          for (var i = 0; i < sp.length; i++) sourceNode = i === 0 ? sourceNode[sp[i]] : sourceNode.children[sp[i]];
          parentNode.children[destName] = OS.clipboard.data;
          delete sourceNode.children[OS.clipboard.name];
          OS.clipboard = { mode: null, name: null, data: null, sourcePath: null };
        }
        render();
      }});
      menuItems.push('---');
      menuItems.push({ label: 'New Folder', icon: OS.folderSvg, action: function () {
        OS.prompt('Folder name:', 'New Folder', function (name) {
          if (name && !parentNode.children[name]) {
            parentNode.children[name] = { type: 'folder', children: {} };
            render();
          }
        });
      }});
      menuItems.push({ label: 'New Text File', icon: OS.fileSvg, action: function () {
        OS.prompt('File name:', 'Untitled.txt', function (name) {
          if (name && !parentNode.children[name]) {
            parentNode.children[name] = { type: 'file', size: 0, modified: todayString(), content: '' };
            render();
          }
        });
      }});
      menuItems.push('---');
      menuItems.push({ label: 'Upload Files...', action: function () { hiddenFileInput.click(); } });
      menuItems.push('---');
      menuItems.push({ label: 'Refresh', action: function () { render(); } });
    }

    OS.showContextMenu(mouseX, mouseY, menuItems);
  }

  function render() {
    pathElement.textContent = currentPath.join('\\');
    listElement.innerHTML = '';

    var node = getCurrentNode();
    if (!node || !node.children) return;

    var entries = Object.keys(node.children);
    entries.sort(function (a, b) {
      var aIsFolder = node.children[a].type === 'folder' ? 0 : 1;
      var bIsFolder = node.children[b].type === 'folder' ? 0 : 1;
      if (aIsFolder !== bIsFolder) return aIsFolder - bIsFolder;
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    var folderCount = 0, fileCount = 0;

    entries.forEach(function (name) {
      var child = node.children[name];
      var isFolder = child.type === 'folder';
      if (isFolder) folderCount++; else fileCount++;

      var row = document.createElement('div');
      row.className = 'file-item';
      row.innerHTML =
        '<span class="file-item-icon">' + (isFolder ? OS.folderSvg : getFileIcon(name)) + '</span>' +
        '<span class="file-item-name">' + OS.escapeHtml(name) + '</span>' +
        '<span class="file-item-size">' + (isFolder ? '' : OS.formatFileSize(child.size || 0)) + '</span>' +
        '<span class="file-item-type">' + (isFolder ? 'Folder' : getFileType(name)) + '</span>' +
        '<span class="file-item-date">' + (child.modified || '') + '</span>';

      row.addEventListener('click', function () {
        listElement.querySelectorAll('.file-item.selected').forEach(function (el) { el.classList.remove('selected'); });
        row.classList.add('selected');
      });

      row.addEventListener('dblclick', function () {
        if (isFolder) { currentPath.push(name); render(); }
        else openFile(name, child);
      });

      row.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        listElement.querySelectorAll('.file-item.selected').forEach(function (el) { el.classList.remove('selected'); });
        row.classList.add('selected');
        showFileContextMenu(e.clientX, e.clientY, name, child);
      });

      listElement.appendChild(row);
    });

    statusBar.textContent = folderCount + ' folder(s), ' + fileCount + ' file(s)';
  }

  // Right-click on empty list area
  listElement.addEventListener('contextmenu', function (e) {
    if (e.target.closest('.file-item')) return;
    e.preventDefault();
    e.stopPropagation();
    showFileContextMenu(e.clientX, e.clientY, null, null);
  });

  windowObj.el.querySelector('.files-back-btn').addEventListener('click', function () {
    if (currentPath.length > 1) { currentPath.pop(); render(); }
  });
  render();
});

// ── Command Prompt ──
OS.registerApp('terminal', function buildTerminal() {
  var windowObj = OS.createWindow('Command Prompt', 540, 320,
    '<div class="terminal-body"><div class="terminal-output">' +
    '<div class="terminal-line">Mini OS [Version 1.0.2600]</div>' +
    '<div class="terminal-line">(C) Mini OS Corp. All rights reserved.</div>' +
    '<div class="terminal-line">&nbsp;</div></div>' +
    '<div class="terminal-input-line"><span class="terminal-prompt">C:\\&gt; </span>' +
    '<input class="terminal-input" autofocus /></div></div>');

  var output = windowObj.el.querySelector('.terminal-output');
  var input = windowObj.el.querySelector('.terminal-input');
  var promptSpan = windowObj.el.querySelector('.terminal-prompt');
  var terminalBody = windowObj.el.querySelector('.terminal-body');

  var currentDirectory = ['C:'];
  var commandHistory = [];
  var historyIndex = -1;

  function getPromptText() { return currentDirectory.join('\\') + '> '; }
  function updatePrompt() { promptSpan.textContent = getPromptText(); }

  function addLine(text, className) {
    var line = document.createElement('div');
    line.className = 'terminal-line' + (className ? ' ' + className : '');
    line.textContent = text;
    output.appendChild(line);
  }

  function resolveNode(pathParts) {
    var node = OS.fileSystem;
    for (var i = 0; i < pathParts.length; i++) {
      if (i === 0) { node = node[pathParts[i]]; }
      else { if (!node || !node.children) return null; node = node.children[pathParts[i]]; }
    }
    return node;
  }

  function resolvePath(target) {
    if (!target) return currentDirectory.slice();
    var parts;
    if (target.indexOf(':') >= 0) {
      parts = target.replace(/\//g, '\\').split('\\').filter(Boolean);
    } else {
      parts = currentDirectory.slice();
      var segments = target.replace(/\//g, '\\').split('\\').filter(Boolean);
      for (var i = 0; i < segments.length; i++) {
        if (segments[i] === '..') { if (parts.length > 1) parts.pop(); }
        else if (segments[i] !== '.') parts.push(segments[i]);
      }
    }
    return parts;
  }

  function runCommand(rawCmd) {
    var trimmed = rawCmd.trim();
    if (!trimmed) return;
    var firstSpace = trimmed.indexOf(' ');
    var command = (firstSpace >= 0 ? trimmed.substring(0, firstSpace) : trimmed).toLowerCase();
    var argString = firstSpace >= 0 ? trimmed.substring(firstSpace + 1).trim() : '';
    var args = argString ? argString.split(/\s+/) : [];

    switch (command) {

    case 'help':
      addLine('Available commands:');
      addLine('  dir [path]         List directory contents');
      addLine('  cd <path>          Change directory (cd .. to go up)');
      addLine('  tree               Show folder tree');
      addLine('  cat <file>         Display file contents');
      addLine('  type <file>        Same as cat');
      addLine('  mkdir <name>       Create a folder');
      addLine('  mkfile <name>      Create an empty file');
      addLine('  del <name>         Delete a file or empty folder');
      addLine('  move <src> <dest>  Move/rename a file');
      addLine('  copy <src> <dest>  Copy a file');
      addLine('  echo <text>        Print text');
      addLine('  cls                Clear screen');
      addLine('  date / time        Show current date/time');
      addLine('  ver                Show version');
      addLine('  whoami / hostname  System identity');
      addLine('  tasklist           List open windows');
      addLine('  systeminfo         System information');
      addLine('  calc <expr>        Evaluate math expression');
      addLine('  ipconfig           Show network info');
      addLine('  save               Save filesystem to localStorage');
      addLine('  load               Load filesystem from localStorage');
      addLine('  export [file]      Download filesystem as .json');
      addLine('  import             Load filesystem from a .json file');
      addLine('  reset              Reset filesystem to factory defaults');
      addLine('  bootcfg [file]     Set/show auto-load config file');
      break;

    case 'dir': case 'ls':
      var dirPath = resolvePath(args[0] || '');
      var dirNode = resolveNode(dirPath);
      if (!dirNode || dirNode.type !== 'folder') { addLine('Directory not found.', 'error'); break; }
      addLine(' Directory of ' + dirPath.join('\\'));
      addLine('');
      var dirEntries = Object.keys(dirNode.children || {});
      var totalFiles = 0, totalSize = 0, totalDirs = 0;
      dirEntries.sort(function (a, b) {
        var af = dirNode.children[a].type === 'folder' ? 0 : 1;
        var bf = dirNode.children[b].type === 'folder' ? 0 : 1;
        return af !== bf ? af - bf : a.localeCompare(b);
      });
      dirEntries.forEach(function (name) {
        var entry = dirNode.children[name];
        var date = entry.modified || '';
        if (entry.type === 'folder') {
          addLine('  ' + date + '    <DIR>          ' + name);
          totalDirs++;
        } else {
          var sizeStr = String(entry.size || 0);
          while (sizeStr.length < 12) sizeStr = ' ' + sizeStr;
          addLine('  ' + date + '  ' + sizeStr + '  ' + name);
          totalFiles++;
          totalSize += (entry.size || 0);
        }
      });
      addLine('         ' + totalFiles + ' File(s)    ' + totalSize + ' bytes');
      addLine('         ' + totalDirs + ' Dir(s)');
      break;

    case 'cd':
      if (!argString) { addLine(currentDirectory.join('\\')); break; }
      var newPath = resolvePath(argString);
      var cdNode = resolveNode(newPath);
      if (!cdNode || cdNode.type !== 'folder') { addLine('The system cannot find the path specified.', 'error'); break; }
      currentDirectory = newPath;
      updatePrompt();
      break;

    case 'tree':
      var treeNode = resolveNode(currentDirectory);
      if (!treeNode || !treeNode.children) break;
      addLine(currentDirectory.join('\\'));
      (function printTree(node, prefix) {
        var keys = Object.keys(node.children || {});
        keys.forEach(function (name, idx) {
          var isLast = idx === keys.length - 1;
          var connector = isLast ? '\u2514\u2500 ' : '\u251C\u2500 ';
          var childPrefix = isLast ? '   ' : '\u2502  ';
          var child = node.children[name];
          addLine(prefix + connector + name + (child.type === 'folder' ? '\\' : ''));
          if (child.type === 'folder') printTree(child, prefix + childPrefix);
        });
      })(treeNode, '');
      break;

    case 'cat': case 'type':
      if (!argString) { addLine('Usage: ' + command + ' <filename>', 'error'); break; }
      var catParent = resolveNode(currentDirectory);
      if (!catParent || !catParent.children || !catParent.children[argString]) { addLine('File not found: ' + argString, 'error'); break; }
      var catFile = catParent.children[argString];
      if (catFile.type === 'folder') { addLine('Cannot display a directory.', 'error'); break; }
      (catFile.content || '').split(/\r?\n/).forEach(function (line) { addLine(line); });
      break;

    case 'mkdir': case 'md':
      if (!argString) { addLine('Usage: mkdir <foldername>', 'error'); break; }
      var mkdirParent = resolveNode(currentDirectory);
      if (mkdirParent && mkdirParent.children) {
        if (mkdirParent.children[argString]) { addLine('Already exists: ' + argString, 'error'); }
        else { mkdirParent.children[argString] = { type: 'folder', children: {} }; }
      }
      break;

    case 'mkfile':
      if (!argString) { addLine('Usage: mkfile <filename>', 'error'); break; }
      var mkfParent = resolveNode(currentDirectory);
      if (mkfParent && mkfParent.children) {
        if (mkfParent.children[argString]) { addLine('Already exists: ' + argString, 'error'); }
        else {
          var now = new Date();
          mkfParent.children[argString] = { type: 'file', size: 0, modified: now.toISOString().slice(0,10), content: '' };
        }
      }
      break;

    case 'del': case 'rm':
      if (!argString) { addLine('Usage: del <name>', 'error'); break; }
      var delParent = resolveNode(currentDirectory);
      if (!delParent || !delParent.children || !delParent.children[argString]) { addLine('Not found: ' + argString, 'error'); break; }
      var delTarget = delParent.children[argString];
      if (delTarget.type === 'folder' && Object.keys(delTarget.children || {}).length > 0) { addLine('Directory is not empty.', 'error'); break; }
      delete delParent.children[argString];
      break;

    case 'move': case 'mv': case 'ren': case 'rename':
      if (args.length < 2) { addLine('Usage: move <source> <newname>', 'error'); break; }
      var mvParent = resolveNode(currentDirectory);
      if (!mvParent || !mvParent.children || !mvParent.children[args[0]]) { addLine('Not found: ' + args[0], 'error'); break; }
      if (mvParent.children[args[1]]) { addLine('Destination already exists: ' + args[1], 'error'); break; }
      mvParent.children[args[1]] = mvParent.children[args[0]];
      delete mvParent.children[args[0]];
      addLine('  1 file(s) moved.');
      break;

    case 'copy': case 'cp':
      if (args.length < 2) { addLine('Usage: copy <source> <newname>', 'error'); break; }
      var cpParent = resolveNode(currentDirectory);
      if (!cpParent || !cpParent.children || !cpParent.children[args[0]]) { addLine('Not found: ' + args[0], 'error'); break; }
      if (cpParent.children[args[1]]) { addLine('Destination already exists: ' + args[1], 'error'); break; }
      cpParent.children[args[1]] = JSON.parse(JSON.stringify(cpParent.children[args[0]]));
      addLine('  1 file(s) copied.');
      break;

    case 'echo':
      addLine(argString);
      break;

    case 'cls': case 'clear':
      output.innerHTML = '';
      break;

    case 'date':
      addLine('The current date is: ' + new Date().toLocaleDateString());
      break;

    case 'time':
      addLine('The current time is: ' + new Date().toLocaleTimeString());
      break;

    case 'ver':
      addLine('Mini OS [Version 1.0.2600]');
      break;

    case 'whoami':
      addLine('MiniOS\\User');
      break;

    case 'hostname':
      addLine('MINIOS-PC');
      break;

    case 'tasklist':
      addLine('');
      addLine('Image Name                     PID  Status');
      addLine('========================= ======== ========');
      addLine('desktop.exe                      1  Running');
      addLine('taskbar.exe                      2  Running');
      addLine('explorer.exe                     3  Running');
      OS.windows.forEach(function (w, idx) {
        var name = (w.title + '.exe').substring(0, 25);
        while (name.length < 25) name += ' ';
        addLine(name + '  ' + String(idx + 10).padStart(8) + '  Running');
      });
      addLine('');
      addLine(OS.windows.length + 3 + ' process(es) running.');
      break;

    case 'systeminfo':
      addLine('Host Name:         MINIOS-PC');
      addLine('OS Name:           Mini OS');
      addLine('OS Version:        1.0 (Build 2600)');
      addLine('System Type:       Browser-based');
      addLine('Total Windows:     ' + OS.windows.length);
      addLine('Boot Time:         ' + new Date().toLocaleString());
      addLine('Uptime:            Since page load');
      break;

    case 'calc':
      if (!argString) { addLine('Usage: calc <expression>', 'error'); break; }
      try { addLine(String(eval(argString))); }
      catch (evalError) { addLine('Error: Invalid expression', 'error'); }
      break;

    case 'ipconfig':
      addLine('');
      addLine('Ethernet adapter Local Area Connection:');
      addLine('');
      addLine('   Connection-specific DNS Suffix: microos.local');
      addLine('   IPv4 Address. . . . . . : 192.168.1.' + Math.floor(Math.random() * 254 + 1));
      addLine('   Subnet Mask . . . . . . : 255.255.255.0');
      addLine('   Default Gateway . . . . : 192.168.1.1');
      break;

    case 'save':
      if (OS.saveFilesystem()) { addLine('Filesystem saved to localStorage.', 'success'); }
      else { addLine('Failed to save filesystem.', 'error'); }
      break;

    case 'load':
      if (OS.loadFilesystem()) {
        addLine('Filesystem loaded from localStorage.', 'success');
        addLine('Reopen file manager to see changes.');
      } else { addLine('No saved filesystem found.', 'error'); }
      break;

    case 'export':
      var exportName = argString || 'microos-backup.json';
      OS.exportFilesystem(exportName);
      addLine('Exporting filesystem as ' + exportName + '...');
      break;

    case 'import':
      addLine('Opening file picker...');
      OS.importFilesystem(function (success, detail) {
        if (success) {
          addLine('Filesystem imported from ' + detail, 'success');
          addLine('Reopen file manager to see changes.');
          currentDirectory = ['C:'];
          updatePrompt();
        } else {
          addLine('Import failed: ' + detail, 'error');
        }
        terminalBody.scrollTop = terminalBody.scrollHeight;
      });
      break;

    case 'reset':
      var currentUser = OS.getActiveUser ? OS.getActiveUser() : 'unknown';
      OS.confirm('This will DELETE all data for user "' + currentUser + '" and log you out. Continue?', function (firstYes) {
        if (!firstYes) return;
        OS.confirm('Are you sure? This cannot be undone.', function (secondYes) {
          if (!secondYes) return;
          OS.resetFilesystem();
          addLine('All data for "' + currentUser + '" has been wiped.', 'success');
          addLine('Logging out in 2 seconds...');
          terminalBody.scrollTop = terminalBody.scrollHeight;
          setTimeout(function () {
            // Close all windows and go to login screen
            while (OS.windows.length > 0) {
              var closeBtn = OS.windows[0].el.querySelector('.btn-close');
              if (closeBtn) closeBtn.click(); else break;
            }
            document.querySelector('#start-menu').classList.add('hidden');
            location.reload();
          }, 2000);
        });
      });
      break;

    case 'bootcfg':
      if (argString) {
        if (argString === 'clear' || argString === 'none') {
          OS.setBootConfig(null);
          addLine('Boot config cleared. Will use default filesystem on reset.');
        } else {
          OS.setBootConfig(argString);
          addLine('Boot config set to: ' + argString);
          addLine('On next load, this file will be imported automatically.');
          addLine('Place your .json export in the Windows folder and reference it by name.');
        }
      } else {
        var currentConfig = OS.getBootConfig();
        if (currentConfig) { addLine('Current boot config: ' + currentConfig); }
        else { addLine('No boot config set. Using localStorage or defaults.'); }
      }
      break;

    case 'pwd':
      addLine(currentDirectory.join('\\'));
      break;

    case 'exit':
      windowObj.el.querySelector('.btn-close').click();
      break;

    default:
      addLine("'" + command + "' is not recognized as an internal or external command,");
      addLine("operable program or batch file. Type 'help' for available commands.");
      break;
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var cmd = input.value;
      input.value = '';
      if (cmd.trim()) { commandHistory.push(cmd); historyIndex = commandHistory.length; }
      addLine(getPromptText() + cmd);
      runCommand(cmd);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) { historyIndex--; input.value = commandHistory[historyIndex]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) { historyIndex++; input.value = commandHistory[historyIndex]; }
      else { historyIndex = commandHistory.length; input.value = ''; }
    }
  });

  windowObj.el.addEventListener('click', function () { input.focus(); });
});

// ── Internet Browser ──
OS.registerApp('browser', function buildBrowser() {
  var windowObj = OS.createWindow('Internet', 700, 500,
    '<div class="browser-bar">' +
      '<span class="browser-label">Address</span>' +
      '<input class="browser-url" value="https://en.m.wikipedia.org" />' +
      '<button class="browser-go">Go</button>' +
    '</div>' +
    '<iframe class="browser-frame" src="https://en.m.wikipedia.org" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>');

  // Make the window body a flex column so the iframe stretches to fill
  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');

  var urlInput = windowObj.el.querySelector('.browser-url');
  var frame = windowObj.el.querySelector('.browser-frame');

  function navigate() {
    var url = urlInput.value.trim();
    if (url.indexOf('http') !== 0) url = 'https://' + url;
    frame.src = url;
  }

  windowObj.el.querySelector('.browser-go').addEventListener('click', navigate);
  urlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') navigate(); });
});

// ── Paint ──
OS.registerApp('paint', function buildPaint() {
  var colors = ['#000', '#fff', '#808080', '#ff0000', '#00aa00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  var html = '<div class="paint-tools">';
  colors.forEach(function (color, index) {
    html += '<div class="paint-color' + (index === 0 ? ' active' : '') + '" data-c="' + color + '" style="background:' + color + '"></div>';
  });
  html += '<input type="range" class="paint-size" min="1" max="20" value="2" />' +
    '<button class="paint-clear">Clear</button></div>' +
    '<canvas class="paint-canvas" width="540" height="330"></canvas>';

  var windowObj = OS.createWindow('Paint', 560, 390, html);
  var canvas = windowObj.el.querySelector('.paint-canvas');
  var ctx = canvas.getContext('2d');
  var isPainting = false, currentColor = '#000', brushSize = 2;

  windowObj.el.querySelectorAll('.paint-color').forEach(function (el) {
    el.addEventListener('click', function () {
      windowObj.el.querySelector('.paint-color.active').classList.remove('active');
      el.classList.add('active');
      currentColor = el.getAttribute('data-c');
    });
  });

  windowObj.el.querySelector('.paint-size').addEventListener('input', function (e) { brushSize = +e.target.value; });
  windowObj.el.querySelector('.paint-clear').addEventListener('click', function () { ctx.clearRect(0, 0, canvas.width, canvas.height); });

  function getCanvasPosition(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('mousedown', function (e) {
    isPainting = true;
    var pos = getCanvasPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });
  canvas.addEventListener('mousemove', function (e) {
    if (!isPainting) return;
    var pos = getCanvasPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  });
  canvas.addEventListener('mouseup', function () { isPainting = false; });
  canvas.addEventListener('mouseleave', function () { isPainting = false; });
});

// ── Clock ──
OS.registerApp('clock', function buildClockApp() {
  var windowObj = OS.createWindow('Clock', 260, 200,
    '<div class="clock-face"><div class="clock-time"></div><div class="clock-date"></div></div>');
  var timeElement = windowObj.el.querySelector('.clock-time');
  var dateElement = windowObj.el.querySelector('.clock-date');

  function tick() {
    var now = new Date();
    timeElement.textContent = now.toLocaleTimeString();
    dateElement.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  tick();
  var intervalId = setInterval(tick, 1000);
  windowObj.el.querySelector('.btn-close').addEventListener('click', function () { clearInterval(intervalId); });
});

// ── Control Panel / Settings ──
OS.registerApp('settings', function buildSettings() {
  var html = '<div class="settings-body"><div class="settings-section"><div class="settings-label">Display</div><div class="wallpaper-grid">';
  OS.wallpapers.forEach(function (wallpaper, index) {
    html += '<div class="wallpaper-opt' + (index === OS.getCurrentWallpaper() ? ' active' : '') +
      '" data-i="' + index + '" style="background:' + wallpaper + '"></div>';
  });
  html += '</div></div><div class="settings-section"><div class="settings-label">System Information</div>' +
    '<div class="settings-row"><span>OS Name</span><span>Mini OS</span></div>' +
    '<div class="settings-row"><span>Version</span><span>1.0 (Build 2600)</span></div>' +
    '<div class="settings-row"><span>Open Windows</span><span>' + OS.windows.length + '</span></div></div></div>';

  var windowObj = OS.createWindow('Control Panel', 340, 300, html);
  windowObj.el.querySelectorAll('.wallpaper-opt').forEach(function (el) {
    el.addEventListener('click', function () {
      windowObj.el.querySelector('.wallpaper-opt.active').classList.remove('active');
      el.classList.add('active');
      var index = +el.getAttribute('data-i');
      OS.setCurrentWallpaper(index);
      document.getElementById('desktop').style.background = OS.wallpapers[index];
    });
  });
});

// ── About ──
OS.registerApp('about', function buildAbout() {
  OS.createWindow('About Mini OS', 300, 220,
    '<div class="about-body">' +
    '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="4" y="4" width="40" height="28" rx="4" fill="#2a6ad4"/><rect x="7" y="7" width="34" height="22" rx="2" fill="#5ac"/><path d="M15 22V12l9 6.5L33 12v10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="16" y="34" width="16" height="3" rx="1" fill="#888"/><rect x="19" y="37" width="10" height="4" rx="1.5" fill="#aaa"/></svg>' +
    '<h2>Mini OS</h2>' +
    '<p>Version 1.0 (Build 2600)<br>A tiny desktop OS in your browser.<br>Pure HTML, CSS &amp; JS. No server.</p></div>');
});

// ── Minesweeper SVG Icons ──
var mineSmiley =
  '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#ffcc00" stroke="#b38f00" stroke-width="1.5"/>' +
  '<circle cx="8" cy="9" r="1.5" fill="#333"/><circle cx="16" cy="9" r="1.5" fill="#333"/>' +
  '<path d="M7 14c1.5 3 7.5 3 9 0" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/></svg>';

var mineDeadFace =
  '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#ffcc00" stroke="#b38f00" stroke-width="1.5"/>' +
  '<line x1="6" y1="7" x2="10" y2="11" stroke="#333" stroke-width="1.5"/><line x1="10" y1="7" x2="6" y2="11" stroke="#333" stroke-width="1.5"/>' +
  '<line x1="14" y1="7" x2="18" y2="11" stroke="#333" stroke-width="1.5"/><line x1="18" y1="7" x2="14" y2="11" stroke="#333" stroke-width="1.5"/>' +
  '<circle cx="12" cy="16" r="2.5" fill="none" stroke="#333" stroke-width="1.5"/></svg>';

var mineCoolFace =
  '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#ffcc00" stroke="#b38f00" stroke-width="1.5"/>' +
  '<rect x="4" y="8" width="16" height="4" rx="2" fill="#333"/><rect x="6" y="9" width="5" height="2" rx="1" fill="#6cf"/>' +
  '<rect x="13" y="9" width="5" height="2" rx="1" fill="#6cf"/>' +
  '<path d="M7 16c1.5 2 7.5 2 9 0" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/></svg>';

var mineBombSvg =
  '<svg viewBox="0 0 20 20" width="14" height="14"><circle cx="10" cy="11" r="6" fill="#333"/>' +
  '<line x1="10" y1="2" x2="10" y2="5" stroke="#333" stroke-width="2" stroke-linecap="round"/>' +
  '<line x1="4" y1="5" x2="6" y2="7" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="16" y1="5" x2="14" y2="7" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="3" y1="11" x2="4" y2="11" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="16" y1="11" x2="17" y2="11" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>' +
  '<circle cx="8" cy="9" r="1.5" fill="#fff" opacity=".5"/></svg>';

var mineFlagSvg =
  '<svg viewBox="0 0 16 16" width="12" height="12"><line x1="4" y1="3" x2="4" y2="14" stroke="#333" stroke-width="1.5"/>' +
  '<polygon points="5,3 13,6 5,9" fill="#e00"/>' +
  '<line x1="2" y1="14" x2="8" y2="14" stroke="#333" stroke-width="1.5"/></svg>';

// ── Minesweeper ──
OS.registerApp('minesweeper', function buildMinesweeper() {
  var rows = 9, cols = 9, mineCount = 10;
  var grid = [], gameOver = false, flagCount = 0, revealedCount = 0;
  var timerValue = 0, timerInterval = null, isFirstClick = true;

  function padNumber(num) { return String(Math.max(0, num)).padStart(3, '0'); }

  var headerHTML =
    '<div class="mine-header"><div class="mine-counter" id="mine-cnt">' + padNumber(mineCount) +
    '</div><button class="mine-reset">' + mineSmiley +
    '</button><div class="mine-counter" id="mine-timer">000</div></div>';

  var gridHTML = '<div class="mine-grid" style="grid-template-columns:repeat(' + cols + ',20px)">';
  for (var r = 0; r < rows; r++)
    for (var c = 0; c < cols; c++)
      gridHTML += '<div class="mine-cell" data-r="' + r + '" data-c="' + c + '"></div>';
  gridHTML += '</div>';

  var windowObj = OS.createWindow('Minesweeper', 220, 290, '<div class="mine-wrap">' + headerHTML + gridHTML + '</div>');
  var counterElement = windowObj.el.querySelector('#mine-cnt');
  var timerElement = windowObj.el.querySelector('#mine-timer');
  var resetButton = windowObj.el.querySelector('.mine-reset');

  function initializeGrid(skipRow, skipCol) {
    grid = [];
    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++)
        grid[r][c] = { mine: false, revealed: false, flagged: false, count: 0 };
    }
    var placed = 0;
    while (placed < mineCount) {
      var mineRow = Math.floor(Math.random() * rows);
      var mineCol = Math.floor(Math.random() * cols);
      if (!grid[mineRow][mineCol].mine && !(mineRow === skipRow && mineCol === skipCol)) {
        grid[mineRow][mineCol].mine = true;
        placed++;
      }
    }
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c].mine) continue;
        var neighborMines = 0;
        for (var deltaRow = -1; deltaRow <= 1; deltaRow++) {
          for (var deltaCol = -1; deltaCol <= 1; deltaCol++) {
            var neighborRow = r + deltaRow, neighborCol = c + deltaCol;
            if (neighborRow >= 0 && neighborRow < rows && neighborCol >= 0 && neighborCol < cols && grid[neighborRow][neighborCol].mine)
              neighborMines++;
          }
        }
        grid[r][c].count = neighborMines;
      }
    }
  }

  function revealCell(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    var cellData = grid[row][col];
    if (cellData.revealed || cellData.flagged) return;
    cellData.revealed = true;
    revealedCount++;
    var cellElement = windowObj.el.querySelector('[data-r="' + row + '"][data-c="' + col + '"]');
    cellElement.classList.add('revealed');
    if (cellData.mine) { cellElement.classList.add('mine'); cellElement.innerHTML = mineBombSvg; return; }
    if (cellData.count > 0) { cellElement.textContent = cellData.count; cellElement.setAttribute('data-n', cellData.count); }
    else {
      for (var deltaRow = -1; deltaRow <= 1; deltaRow++)
        for (var deltaCol = -1; deltaCol <= 1; deltaCol++)
          if (deltaRow || deltaCol) revealCell(row + deltaRow, col + deltaCol);
    }
  }

  function checkForWin() {
    if (revealedCount === rows * cols - mineCount) {
      gameOver = true;
      clearInterval(timerInterval);
      resetButton.innerHTML = mineCoolFace;
      OS.showNotification('Minesweeper', 'You won in ' + timerValue + 's!');
    }
  }

  function revealAllMines() {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c].mine) {
          var cellElement = windowObj.el.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
          cellElement.classList.add('revealed');
          cellElement.innerHTML = mineBombSvg;
        }
      }
    }
  }

  windowObj.el.querySelector('.mine-grid').addEventListener('click', function (e) {
    var cellElement = e.target.closest('.mine-cell');
    if (!cellElement || gameOver) return;
    var row = +cellElement.dataset.r, col = +cellElement.dataset.c;
    if (grid[row] && grid[row][col] && grid[row][col].flagged) return;
    if (isFirstClick) {
      initializeGrid(row, col);
      isFirstClick = false;
      timerInterval = setInterval(function () {
        timerValue++;
        timerElement.textContent = padNumber(timerValue);
      }, 1000);
    }
    if (grid[row][col].mine) {
      gameOver = true;
      clearInterval(timerInterval);
      cellElement.classList.add('mine');
      revealAllMines();
      resetButton.innerHTML = mineDeadFace;
      return;
    }
    revealCell(row, col);
    checkForWin();
  });

  windowObj.el.querySelector('.mine-grid').addEventListener('contextmenu', function (e) {
    e.preventDefault();
    var cellElement = e.target.closest('.mine-cell');
    if (!cellElement || gameOver) return;
    var row = +cellElement.dataset.r, col = +cellElement.dataset.c;
    if (grid[row][col].revealed) return;
    grid[row][col].flagged = !grid[row][col].flagged;
    cellElement.innerHTML = grid[row][col].flagged ? mineFlagSvg : '';
    cellElement.classList.toggle('flagged');
    flagCount += grid[row][col].flagged ? 1 : -1;
    counterElement.textContent = padNumber(mineCount - flagCount);
  });

  resetButton.addEventListener('click', function () {
    gameOver = false; flagCount = 0; revealedCount = 0; timerValue = 0; isFirstClick = true;
    clearInterval(timerInterval);
    timerElement.textContent = '000';
    counterElement.textContent = padNumber(mineCount);
    resetButton.innerHTML = mineSmiley;
    windowObj.el.querySelectorAll('.mine-cell').forEach(function (el) {
      el.className = 'mine-cell';
      el.innerHTML = '';
      el.removeAttribute('data-n');
    });
  });

  windowObj.el.querySelector('.btn-close').addEventListener('click', function () { clearInterval(timerInterval); });
  initializeGrid(-1, -1);
});

// ── Code Editor ──
OS.registerApp('codeeditor', function buildCodeEditor() {
  var defaultCode = '// Welcome to Code Editor\n// Write JS, HTML, or CSS and hit Run\n\nvar greeting = "Hello from Mini OS!";\nOS.showNotification("Code Editor", greeting);';

  var windowObj = OS.createWindow('Code Editor', 560, 400,
    '<div style="display:flex;flex-direction:column;height:100%">' +
    '<div style="display:flex;gap:4px;padding:3px 6px;background:#1e1e1e;border-bottom:1px solid #333;flex-shrink:0">' +
      '<select class="code-lang" style="background:#333;color:#ccc;border:1px solid #555;font-size:10px;padding:1px 4px;font-family:inherit">' +
        '<option value="javascript">JavaScript</option>' +
        '<option value="html">HTML</option>' +
        '<option value="css">CSS</option>' +
      '</select>' +
      '<button class="code-run-btn" style="background:#388e3c;color:#fff;border:none;padding:1px 10px;font-size:10px;cursor:pointer;border-radius:2px;font-family:inherit">Run</button>' +
      '<span style="color:#666;font-size:10px;margin-left:auto" class="code-status">Ready</span>' +
    '</div>' +
    '<div style="flex:1;position:relative;overflow:hidden">' +
      '<pre class="code-highlight" style="position:absolute;inset:0;margin:0;padding:8px;font-family:Consolas,monospace;font-size:12px;line-height:1.5;overflow:auto;color:#d4d4d4;background:#1e1e1e;white-space:pre-wrap;word-wrap:break-word;pointer-events:none"></pre>' +
      '<textarea class="code-input" style="position:absolute;inset:0;margin:0;padding:8px;font-family:Consolas,monospace;font-size:12px;line-height:1.5;background:transparent;color:transparent;caret-color:#fff;border:none;outline:none;resize:none;white-space:pre-wrap;word-wrap:break-word;overflow:auto;tab-size:2" spellcheck="false"></textarea>' +
    '</div></div>');

  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');
  var inputArea = windowObj.el.querySelector('.code-input');
  var highlightArea = windowObj.el.querySelector('.code-highlight');
  var langSelect = windowObj.el.querySelector('.code-lang');
  var statusSpan = windowObj.el.querySelector('.code-status');
  inputArea.value = defaultCode;

  function highlightCode() {
    var rawText = inputArea.value;
    var escaped = OS.escapeHtml(rawText);
    var language = langSelect.value;
    var highlighted = escaped;

    if (language === 'javascript') {
      highlighted = highlighted
        .replace(/(\/\/.*)/g, '<span style="color:#6a9955">$1</span>')
        .replace(/\b(var|let|const|function|return|if|else|for|while|switch|case|break|default|new|this|typeof|instanceof|try|catch|throw|finally|class|extends|import|export|from|of|in|do|continue|null|undefined|true|false|NaN|Infinity)\b/g, '<span style="color:#569cd6">$1</span>')
        .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;|&#39;(?:[^&]|&(?!#39;))*?&#39;)/g, '<span style="color:#ce9178">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8">$1</span>');
    } else if (language === 'html') {
      highlighted = highlighted
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#6a9955">$1</span>')
        .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span style="color:#569cd6">$1</span>')
        .replace(/(&gt;)/g, '<span style="color:#808080">$1</span>')
        .replace(/(&quot;[^&]*?&quot;)/g, '<span style="color:#ce9178">$1</span>');
    } else if (language === 'css') {
      highlighted = highlighted
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955">$1</span>')
        .replace(/([.#][a-zA-Z][\w-]*)/g, '<span style="color:#d7ba7d">$1</span>')
        .replace(/([a-zA-Z-]+)(\s*:)/g, '<span style="color:#9cdcfe">$1</span>$2')
        .replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms)?\b/g, '<span style="color:#b5cea8">$1$2</span>');
    }

    highlightArea.innerHTML = highlighted + '\n';
  }

  inputArea.addEventListener('input', highlightCode);
  inputArea.addEventListener('scroll', function () {
    highlightArea.scrollTop = inputArea.scrollTop;
    highlightArea.scrollLeft = inputArea.scrollLeft;
  });
  inputArea.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var start = inputArea.selectionStart;
      inputArea.value = inputArea.value.substring(0, start) + '  ' + inputArea.value.substring(inputArea.selectionEnd);
      inputArea.selectionStart = inputArea.selectionEnd = start + 2;
      highlightCode();
    }
  });
  langSelect.addEventListener('change', highlightCode);
  highlightCode();

  windowObj.el.querySelector('.code-run-btn').addEventListener('click', function () {
    var codeText = inputArea.value;
    var language = langSelect.value;
    statusSpan.textContent = 'Running...';
    statusSpan.style.color = '#4ec9b0';
    try {
      if (language === 'javascript') {
        var runFunction = new Function('OS', codeText);
        runFunction(OS);
        statusSpan.textContent = 'Done';
        statusSpan.style.color = '#4ec9b0';
      } else if (language === 'html') {
        var previewWindow = OS.createWindow('HTML Preview', 450, 350,
          '<iframe style="width:100%;height:100%;border:none" sandbox="allow-same-origin"></iframe>');
        previewWindow.el.querySelector('iframe').srcdoc = codeText;
        statusSpan.textContent = 'Previewing';
        statusSpan.style.color = '#4ec9b0';
      } else if (language === 'css') {
        var styleTag = document.createElement('style');
        styleTag.textContent = codeText;
        document.head.appendChild(styleTag);
        statusSpan.textContent = 'CSS Applied';
        statusSpan.style.color = '#4ec9b0';
      }
    } catch (runError) {
      statusSpan.textContent = 'Error: ' + runError.message;
      statusSpan.style.color = '#f44';
    }
  });
});

// ── Task Manager ──
OS.registerApp('taskmanager', function buildTaskManager() {
  var windowObj = OS.createWindow('Task Manager', 420, 320,
    '<div style="display:flex;flex-direction:column;height:100%;background:#ece9d8">' +
    '<div style="display:flex;gap:4px;padding:4px 6px;background:#ece9d8;border-bottom:1px solid #aca899;flex-shrink:0">' +
      '<button class="tm-refresh" style="background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px;padding:2px 10px;cursor:pointer;font-size:11px;font-family:inherit">Refresh</button>' +
      '<button class="tm-killall" style="background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px;padding:2px 10px;cursor:pointer;font-size:11px;font-family:inherit;color:#c00">End All</button>' +
      '<span style="margin-left:auto;font-size:10px;color:#555;padding-top:3px" class="tm-count"></span>' +
    '</div>' +
    '<div style="display:flex;padding:2px 6px;background:#ece9d8;border-bottom:1px solid #aca899;font-size:11px;font-weight:700;flex-shrink:0">' +
      '<span style="flex:2">Window Title</span>' +
      '<span style="width:60px;text-align:center">Status</span>' +
      '<span style="width:70px;text-align:right;padding-right:8px">Action</span>' +
    '</div>' +
    '<div class="tm-list" style="flex:1;overflow-y:auto;background:#fff"></div>' +
    '</div>');

  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');
  var listElement = windowObj.el.querySelector('.tm-list');
  var countSpan = windowObj.el.querySelector('.tm-count');

  function renderTaskList() {
    listElement.innerHTML = '';
    countSpan.textContent = OS.windows.length + ' window(s)';

    OS.windows.forEach(function (targetWindow) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;padding:3px 6px;font-size:11px;border-bottom:1px solid #eee';
      var statusText = targetWindow.minimized ? 'Minimized' : (targetWindow.maximized ? 'Maximized' : 'Running');
      var statusColor = targetWindow.minimized ? '#999' : '#2a2';

      row.innerHTML =
        '<span style="flex:2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + OS.escapeHtml(targetWindow.title) + '</span>' +
        '<span style="width:60px;text-align:center;color:' + statusColor + ';font-size:10px">' + statusText + '</span>' +
        '<span style="width:70px;text-align:right;padding-right:4px"></span>';

      var actionSpan = row.querySelector('span:last-child');
      var focusButton = document.createElement('button');
      focusButton.textContent = 'Focus';
      focusButton.style.cssText = 'background:#4a8acc;color:#fff;border:none;padding:1px 6px;font-size:9px;cursor:pointer;border-radius:2px;margin-right:2px';
      focusButton.addEventListener('click', function () {
        targetWindow.minimized = false;
        targetWindow.el.classList.remove('minimized');
        targetWindow.el.style.zIndex = 9999;
        renderTaskList();
      });

      var killButton = document.createElement('button');
      killButton.textContent = 'End';
      killButton.style.cssText = 'background:#c44;color:#fff;border:none;padding:1px 6px;font-size:9px;cursor:pointer;border-radius:2px';
      killButton.addEventListener('click', function () {
        var closeBtn = targetWindow.el.querySelector('.btn-close');
        if (closeBtn) closeBtn.click();
        setTimeout(renderTaskList, 50);
      });

      actionSpan.appendChild(focusButton);
      actionSpan.appendChild(killButton);
      listElement.appendChild(row);
    });

    if (OS.windows.length === 0) {
      listElement.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:11px">No windows open</div>';
    }
  }

  windowObj.el.querySelector('.tm-refresh').addEventListener('click', renderTaskList);
  windowObj.el.querySelector('.tm-killall').addEventListener('click', function () {
    OS.confirm('Close all windows?', function (yes) {
      if (yes) {
        while (OS.windows.length > 0) {
          var closeBtn = OS.windows[0].el.querySelector('.btn-close');
          if (closeBtn) closeBtn.click(); else break;
        }
        setTimeout(renderTaskList, 50);
      }
    });
  });

  renderTaskList();
  var refreshInterval = setInterval(renderTaskList, 3000);
  windowObj.el.querySelector('.btn-close').addEventListener('click', function () { clearInterval(refreshInterval); });
});

})();
