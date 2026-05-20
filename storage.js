(function () {

var OS = window.MicroOS;
var PROFILES_KEY = 'minios-profiles';
var ACTIVE_USER_KEY = 'minios-active-user';
var BOOT_KEY = 'minios-boot-config';

function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

var defaultFileSystem = deepClone(OS.fileSystem);
var activeUserName = null;

function getUserFSKey(userName) { return 'minios-fs-' + userName; }
function getUserSessionKey(userName) { return 'minios-session-' + userName; }

// ── Profile management ──

function getProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); }
  catch (error) { return []; }
}

function saveProfiles(profileList) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profileList));
}

function createProfile(userName) {
  var profiles = getProfiles();
  if (profiles.indexOf(userName) >= 0) return false;
  profiles.push(userName);
  saveProfiles(profiles);
  return true;
}

function deleteProfile(userName) {
  var profiles = getProfiles();
  profiles = profiles.filter(function (profileName) { return profileName !== userName; });
  saveProfiles(profiles);
  localStorage.removeItem(getUserFSKey(userName));
  localStorage.removeItem(getUserSessionKey(userName));
}

// ── Filesystem persistence (per-user) ──

function loadFilesystem() {
  if (!activeUserName) return false;
  try {
    var saved = localStorage.getItem(getUserFSKey(activeUserName));
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed['C:']) { OS.fileSystem['C:'] = parsed['C:']; return true; }
    }
  } catch (error) { console.error('Failed to load filesystem:', error); }
  return false;
}

function saveFilesystem() {
  if (!activeUserName) return false;
  try {
    localStorage.setItem(getUserFSKey(activeUserName), JSON.stringify(OS.fileSystem));
    return true;
  } catch (error) { console.error('Failed to save filesystem:', error); return false; }
}

function resetFilesystem() {
  if (activeUserName) {
    // Remove storage keys one at a time to avoid lag
    try { localStorage.removeItem(getUserFSKey(activeUserName)); } catch (e) {}
    try { localStorage.removeItem(getUserSessionKey(activeUserName)); } catch (e) {}
    // Remove user from profiles list
    var profiles = getProfiles();
    profiles = profiles.filter(function (name) { return name !== activeUserName; });
    saveProfiles(profiles);
    try { localStorage.removeItem(ACTIVE_USER_KEY); } catch (e) {}
  }
}

// ── Session state (per-user) ──

function saveSession() {
  if (!activeUserName) return false;
  try {
    var windowStates = [];
    OS.windows.forEach(function (windowObj) {
      var element = windowObj.el;
      windowStates.push({
        title: windowObj.title,
        minimized: windowObj.minimized,
        maximized: windowObj.maximized,
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        height: element.style.height
      });
    });
    var sessionData = { wallpaper: OS.getCurrentWallpaper(), windows: windowStates };
    localStorage.setItem(getUserSessionKey(activeUserName), JSON.stringify(sessionData));
    return true;
  } catch (error) { console.error('Failed to save session:', error); return false; }
}

function loadSession() {
  if (!activeUserName) return false;
  try {
    var saved = localStorage.getItem(getUserSessionKey(activeUserName));
    if (!saved) return false;
    var sessionData = JSON.parse(saved);
    if (typeof sessionData.wallpaper === 'number') {
      OS.setCurrentWallpaper(sessionData.wallpaper);
      document.getElementById('desktop').style.background = OS.wallpapers[sessionData.wallpaper];
    }
    if (sessionData.windows && sessionData.windows.length > 0) {
      window._pendingWindowRestore = sessionData.windows;
    }
    return true;
  } catch (error) { console.error('Failed to load session:', error); return false; }
}

// Map window titles to app names for restore
var titleToAppName = {
  'Untitled - Notepad': 'notepad',
  'Calculator': 'calculator',
  'My Documents': 'files',
  'Command Prompt': 'terminal',
  'Internet': 'browser',
  'Paint': 'paint',
  'Clock': 'clock',
  'Minesweeper': 'minesweeper',
  'Control Panel': 'settings',
  'About Mini OS': 'about',
  'Code Editor': 'codeeditor',
  'Find Files': 'findfiles',
  'Clipboard Manager': 'clipboardmanager'
};

function restorePendingWindows() {
  var pendingWindows = window._pendingWindowRestore;
  if (!pendingWindows) return;
  delete window._pendingWindowRestore;
  pendingWindows.forEach(function (windowState) {
    var appName = titleToAppName[windowState.title];
    if (appName) {
      OS.openApp(appName);
      // After the app opens, adjust the window position
      var lastWindow = OS.windows[OS.windows.length - 1];
      if (lastWindow) {
        var element = lastWindow.el;
        if (windowState.left) element.style.left = windowState.left;
        if (windowState.top) element.style.top = windowState.top;
        if (windowState.width) element.style.width = windowState.width;
        if (windowState.height) element.style.height = windowState.height;
        if (windowState.maximized) { lastWindow.maximized = true; element.classList.add('maximized'); }
        if (windowState.minimized) { lastWindow.minimized = true; element.classList.add('minimized'); }
      }
    }
  });
}

// ── Export / Import ──

