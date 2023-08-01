const options = require('./options');
var path = require('path');
var fileUtil = require('./utils/fileUtil');
var xmlHelper = require('./utils/xmlHelper');

var sharedLibsPath = options.path + 'libraries';
var sitesPath = options.path + 'sites';

/**
 * Merge Pages files into main library.xml
 * npm run library:build
*/
async function processSharedLibraries() {
    var libraryFolders = await fileUtil.readDir(path.join(__dirname, sharedLibsPath));

    libraryFolders.forEach(file => {
        readPages(file);
    });
}

/**
 * processPrivateLibraries
*/
async function processPrivateLibraries() {
    var sitesFolders = await fileUtil.readDir(path.join(__dirname, sitesPath));

    for await (let filePath of sitesFolders) {
        var libraryFolderPath = path.join(filePath, 'library');
        var privateLibraryFiles = await fileUtil.readDir(libraryFolderPath);

        if (privateLibraryFiles && privateLibraryFiles.length > 0) {
            readPages(libraryFolderPath);
        }
    }
}

/**
 * Read Pages
 * @param {string} libraryFolderPath - libraryFolderPath
*/
async function readPages(libraryFolderPath) {
    var libraryPages = await fileUtil.readDir(path.join(libraryFolderPath, 'pages'));

    if (!libraryPages || libraryPages.length === 0) {
        return;
    }

    var pagesContent = [];

    for await (let filePath of libraryPages) {
        var file = await fileUtil.readFile(filePath);
        var xmlObj = await xmlHelper.parseFile(file);

        if (xmlObj.library.content && xmlObj.library.content.length > 0) {
            xmlObj.library.content.forEach(asset => {
                pagesContent.push(asset);
            });
        }
    }

    mergeLibrary(pagesContent, libraryFolderPath);
}

/**
 * mergeLibrary
 * @param {Object} pagesContent - pagesContent
 * @param {string} libraryFolderPath - libraryFolderPath
*/
async function mergeLibrary(pagesContent, libraryFolderPath) {
    var file = await fileUtil.readFile(`${libraryFolderPath}/libraryAssets.xml`);
    var xmlObj = await xmlHelper.parseFile(file);
    var libraryContent = xmlObj.library.content;
    var allContentAssets = libraryContent ? pagesContent.concat(libraryContent) : pagesContent;

    xmlObj.library.content = allContentAssets;
    xmlHelper.writeFile(xmlObj, `${libraryFolderPath}/library.xml`);
}

processSharedLibraries();
processPrivateLibraries();
