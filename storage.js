(function () {

var OS = window.MicroOS;
var STORAGE_KEY = 'microos-filesystem';
var BOOT_CONFIG_KEY = 'microos-boot-config';

// ── Deep clone utility ──
function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

// ── Save a snapshot of the default FS before anything loads over it ──
var defaultFileSystem = deepClone(OS.fileSystem);

// ── Load from localStorage on boot (if saved data exists) ──
function loadFilesystem() {
  try {
    var savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      var parsed = JSON.parse(savedData);
      OS.fileSystem['C:'] = parsed['C:'];
      return true;
    }
  } catch (loadError) {
    console.error('Failed to load filesystem:', loadError);
  }
  return false;
}

// ── Save current filesystem to localStorage ──
function saveFilesystem() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(OS.fileSystem));
    return true;
  } catch (saveError) {
    console.error('Failed to save filesystem:', saveError);
    return false;
  }
}

// ── Reset filesystem to factory defaults ──
function resetFilesystem() {
  OS.fileSystem['C:'] = deepClone(defaultFileSystem['C:']);
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BOOT_CONFIG_KEY);
}

// ── Export filesystem as downloadable JSON file ──
function exportFilesystem(filename) {
  var exportFileName = filename || 'microos-backup.json';
  var exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    fileSystem: OS.fileSystem
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

// ── Import filesystem from a JSON file (via file picker) ──
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

// ── Save/Load boot config (which save file to auto-load) ──
function setBootConfig(configFilePath) {
  if (configFilePath) {
    localStorage.setItem(BOOT_CONFIG_KEY, configFilePath);
  } else {
    localStorage.removeItem(BOOT_CONFIG_KEY);
  }
}

function getBootConfig() {
  return localStorage.getItem(BOOT_CONFIG_KEY) || null;
}

// ── Auto-save on interval (every 30 seconds) ──
setInterval(function () {
  saveFilesystem();
}, 30000);

// ── Save before page unload ──
window.addEventListener('beforeunload', function () {
  saveFilesystem();
});

// ── Load saved filesystem on boot ──
var didLoad = loadFilesystem();
if (didLoad) {
  console.log('MicroOS: Loaded saved filesystem from localStorage');
} else {
  console.log('MicroOS: Using default filesystem (no save found)');
}

// ── Expose storage API ──
OS.saveFilesystem = saveFilesystem;
OS.loadFilesystem = loadFilesystem;
OS.resetFilesystem = resetFilesystem;
OS.exportFilesystem = exportFilesystem;
OS.importFilesystem = importFilesystem;
OS.setBootConfig = setBootConfig;
OS.getBootConfig = getBootConfig;

})();
