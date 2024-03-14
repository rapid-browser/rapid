const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const minLoadingTime = 3000;
const maxLoadingTime = 15000;
const randomLoadingTime = Math.random() * (maxLoadingTime - minLoadingTime) + minLoadingTime;

let settingsWindow = null;
let loadingScreen = null;
let mainWindow = null;

function createLoadingScreen() {
  const loadingScreen = new BrowserWindow({
    width: 250,
    height: 325,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: false,
    icon: path.join(__dirname, 'logo.ico'), // Set custom icon for loading window
  });

  loadingScreen.loadFile('loading.html');
  loadingScreen.setHasShadow(true)
  return loadingScreen;
}

function createMainWindow() {
    let ldngscrnclswapp = true
    const mainWindow = new BrowserWindow({
      show: false,
      frame: false,
      minWidth: 850,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // Ensure the path is correct
        contextIsolation: true,
        nodeIntegration: false,
        enableRemoteModule: false, // Explicitly disable remote module for security
        webviewTag: true,
      },
      icon: path.join(__dirname, 'logo.ico'),
      title: "RAPID"
    });
  
  
    mainWindow.loadFile('index.html');
  
    mainWindow.setMenu(null); // Remove the default menu

    ipcMain.on('close-app', () => {
      mainWindow.close();
    });
    
    ipcMain.on('minimize-app', () => {
        mainWindow.minimize();
    });
    
    ipcMain.on('maximize-app', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('open-settings', () => {
      if (settingsWindow === null) {
          createSettingsWindow();
      } else {
          settingsWindow.focus();
      }
    });

    mainWindow.on("closed", () => {
      if (settingsWindow === null) {
        
      } else {
        settingsWindow.close()
      }
    });

    loadingScreen.on("closed", () => {
      loadingScreen = null
      if (ldngscrnclswapp === true) {
        app.quit()
      }
    });
  
    setTimeout(() => {
      if (loadingScreen) {
        ldngscrnclswapp = false
        loadingScreen.close();
      }
      mainWindow.maximize();
      mainWindow.show();
    }, randomLoadingTime);
} 

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
      width: 800,
      height: 550,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      },
      resizable: false,
      parent: mainWindow, // Optional: make the settings window a modal of the main window
      transparent: true,
      frame: true,
      title: "Loading...",
      icon: path.join(__dirname, 'logo.ico'),
  });

  settingsWindow.loadFile('settings.html');
  settingsWindow.setMenu(null)

  settingsWindow.on('closed', () => {
    settingsWindow = null; // Dereference the window object
  });
}

app.whenReady().then(() => {
  loadingScreen = createLoadingScreen();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});