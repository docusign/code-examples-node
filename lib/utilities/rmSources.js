/**
 * @file
 * remove the public/source files
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs')
    , sourceDirPath = path.resolve(__dirname, '../../public/source')
    ;


function deleteSourceDir() {
    // Delete all files except for .gitkeep
    // See https://stackoverflow.com/a/42182416/64904
    const directory = sourceDirPath
        , gitkeep = '.gitkeep'
        , files = fs.readdirSync(directory);

    for (const file of files) {
        if (file == gitkeep) {
            continue;
        }
        fs.unlinkSync(path.join(directory, file));
    }
}

console.log ("\nDeleting the public/source files...");
deleteSourceDir();
console.log ("Done.\n");
