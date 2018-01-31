const ipc = require('electron').ipcRenderer;
const MindMap = require('./mindmap');
/**
 * 当前mindmap的保存路径
 */
let mindMapPath;

ipc.on("doImport", function (e, path) {
    MindMap.readMind(path, function (fileType, content) {
        // callback(paths[0],fileType,data)
        mindMapPath = path;
        editor.minder.importData(fileType, content).then(function (data) {
            console.log(data);
        });
    });

});
ipc.on("doExport", function (e, filename, fileType, firstSave) {
    pkgData(fileType, (content) => {

        if (fileType === 'png') {
            //导出png的时候km返回的是base64的串，因此要转成二进制再写入文件
            content = new Buffer(content.substr(22), 'base64');
        }
        MindMap.saveMind(filename, content, function (err) {
            if (err) {
                e.sender.send('showExportMessageBox', firstSave, err);
            } else {
                if (!firstSave) {
                    mindMapPath = filename;
                } else {
                    e.sender.send('showExportMessageBox', firstSave, err);
                }
            }
        });
    });
})
ipc.on("doSave", function (e, fileType) {
    if (mindMapPath) {
        pkgData(fileType, (content) => {
            MindMap.saveMind(mindMapPath, content, function (err) {
                if (err) {
                    e.sender.send('showSaveMessageBox', err);
                    console.log("doSave>>" + err);
                } else {
                    console.log("doSave>>ok");
                }
            });
        });
    } else {
        e.sender.send("doSave");
    }
})
function pkgData(type, callback) {
    var exportType;
    switch (type) {
        case 'km':
            exportType = 'json';
            break;
        case 'md':
            exportType = 'markdown';
            break;
        default:
            exportType = type;
            break;
    }
    editor.minder.exportData(exportType).then(callback);
}
