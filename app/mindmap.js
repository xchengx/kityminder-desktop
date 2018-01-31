const fs = require('fs');
const path = require('path');
const dialog = require('electron').dialog;
module.exports = {
    openMind:function openMind(defaultpath,callback) {
        dialog.showOpenDialog({
            defaultPath: defaultpath,
            properties: [
                'openFile',
            ],
            filters: [
                { name: 'MindMap', extensions: ['km', 'md'] },
            ]
        }, function (res) {
            callback(res) //我这个是打开单个文件的
        });
    },
    saveMind:function saveMindMap(filepath, data, callback) {
        fs.writeFile(filepath, data, { flag: 'w' }, callback);
    },
    readMind:function readMindMap(filepath, callback) {
        let path = filepath;
        fs.readFile(path, { flag: 'r+', encoding: 'utf8' }, function (err, data) {
            if (err) {
                console.error(err);
                dialog.showMessageBox({ type: "error", buttons: ["取消","确定"], message: '打开文件时遇到错误' });
                return;
            }
            fileType = path.substr(path.lastIndexOf('.') + 1);
            switch (fileType) {
                case 'md':
                    fileType = 'markdown';
                    break;
                case 'km':
                case 'json':
                    fileType = 'json';
                    break;
                default:
                    dialog.showMessageBox({ type: "warning", buttons: ["取消","确定"], message: '只支持.md、.km文件' });
                    return;
            }
            callback(fileType, data);
        });
    },
}