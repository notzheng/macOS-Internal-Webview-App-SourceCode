const fs = require('fs/promises');
const path = require('path');

const { reverseSourceMaps } = require("./sourcemap");


const FILES_DIR = path.join(__dirname, '../files');
const SRC_DIR = path.join(__dirname, '../src');
const main = async () => {
    // const files = await fs.readdir(FILES_DIR);

    // for (let filename of files) {
    //     if (!filename.endsWith('.map')) {
    //         return;
    //     }
    //     const appName = filename.split('.')[0];
    //     const fileFullPath = path.join(FILES_DIR, filename);

    //     await reverseSourceMap(fileFullPath, path.join(SRC_DIR, appName))


    // }

    reverseSourceMaps(FILES_DIR, SRC_DIR)
}


main();