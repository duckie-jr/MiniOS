(function () {

var OS = window.MicroOS;

// ── Notepad ──
OS.registerApp('notepad', function buildNotepad() {
  var STORAGE_KEY = 'micro-notepad-v2';

  // ── Simple Markdown renderer ──
  function renderMarkdown(rawText) {
    var lines = rawText.split('\n');
    var outputHtml = '';
    var insideCodeBlock = false;
    var insideOrderedList = false;
    var insideUnorderedList = false;

    function closeOpenLists() {
      if (insideUnorderedList) { outputHtml += '</ul>'; insideUnorderedList = false; }
      if (insideOrderedList)   { outputHtml += '</ol>'; insideOrderedList = false; }
    }

    function applyInlineStyles(text) {
      // Escape HTML first
      text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      // Code spans
      text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Bold+italic
      text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
      // Bold
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
      // Italic
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
      // Strikethrough
      text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
      // Links
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      return text;
    }

    lines.forEach(function (line) {
      if (line.startsWith('```')) {
        if (insideCodeBlock) {
          outputHtml += '</code></pre>';
          insideCodeBlock = false;
        } else {
          closeOpenLists();
          var language = line.slice(3).trim();
          outputHtml += '<pre><code' + (language ? ' class="lang-' + language + '"' : '') + '>';
          insideCodeBlock = true;
        }
        return;
      }

      if (insideCodeBlock) {
        outputHtml += line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '\n';
        return;
      }

      if (/^#{1,6}\s/.test(line)) {
        closeOpenLists();
        var headingLevel = line.match(/^(#{1,6})\s/)[1].length;
        var headingText = line.slice(headingLevel + 1);
        outputHtml += '<h' + headingLevel + '>' + applyInlineStyles(headingText) + '</h' + headingLevel + '>';
        return;
      }

      if (/^[-*]\s/.test(line)) {
        if (insideOrderedList) { outputHtml += '</ol>'; insideOrderedList = false; }
        if (!insideUnorderedList) { outputHtml += '<ul>'; insideUnorderedList = true; }
        outputHtml += '<li>' + applyInlineStyles(line.slice(2)) + '</li>';
        return;
      }

      if (/^\d+\.\s/.test(line)) {
        if (insideUnorderedList) { outputHtml += '</ul>'; insideUnorderedList = false; }
        if (!insideOrderedList) { outputHtml += '<ol>'; insideOrderedList = true; }
        outputHtml += '<li>' + applyInlineStyles(line.replace(/^\d+\.\s/, '')) + '</li>';
        return;
      }

      if (/^>\s?/.test(line)) {
        closeOpenLists();
        outputHtml += '<blockquote>' + applyInlineStyles(line.replace(/^>\s?/, '')) + '</blockquote>';
        return;
      }

      if (/^[-*_]{3,}$/.test(line.trim())) {
        closeOpenLists();
        outputHtml += '<hr />';
        return;
      }

      closeOpenLists();
      if (line.trim() === '') {
        outputHtml += '<br />';
      } else {
        outputHtml += '<p>' + applyInlineStyles(line) + '</p>';
      }
    });

    closeOpenLists();
    if (insideCodeBlock) outputHtml += '</code></pre>';
    return outputHtml;
  }

  // ── Note storage helpers ──
  function loadAllNotes() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (storageError) { /* fallback below */ }
    return [{ id: Date.now(), title: 'Welcome', content: '# Welcome to Notepad\n\nThis is your new **multi-note** editor.\n\n- Click **New** to create a note\n- Double-click a note title to rename it\n- Toggle **Preview** to render Markdown\n\n---\n\nHappy writing!' }];
  }

  function persistAllNotes(notesList) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notesList)); } catch (e) {}
  }

  function generateUniqueId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function getTodayTimestamp() {
    return new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ── Build window HTML ──
  var windowHtml =
    '<div class="np2-shell">' +
      '<div class="np2-sidebar">' +
        '<div class="np2-sidebar-actions">' +
          '<button class="np2-btn-new" title="New Note (Shift+N)">+ New</button>' +
          '<button class="np2-btn-delete" title="Delete selected note">Delete</button>' +
        '</div>' +
        '<div class="np2-note-list"></div>' +
      '</div>' +
      '<div class="np2-editor-panel">' +
        '<div class="np2-title-bar">' +
          '<input class="np2-title-input" type="text" placeholder="Note title..." />' +
        '</div>' +
        '<div class="np2-toolbar">' +
          '<button class="np2-tb-btn" data-action="bold"       title="Bold (Shift+B)"><b>B</b></button>' +
          '<button class="np2-tb-btn" data-action="italic"     title="Italic (Shift+I)"><i>I</i></button>' +
          '<button class="np2-tb-btn" data-action="strike"     title="Strikethrough"><s>S</s></button>' +
          '<button class="np2-tb-btn" data-action="code"       title="Inline code"><code>`c`</code></button>' +
          '<span class="np2-tb-sep"></span>' +
          '<button class="np2-tb-btn" data-action="h1"         title="Heading 1">H1</button>' +
          '<button class="np2-tb-btn" data-action="h2"         title="Heading 2">H2</button>' +
          '<button class="np2-tb-btn" data-action="h3"         title="Heading 3">H3</button>' +
          '<span class="np2-tb-sep"></span>' +
          '<button class="np2-tb-btn" data-action="ul"         title="Bullet list">• List</button>' +
          '<button class="np2-tb-btn" data-action="ol"         title="Numbered list">1. List</button>' +
          '<button class="np2-tb-btn" data-action="quote"      title="Blockquote">" Quote</button>' +
          '<button class="np2-tb-btn" data-action="hr"         title="Horizontal rule">─ Rule</button>' +
          '<span class="np2-tb-sep"></span>' +
          '<button class="np2-tb-btn np2-btn-preview" data-action="preview" title="Toggle Preview (Shift+P)">Preview</button>' +
          '<span class="np2-tb-sep"></span>' +
          '<button class="np2-tb-btn" data-action="find"       title="Find (Shift+F)">Find</button>' +
        '</div>' +
        '<div class="np2-find-bar" style="display:none">' +
          '<span>Find:</span>' +
          '<input class="np2-find-input" type="text" />' +
          '<button class="np2-find-next">Next</button>' +
          '<button class="np2-find-prev">Prev</button>' +
          '<button class="np2-find-close"><svg viewBox="0 0 10 10" width="10" height="10" style="vertical-align:middle"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
          '<span class="np2-find-count"></span>' +
        '</div>' +
        '<div class="np2-body-wrap">' +
          '<textarea class="np2-textarea" spellcheck="true" placeholder="Start writing..."></textarea>' +
          '<div class="np2-preview" style="display:none"></div>' +
        '</div>' +
        '<div class="np2-status-bar">' +
          '<span class="np2-status-words">0 words</span>' +
          '<span class="np2-status-saved">Saved</span>' +
        '</div>' +
      '</div>' +
    '</div>';

  var windowObj = OS.createWindow('Notepad', 680, 480, windowHtml);
  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');

  // ── Element references ──
  var noteListEl       = windowObj.el.querySelector('.np2-note-list');
  var titleInputEl     = windowObj.el.querySelector('.np2-title-input');
  var textareaEl       = windowObj.el.querySelector('.np2-textarea');
  var previewEl        = windowObj.el.querySelector('.np2-preview');
  var statusWordsEl    = windowObj.el.querySelector('.np2-status-words');
  var statusSavedEl    = windowObj.el.querySelector('.np2-status-saved');
  var findBarEl        = windowObj.el.querySelector('.np2-find-bar');
  var findInputEl      = windowObj.el.querySelector('.np2-find-input');
  var findCountEl      = windowObj.el.querySelector('.np2-find-count');
  var previewBtn       = windowObj.el.querySelector('.np2-btn-preview');
  var deleteBtn        = windowObj.el.querySelector('.np2-btn-delete');

  // ── State ──
  var notesList        = loadAllNotes();
  var activeNoteIndex  = 0;
  var isPreviewMode    = false;
  var autoSaveTimer    = null;

  // ── Render sidebar note list ──
  function renderNoteList() {
    noteListEl.innerHTML = '';
    notesList.forEach(function (note, index) {
      var noteItemEl = document.createElement('div');
      noteItemEl.className = 'np2-note-item' + (index === activeNoteIndex ? ' active' : '');
      noteItemEl.dataset.index = index;

      var noteTitleSpan = document.createElement('span');
      noteTitleSpan.className = 'np2-note-item-title';
      noteTitleSpan.textContent = note.title || 'Untitled';

      noteItemEl.appendChild(noteTitleSpan);
      noteListEl.appendChild(noteItemEl);

      noteItemEl.addEventListener('click', function () {
        saveCurrentNoteContent();
        activeNoteIndex = index;
        loadActiveNote();
        renderNoteList();
      });

      noteTitleSpan.addEventListener('dblclick', function (doubleClickEvent) {
        doubleClickEvent.stopPropagation();
        startInlineRename(noteTitleSpan, index);
      });
    });
  }

  // ── Inline rename on double-click ──
  function startInlineRename(titleSpanEl, noteIndex) {
    var currentTitle = notesList[noteIndex].title || 'Untitled';
    var renameInput = document.createElement('input');
    renameInput.className = 'np2-rename-input';
    renameInput.type = 'text';
    renameInput.value = currentTitle;

    titleSpanEl.replaceWith(renameInput);
    renameInput.focus();
    renameInput.select();

    function commitRename() {
      var newTitle = renameInput.value.trim() || 'Untitled';
      notesList[noteIndex].title = newTitle;
      persistAllNotes(notesList);
      renderNoteList();
      if (noteIndex === activeNoteIndex) titleInputEl.value = newTitle;
    }

    renameInput.addEventListener('blur', commitRename);
    renameInput.addEventListener('keydown', function (keyEvent) {
      if (keyEvent.key === 'Enter') renameInput.blur();
      if (keyEvent.key === 'Escape') { notesList[noteIndex].title = currentTitle; renderNoteList(); }
    });
  }

  // ── Load the active note into the editor ──
  function loadActiveNote() {
    var activeNote = notesList[activeNoteIndex];
    if (!activeNote) return;
    titleInputEl.value = activeNote.title || '';
    textareaEl.value   = activeNote.content || '';
    updateWordCount();
    if (isPreviewMode) refreshPreview();
    statusSavedEl.textContent = 'Saved';
    deleteBtn.disabled = notesList.length <= 1;
  }

  // ── Save textarea content into notesList without persisting to localStorage ──
  function saveCurrentNoteContent() {
    if (!notesList[activeNoteIndex]) return;
    notesList[activeNoteIndex].content  = textareaEl.value;
    notesList[activeNoteIndex].title    = titleInputEl.value.trim() || 'Untitled';
    notesList[activeNoteIndex].modified = getTodayTimestamp();
  }

  // ── Debounced auto-save to localStorage ──
  function scheduleAutoSave() {
    statusSavedEl.textContent = 'Saving…';
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      saveCurrentNoteContent();
      persistAllNotes(notesList);
      statusSavedEl.textContent = 'Saved';
    }, 600);
  }

  // ── Word count ──
  function updateWordCount() {
    var words = textareaEl.value.trim().split(/\s+/).filter(function (word) { return word.length > 0; });
    statusWordsEl.textContent = words.length + (words.length === 1 ? ' word' : ' words');
  }

  // ── Markdown preview ──
  function refreshPreview() {
    previewEl.innerHTML = renderMarkdown(textareaEl.value);
  }

  function togglePreviewMode() {
    isPreviewMode = !isPreviewMode;
    if (isPreviewMode) {
      refreshPreview();
      textareaEl.style.display = 'none';
      previewEl.style.display  = 'block';
      previewBtn.classList.add('active');
      previewBtn.textContent = 'Edit';
    } else {
      textareaEl.style.display = 'block';
      previewEl.style.display  = 'none';
      previewBtn.classList.remove('active');
      previewBtn.textContent = 'Preview';
      textareaEl.focus();
    }
  }

  // ── Toolbar: wrap selection or insert at cursor ──
  function insertMarkdownWrapper(prefix, suffix) {
    if (isPreviewMode) return;
    textareaEl.focus();
    var start  = textareaEl.selectionStart;
    var end    = textareaEl.selectionEnd;
    var before = textareaEl.value.substring(0, start);
    var selected = textareaEl.value.substring(start, end);
    var after  = textareaEl.value.substring(end);
    var replacement = prefix + (selected || 'text') + suffix;
    textareaEl.value = before + replacement + after;
    var cursorStart = start + prefix.length;
    var cursorEnd   = cursorStart + (selected || 'text').length;
    textareaEl.setSelectionRange(cursorStart, cursorEnd);
    scheduleAutoSave();
    updateWordCount();
  }

  function insertLinePrefix(prefix) {
    if (isPreviewMode) return;
    textareaEl.focus();
    var start       = textareaEl.selectionStart;
    var beforeCursor = textareaEl.value.substring(0, start);
    var lineStart   = beforeCursor.lastIndexOf('\n') + 1;
    var before      = textareaEl.value.substring(0, lineStart);
    var restOfText  = textareaEl.value.substring(lineStart);
    textareaEl.value = before + prefix + restOfText;
    textareaEl.setSelectionRange(start + prefix.length, start + prefix.length);
    scheduleAutoSave();
    updateWordCount();
  }

  var toolbarActions = {
    bold:    function () { insertMarkdownWrapper('**', '**'); },
    italic:  function () { insertMarkdownWrapper('*', '*'); },
    strike:  function () { insertMarkdownWrapper('~~', '~~'); },
    code:    function () { insertMarkdownWrapper('`', '`'); },
    h1:      function () { insertLinePrefix('# '); },
    h2:      function () { insertLinePrefix('## '); },
    h3:      function () { insertLinePrefix('### '); },
    ul:      function () { insertLinePrefix('- '); },
    ol:      function () { insertLinePrefix('1. '); },
    quote:   function () { insertLinePrefix('> '); },
    hr:      function () { insertMarkdownWrapper('\n---\n', ''); },
    preview: togglePreviewMode,
    find:    function () { toggleFindBar(); }
  };

  windowObj.el.querySelector('.np2-toolbar').addEventListener('click', function (toolbarEvent) {
    var actionName = toolbarEvent.target.closest('[data-action]');
    if (!actionName) return;
    var action = toolbarActions[actionName.dataset.action];
    if (action) action();
  });

  // ── Find bar ──
  var findSearchTerm    = '';
  var findMatchPositions = [];
  var findActiveIndex   = -1;

  function toggleFindBar() {
    var isVisible = findBarEl.style.display !== 'none';
    if (isVisible) {
      findBarEl.style.display = 'none';
      textareaEl.focus();
    } else {
      findBarEl.style.display = 'flex';
      var selectedText = textareaEl.value.substring(textareaEl.selectionStart, textareaEl.selectionEnd);
      if (selectedText) findInputEl.value = selectedText;
      findInputEl.focus();
      findInputEl.select();
      runFindSearch();
    }
  }

  function runFindSearch() {
    findSearchTerm = findInputEl.value;
    findMatchPositions = [];
    findActiveIndex = -1;
    if (!findSearchTerm) { findCountEl.textContent = ''; return; }
    var lowerContent = textareaEl.value.toLowerCase();
    var lowerTerm    = findSearchTerm.toLowerCase();
    var searchStart  = 0;
    while (true) {
      var matchPos = lowerContent.indexOf(lowerTerm, searchStart);
      if (matchPos === -1) break;
      findMatchPositions.push(matchPos);
      searchStart = matchPos + 1;
    }
    findCountEl.textContent = findMatchPositions.length + ' match' + (findMatchPositions.length !== 1 ? 'es' : '');
  }

  function jumpToFindMatch(direction) {
    if (findMatchPositions.length === 0) return;
    if (direction === 'next') {
      findActiveIndex = (findActiveIndex + 1) % findMatchPositions.length;
    } else {
      findActiveIndex = (findActiveIndex - 1 + findMatchPositions.length) % findMatchPositions.length;
    }
    var matchPosition = findMatchPositions[findActiveIndex];
    textareaEl.focus();
    textareaEl.setSelectionRange(matchPosition, matchPosition + findSearchTerm.length);
    findCountEl.textContent = (findActiveIndex + 1) + ' / ' + findMatchPositions.length;
  }

  findInputEl.addEventListener('input', runFindSearch);
  findInputEl.addEventListener('keydown', function (keyEvent) {
    if (keyEvent.key === 'Enter') { keyEvent.preventDefault(); jumpToFindMatch('next'); }
    if (keyEvent.key === 'Escape') { findBarEl.style.display = 'none'; textareaEl.focus(); }
  });
  windowObj.el.querySelector('.np2-find-next').addEventListener('click', function () { jumpToFindMatch('next'); });
  windowObj.el.querySelector('.np2-find-prev').addEventListener('click', function () { jumpToFindMatch('prev'); });
  windowObj.el.querySelector('.np2-find-close').addEventListener('click', function () {
    findBarEl.style.display = 'none';
    textareaEl.focus();
  });

  // ── New note ──
  windowObj.el.querySelector('.np2-btn-new').addEventListener('click', function () {
    saveCurrentNoteContent();
    var newNote = { id: generateUniqueId(), title: 'New Note', content: '', modified: getTodayTimestamp() };
    notesList.unshift(newNote);
    activeNoteIndex = 0;
    persistAllNotes(notesList);
    renderNoteList();
    loadActiveNote();
    titleInputEl.focus();
    titleInputEl.select();
  });

  // ── Delete note ──
  deleteBtn.addEventListener('click', function () {
    if (notesList.length <= 1) return;
    var noteTitle = notesList[activeNoteIndex].title || 'this note';
    OS.confirm('Delete "' + noteTitle + '"?', function (confirmed) {
      if (!confirmed) return;
      notesList.splice(activeNoteIndex, 1);
      activeNoteIndex = Math.min(activeNoteIndex, notesList.length - 1);
      persistAllNotes(notesList);
      renderNoteList();
      loadActiveNote();
    });
  });

  // ── Title input: sync title to note ──
  titleInputEl.addEventListener('input', function () {
    if (notesList[activeNoteIndex]) {
      notesList[activeNoteIndex].title = titleInputEl.value.trim() || 'Untitled';
      renderNoteList();
      scheduleAutoSave();
    }
  });

  // ── Textarea: sync content to note + word count ──
  textareaEl.addEventListener('input', function () {
    updateWordCount();
    scheduleAutoSave();
  });

  // ── Keyboard shortcuts (Shift+key, only when not typing in an input/textarea) ──
  windowObj.el.addEventListener('keydown', function (keyboardEvent) {
    var focusedElement = document.activeElement;
    var isTypingInInput = focusedElement === textareaEl
      || focusedElement === titleInputEl
      || focusedElement === findInputEl
      || (focusedElement && focusedElement.classList.contains('np2-rename-input'));

    if (keyboardEvent.shiftKey && !isTypingInInput) {
      var pressedKey = keyboardEvent.key.toUpperCase();
      if (pressedKey === 'B') { keyboardEvent.preventDefault(); toolbarActions.bold(); }
      if (pressedKey === 'I') { keyboardEvent.preventDefault(); toolbarActions.italic(); }
      if (pressedKey === 'F') { keyboardEvent.preventDefault(); toggleFindBar(); }
      if (pressedKey === 'P') { keyboardEvent.preventDefault(); togglePreviewMode(); }
      if (pressedKey === 'N') { keyboardEvent.preventDefault(); windowObj.el.querySelector('.np2-btn-new').click(); }
    }

    if (keyboardEvent.key === 'Tab' && document.activeElement === textareaEl) {
      keyboardEvent.preventDefault();
      insertMarkdownWrapper('  ', '');
    }
  });

  // ── Init ──
  renderNoteList();
  loadActiveNote();
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

  function openFile(name, fileData, callerParentNode) {
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
        var svgZoom = 100;
        var svgBgColor = 'repeating-conic-gradient(#ddd 0% 25%,#fff 0% 50%) 0 0/16px 16px';
        var svgFullHTML = '<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:' + svgBgColor + '}svg{max-width:100%;max-height:100%}</style></head><body>' + svgContent + '</body></html>';

        var svgWindow = OS.createWindow(name + ' - SVG Viewer', 500, 440,
          '<div style="display:flex;flex-direction:column;height:100%">' +
          '<div style="display:flex;gap:4px;padding:3px 6px;background:#ece9d8;border-bottom:1px solid #aca899;flex-shrink:0;align-items:center;font-size:10px">' +
            '<span style="color:#555">' + OS.escapeHtml(name) + ' - ' + OS.formatFileSize(fileData.size || 0) + '</span>' +
            '<span style="flex:1"></span>' +
            '<button class="svg-zoom-out" style="padding:1px 6px;font-size:10px;cursor:pointer;font-family:inherit;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">-</button>' +
            '<span class="svg-zoom-label" style="min-width:36px;text-align:center">100%</span>' +
            '<button class="svg-zoom-in" style="padding:1px 6px;font-size:10px;cursor:pointer;font-family:inherit;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">+</button>' +
            '<button class="svg-zoom-fit" style="padding:1px 6px;font-size:10px;cursor:pointer;font-family:inherit;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">Fit</button>' +
            '<span style="color:#ccc">|</span>' +
            '<button class="svg-bg-toggle" style="padding:1px 6px;font-size:10px;cursor:pointer;font-family:inherit;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">BG</button>' +
            '<button class="svg-edit-btn" style="padding:1px 6px;font-size:10px;cursor:pointer;font-family:inherit;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">Edit</button>' +
          '</div>' +
          '<iframe class="svg-frame" style="flex:1;width:100%;border:none;background:#f8f8f8" sandbox="allow-same-origin"></iframe>' +
          '</div>');

        svgWindow.el.querySelector('.window-body').classList.add('window-body-flex');
        var svgFrame = svgWindow.el.querySelector('.svg-frame');
        var zoomLabel = svgWindow.el.querySelector('.svg-zoom-label');
        svgFrame.srcdoc = svgFullHTML;

        function updateZoom() {
          zoomLabel.textContent = svgZoom + '%';
          try {
            var svgEl = svgFrame.contentDocument.querySelector('svg');
            if (svgEl) { svgEl.style.transform = 'scale(' + (svgZoom / 100) + ')'; svgEl.style.transformOrigin = 'center center'; }
          } catch (zoomError) {}
        }

        svgWindow.el.querySelector('.svg-zoom-in').addEventListener('click', function () { svgZoom = Math.min(500, svgZoom + 25); updateZoom(); });
        svgWindow.el.querySelector('.svg-zoom-out').addEventListener('click', function () { svgZoom = Math.max(25, svgZoom - 25); updateZoom(); });
        svgWindow.el.querySelector('.svg-zoom-fit').addEventListener('click', function () { svgZoom = 100; updateZoom(); });

        var bgStates = [
          'repeating-conic-gradient(#ddd 0% 25%,#fff 0% 50%) 0 0/16px 16px',
          '#ffffff',
          '#000000',
          '#808080'
        ];
        var bgIndex = 0;
        svgWindow.el.querySelector('.svg-bg-toggle').addEventListener('click', function () {
          bgIndex = (bgIndex + 1) % bgStates.length;
          try { svgFrame.contentDocument.body.style.background = bgStates[bgIndex]; } catch (bgError) {}
        });

        svgWindow.el.querySelector('.svg-edit-btn').addEventListener('click', function () {
          var editWindow = OS.createWindow(name + ' - Edit SVG', 500, 350,
            '<div style="display:flex;flex-direction:column;height:100%">' +
            '<div style="display:flex;gap:4px;padding:3px 6px;background:#1e1e1e;border-bottom:1px solid #333;flex-shrink:0">' +
              '<button class="svg-apply-btn" style="background:#388e3c;color:#fff;border:none;padding:1px 10px;font-size:10px;cursor:pointer;border-radius:2px;font-family:inherit">Apply</button>' +
              '<span style="color:#666;font-size:10px;margin-left:auto" class="svg-edit-status">Edit SVG source below</span>' +
            '</div>' +
            '<textarea class="svg-edit-area" style="flex:1;margin:0;padding:8px;font-family:Consolas,monospace;font-size:12px;line-height:1.5;background:#1e1e1e;color:#d4d4d4;border:none;outline:none;resize:none;white-space:pre-wrap" spellcheck="false"></textarea>' +
            '</div>');
          editWindow.el.querySelector('.window-body').classList.add('window-body-flex');
          var editArea = editWindow.el.querySelector('.svg-edit-area');
          var editStatus = editWindow.el.querySelector('.svg-edit-status');
          editArea.value = fileData.content || svgContent;

          editWindow.el.querySelector('.svg-apply-btn').addEventListener('click', function () {
            var newSource = editArea.value.trim();
            if (newSource.indexOf('<svg') < 0) {
              editStatus.textContent = 'No <svg> tag found';
              editStatus.style.color = '#f44';
              return;
            }
            fileData.content = newSource;
            fileData.size = newSource.length;
            var updatedHTML = '<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:' + bgStates[bgIndex] + '}svg{max-width:100%;max-height:100%}</style></head><body>' + newSource + '</body></html>';
            svgFrame.srcdoc = updatedHTML;
            svgZoom = 100;
            updateZoom();
            editStatus.textContent = 'Applied!';
            editStatus.style.color = '#4ec9b0';
          });
        });

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

    // ── Improved text file editor ──
    var feExt  = name.lastIndexOf('.') >= 0 ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : 'txt';
    var feBase = name.lastIndexOf('.') >= 0 ? name.substring(0, name.lastIndexOf('.')) : name;
    var feCurrentName = name;

    var feAllTypes = ['txt','md','json','html','css','js','bat','log','cfg','app','csv'];
    var feTypeButtons = feAllTypes.map(function (ext) {
      return '<button class="fe-type-btn' + (ext === feExt ? ' active' : '') + '" data-ext="' + ext + '">.' + ext + '</button>';
    }).join('');

    var feIsMd   = feExt === 'md';
    var feIsJson = feExt === 'json';
    var feIsHtml = feExt === 'html' || feExt === 'htm';

    var feToolbar = '';
    if (feIsMd) {
      feToolbar = '<button class="fe-tb" data-a="bold"><b>B</b></button>' +
        '<button class="fe-tb" data-a="italic"><i>I</i></button>' +
        '<button class="fe-tb" data-a="h1">H1</button>' +
        '<button class="fe-tb" data-a="h2">H2</button>' +
        '<span class="fe-tb-sep"></span>' +
        '<button class="fe-tb" data-a="ul">• List</button>' +
        '<button class="fe-tb" data-a="ol">1. List</button>' +
        '<button class="fe-tb" data-a="code">`code`</button>' +
        '<button class="fe-tb" data-a="quote">" Quote</button>' +
        '<button class="fe-tb" data-a="hr">─ Rule</button>' +
        '<span class="fe-tb-sep"></span>' +
        '<button class="fe-tb fe-preview-btn" data-a="preview">Preview</button>';
    } else if (feIsJson) {
      feToolbar = '<button class="fe-tb" data-a="prettify">Format JSON</button>' +
        '<button class="fe-tb" data-a="minify">Minify</button>' +
        '<button class="fe-tb" data-a="validate">Validate</button>';
    } else if (feIsHtml) {
      feToolbar = '<button class="fe-tb fe-preview-btn" data-a="preview-html">Preview HTML</button>' +
        '<span class="fe-tb-sep"></span>' +
        '<button class="fe-tb" data-a="wrap-p">&lt;p&gt;</button>' +
        '<button class="fe-tb" data-a="wrap-div">&lt;div&gt;</button>' +
        '<button class="fe-tb" data-a="wrap-b">&lt;b&gt;</button>' +
        '<button class="fe-tb" data-a="wrap-a">&lt;a&gt;</button>' +
        '<button class="fe-tb" data-a="wrap-h1">&lt;h1&gt;</button>';
    } else {
      feToolbar = '<button class="fe-tb" data-a="datetime"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="3" width="14" height="12" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><rect x="1" y="3" width="14" height="4" rx="1" fill="#4a7acc"/><line x1="5" y1="1" x2="5" y2="5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/><line x1="11" y1="1" x2="11" y2="5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/><rect x="3" y="9" width="2" height="2" rx=".3" fill="#ccc"/><rect x="7" y="9" width="2" height="2" rx=".3" fill="#ccc"/><rect x="11" y="9" width="2" height="2" rx=".3" fill="#ccc"/></svg> Date/Time</button>' +
        '<button class="fe-tb" data-a="divider">─ Divider</button>' +
        '<button class="fe-tb" data-a="wrap-toggle">Wrap</button>';
    }

    var feHtml =
      '<div class="fe-shell">' +
        '<div class="fe-topbar">' +
          '<span class="fe-topbar-label">Rename:</span>' +
          '<input class="fe-name-input" type="text" value="' + OS.escapeHtml(feBase) + '" />' +
          '<div class="fe-type-pills">' + feTypeButtons + '</div>' +
        '</div>' +
        '<div class="fe-toolbar">' + feToolbar + '</div>' +
        '<div class="fe-body-wrap">' +
          '<textarea class="fe-textarea" spellcheck="true">' + OS.escapeHtml(content) + '</textarea>' +
          '<div class="fe-preview-pane" style="display:none"></div>' +
        '</div>' +
        '<div class="fe-statusbar">' +
          '<span class="fe-stat"></span>' +
          '<span class="fe-saved">Saved</span>' +
        '</div>' +
      '</div>';

    var editWindow = OS.createWindow(name, 530, 440, feHtml);
    editWindow.el.querySelector('.window-body').classList.add('window-body-flex');

    var feTa        = editWindow.el.querySelector('.fe-textarea');
    var fePreview   = editWindow.el.querySelector('.fe-preview-pane');
    var feStat      = editWindow.el.querySelector('.fe-stat');
    var feSaved     = editWindow.el.querySelector('.fe-saved');
    var feNameInput = editWindow.el.querySelector('.fe-name-input');
    var feToolbarEl = editWindow.el.querySelector('.fe-toolbar');
    var fePillsEl   = editWindow.el.querySelector('.fe-type-pills');
    var feInPreview = false;
    var feWrap      = true;
    var feSaveTimer = null;

    function feUpdateStat() {
      var text  = feTa.value;
      var words = text.trim() ? text.trim().split(/\s+/).length : 0;
      var lines = text.split('\n').length;
      feStat.textContent = words + ' words · ' + text.length + ' chars · ' + lines + ' lines';
    }

    function feScheduleSave() {
      feSaved.textContent = 'Saving…';
      clearTimeout(feSaveTimer);
      feSaveTimer = setTimeout(function () {
        fileData.content = feTa.value;
        fileData.size    = feTa.value.length;
        feSaved.textContent = 'Saved';
      }, 400);
    }

    function feSimpleMd(text) {
      var html = '';
      var lines = text.split('\n');
      var inCode = false;
      lines.forEach(function (ln) {
        if (ln.startsWith('```')) { inCode = !inCode; html += inCode ? '<pre><code>' : '</code></pre>'; return; }
        if (inCode) { html += ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '\n'; return; }
        var safe = ln.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        safe = safe.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/~~(.+?)~~/g,'<del>$1</del>');
        if (/^#{1,6}\s/.test(ln)) { var lvl = ln.match(/^(#{1,6})\s/)[1].length; html += '<h' + lvl + '>' + safe.replace(/^#{1,6}\s/,'') + '</h' + lvl + '>'; return; }
        if (/^[-*]\s/.test(ln)) { html += '<li>' + safe.slice(2) + '</li>'; return; }
        if (/^>\s?/.test(ln)) { html += '<blockquote>' + safe.replace(/^>\s?/,'') + '</blockquote>'; return; }
        if (/^[-*_]{3,}$/.test(ln.trim())) { html += '<hr />'; return; }
        html += ln.trim() ? '<p>' + safe + '</p>' : '<br />';
      });
      if (inCode) html += '</code></pre>';
      return html;
    }

    function feTogglePreview() {
      feInPreview = !feInPreview;
      if (feInPreview) {
        fePreview.innerHTML = feSimpleMd(feTa.value);
        feTa.style.display = 'none';
        fePreview.style.display = 'block';
        var previewBtn = feToolbarEl.querySelector('[data-a="preview"]');
        if (previewBtn) { previewBtn.textContent = 'Edit'; previewBtn.classList.add('active'); }
      } else {
        feTa.style.display = 'block';
        fePreview.style.display = 'none';
        var previewBtn = feToolbarEl.querySelector('[data-a="preview"]');
        if (previewBtn) { previewBtn.textContent = 'Preview'; previewBtn.classList.remove('active'); }
        feTa.focus();
      }
    }

    function feInsertWrap(prefix, suffix) {
      if (feInPreview) return;
      feTa.focus();
      var start = feTa.selectionStart;
      var end   = feTa.selectionEnd;
      var sel   = feTa.value.substring(start, end) || 'text';
      feTa.value = feTa.value.substring(0, start) + prefix + sel + suffix + feTa.value.substring(end);
      feTa.setSelectionRange(start + prefix.length, start + prefix.length + sel.length);
      feScheduleSave(); feUpdateStat();
    }

    function feInsertLinePrefix(prefix) {
      if (feInPreview) return;
      feTa.focus();
      var start     = feTa.selectionStart;
      var lineStart = feTa.value.lastIndexOf('\n', start - 1) + 1;
      feTa.value = feTa.value.substring(0, lineStart) + prefix + feTa.value.substring(lineStart);
      feTa.setSelectionRange(start + prefix.length, start + prefix.length);
      feScheduleSave(); feUpdateStat();
    }

    feToolbarEl.addEventListener('click', function (toolbarClickEvent) {
      var btn = toolbarClickEvent.target.closest('[data-a]');
      if (!btn) return;
      var action = btn.dataset.a;
      if (action === 'bold')         feInsertWrap('**', '**');
      else if (action === 'italic')  feInsertWrap('*', '*');
      else if (action === 'code')    feInsertWrap('`', '`');
      else if (action === 'hr')      feInsertWrap('\n---\n', '');
      else if (action === 'h1')      feInsertLinePrefix('# ');
      else if (action === 'h2')      feInsertLinePrefix('## ');
      else if (action === 'ul')      feInsertLinePrefix('- ');
      else if (action === 'ol')      feInsertLinePrefix('1. ');
      else if (action === 'quote')   feInsertLinePrefix('> ');
      else if (action === 'wrap-p')  feInsertWrap('<p>', '</p>');
      else if (action === 'wrap-div') feInsertWrap('<div>', '</div>');
      else if (action === 'wrap-b')  feInsertWrap('<b>', '</b>');
      else if (action === 'wrap-a')  feInsertWrap('<a href="">', '</a>');
      else if (action === 'wrap-h1') feInsertWrap('<h1>', '</h1>');
      else if (action === 'preview') feTogglePreview();
      else if (action === 'preview-html') {
        var htmlPrev = OS.createWindow('Preview - ' + feCurrentName, 500, 380,
          '<iframe style="width:100%;height:100%;border:none" sandbox="allow-same-origin"></iframe>');
        htmlPrev.el.querySelector('.window-body').classList.add('window-body-flex');
        htmlPrev.el.querySelector('iframe').srcdoc = feTa.value;
      }
      else if (action === 'prettify') {
        try { feTa.value = JSON.stringify(JSON.parse(feTa.value), null, 2); feScheduleSave(); feUpdateStat(); }
        catch (jsonErr) { OS.showNotification('JSON', 'Invalid JSON: ' + jsonErr.message); }
      }
      else if (action === 'minify') {
        try { feTa.value = JSON.stringify(JSON.parse(feTa.value)); feScheduleSave(); feUpdateStat(); }
        catch (jsonErr) { OS.showNotification('JSON', 'Invalid JSON: ' + jsonErr.message); }
      }
      else if (action === 'validate') {
        try { JSON.parse(feTa.value); OS.showNotification('JSON', '&#10003; Valid JSON'); }
        catch (jsonErr) { OS.showNotification('JSON', 'Invalid: ' + jsonErr.message); }
      }
      else if (action === 'datetime') feInsertWrap(new Date().toLocaleString(), '');
      else if (action === 'divider')  feInsertWrap('\n' + '─'.repeat(40) + '\n', '');
      else if (action === 'wrap-toggle') {
        feWrap = !feWrap;
        feTa.style.whiteSpace = feWrap ? 'pre-wrap' : 'pre';
        feTa.style.overflowX  = feWrap ? 'hidden' : 'auto';
        btn.classList.toggle('active', feWrap);
      }
    });

    // ── File type pill switcher ──
    fePillsEl.addEventListener('click', function (pillClickEvent) {
      var pill = pillClickEvent.target.closest('[data-ext]');
      if (!pill) return;
      var newExt  = pill.dataset.ext;
      var newName = feNameInput.value.trim() || feBase;
      if (!newName) return;
      var fullNewName = newName + '.' + newExt;
      if (fullNewName === feCurrentName) return;

      var parentRef = callerParentNode || getCurrentNode();
      if (parentRef && parentRef.children && parentRef.children[fullNewName] && fullNewName !== feCurrentName) {
        OS.showNotification('File Editor', '"' + fullNewName + '" already exists.');
        return;
      }

      if (parentRef && parentRef.children) {
        fileData.content = feTa.value;
        fileData.size    = feTa.value.length;
        parentRef.children[fullNewName] = fileData;
        delete parentRef.children[feCurrentName];
        feCurrentName = fullNewName;
        feExt = newExt;
        render();
      }

      // Update active pill
      fePillsEl.querySelectorAll('.fe-type-btn').forEach(function (p) {
        p.classList.toggle('active', p.dataset.ext === newExt);
      });

      // Rebuild toolbar for new type
      var newIsMd   = newExt === 'md';
      var newIsJson = newExt === 'json';
      var newIsHtml = newExt === 'html' || newExt === 'htm';
      if (newIsMd) {
        feToolbarEl.innerHTML = '<button class="fe-tb" data-a="bold"><b>B</b></button>' +
          '<button class="fe-tb" data-a="italic"><i>I</i></button>' +
          '<button class="fe-tb" data-a="h1">H1</button><button class="fe-tb" data-a="h2">H2</button>' +
          '<span class="fe-tb-sep"></span><button class="fe-tb" data-a="ul">• List</button>' +
          '<button class="fe-tb" data-a="ol">1. List</button><button class="fe-tb" data-a="code">`code`</button>' +
          '<button class="fe-tb" data-a="quote">" Quote</button><button class="fe-tb" data-a="hr">─ Rule</button>' +
          '<span class="fe-tb-sep"></span><button class="fe-tb fe-preview-btn" data-a="preview">Preview</button>';
      } else if (newIsJson) {
        feToolbarEl.innerHTML = '<button class="fe-tb" data-a="prettify">Format JSON</button>' +
          '<button class="fe-tb" data-a="minify">Minify</button><button class="fe-tb" data-a="validate">Validate</button>';
      } else if (newIsHtml) {
        feToolbarEl.innerHTML = '<button class="fe-tb fe-preview-btn" data-a="preview-html">Preview HTML</button>' +
          '<span class="fe-tb-sep"></span>' +
          '<button class="fe-tb" data-a="wrap-p">&lt;p&gt;</button><button class="fe-tb" data-a="wrap-div">&lt;div&gt;</button>' +
          '<button class="fe-tb" data-a="wrap-b">&lt;b&gt;</button><button class="fe-tb" data-a="wrap-a">&lt;a&gt;</button>' +
          '<button class="fe-tb" data-a="wrap-h1">&lt;h1&gt;</button>';
      } else {
        feToolbarEl.innerHTML = '<button class="fe-tb" data-a="datetime"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="3" width="14" height="12" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><rect x="1" y="3" width="14" height="4" rx="1" fill="#4a7acc"/><line x1="5" y1="1" x2="5" y2="5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/><line x1="11" y1="1" x2="11" y2="5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/><rect x="3" y="9" width="2" height="2" rx=".3" fill="#ccc"/><rect x="7" y="9" width="2" height="2" rx=".3" fill="#ccc"/><rect x="11" y="9" width="2" height="2" rx=".3" fill="#ccc"/></svg> Date/Time</button>' +
          '<button class="fe-tb" data-a="divider">─ Divider</button>' +
          '<button class="fe-tb" data-a="wrap-toggle">Wrap</button>';
      }
      feInPreview = false;
      feTa.style.display = 'block';
      fePreview.style.display = 'none';

      // Update window title
      var winTitle = editWindow.el.querySelector('.window-title');
      if (winTitle) winTitle.textContent = feCurrentName;
      feSaved.textContent = 'Renamed';
    });

    // ── Name input: apply rename on Enter ──
    feNameInput.addEventListener('keydown', function (nameKeyEvent) {
      if (nameKeyEvent.key !== 'Enter') return;
      nameKeyEvent.preventDefault();
      var newBase    = feNameInput.value.trim();
      if (!newBase) return;
      var currentExt = feCurrentName.lastIndexOf('.') >= 0
        ? feCurrentName.substring(feCurrentName.lastIndexOf('.') + 1)
        : '';
      var fullNewName = newBase + (currentExt ? '.' + currentExt : '');
      if (fullNewName === feCurrentName) return;
      var parentRef = callerParentNode || getCurrentNode();
      if (parentRef && parentRef.children) {
        if (parentRef.children[fullNewName]) { OS.showNotification('File Editor', '"' + fullNewName + '" already exists.'); return; }
        fileData.content = feTa.value;
        fileData.size    = feTa.value.length;
        parentRef.children[fullNewName] = fileData;
        delete parentRef.children[feCurrentName];
        feCurrentName = fullNewName;
        render();
        var winTitle = editWindow.el.querySelector('.window-title');
        if (winTitle) winTitle.textContent = feCurrentName;
        feSaved.textContent = 'Renamed';
      }
    });

    feTa.addEventListener('input', function () { feScheduleSave(); feUpdateStat(); });
    feTa.addEventListener('keydown', function (keydownEvent) {
      if (keydownEvent.key === 'Tab') {
        keydownEvent.preventDefault();
        feInsertWrap('  ', '');
      }
    });
    feTa.addEventListener('click', feUpdateStat);
    feTa.addEventListener('keyup',  feUpdateStat);
    feTa.focus();
    feUpdateStat();
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
  function isInRecycleBin() {
    return currentPath.length === 2 && currentPath[1] === 'Recycle Bin';
  }

  function restoreFile(fileName, fileData) {
    var originalPath = fileData._originalPath || 'C:\\My Documents';
    var pathParts = originalPath.split('\\');
    var targetNode = OS.fileSystem;
    for (var ri = 0; ri < pathParts.length; ri++) {
      targetNode = ri === 0 ? targetNode[pathParts[ri]] : (targetNode.children ? targetNode.children[pathParts[ri]] : null);
      if (!targetNode) break;
    }
    if (!targetNode || !targetNode.children) targetNode = OS.fileSystem['C:'].children['My Documents'];
    var restoreName = fileName;
    while (targetNode.children[restoreName]) restoreName = restoreName.replace(/(\.[^.]+)?$/, ' (restored)$1');
    delete fileData._originalPath;
    targetNode.children[restoreName] = fileData;
    var recycleBin = OS.recycleBin();
    delete recycleBin.children[fileName];
    OS.showNotification('Recycle Bin', 'Restored ' + fileName + ' to ' + originalPath);
    render();
  }

  // ── Right-click on file list or items ──
  function showFileContextMenu(mouseX, mouseY, selectedName, selectedChild) {
    var parentNode = getCurrentNode();
    var menuItems = [];
    var inBin = isInRecycleBin();

    if (selectedName) {
      var isFolder = selectedChild.type === 'folder';

      if (inBin) {
        var origLocation = selectedChild._originalPath || 'Unknown';
        menuItems.push({ label: 'Restore to ' + origLocation, action: function () { restoreFile(selectedName, selectedChild); } });
        menuItems.push('---');
        menuItems.push({ label: 'Delete Permanently', action: function () {
          OS.confirm('Permanently delete "' + selectedName + '"?', function (yes) {
            if (yes) { delete parentNode.children[selectedName]; render(); }
          });
        }});
      } else {
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
          OS.confirm('Move "' + selectedName + '" to Recycle Bin?', function (yes) {
            if (yes) {
              var recycleBin = OS.recycleBin();
              if (recycleBin && recycleBin.children) {
                var recycleName = selectedName;
                while (recycleBin.children[recycleName]) recycleName = recycleName.replace(/(\.[^.]+)?$/, ' (2)$1');
                var itemToRecycle = parentNode.children[selectedName];
                itemToRecycle._originalPath = currentPath.join('\\');
                recycleBin.children[recycleName] = itemToRecycle;
              }
              delete parentNode.children[selectedName];
              render();
              OS.showNotification('Recycle Bin', selectedName + ' moved to Recycle Bin');
            }
          });
        }});
      }
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
        OS.prompt('File name:', 'Untitled.txt', function (newFileName) {
          if (newFileName && !parentNode.children[newFileName]) {
            var newFileData = { type: 'file', size: 0, modified: todayString(), content: '' };
            parentNode.children[newFileName] = newFileData;
            render();
            openFile(newFileName, newFileData, parentNode);
          }
        });
      }});
      menuItems.push('---');
      menuItems.push({ label: 'Upload Files...', action: function () { hiddenFileInput.click(); } });
      menuItems.push('---');
      menuItems.push({ label: 'Refresh', action: function () { render(); } });

      if (inBin) {
        var binItemCount = Object.keys(parentNode.children || {}).length;
        menuItems.push('---');
        menuItems.push({ label: 'Empty Recycle Bin (' + binItemCount + ')', disabled: binItemCount === 0, action: function () {
          OS.confirm('Permanently delete ' + binItemCount + ' item(s)?', function (yes) {
            if (yes) { parentNode.children = {}; render(); OS.showNotification('Recycle Bin', 'Emptied'); }
          });
        }});
        if (binItemCount > 0) {
          menuItems.push({ label: 'Restore All', action: function () {
            var itemNames = Object.keys(parentNode.children);
            itemNames.forEach(function (itemName) { restoreFile(itemName, parentNode.children[itemName]); });
          }});
        }
      }
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
        else openFile(name, child, node);
      });

      row.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        listElement.querySelectorAll('.file-item.selected').forEach(function (el) { el.classList.remove('selected'); });
        row.classList.add('selected');
        showFileContextMenu(e.clientX, e.clientY, name, child);
      });

      // ── Drag and drop ──
      row.setAttribute('draggable', 'true');
      row.addEventListener('dragstart', function (dragEvent) {
        dragEvent.dataTransfer.setData('text/plain', name);
        dragEvent.dataTransfer.effectAllowed = 'move';
        row.style.opacity = '0.5';
      });
      row.addEventListener('dragend', function () { row.style.opacity = '1'; });

      if (isFolder) {
        row.addEventListener('dragover', function (dragEvent) {
          dragEvent.preventDefault();
          dragEvent.dataTransfer.dropEffect = 'move';
          row.style.background = '#1a4a8a';
          row.style.color = '#fff';
        });
        row.addEventListener('dragleave', function () {
          row.style.background = '';
          row.style.color = '';
        });
        row.addEventListener('drop', function (dragEvent) {
          dragEvent.preventDefault();
          row.style.background = '';
          row.style.color = '';
          var draggedFileName = dragEvent.dataTransfer.getData('text/plain');
          if (!draggedFileName || draggedFileName === name) return;
          var parentNode = getCurrentNode();
          if (!parentNode || !parentNode.children || !parentNode.children[draggedFileName]) return;
          var targetFolder = parentNode.children[name];
          if (!targetFolder || targetFolder.type !== 'folder') return;
          if (targetFolder.children[draggedFileName]) {
            OS.showNotification('File Manager', 'A file with that name already exists in ' + name);
            return;
          }
          targetFolder.children[draggedFileName] = parentNode.children[draggedFileName];
          delete parentNode.children[draggedFileName];
          render();
          OS.showNotification('File Manager', 'Moved ' + draggedFileName + ' into ' + name);
        });
      }

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

  function executePipeline(fullCommand) {
    var pipeSegments = fullCommand.split('|').map(function (s) { return s.trim(); });
    if (pipeSegments.length === 1) {
      runCommand(pipeSegments[0], null);
      return;
    }
    // Capture output from first command
    var capturedLines = [];
    var originalAddLine = addLine;
    addLine = function (text) { capturedLines.push(text); };
    runCommand(pipeSegments[0], null);
    addLine = originalAddLine;
    var pipedOutput = capturedLines.join('\n');
    // Feed into each subsequent command
    for (var pipeIdx = 1; pipeIdx < pipeSegments.length; pipeIdx++) {
      capturedLines = [];
      if (pipeIdx < pipeSegments.length - 1) {
        addLine = function (text) { capturedLines.push(text); };
      }
      runCommand(pipeSegments[pipeIdx], pipedOutput);
      if (pipeIdx < pipeSegments.length - 1) {
        addLine = originalAddLine;
        pipedOutput = capturedLines.join('\n');
      }
    }
  }

  function runCommand(rawCmd, pipedInput) {
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
      addLine('  emptybin           Empty the Recycle Bin');
      addLine('  restore <name>     Restore file from Recycle Bin');
      addLine('  save               Save filesystem to localStorage');
      addLine('  load               Load filesystem from localStorage');
      addLine('  export [file]      Download filesystem as .json');
      addLine('  import             Load filesystem from a .json file');
      addLine('  reset              Reset filesystem to factory defaults');
      addLine('  write <file> <txt> Write text content to a file');
      addLine('  grep <term>        Filter piped input (use with |)');
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
      var recycleBinNode = OS.recycleBin();
      if (recycleBinNode && recycleBinNode.children) {
        var rName = argString;
        while (recycleBinNode.children[rName]) rName = rName.replace(/(\.[^.]+)?$/, ' (2)$1');
        recycleBinNode.children[rName] = delParent.children[argString];
      }
      delete delParent.children[argString];
      addLine('Moved to Recycle Bin.');
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

    case 'emptybin':
      var emptyBinNode = OS.recycleBin();
      if (!emptyBinNode) { addLine('Recycle Bin not found.', 'error'); break; }
      var binCount = Object.keys(emptyBinNode.children || {}).length;
      if (binCount === 0) { addLine('Recycle Bin is already empty.'); break; }
      OS.confirm('Permanently delete ' + binCount + ' item(s) from Recycle Bin?', function (yes) {
        if (yes) {
          emptyBinNode.children = {};
          addLine('Recycle Bin emptied. ' + binCount + ' item(s) permanently deleted.', 'success');
          terminalBody.scrollTop = terminalBody.scrollHeight;
        }
      });
      break;

    case 'restore':
      if (!argString) { addLine('Usage: restore <filename>', 'error'); break; }
      var restoreBin = OS.recycleBin();
      if (!restoreBin || !restoreBin.children || !restoreBin.children[argString]) { addLine('Not found in Recycle Bin: ' + argString, 'error'); break; }
      var restoreTarget = resolveNode(currentDirectory);
      if (!restoreTarget || !restoreTarget.children) { addLine('Cannot restore to current directory.', 'error'); break; }
      if (restoreTarget.children[argString]) { addLine('A file with that name already exists here.', 'error'); break; }
      restoreTarget.children[argString] = restoreBin.children[argString];
      delete restoreBin.children[argString];
      addLine('Restored ' + argString + ' to ' + currentDirectory.join('\\'));
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
          addLine('Reloading...');
          terminalBody.scrollTop = terminalBody.scrollHeight;
          setTimeout(function () { location.reload(); }, 500);
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

    case 'write':
      if (args.length < 2) { addLine('Usage: write <filename> <content...>', 'error'); break; }
      var writeFileName = args[0];
      var writeContent = argString.substring(argString.indexOf(' ') + 1);
      var writeParent = resolveNode(currentDirectory);
      if (!writeParent || !writeParent.children) { addLine('Cannot write to current directory.', 'error'); break; }
      var writeNow = new Date();
      writeParent.children[writeFileName] = {
        type: 'file',
        size: writeContent.length,
        modified: writeNow.toISOString().slice(0, 10),
        content: writeContent
      };
      addLine('Wrote ' + writeContent.length + ' bytes to ' + writeFileName);
      break;

    case 'grep':
      if (!argString) { addLine('Usage: grep <term> (use with pipe: cat file | grep word)', 'error'); break; }
      if (typeof pipedInput === 'string') {
        var grepTerm = argString.toLowerCase();
        var grepLines = pipedInput.split('\n');
        var matchedLines = grepLines.filter(function (line) { return line.toLowerCase().indexOf(grepTerm) >= 0; });
        if (matchedLines.length > 0) {
          matchedLines.forEach(function (line) { addLine(line); });
        } else {
          addLine('No matches found for: ' + argString);
        }
      } else {
        addLine('grep requires piped input. Example: cat file.txt | grep word', 'error');
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
      executePipeline(cmd);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var currentText = input.value;
      // Split into command and args
      var spaceIndex = currentText.lastIndexOf(' ');
      var prefix = spaceIndex >= 0 ? currentText.substring(spaceIndex + 1) : currentText;
      var beforePrefix = spaceIndex >= 0 ? currentText.substring(0, spaceIndex + 1) : '';

      // Get the current directory contents for matching
      var dirNode = resolveNode(currentDirectory);
      if (dirNode && dirNode.children) {
        var matchingNames = Object.keys(dirNode.children).filter(function (entryName) {
          return entryName.toLowerCase().indexOf(prefix.toLowerCase()) === 0;
        });
        if (matchingNames.length === 1) {
          input.value = beforePrefix + matchingNames[0];
        } else if (matchingNames.length > 1) {
          addLine(getPromptText() + currentText);
          addLine(matchingNames.join('  '));
          terminalBody.scrollTop = terminalBody.scrollHeight;
        }
      }
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

  // ── Shared CSS for all Mini:// pages ──
  var mcss = '* {margin:0;padding:0;box-sizing:border-box} body{font-family:Tahoma,Geneva,sans-serif;font-size:12px;background:#dce8fa;color:#111} a{color:#1a5ccc;cursor:pointer;text-decoration:none} a:hover{text-decoration:underline} .hdr{background:linear-gradient(180deg,#2e6ad4,#1848a8);padding:12px 20px;display:flex;align-items:center;gap:10px} .hdr-logo{color:#fff;font-size:20px;font-weight:700;letter-spacing:1px} .hdr-logo em{color:#9dd4ff;font-style:normal} .hdr-tag{color:#7abcee;font-size:10px} .mnav{background:#122a5a;display:flex;padding:0 6px} .mnav a{display:inline-block;padding:6px 14px;font-size:11px;color:#a8c8f0;cursor:pointer;transition:background .1s} .mnav a:hover{background:rgba(255,255,255,.12);color:#fff;text-decoration:none} .mnav a.on{color:#fff;font-weight:700;border-bottom:2px solid #5ab0ff} .body{padding:14px;max-width:820px;margin:0 auto} .card{background:#fff;border:1px solid #b8d4f0;border-radius:4px;padding:14px;margin-bottom:12px} .card h2{font-size:14px;color:#1a3a7a;padding-bottom:8px;border-bottom:1px solid #d8eaff;margin-bottom:12px} .card h3{font-size:12px;color:#1a3a7a;margin-bottom:6px} .card p{line-height:1.6;color:#333;margin-bottom:8px} .card ul{padding-left:18px} .card li{margin-bottom:4px;line-height:1.55} .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px} .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px} .qbtn{background:linear-gradient(180deg,#f4f8ff,#e0ecff);border:1px solid #b0ccf0;border-radius:4px;padding:12px 8px;cursor:pointer;text-align:center;transition:background .15s} .qbtn:hover{background:linear-gradient(180deg,#e0ecff,#cce0ff)} .qbtn .ico{font-size:22px;display:block;margin-bottom:4px} .qbtn .lbl{font-size:11px;font-weight:700;color:#1a3a7a} .qbtn .sub{font-size:9px;color:#666;margin-top:2px} .lrow{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #eef2ff} .lrow:last-child{border-bottom:none} .lrow .ico{font-size:16px;flex-shrink:0} .lrow .info{flex:1} .lrow .info strong{display:block;font-size:11px;color:#111} .lrow .info small{color:#666;font-size:10px} .badge{display:inline-block;background:#1a3a7a;color:#fff;border-radius:8px;padding:1px 7px;font-size:9px;margin:2px 2px 2px 0} .tip{background:#fffce8;border:1px solid #d4c840;border-radius:4px;padding:10px;font-size:11px;color:#555} .tip strong{color:#888800} .two{display:grid;grid-template-columns:1fr 230px;gap:12px} .ftr{text-align:center;padding:10px;font-size:10px;color:#999;background:#e4eefc;border-top:1px solid #c0d8f0} kbd{background:#e4e0d4;border:1px solid #999;border-bottom:2px solid #888;border-radius:3px;padding:1px 5px;font-size:10px} .app-item{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #eef2ff} .app-item:last-child{border-bottom:none} .app-ico{font-size:26px;flex-shrink:0;width:36px;text-align:center} .app-name{font-weight:700;font-size:12px;color:#1a3a7a} .app-desc{font-size:11px;color:#555;margin-top:2px;line-height:1.5} .cat-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;margin:12px 0 4px} code{background:#f0f0f0;border:1px solid #ddd;border-radius:2px;padding:0 4px;font-size:11px}';

  // postMessage script injected in every mini page
  var mjs = '<scr'+'ipt>function go(p){window.parent.postMessage({miniNav:p},"*")}function ext(u){window.parent.postMessage({externalNav:u},"*")}<'+'/script>';

  function mnav(active) {
    var tabs = [['home','<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M8 2L1 8h2v6h4v-3.5h2V14h4V8h2z" fill="#3a7acc"/><rect x="6" y="10.5" width="4" height="3.5" rx=".5" fill="#1e56a0"/></svg> Home'],['about','<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#4a8acc"/><text x="8" y="12.5" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="serif">i</text></svg> About'],['apps','<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="1" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="9" y="1" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="1" y="9" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#4a7acc"/></svg> Apps'],['web','<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="6.5" fill="#4a9ade" stroke="#2a6aaa" stroke-width=".7"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="3" y1="5" x2="13" y2="5" stroke="#fff" stroke-width=".5" opacity=".4"/><line x1="3" y1="11" x2="13" y2="11" stroke="#fff" stroke-width=".5" opacity=".4"/></svg> Web'],['help','<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#e8a020"/><text x="8" y="12" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">?</text></svg> Help']];
    return '<div class="mnav">' + tabs.map(function(t){
      return '<a onclick="go(\''+t[0]+'\')" class="'+(t[0]===active?'on':'')+'">' + t[1] + '</a>';
    }).join('') + '</div>';
  }

  function wrap(active, body) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + mcss + '</style>' + mjs + '</head><body>' +
      '<div class="hdr"><div class="hdr-logo">Mini <em>Browser</em></div><div class="hdr-tag">Mini OS</div></div>' +
      mnav(active) + body + '</body></html>';
  }

  // ── Page: Home ──
  var pgHome = wrap('home',
    '<div class="body"><div class="two">' +
      '<div>' +
        '<div class="card"><h2><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M8 2L1 8h2v6h4v-3.5h2V14h4V8h2z" fill="#3a7acc"/><rect x="6" y="10.5" width="4" height="3.5" rx=".5" fill="#1e56a0"/></svg> Welcome to Mini Browser</h2>' +
          '<p>Your built-in browser for Mini OS. Enter any web address in the bar above, or explore Mini OS pages using the tabs.</p>' +
          '<h3>Quick Links</h3><br>' +
          '<div class="g3">' +
            '<div class="qbtn" onclick="ext(\'https://en.m.wikipedia.org\')"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M8 3v10c-2-1-4-1.5-6-1.5V3c2 0 4 .5 6 1.5z" fill="#7a5a2a"/><path d="M8 3v10c2-1 4-1.5 6-1.5V3c-2 0-4 .5-6 1.5z" fill="#a07840"/><line x1="8" y1="3" x2="8" y2="13" stroke="#5a3a1a" stroke-width=".8"/></svg></span><span class="lbl">Wikipedia</span><span class="sub">Encyclopedia</span></div>' +
            '<div class="qbtn" onclick="ext(\'https://www.google.com\')"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="#555" stroke-width="1.5"/><line x1="10" y1="10" x2="14" y2="14" stroke="#555" stroke-width="2" stroke-linecap="round"/></svg></span><span class="lbl">Google</span><span class="sub">Search</span></div>' +
            '<div class="qbtn" onclick="ext(\'https://github.com\')"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#24292e"/><path d="M8 3.5a4.5 4.5 0 00-1.5 8.75c.23.04.31-.1.31-.22v-.8c-1.25.27-1.52-.6-1.52-.6-.2-.52-.5-.66-.5-.66-.41-.28.03-.27.03-.27.46.03.7.47.7.47.4.69 1.06.49 1.32.37.04-.29.16-.49.28-.6-.99-.11-2.04-.5-2.04-2.2 0-.49.17-.89.46-1.2-.05-.12-.2-.57.04-1.18 0 0 .38-.12 1.23.46a4.3 4.3 0 012.24 0c.85-.58 1.23-.46 1.23-.46.24.61.09 1.06.04 1.18.29.31.46.71.46 1.2 0 1.71-1.05 2.09-2.05 2.2.16.14.3.41.3.83v1.22c0 .12.08.27.32.22A4.5 4.5 0 008 3.5z" fill="#fff"/></svg></span><span class="lbl">GitHub</span><span class="sub">Code</span></div>' +
            '<div class="qbtn" onclick="ext(\'https://developer.mozilla.org\')"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="2" width="9" height="12" rx="1" fill="#fff" stroke="#666" stroke-width=".8"/><rect x="5" y="4" width="9" height="12" rx="1" fill="#e8e8e8" stroke="#888" stroke-width=".7"/><line x1="7" y1="7" x2="12" y2="7" stroke="#aaa" stroke-width=".8"/><line x1="7" y1="9.5" x2="12" y2="9.5" stroke="#aaa" stroke-width=".8"/></svg></span><span class="lbl">MDN</span><span class="sub">Web Docs</span></div>' +
            '<div class="qbtn" onclick="ext(\'https://news.ycombinator.com\')"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#ff6600"/><text x="8" y="12" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Y</text></svg></span><span class="lbl">Hacker News</span><span class="sub">Tech</span></div>' +
            '<div class="qbtn" onclick="ext(\'https://www.youtube.com\')"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#cc0000"/><polygon points="6,5 12,8 6,11" fill="#fff"/></svg></span><span class="lbl">YouTube</span><span class="sub">Videos</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<div class="card"><h2>Mini Pages</h2>' +
          '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M8 2L1 8h2v6h4v-3.5h2V14h4V8h2z" fill="#3a7acc"/></svg></span><div class="info"><strong><a onclick="go(\'home\')">Mini/Home</a></strong><small>This page</small></div></div>' +
          '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#4a8acc"/><text x="8" y="12.5" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="serif">i</text></svg></span><div class="info"><strong><a onclick="go(\'about\')">Mini/About</a></strong><small>About Mini OS</small></div></div>' +
          '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="1" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="9" y="1" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="1" y="9" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#4a7acc"/></svg></span><div class="info"><strong><a onclick="go(\'apps\')">Mini/Apps</a></strong><small>All applications</small></div></div>' +
          '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="6.5" fill="#4a9ade" stroke="#2a6aaa" stroke-width=".7"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#fff" stroke-width=".6" opacity=".7"/></svg></span><div class="info"><strong><a onclick="go(\'web\')">Mini/Web</a></strong><small>Web bookmarks</small></div></div>' +
          '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#e8a020"/><text x="8" y="12" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">?</text></svg></span><div class="info"><strong><a onclick="go(\'help\')">Mini/Help</a></strong><small>Tips &amp; shortcuts</small></div></div>' +
        '</div>' +
        '<div class="tip"><strong>Tip:</strong> Type <kbd>Mini/Apps</kbd> in the address bar to jump to any Mini page.</div>' +
      '</div>' +
    '</div></div>' +
    '<div class="ftr">Mini Browser &bull; Mini OS v1.0</div>');

  // ── Page: About ──
  var pgAbout = wrap('about',
    '<div class="body">' +
      '<div class="card"><h2><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#4a8acc"/><text x="8" y="12.5" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="serif">i</text></svg> About Mini OS</h2>' +
        '<p>Mini OS is a fully functional desktop operating system that runs entirely in your browser. No server required — pure HTML, CSS and JavaScript.</p>' +
        '<div class="g2">' +
          '<div><h3>System Info</h3><br><ul>' +
            '<li><strong>Name:</strong> Mini OS</li>' +
            '<li><strong>Version:</strong> 1.0 (Build 2600)</li>' +
            '<li><strong>Type:</strong> Browser-based OS</li>' +
            '<li><strong>Shell:</strong> Vanilla JS / HTML</li>' +
            '<li><strong>Storage:</strong> LocalStorage</li>' +
          '</ul></div>' +
          '<div><h3>Features</h3><br><ul>' +
            '<li>Multi-window desktop</li>' +
            '<li>Per-user profiles &amp; sessions</li>' +
            '<li>Persistent file system</li>' +
            '<li>Multi-note Notepad + Markdown</li>' +
            '<li>Code Editor with syntax highlight</li>' +
            '<li>Terminal with 30+ commands</li>' +
            '<li>Paint, Calculator, Minesweeper</li>' +
          '</ul></div>' +
        '</div>' +
      '</div>' +
      '<div class="card"><h2>Built With</h2>' +
        '<p>Mini OS uses zero external dependencies — just the web platform.</p>' +
        '<span class="badge">HTML5</span><span class="badge">CSS3</span><span class="badge">Vanilla JS</span><span class="badge">LocalStorage</span><span class="badge">Canvas API</span><span class="badge">IndexedDB</span>' +
      '</div>' +
      '<div class="card"><h2>Credits</h2>' +
        '<p>Built as a demonstration of what the modern browser platform can do without any frameworks or build tools beyond a simple dev server.</p>' +
        '<p><a onclick="go(\'home\')">← Back to Home</a></p>' +
      '</div>' +
    '</div>' +
    '<div class="ftr">Mini Browser &bull; Mini OS v1.0</div>');

  // ── Page: Apps ──
  function appRow(ico, name, desc) {
    return '<div class="app-item"><div class="app-ico">' + ico + '</div><div><div class="app-name">' + name + '</div><div class="app-desc">' + desc + '</div></div></div>';
  }
  var pgApps = wrap('apps',
    '<div class="body">' +
      '<div class="card"><h2><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="1" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="9" y="1" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="1" y="9" width="6" height="6" rx="1" fill="#4a7acc"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#4a7acc"/></svg> Mini OS Applications</h2>' +
        '<p>All built-in apps. Open them from desktop icons or the Start Menu.</p>' +
        '<div class="cat-lbl">Productivity</div>' +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="3" y="1" width="10" height="14" rx="1" fill="#fff" stroke="#6685a0" stroke-width=".8"/><line x1="5" y1="5" x2="11" y2="5" stroke="#b0c4de" stroke-width=".7"/><line x1="5" y1="7" x2="11" y2="7" stroke="#b0c4de" stroke-width=".7"/><line x1="5" y1="9" x2="9" y2="9" stroke="#b0c4de" stroke-width=".7"/><rect x="2" y="1" width="2" height="14" rx=".5" fill="#4a7ebb"/></svg>','Notepad','Multi-note editor with sidebar, Markdown preview, formatting toolbar, find bar, and auto-save to LocalStorage.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M1 5V13a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3H2a1 1 0 00-1 1z" fill="#f5d76e" stroke="#c8a415" stroke-width=".7"/></svg>','My Documents','Full file explorer with folders, drag-and-drop, upload, copy/cut/paste, Recycle Bin, and right-click menus.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="2" width="14" height="12" rx="1.5" fill="#1e1e1e" stroke="#555" stroke-width=".8"/><text x="8" y="11" text-anchor="middle" fill="#569cd6" font-size="6" font-family="monospace">&lt;/&gt;</text></svg>','Code Editor','Write JavaScript, HTML or CSS with syntax highlighting. Run JS against the OS or preview HTML live.') +
        '<div class="cat-lbl">Internet</div>' +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="6.5" fill="#4a9ade" stroke="#2a6aaa" stroke-width=".7"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="3" y1="5" x2="13" y2="5" stroke="#fff" stroke-width=".5" opacity=".4"/><line x1="3" y1="11" x2="13" y2="11" stroke="#fff" stroke-width=".5" opacity=".4"/></svg>','Internet','This browser. Supports any https:// URL plus internal Mini/ pages.') +
        '<div class="cat-lbl">Utilities</div>' +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="2" width="14" height="12" rx="1.5" fill="#0c0c0c" stroke="#555" stroke-width=".8"/><polyline points="3,6 6,8 3,10" fill="none" stroke="#c0c0c0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><line x1="7" y1="10" x2="12" y2="10" stroke="#c0c0c0" stroke-width="1.2" stroke-linecap="round"/></svg>','Command Prompt','Terminal with 30+ commands: dir, cd, tree, cat, mkdir, del, grep, pipe (|), tab-complete, and more.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="3" y="1" width="10" height="14" rx="1.5" fill="#c0cfe0" stroke="#5a7a9a" stroke-width=".8"/><rect x="4.5" y="2.5" width="7" height="3" rx=".5" fill="#d4e8d4"/><rect x="4.5" y="7" width="2" height="1.5" rx=".3" fill="#e8e8e8"/><rect x="7" y="7" width="2" height="1.5" rx=".3" fill="#e8e8e8"/><rect x="9.5" y="7" width="2" height="1.5" rx=".3" fill="#e8e8e8"/><rect x="4.5" y="10" width="2" height="1.5" rx=".3" fill="#e8e8e8"/><rect x="7" y="10" width="2" height="1.5" rx=".3" fill="#e8e8e8"/><rect x="9.5" y="10" width="2" height="1.5" rx=".3" fill="#6a9ada"/></svg>','Calculator','Standard four-function calculator with percent and sign-flip.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="6.5" fill="#f0f0f0" stroke="#666" stroke-width=".8"/><circle cx="8" cy="8" r="5.5" fill="#fff" stroke="#ddd" stroke-width=".4"/><line x1="8" y1="8" x2="8" y2="4" stroke="#333" stroke-width="1.2" stroke-linecap="round"/><line x1="8" y1="8" x2="11" y2="10" stroke="#555" stroke-width=".9" stroke-linecap="round"/><circle cx="8" cy="8" r="1" fill="#333"/></svg>','Clock','Live analog + digital clock with full date display.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="2" width="14" height="12" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><circle cx="5" cy="7" r="2" fill="#ff4444"/><circle cx="10" cy="6" r="2" fill="#44aa44"/><path d="M3 12 Q7 7 11 11" fill="none" stroke="#dd8800" stroke-width="1.5" stroke-linecap="round"/></svg>','Paint','Freehand canvas drawing with colour palette and brush size control.') +
        '<div class="cat-lbl">Games &amp; System</div>' +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8.5" r="4.5" fill="#333"/><line x1="8" y1="2" x2="8" y2="4" stroke="#333" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="13" x2="8" y2="15" stroke="#333" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="8.5" x2="4" y2="8.5" stroke="#333" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="8.5" x2="14" y2="8.5" stroke="#333" stroke-width="1.5" stroke-linecap="round"/><line x1="3.5" y1="4" x2="5" y2="5.5" stroke="#333" stroke-width="1.2" stroke-linecap="round"/><line x1="12.5" y1="4" x2="11" y2="5.5" stroke="#333" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="8.5" r="2" fill="#ff4444"/></svg>','Minesweeper','Classic 9×9 Minesweeper with flag support and timer.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="2.5" fill="none" stroke="#555" stroke-width="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M11.53 4.47l-1.42 1.42M4.47 11.53l-1.42 1.42" stroke="#555" stroke-width="1.2" stroke-linecap="round"/></svg>','Control Panel','Wallpaper presets, custom image/colour wallpapers, and system info.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="#555" stroke-width="1.5"/><line x1="10" y1="10" x2="14" y2="14" stroke="#555" stroke-width="2" stroke-linecap="round"/></svg>','Find Files','Search the entire virtual filesystem by filename.') +
        appRow('<svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="4" y="2" width="8" height="12" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><rect x="6" y="1" width="4" height="3" rx=".5" fill="#ddd" stroke="#888" stroke-width=".6"/><line x1="6" y1="7" x2="10" y2="7" stroke="#ccc" stroke-width=".8"/><line x1="6" y1="9.5" x2="10" y2="9.5" stroke="#ccc" stroke-width=".8"/><line x1="6" y1="12" x2="9" y2="12" stroke="#ccc" stroke-width=".8"/></svg>','Clipboard Manager','View and manage the file cut/copy history.') +
      '</div>' +
    '</div>' +
    '<div class="ftr">Mini Browser &bull; Mini OS v1.0</div>');

  // ── Page: Web ──
  var pgWeb = wrap('web',
    '<div class="body">' +
      '<div class="card"><h2><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="6.5" fill="#4a9ade" stroke="#2a6aaa" stroke-width=".7"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#fff" stroke-width=".6" opacity=".7"/><line x1="3" y1="5" x2="13" y2="5" stroke="#fff" stroke-width=".5" opacity=".4"/><line x1="3" y1="11" x2="13" y2="11" stroke="#fff" stroke-width=".5" opacity=".4"/></svg> Web Bookmarks</h2><p>Click any link to open it in this browser.</p>' +
        '<div class="g2">' +
          '<div><h3>Reference &amp; Docs</h3><br>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="1" y="2" width="9" height="12" rx="1" fill="#fff" stroke="#666" stroke-width=".8"/><rect x="5" y="4" width="9" height="12" rx="1" fill="#e8e8e8" stroke="#888" stroke-width=".7"/><line x1="7" y1="7" x2="12" y2="7" stroke="#aaa" stroke-width=".8"/><line x1="7" y1="9.5" x2="12" y2="9.5" stroke="#aaa" stroke-width=".8"/></svg></span><div class="info"><strong><a onclick="ext(\'https://developer.mozilla.org\')">MDN Web Docs</a></strong><small>HTML, CSS, JS reference</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M8 3v10c-2-1-4-1.5-6-1.5V3c2 0 4 .5 6 1.5z" fill="#7a5a2a"/><path d="M8 3v10c2-1 4-1.5 6-1.5V3c-2 0-4 .5-6 1.5z" fill="#a07840"/><line x1="8" y1="3" x2="8" y2="13" stroke="#5a3a1a" stroke-width=".8"/></svg></span><div class="info"><strong><a onclick="ext(\'https://en.m.wikipedia.org\')">Wikipedia</a></strong><small>Free encyclopedia</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M12.2 1.8a3 3 0 00-3.9 4L3 11a1.5 1.5 0 002.1 2.1l5.2-5.3a3 3 0 004-3.9l-1.8 1.8-1.4-1.4 1.8-1.8-.7-.7z" fill="#888"/></svg></span><div class="info"><strong><a onclick="ext(\'https://caniuse.com\')">Can I Use</a></strong><small>Browser support tables</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><rect x="3" y="1" width="10" height="14" rx="1" fill="#fff" stroke="#6685a0" stroke-width=".8"/><line x1="5" y1="5" x2="11" y2="5" stroke="#b0c4de" stroke-width=".7"/><line x1="5" y1="7" x2="11" y2="7" stroke="#b0c4de" stroke-width=".7"/><rect x="2" y="1" width="2" height="14" rx=".5" fill="#4a7ebb"/></svg></span><div class="info"><strong><a onclick="ext(\'https://devdocs.io\')">DevDocs</a></strong><small>API documentation</small></div></div>' +
          '</div>' +
          '<div><h3>Search</h3><br>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="#555" stroke-width="1.5"/><line x1="10" y1="10" x2="14" y2="14" stroke="#555" stroke-width="2" stroke-linecap="round"/></svg></span><div class="info"><strong><a onclick="ext(\'https://www.google.com\')">Google</a></strong><small>Web search</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><ellipse cx="8" cy="11" rx="5.5" ry="3.5" fill="#de5733"/><circle cx="9" cy="6.5" r="3.5" fill="#de5733"/><ellipse cx="7.5" cy="7" rx="2" ry="1.2" fill="#f5a800"/><circle cx="11" cy="5.5" r=".8" fill="#1a1a1a"/></svg></span><div class="info"><strong><a onclick="ext(\'https://duckduckgo.com\')">DuckDuckGo</a></strong><small>Private search</small></div></div>' +
          '</div>' +
          '<div><h3>Development</h3><br>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#24292e"/><path d="M8 3.5a4.5 4.5 0 00-1.5 8.75c.23.04.31-.1.31-.22v-.8c-1.25.27-1.52-.6-1.52-.6-.2-.52-.5-.66-.5-.66-.41-.28.03-.27.03-.27.46.03.7.47.7.47.4.69 1.06.49 1.32.37.04-.29.16-.49.28-.6-.99-.11-2.04-.5-2.04-2.2 0-.49.17-.89.46-1.2-.05-.12-.2-.57.04-1.18 0 0 .38-.12 1.23.46a4.3 4.3 0 012.24 0c.85-.58 1.23-.46 1.23-.46.24.61.09 1.06.04 1.18.29.31.46.71.46 1.2 0 1.71-1.05 2.09-2.05 2.2.16.14.3.41.3.83v1.22c0 .12.08.27.32.22A4.5 4.5 0 008 3.5z" fill="#fff"/></svg></span><div class="info"><strong><a onclick="ext(\'https://github.com\')">GitHub</a></strong><small>Code hosting</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#ff6600"/><text x="8" y="12" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Y</text></svg></span><div class="info"><strong><a onclick="ext(\'https://news.ycombinator.com\')">Hacker News</a></strong><small>Tech community</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><path d="M2 2h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z" fill="#e44"/><line x1="5" y1="6" x2="11" y2="6" stroke="#fff" stroke-width=".9"/><line x1="5" y1="8.5" x2="9" y2="8.5" stroke="#fff" stroke-width=".9"/></svg></span><div class="info"><strong><a onclick="ext(\'https://stackoverflow.com\')">Stack Overflow</a></strong><small>Q&amp;A for developers</small></div></div>' +
          '</div>' +
          '<div><h3>Media</h3><br>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#cc0000"/><polygon points="6,5 12,8 6,11" fill="#fff"/></svg></span><div class="info"><strong><a onclick="ext(\'https://www.youtube.com\')">YouTube</a></strong><small>Video platform</small></div></div>' +
            '<div class="lrow"><span class="ico"><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="6.5" fill="#4aade8" stroke="#2a7aaa" stroke-width=".7"/><path d="M3.5 5.5c.8 0 1.5.8 2.5 0s.8-1.8 1.8-.8 0 2.8.8 2.8" fill="none" stroke="#4a8a30" stroke-width="1.5"/><path d="M3 10c.8 1 1.8 0 2.8 1s.8 1.8 1.8.8" fill="none" stroke="#4a8a30" stroke-width="1.5"/></svg></span><div class="info"><strong><a onclick="ext(\'https://www.openstreetmap.org\')">OpenStreetMap</a></strong><small>Free maps</small></div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="ftr">Mini Browser &bull; Mini OS v1.0</div>');

  // ── Page: Help ──
  var pgHelp = wrap('help',
    '<div class="body">' +
      '<div class="card"><h2><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#e8a020"/><text x="8" y="12" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">?</text></svg> Mini Browser Help</h2>' +
        '<h3>Navigating</h3><br>' +
        '<ul>' +
          '<li>Type any URL in the address bar and press <kbd>Enter</kbd> or click <strong>Go</strong></li>' +
          '<li>Use <kbd>◀</kbd> and <kbd>▶</kbd> buttons to go back and forward in history</li>' +
          '<li>Click <kbd>⌂</kbd> to return to Mini/Home at any time</li>' +
          '<li>Type <code>Mini/About</code>, <code>Mini/Apps</code>, <code>Mini/Web</code>, or <code>Mini/Help</code> for built-in pages</li>' +
        '</ul>' +
      '</div>' +
      '<div class="card"><h2>Mini OS Keyboard Shortcuts</h2>' +
        '<div class="g2">' +
          '<div><h3>Global</h3><br><ul>' +
            '<li><kbd>Alt</kbd>+<kbd>F4</kbd> — Close window</li>' +
            '<li>Right-click desktop — Wallpaper menu</li>' +
          '</ul></div>' +
          '<div><h3>Notepad</h3><br><ul>' +
            '<li><kbd>Shift</kbd>+<kbd>B</kbd> — Bold</li>' +
            '<li><kbd>Shift</kbd>+<kbd>I</kbd> — Italic</li>' +
            '<li><kbd>Shift</kbd>+<kbd>F</kbd> — Find</li>' +
            '<li><kbd>Shift</kbd>+<kbd>P</kbd> — Preview</li>' +
            '<li><kbd>Shift</kbd>+<kbd>N</kbd> — New note</li>' +
          '</ul></div>' +
          '<div><h3>Terminal</h3><br><ul>' +
            '<li><kbd>↑</kbd> / <kbd>↓</kbd> — Command history</li>' +
            '<li><kbd>Tab</kbd> — Autocomplete filename</li>' +
            '<li><code>help</code> — List all commands</li>' +
          '</ul></div>' +
          '<div><h3>File Editor</h3><br><ul>' +
            '<li>Click type pill — Convert file type</li>' +
            '<li><kbd>Enter</kbd> in name — Rename file</li>' +
            '<li><kbd>Tab</kbd> — Insert 2 spaces</li>' +
          '</ul></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="ftr">Mini Browser &bull; Mini OS v1.0</div>');

  // ── 404 page ──
  var pg404 = wrap('home',
    '<div class="body"><div class="card"><h2><svg viewBox="0 0 16 16" width="1em" height="1em" style="vertical-align:middle"><circle cx="8" cy="8" r="7" fill="#cc2222" stroke="#aa1111" stroke-width=".7"/><line x1="5" y1="5" x2="11" y2="11" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="5" x2="5" y2="11" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg> Page Not Found</h2>' +
      '<p>The Mini page you requested does not exist.</p>' +
      '<p>Available pages: <a onclick="go(\'home\')">Mini/Home</a>, <a onclick="go(\'about\')">Mini/About</a>, <a onclick="go(\'apps\')">Mini/Apps</a>, <a onclick="go(\'web\')">Mini/Web</a>, <a onclick="go(\'help\')">Mini/Help</a></p>' +
    '</div></div>' +
    '<div class="ftr">Mini Browser &bull; Mini OS v1.0</div>');

  var miniPageMap = { home: pgHome, about: pgAbout, apps: pgApps, web: pgWeb, help: pgHelp };

  // ── Build window ──
  var windowObj = OS.createWindow('Internet', 720, 520,
    '<div class="browser-bar">' +
      '<button class="browser-back" title="Back">&#9664;</button>' +
      '<button class="browser-fwd"  title="Forward">&#9654;</button>' +
      '<button class="browser-home-btn" title="Home">&#8962;</button>' +
      '<input  class="browser-url"  type="text" value="Mini/Home" />' +
      '<button class="browser-go">Go</button>' +
    '</div>' +
    '<iframe class="browser-frame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>');

  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');

  var urlInput  = windowObj.el.querySelector('.browser-url');
  var frame     = windowObj.el.querySelector('.browser-frame');
  var backBtn   = windowObj.el.querySelector('.browser-back');
  var fwdBtn    = windowObj.el.querySelector('.browser-fwd');

  // ── Navigation history ──
  var navHistory = ['Mini/Home'];
  var navIndex   = 0;

  function updateNavBtns() {
    backBtn.disabled = navIndex <= 0;
    fwdBtn.disabled  = navIndex >= navHistory.length - 1;
    backBtn.style.opacity = backBtn.disabled ? '0.4' : '1';
    fwdBtn.style.opacity  = fwdBtn.disabled  ? '0.4' : '1';
  }

  function pushHistory(url) {
    navHistory = navHistory.slice(0, navIndex + 1);
    if (navHistory[navIndex] !== url) {
      navHistory.push(url);
      navIndex = navHistory.length - 1;
    }
    updateNavBtns();
  }

  function loadUrl(rawUrl, skipHistory) {
    var url = (rawUrl || urlInput.value).trim();

    // Normalise Mini/ variants → mini://pagename
    var miniMatch = url.match(/^mini[:/][\\/]?([a-z0-9_-]*)?$/i);
    if (miniMatch || url === '' || /^mini$/i.test(url)) {
      var pageName = (miniMatch && miniMatch[1] ? miniMatch[1] : 'home').toLowerCase();
      var pageHtml = miniPageMap[pageName] || pg404;
      frame.srcdoc = pageHtml;
      var display = 'Mini/' + pageName.charAt(0).toUpperCase() + pageName.slice(1);
      urlInput.value = display;
      if (!skipHistory) pushHistory(display);
      return;
    }

    // External URL — wrap in inner iframe so srcdoc→src transition always works
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    urlInput.value = url;
    var outerHtml = '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%;overflow:hidden}iframe{display:block;width:100%;height:100%;border:none}</style></head><body><iframe src="' + url.replace(/"/g, '%22') + '" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"></iframe></body></html>';
    frame.srcdoc = outerHtml;
    if (!skipHistory) pushHistory(url);
  }

  // ── Button handlers ──
  windowObj.el.querySelector('.browser-go').addEventListener('click', function () { loadUrl(); });
  urlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') loadUrl(); });

  backBtn.addEventListener('click', function () {
    if (navIndex > 0) { navIndex--; loadUrl(navHistory[navIndex], true); urlInput.value = navHistory[navIndex]; updateNavBtns(); }
  });
  fwdBtn.addEventListener('click', function () {
    if (navIndex < navHistory.length - 1) { navIndex++; loadUrl(navHistory[navIndex], true); urlInput.value = navHistory[navIndex]; updateNavBtns(); }
  });
  windowObj.el.querySelector('.browser-home-btn').addEventListener('click', function () { loadUrl('Mini/Home'); });

  // ── postMessage from mini pages ──
  function onMiniMessage(evt) {
    if (!evt.data) return;
    if (evt.data.miniNav)    loadUrl('Mini/' + evt.data.miniNav);
    if (evt.data.externalNav) loadUrl(evt.data.externalNav);
  }
  window.addEventListener('message', onMiniMessage);
  windowObj.el.querySelector('.btn-close').addEventListener('click', function () {
    window.removeEventListener('message', onMiniMessage);
  });

  // ── Boot to home ──
  loadUrl('Mini/Home', true);
  updateNavBtns();
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
  var html = '<div class="settings-body">' +
    '<div class="settings-section"><div class="settings-label">Wallpaper Presets</div><div class="wallpaper-grid">';
  OS.wallpapers.forEach(function (wallpaper, index) {
    html += '<div class="wallpaper-opt' + (index === OS.getCurrentWallpaper() ? ' active' : '') +
      '" data-i="' + index + '" style="background:' + wallpaper + '"></div>';
  });
  html += '</div></div>' +
    '<div class="settings-section"><div class="settings-label">Custom Wallpaper</div>' +
    '<div style="display:flex;gap:6px;align-items:center;margin-top:4px">' +
      '<button class="wp-upload-btn" style="padding:3px 10px;font-size:11px;font-family:inherit;cursor:pointer;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">Upload Image...</button>' +
      '<button class="wp-browse-btn" style="padding:3px 10px;font-size:11px;font-family:inherit;cursor:pointer;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">From Files...</button>' +
      '<button class="wp-color-btn" style="padding:3px 10px;font-size:11px;font-family:inherit;cursor:pointer;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">Solid Color...</button>' +
    '</div>' +
    '<div class="wp-preview" style="margin-top:6px;height:40px;border:1px solid #ccc;border-radius:2px;background:#3a6ea5"></div>' +
    '</div>' +
    '<div class="settings-section"><div class="settings-label">System Information</div>' +
    '<div class="settings-row"><span>OS Name</span><span>Mini OS</span></div>' +
    '<div class="settings-row"><span>Version</span><span>1.0 (Build 2600)</span></div>' +
    '<div class="settings-row"><span>Open Windows</span><span>' + OS.windows.length + '</span></div></div></div>';

  var windowObj = OS.createWindow('Control Panel', 380, 380, html);
  var previewElement = windowObj.el.querySelector('.wp-preview');

  function applyCustomWallpaper(cssValue) {
    document.getElementById('desktop').style.background = cssValue;
    document.getElementById('desktop').style.backgroundSize = 'cover';
    previewElement.style.background = cssValue;
    previewElement.style.backgroundSize = 'cover';
    localStorage.setItem('minios-custom-wallpaper', cssValue);
  }

  // Preset wallpapers
  windowObj.el.querySelectorAll('.wallpaper-opt').forEach(function (el) {
    el.addEventListener('click', function () {
      windowObj.el.querySelector('.wallpaper-opt.active').classList.remove('active');
      el.classList.add('active');
      var index = +el.getAttribute('data-i');
      OS.setCurrentWallpaper(index);
      document.getElementById('desktop').style.background = OS.wallpapers[index];
      document.getElementById('desktop').style.backgroundSize = '';
      previewElement.style.background = OS.wallpapers[index];
      localStorage.removeItem('minios-custom-wallpaper');
    });
  });

  // Upload image from computer
  windowObj.el.querySelector('.wp-upload-btn').addEventListener('click', function () {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        applyCustomWallpaper('url(' + reader.result + ') center/cover no-repeat');
        OS.showNotification('Control Panel', 'Wallpaper set from ' + file.name);
      };
      reader.readAsDataURL(file);
      document.body.removeChild(fileInput);
    });
    fileInput.click();
  });

  // Browse filesystem for image files
  windowObj.el.querySelector('.wp-browse-btn').addEventListener('click', function () {
    var browseWindow = OS.createWindow('Select Wallpaper', 360, 260,
      '<div style="display:flex;flex-direction:column;height:100%;background:#ece9d8">' +
      '<div style="padding:6px;font-size:11px;border-bottom:1px solid #aca899;flex-shrink:0">Select an image file from the filesystem:</div>' +
      '<div class="wp-file-list" style="flex:1;overflow-y:auto;background:#fff;padding:4px"></div></div>');
    browseWindow.el.querySelector('.window-body').classList.add('window-body-flex');
    var fileListElement = browseWindow.el.querySelector('.wp-file-list');

    function findImages(node, path, results) {
      if (!node || !node.children) return;
      Object.keys(node.children).forEach(function (name) {
        var child = node.children[name];
        var fullPath = path + '\\' + name;
        var lower = name.toLowerCase();
        if (lower.match(/\.(jpg|jpeg|png|bmp|gif|svg)$/) || lower.endsWith('.html')) {
          results.push({ name: name, path: fullPath, content: child.content || '' });
        }
        if (child.type === 'folder') findImages(child, fullPath, results);
      });
    }

    var imageFiles = [];
    findImages(OS.fileSystem['C:'], 'C:', imageFiles);

    if (imageFiles.length === 0) {
      fileListElement.innerHTML = '<div style="padding:12px;text-align:center;color:#999;font-size:11px">No image files found in filesystem</div>';
    } else {
      imageFiles.forEach(function (imgFile) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:3px 6px;cursor:pointer;font-size:11px;border-radius:2px';
        row.innerHTML = '<span style="width:16px;height:16px;flex-shrink:0">' + OS.imgSvg + '</span>' +
          '<span style="flex:1">' + OS.escapeHtml(imgFile.name) + '</span>' +
          '<span style="color:#888;font-size:9px">' + OS.escapeHtml(imgFile.path) + '</span>';
        row.addEventListener('mouseenter', function () { row.style.background = '#316ac5'; row.style.color = '#fff'; });
        row.addEventListener('mouseleave', function () { row.style.background = ''; row.style.color = ''; });
        row.addEventListener('click', function () {
          if (imgFile.name.toLowerCase().endsWith('.svg') && imgFile.content.indexOf('<svg') >= 0) {
            var svgDataUrl = 'data:image/svg+xml;base64,' + btoa(imgFile.content);
            applyCustomWallpaper('url(' + svgDataUrl + ') center/cover no-repeat');
          } else {
            applyCustomWallpaper(imgFile.content);
          }
          OS.showNotification('Control Panel', 'Wallpaper set from ' + imgFile.name);
          browseWindow.el.querySelector('.btn-close').click();
        });
        fileListElement.appendChild(row);
      });
    }
  });

  // Solid color picker
  windowObj.el.querySelector('.wp-color-btn').addEventListener('click', function () {
    OS.prompt('Enter a CSS color (e.g. #3a6ea5, darkblue, rgb(50,100,150)):', '#3a6ea5', function (colorValue) {
      if (colorValue) {
        applyCustomWallpaper(colorValue);
        OS.showNotification('Control Panel', 'Wallpaper color set to ' + colorValue);
      }
    });
  });

  // Load current custom wallpaper into preview
  var savedCustom = localStorage.getItem('minios-custom-wallpaper');
  if (savedCustom) {
    previewElement.style.background = savedCustom;
    previewElement.style.backgroundSize = 'cover';
  }
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

