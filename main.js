const { app, BrowserWindow, Menu: menu } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const ipcMain = require('electron').ipcMain;
const ipc = require('electron').ipcRenderer;
const dialog = require('electron').dialog;
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
// window 对象的引用列表，用来支持多个窗口
let windowsRegistry = [];
/**导出*/
function doExport(window, fileType, firstSave = false) {
	dialog.showSaveDialog({
		title: "导出",
		defaultPath: __dirname,
		filters: [
			{
				name: 'MindMap', extensions: [fileType]
			},
		]
	}, function (filename) {
		if (filename) {
			window.webContents.send('doExport', filename, fileType, firstSave);
		}
	});
}
/**保存，默认文件类型为km */
function doSave(window) {
	window.webContents.send('doSave', "km");
}

/*导入 */
function dowImport(window) {
	dialog.showOpenDialog({
		defaultPath: __dirname,
		properties: [
			'openFile',
		],
		filters: [
			{ name: 'MindMap', extensions: ['km', 'md'] },
		]
	}, function (paths) {
		if (paths) {
			window.webContents.send('doImport', paths[0]);
		}
	});
}

/***新建窗口 */
function createWindow() {
	// 创建浏览器窗口。
	let mainWindow = new BrowserWindow({ icon: 'icon.png', width: 800, height: 600 })
	//将新窗口放到数组里面
	windowsRegistry.push(mainWindow)
	// 然后加载应用的 index.html。
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'app/index.html'),
		protocol: 'file:',
		slashes: true
	}))

	// 打开开发者工具。
	mainWindow.webContents.openDevTools();

	//当关闭窗口的时候从window集合里面将window对象清除
	mainWindow.on('closed', (event) => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		const index = windowsRegistry.indexOf(event.sender)
		windowsRegistry.splice(index, 1);
	})
	ipcMain.on("doSave", (e) => {
		doExport(mainWindow, "km", true);
	})
	ipcMain.on("showExportMessageBox", (e, firstSave, err) => {
		if (err) {
			dialog.showMessageBox({ type: "err", buttons: ["确定"], message: firstSave ? "保存失败" : "导出失败" });
		} else {
			if (!firstSave)
				dialog.showMessageBox({ type: "info", buttons: ["确定"], message: "完成" });
		}
	})
	ipcMain.on("showSaveMessageBox", (e, err) => {
		if (err) {
			dialog.showMessageBox({ type: "err", buttons: ["确定"], message: "保存失败" });
		}
	})
}
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', e => {
	let diyMenu = [{
		label: '文件',
		submenu: [
			{
				label: '新建窗口',
				// icon:'/assets/icons/new.png',
				accelerator: 'CmdOrCtrl+I',
				click: function (item, window) {
					createWindow();
				}
			},
			{
				label: '打开',
				// icon:'assets/icons/import.png',
				accelerator: 'CmdOrCtrl+I',
				click: function (item, window) {
					dowImport(window);
				}
			},
			{
				label: '导出',
				// icon:'./assets/icons/export.png',
				submenu: [{
					label: 'SVG',
					click: function (item, window) {
						doExport(window, 'svg');
					}
				}, {
					label: 'PNG',
					click: function (item, window) {
						doExport(window, 'png');
					}
				}, {
					label: 'MarkDown',
					click: function (item, window) {
						doExport(window, 'md');
					}
				}]
			},
			{
				label: '设置',
				// icon:'./assets/icons/settings.png',
				accelerator: 'CmdOrCtrl+Q',
				click() { }
			},
			{
				type: 'separator'
			},
			{
				label: '退出',
				// icon:'assets/icons/exit.png',
				accelerator: 'CmdOrCtrl+Q',
				click: function (item, window) {
					window.destroy()
				}
			}]
	}, {
		label: '保存',
		// icon:'./assets/icons/save.png',
		accelerator: 'CmdOrCtrl+S',
		click: function (item, window) {
			doSave(window);
		}
	}]
	const menuBar = menu.buildFromTemplate(diyMenu)
	menu.setApplicationMenu(menuBar)
	createWindow();
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// 在macOS上，当单击dock图标并且没有其他窗口打开时，
	// 通常在应用程序中重新创建一个窗口。
	if (win === null) {
		createWindow();
	}
})
