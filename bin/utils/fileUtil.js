var fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
var path = require('path');
var exludeFolders = ['.DS_Store']; // eslint-disable-line

/**
 * readDir
 * @param {string} dirPath - dirPath
 * @param {Object} fileFormat - fileFormat
 * @return {Array} filesWithPath
*/
async function readDir(dirPath, fileFormat) {
    var resFiles = [];
    var files = [];

    try {
        files = await readdir(dirPath);
    } catch (e) {
        //
    }

    files.forEach(function(fileName) {
        if (exludeFolders.indexOf(fileName) === -1) {
            resFiles.push(`${dirPath}/` + fileName);
        }
    });

    if (fileFormat) {
        resFiles = resFiles.filter(el => path.extname(el) === '.' + fileFormat);
    }

    return resFiles;
}

/**
 * readMultiDirUtil
 * @param {Object} arrayPath - arrayPath
 * @param {Object} fileFormat - fileFormat
 * @return {Array} resFiles
*/
async function readMultiDir(arrayPath, fileFormat) {
    var resFiles = [];

    for (let index = 0; index < arrayPath.length; index++) {
        const fileName = arrayPath[index];

        var dirFiles = await readDir(fileName);
        if (dirFiles) {
            resFiles = resFiles.concat(dirFiles);
        }
    }

    if (fileFormat) {
        resFiles = resFiles.filter(el => path.extname(el) === '.' + fileFormat);
    }

    return resFiles;
}

/**
 * writeFile
 * @param {Object} filePath - arrayPath
 * @param {Object} content - fileFormat
 * @param {string} fileFormat - fileFormat
*/
function writeFile(filePath, content, fileFormat) {
    fs.writeFile(filePath, fileFormat === 'json' ? JSON.stringify(content, null, 2) : '', function(err) {
        if (err) {
            console.log('err');
        } else {
            console.log(`${filePath} file successfully updated.`);
        }
    });
}

/**
 * getFileNameFromPath
 * @param {Object} filePath - filePath
 * @return {string} name
*/
function getFileNameFromPath(filePath) {
    var name = '';
    var lastIndex = filePath.lastIndexOf('/');
    name = filePath.substring(lastIndex + 1);

    return name;
}

/**
 * readFile
 * @param {Object} filePath - filePath
 * @return {string} file
*/
async function readFile(filePath) {
    var data = null;

    try {
        data = await readfile(filePath);
    } catch (e) {
        //
    }

    return data;
}

module.exports = {
    readFile: readFile,
    readDir: readDir,
    readMultiDir: readMultiDir,
    writeFile: writeFile,
    getFileNameFromPath: getFileNameFromPath
};
