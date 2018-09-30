const electron = require('electron')
const { machineId, machineIdSync } = require('node-machine-id');
const { app, BrowserWindow, ipcMain} = electron
const path = require('path')
const url = require('url')
const Menu = electron.Menu;
const Tray = electron.Tray;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let qrwin
let token

function createWindow() {
    // Create the browser window.
    let displays = electron.screen.getAllDisplays()
    let externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    if (externalDisplay) {
        const { width, height } = externalDisplay.workAreaSize        
        win = new BrowserWindow({
            x: externalDisplay.bounds.x,
            y: externalDisplay.bounds.y,
            alwaysOnTop: true,
            width: width,
            height: height,
            transparent: true,
            frame: false 
        })
        
    }else{
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
        win = new BrowserWindow({ 
            alwaysOnTop: true, 
            width: width, 
            height: height, 
            transparent: true, 
            frame: false})
        
    }
    win.custom = {
        'mid' : machineIdSync()
    }
    win.setIgnoreMouseEvents(true)
    win.setAlwaysOnTop(true, 'screen', 2147483631);
    win.setVisibleOnAllWorkspaces(true);
    // win.setFullScreenable(false);
    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

function createTray() {
    var trayMenuTemplate = [
        {
            label: 'QR Code',
            click: function () { 
                createQR()
            }
        },
        {
            label: 'Quit',
            click: function () {
                app.quit();
            }
        }
    ];

    trayIcon = path.join(__dirname, 'static', 'images');
    // console.log(trayIcon);
    appTray = new Tray(path.join(trayIcon, 'subtitlesTemplate.png'));
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setToolTip('PP DanMu');
    appTray.setContextMenu(contextMenu);
}

function createQR() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
    qrwin= new BrowserWindow({
        width: 500,
        height: 500
    })
    qrwin.custom = {
        'token': token
    };
    qrwin.loadURL(url.format({
        pathname: path.join(__dirname, 'qr.html'),
        protocol: 'file:',
        slashes: true
    }))
    console.log(token)


}
ipcMain.on('token', (event, arg) => {
    // console.log(arg) // prints "ping"
    token = arg;
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
    createTray()
    createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.