// ── Find Files ──
OS.registerApp('findfiles', function buildFindFiles() {
  var windowObj = OS.createWindow('Find Files', 400, 320,
    '<div style="display:flex;flex-direction:column;height:100%;background:#ece9d8">' +
    '<div style="display:flex;gap:4px;padding:6px;border-bottom:1px solid #aca899;flex-shrink:0;align-items:center">' +
      '<span style="font-size:11px">Search:</span>' +
      '<input class="search-input" style="flex:1;padding:2px 6px;font-size:11px;border:2px inset #c8c4b8;font-family:inherit" placeholder="Type a filename..." />' +
      '<button class="search-btn" style="padding:2px 12px;font-size:11px;font-family:inherit;cursor:pointer;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">Search</button>' +
    '</div>' +
    '<div class="search-results" style="flex:1;overflow-y:auto;padding:4px;background:#fff;font-size:11px"></div>' +
    '<div class="search-status" style="padding:2px 8px;background:#ece9d8;border-top:1px solid #aca899;font-size:10px;color:#555;flex-shrink:0"></div>' +
    '</div>');

  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');
  var searchInput = windowObj.el.querySelector('.search-input');
  var resultsElement = windowObj.el.querySelector('.search-results');
  var statusElement = windowObj.el.querySelector('.search-status');

  function searchFilesystem(node, currentPath, query, results) {
    if (!node || !node.children) return;
    Object.keys(node.children).forEach(function (name) {
      var child = node.children[name];
      var fullPath = currentPath + '\\' + name;
      if (name.toLowerCase().indexOf(query) >= 0) {
        results.push({ name: name, path: fullPath, type: child.type, size: child.size || 0 });
      }
      if (child.type === 'folder') {
        searchFilesystem(child, fullPath, query, results);
      }
    });
  }

  function doSearch() {
    var query = searchInput.value.trim().toLowerCase();
    if (!query) { statusElement.textContent = 'Type a search term.'; return; }
    var results = [];
    searchFilesystem(OS.fileSystem['C:'], 'C:', query, results);
    resultsElement.innerHTML = '';
    statusElement.textContent = results.length + ' result(s) found';

    if (results.length === 0) {
      resultsElement.innerHTML = '<div style="padding:16px;text-align:center;color:#999">No files matching "' + OS.escapeHtml(query) + '"</div>';
      return;
    }

    results.forEach(function (result) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:3px 6px;cursor:default;border:1px solid transparent;border-radius:2px';
      row.innerHTML =
        '<span style="width:16px;height:16px;flex-shrink:0">' + (result.type === 'folder' ? OS.folderSvg : OS.fileSvg) + '</span>' +
        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + OS.escapeHtml(result.name) + '</span>' +
        '<span style="color:#888;font-size:10px;flex-shrink:0">' + OS.escapeHtml(result.path) + '</span>';
      row.addEventListener('mouseenter', function () { row.style.background = '#e8e8f0'; });
      row.addEventListener('mouseleave', function () { row.style.background = ''; });
      resultsElement.appendChild(row);
    });
  }

  windowObj.el.querySelector('.search-btn').addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
  searchInput.focus();
});

