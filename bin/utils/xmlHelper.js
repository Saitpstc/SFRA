var fs = require('fs');
var xml2js = require('xml2js');
var formatXml = require('xml-formatter');

/**
 * getLibraryHead
 * @param {Object} inputXmlObj - inputXmlObj
 * @returns {Object} xmlObj
*/
function getLibraryHead(inputXmlObj) {
    if (!inputXmlObj.library) {
        return;
    }

    var xmlObj = JSON.parse(JSON.stringify(inputXmlObj));

    Object.keys(xmlObj.library).forEach(function (propertyName) {
        if (propertyName !== '$') {
            delete xmlObj.library[propertyName];
        }
    });

    return xmlObj;
}

/**
 * writeFile
 * @param {Object} xmlObj - xmlObj
 * @param {string} outpuFileName - outpuFileName
*/
function writeFile(xmlObj, outpuFileName) {
    var builder = new xml2js.Builder({
        headless: false,
        xmldec: { 'version': '1.0', 'encoding': 'UTF-8' }
    });

    var fileFolder =  outpuFileName.substring(0, outpuFileName.lastIndexOf('/'));

    if (!fs.existsSync(fileFolder)) {
        fs.mkdir(fileFolder, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }

    // deepXmlLoop(xmlObj);

    var finalXml = builder.buildObject(xmlObj);

    finalXml = finalXml.replace(/&#xD;&#xD;/g, '&#13;'); // WINDOWS fix for double new line entity
    finalXml = finalXml.replace(/&#xD;/g, '&#13;');


    var formattedXML = formatXml(finalXml, {
        collapseContent: true,
        lineSeparator: '\r\n'
    });

    // Add line separator for Content and Folder
    formattedXML = formattedXML.replace(/<\/content>/g, '</content>\r\n').replace(/<\/folder>/g, '</folder>\r\n');

    fs.writeFile(outpuFileName, formattedXML, function(err) {
        if (err) {
            console.log('err');
        } else {
            var shortNameIndex = outpuFileName.lastIndexOf('/') + 1;
            var shortName = outpuFileName.substring(shortNameIndex); // eslint-disable-line
            console.log(`${outpuFileName} file successfully updated.`);
        }
    });
}

/**
 * parseFile
 * @param {Object} data - data
 * @returns {Object} parsedFile
*/
async function parseFile(data) {
    var parsedFile = null;
    try {
        parsedFile = await xml2js.parseStringPromise(data);
    } catch (ex) {
        console.log('Exception: XML file is invalid');
    }

    return parsedFile;
}

/**
 * escapeXml
 * @param {string} unsafe - unsafe
 * @returns {string} string - string
*/
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&\r]/g, function (c) {
        switch (c) { // eslint-disable-line
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '`';
            case '\r': return '&#13;';
        }
    });
    //  return unsafe.replace(/[<>&'"]/g, function (c) { - removed single quote
    //  case '\'': return '&apos;';
    //  case '"': return '&quot;';
}

module.exports = {
    parseFile: parseFile,
    writeFile: writeFile,
    getLibraryHead: getLibraryHead
};