function exportFilesystem(filename) {
  var exportFileName = filename || 'minios-backup.json';
  var exportData = { version: '1.0', exportDate: new Date().toISOString(), user: activeUserName, fileSystem: OS.fileSystem, session: { wallpaper: OS.getCurrentWallpaper() } };
  var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
        } else { if (callback) callback(false, 'Invalid filesystem structure'); }
      } catch (parseError) { if (callback) callback(false, parseError.message); }
      document.body.removeChild(fileInput);
    };
    reader.readAsText(file);
  });
  fileInput.click();
}

function setBootConfig(val) { if (val) localStorage.setItem(BOOT_KEY, val); else localStorage.removeItem(BOOT_KEY); }
function getBootConfig() { return localStorage.getItem(BOOT_KEY) || null; }

// ── Login flow ──

function loginAs(userName) {
  activeUserName = userName;
  localStorage.setItem(ACTIVE_USER_KEY, userName);
  OS.fileSystem['C:'] = deepClone(defaultFileSystem['C:']);
  loadFilesystem();
  loadSession();

  // Update the start menu user name
  var userNameElement = document.querySelector('.start-user-name');
  if (userNameElement) userNameElement.textContent = userName;

  // Hide login, go straight to desktop (boot already ran)
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('boot-screen').style.display = 'none';
  document.getElementById('desktop').style.visibility = 'visible';
  document.getElementById('taskbar').style.visibility = 'visible';

  // Restore windows after everything settles
  setTimeout(function () { restorePendingWindows(); }, 100);
}

function showLoginScreen() {
  var loginScreen = document.getElementById('login-screen');
  var bootScreen = document.getElementById('boot-screen');
  var desktop = document.getElementById('desktop');
  var taskbar = document.getElementById('taskbar');

  bootScreen.style.display = 'none';
  desktop.style.visibility = 'hidden';
  taskbar.style.visibility = 'hidden';
  loginScreen.style.display = '';

  renderProfileList();
}

function renderProfileList() {
  var profilesContainer = document.getElementById('login-profiles');
  var profiles = getProfiles();
  profilesContainer.innerHTML = '';

  var avatarSvg = '<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="12" r="7" fill="#fff" opacity=".9"/><ellipse cx="18" cy="32" rx="12" ry="8" fill="#fff" opacity=".7"/></svg>';

  profiles.forEach(function (profileName) {
    var profileButton = document.createElement('div');
    profileButton.className = 'login-profile-btn';
    profileButton.innerHTML = avatarSvg + '<span>' + profileName + '</span>' +
      '<button class="login-profile-delete" title="Delete profile">x</button>';

    profileButton.addEventListener('click', function (e) {
      if (e.target.classList.contains('login-profile-delete')) return;
      loginAs(profileName);
    });

    profileButton.querySelector('.login-profile-delete').addEventListener('click', function (e) {
      e.stopPropagation();
      if (confirm('Delete profile "' + profileName + '" and all its data?')) {
        deleteProfile(profileName);
        renderProfileList();
      }
    });

    profilesContainer.appendChild(profileButton);
  });

  if (profiles.length === 0) {
    profilesContainer.innerHTML = '<div style="color:rgba(255,255,255,.5);font-size:11px;padding:10px">No profiles yet. Create one below.</div>';
  }
}

// Wire up the "Create" button
setTimeout(function () {
  var newInput = document.getElementById('login-new-input');
  var newButton = document.getElementById('login-new-btn');
  if (!newInput || !newButton) return;

  function handleCreateProfile() {
    var name = newInput.value.trim();
    if (!name) return;
    if (createProfile(name)) {
      newInput.value = '';
      loginAs(name);
    } else {
      newInput.value = '';
      newInput.placeholder = 'Name already exists';
    }
  }

  newButton.addEventListener('click', handleCreateProfile);
  newInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleCreateProfile(); });
}, 0);

// ── Auto-save ──
setInterval(function () { saveFilesystem(); saveSession(); }, 15000);
window.addEventListener('beforeunload', function () { saveFilesystem(); saveSession(); });

// ── Boot decision: show login or auto-login last user ──
var profiles = getProfiles();
var lastUser = localStorage.getItem(ACTIVE_USER_KEY);

if (profiles.length === 0) {
  // No profiles at all — create a default one and login
  createProfile('User');
  loginAs('User');
} else if (lastUser && profiles.indexOf(lastUser) >= 0) {
  // Auto-login to last user but still show login screen for profile selection
  loginAs(lastUser);
} else {
  showLoginScreen();
}

// ── Log Off handler (show login screen again) ──
setTimeout(function () {
  var logoffButton = document.getElementById('logoff-btn');
  if (logoffButton) {
    var originalHandler = logoffButton.onclick;
    logoffButton.addEventListener('click', function () {
      // Close all windows
      while (OS.windows.length) {
        var closeBtn = OS.windows[0].el.querySelector('.btn-close');
        if (closeBtn) closeBtn.click(); else break;
      }
      saveFilesystem();
      saveSession();
      document.querySelector('#start-menu').classList.add('hidden');
      activeUserName = null;
      localStorage.removeItem(ACTIVE_USER_KEY);
      showLoginScreen();
    });
  }
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
OS.getActiveUser = function () { return activeUserName; };
OS.onWindowChanged = function () { saveSession(); };
OS.getProfiles = getProfiles;

})();
