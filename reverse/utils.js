const fs = require("fs");
const path = require("path");


/**
 * Check given file is exits
 *
 * @param {string} filePath
 * @returns {boolean} is file exists
 */
const checkIsFilePathExists = (filePath) => {
    return fs.existsSync(filePath);
};

/**
* Normalize file path
*
* @param {string} originFileName
* @returns string
*/
const normalizeFilePath = (originFileName) =>
    path
        .normalize(originFileName)
        .replace(/^(\.\.[/\\])+/, "")
        .replace(/[\^|\&#,+()?$~%'":*?<>{}]/g, "")
        .replace(/\/$/, "")
        .replace(" ", ".");



class Logger {
    log(...args) {
        console.log(...args);
    }

    info(...args) {
        this.log('INFO:', ...args);
    }

    warning(...args) {
        this.log('WARNING:', ...args);
    }

    success(...args) {
        this.log('SUCCESS:', ...args);
    }

    error(...args) {
        this.log('ERROR:', ...args);
    }
}



const logger = new Logger();


const smartWriteFile = async (
    fullPath,
    content,
    { override = true, encoding = "utf-8" } = {}
) => {
    if (!override) {
        if (checkIsFilePathExists(fullFilePath)) {
            return;
        }
    }
    const parentDirPath = path.dirname(fullPath);
    if (!checkIsFilePathExists(fullPath)) {
        await fs.promises.mkdir(parentDirPath, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, content, encoding);
};


module.exports = {
    logger,
    smartWriteFile,
    normalizeFilePath,
    checkIsFilePathExists,
};
