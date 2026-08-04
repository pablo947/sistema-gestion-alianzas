const fs = require('fs');
const path = require('path');

const dirToSearch = path.join(__dirname, 'src');

function renameRecursive(dir) {
    let files = fs.readdirSync(dir);
    // Sort so files are renamed before their parent directories
    for (let f of files) {
        let fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            renameRecursive(fullPath);
        }
        
        let newName = f.replace(/Projects/g, 'Programs')
                       .replace(/projects/g, 'programs')
                       .replace(/Project/g, 'Program')
                       .replace(/project/g, 'program');
        if (newName !== f) {
            let newPath = path.join(dir, newName);
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed ${f} -> ${newName}`);
        }
    }
}

renameRecursive(dirToSearch);
