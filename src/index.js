const {createWindow} = require ('./main')
const {app} = require('electron')

require('./database')

require('electron-reload')(__dirname)

app.allowRenderProcessReuse = false;
app.whenReady().then(createWindow);