// ── Clipboard Manager ──
OS.registerApp('clipboardmanager', function buildClipboardManager() {
  var windowObj = OS.createWindow('Clipboard Manager', 320, 280,
    '<div style="display:flex;flex-direction:column;height:100%;background:#ece9d8">' +
    '<div style="padding:4px 6px;background:#ece9d8;border-bottom:1px solid #aca899;font-size:11px;font-weight:700;flex-shrink:0;display:flex;align-items:center">' +
      '<span style="flex:1">Clipboard History</span>' +
      '<button class="cm-clear" style="padding:1px 8px;font-size:10px;font-family:inherit;cursor:pointer;background:linear-gradient(180deg,#f0ede4,#d8d4c8);border:1px solid #999;border-radius:2px">Clear</button>' +
    '</div>' +
    '<div class="cm-list" style="flex:1;overflow-y:auto;background:#fff;font-size:11px"></div>' +
    '<div style="padding:2px 6px;background:#ece9d8;border-top:1px solid #aca899;font-size:10px;color:#555;flex-shrink:0" class="cm-status"></div>' +
    '</div>');

  windowObj.el.querySelector('.window-body').classList.add('window-body-flex');
  var listElement = windowObj.el.querySelector('.cm-list');
  var statusElement = windowObj.el.querySelector('.cm-status');

  function renderHistory() {
    listElement.innerHTML = '';
    var history = OS.clipboardHistory;
    statusElement.textContent = history.length + ' item(s) in history';

    if (history.length === 0) {
      listElement.innerHTML = '<div style="padding:16px;text-align:center;color:#999">No clipboard history yet.<br>Cut or copy files to see them here.</div>';
      return;
    }

    history.forEach(function (entry, index) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid #eee';
      var modeColor = entry.mode === 'cut' ? '#c44' : '#4a8acc';
      var modeLabel = entry.mode === 'cut' ? 'CUT' : 'COPY';
      row.innerHTML =
        '<span style="background:' + modeColor + ';color:#fff;font-size:8px;padding:1px 4px;border-radius:2px;font-weight:700">' + modeLabel + '</span>' +
        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + OS.escapeHtml(entry.name) + '</span>' +
        '<span style="color:#999;font-size:9px;flex-shrink:0">' + entry.time + '</span>';
      row.addEventListener('mouseenter', function () { row.style.background = '#e8e8f0'; });
      row.addEventListener('mouseleave', function () { row.style.background = ''; });
      listElement.appendChild(row);
    });
  }

  windowObj.el.querySelector('.cm-clear').addEventListener('click', function () {
    OS.clipboardHistory.length = 0;
    renderHistory();
  });

  renderHistory();
  var refreshInterval = setInterval(renderHistory, 2000);
  windowObj.el.querySelector('.btn-close').addEventListener('click', function () { clearInterval(refreshInterval); });
});

})();
