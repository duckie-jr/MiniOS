(function () {

var OS = window.MicroOS;
var FS_KEY = 'minios-filesystem';
var STATE_KEY = 'minios-session';
var BOOT_KEY = 'minios-boot-config';

function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

var defaultFileSystem = deepClone(OS.fileSystem);

// ── Filesystem persistence ──

function loadFilesystem() {
  try {
    var saved = localStorage.getItem(FS_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed['C:']) { OS.fileSystem['C:'] = parsed['C:']; return true; }
    }
  } catch (error) { console.error('Failed to load filesystem:', error); }
  return false;
}

function saveFilesystem() {
  try {
    localStorage.setItem(FS_KEY, JSON.stringify(OS.fileSystem));
    return true;
  } catch (error) { console.error('Failed to save filesystem:', error); return false; }
}

function resetFilesystem() {
  OS.fileSystem['C:'] = deepClone(defaultFileSystem['C:']);
  localStorage.removeItem(FS_KEY);
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(BOOT_KEY);
}

// ── Session state (windows, wallpaper) ──

function saveSession() {
  try {
    var windowStates = [];
    OS.windows.forEach(function (windowObj) {
      var element = windowObj.el;
      var bodyElement = element.querySelector('.window-body');
      windowStates.push({
        title: windowObj.title,
        minimized: windowObj.minimized,
        maximized: windowObj.maximized,
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        height: element.style.height,
        bodyHTML: bodyElement ? bodyElement.innerHTML : '',
        zIndex: element.style.zIndex || '10',
        hasFlex: bodyElement ? bodyElement.classList.contains('window-body-flex') : false
      });
    });

    var sessionData = {
      wallpaper: OS.getCurrentWallpaper(),
      windows: windowStates
    };

    localStorage.setItem(STATE_KEY, JSON.stringify(sessionData));
    return true;
  } catch (error) { console.error('Failed to save session:', error); return false; }
}

function loadSession() {
  try {
    var saved = localStorage.getItem(STATE_KEY);
    if (!saved) return false;
    var sessionData = JSON.parse(saved);

    // Restore wallpaper
    if (typeof sessionData.wallpaper === 'number') {
      OS.setCurrentWallpaper(sessionData.wallpaper);
      document.getElementById('desktop').style.background = OS.wallpapers[sessionData.wallpaper];
    }

    // Restore windows after apps.js has loaded (use a small delay)
    if (sessionData.windows && sessionData.windows.length > 0) {
      window._pendingWindowRestore = sessionData.windows;
    }

    return true;
  } catch (error) { console.error('Failed to load session:', error); return false; }
}

function restorePendingWindows() {
  var pendingWindows = window._pendingWindowRestore;
  if (!pendingWindows) return;
  delete window._pendingWindowRestore;

  pendingWindows.forEach(function (windowState) {
    var restoredWindow = OS.createWindow(
      windowState.title,
      parseInt(windowState.width) || 400,
      parseInt(windowState.height) || 300,
      windowState.bodyHTML
    );

    var element = restoredWindow.el;
    element.style.left = windowState.left;
    element.style.top = windowState.top;
    element.style.width = windowState.width;
    element.style.height = windowState.height;
    element.style.zIndex = windowState.zIndex;

    if (windowState.hasFlex) {
      element.querySelector('.window-body').classList.add('window-body-flex');
    }
    if (windowState.maximized) {
      restoredWindow.maximized = true;
      element.classList.add('maximized');
    }
    if (windowState.minimized) {
      restoredWindow.minimized = true;
      element.classList.add('minimized');
    }
  });
}

// ── Export / Import ──

function exportFilesystem(filename) {
  var exportFileName = filename || 'minios-backup.json';
  var exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    fileSystem: OS.fileSystem,
    session: {
      wallpaper: OS.getCurrentWallpaper()
    }
  };
  var jsonString = JSON.stringify(exportData, null, 2);
  var blob = new Blob([jsonString], { type: 'application/json' });
  var downloadUrl = URL.createObjectURL(blob);
  var downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = exportFileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}

function importFilesystem(callback) {
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (!file) { document.body.removeChild(fileInput); return; }

    var reader = new FileReader();
    reader.onload = function () {
      try {
        var importedData = JSON.parse(reader.result);
        var restoredFS = importedData.fileSystem || importedData;
        if (restoredFS['C:'] && restoredFS['C:'].children) {
          OS.fileSystem['C:'] = restoredFS['C:'];
          saveFilesystem();
          if (importedData.session && typeof importedData.session.wallpaper === 'number') {
            OS.setCurrentWallpaper(importedData.session.wallpaper);
            document.getElementById('desktop').style.background = OS.wallpapers[importedData.session.wallpaper];
          }
          if (callback) callback(true, file.name);
        } else {
          if (callback) callback(false, 'Invalid filesystem structure');
        }
      } catch (parseError) {
        if (callback) callback(false, parseError.message);
      }
      document.body.removeChild(fileInput);
    };
    reader.readAsText(file);
  });

  fileInput.click();
}

// ── Boot config ──

function setBootConfig(configFilePath) {
  if (configFilePath) { localStorage.setItem(BOOT_KEY, configFilePath); }
  else { localStorage.removeItem(BOOT_KEY); }
}

function getBootConfig() {
  return localStorage.getItem(BOOT_KEY) || null;
}

// ── Auto-save on interval (every 15 seconds) ──
setInterval(function () {
  saveFilesystem();
  saveSession();
}, 15000);

// ── Save before page unload ──
window.addEventListener('beforeunload', function () {
  saveFilesystem();
  saveSession();
});

// ── Load on boot ──
var didLoadFS = loadFilesystem();
var didLoadSession = loadSession();
console.log('Mini OS: FS ' + (didLoadFS ? 'restored' : 'default') + ', Session ' + (didLoadSession ? 'restored' : 'fresh'));

// ── Restore windows after apps.js finishes loading ──
// apps.js runs synchronously after storage.js, so we use setTimeout(0) to queue after it
setTimeout(function () {
  restorePendingWindows();
}, 0);

// ── Expose API ──
OS.saveFilesystem = saveFilesystem;
OS.loadFilesystem = loadFilesystem;
OS.resetFilesystem = resetFilesystem;
OS.saveSession = saveSession;
OS.loadSession = loadSession;
OS.exportFilesystem = exportFilesystem;
OS.importFilesystem = importFilesystem;
OS.setBootConfig = setBootConfig;
OS.getBootConfig = getBootConfig;

})();
