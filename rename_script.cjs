const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'src');

const replacements = [
  // Spanish
  { regex: /Proyectos/g, replacement: 'Programas' },
  { regex: /proyectos/g, replacement: 'programas' },
  { regex: /PROYECTOS/g, replacement: 'PROGRAMAS' },
  { regex: /Proyecto/g, replacement: 'Programa' },
  { regex: /proyecto/g, replacement: 'programa' },
  { regex: /PROYECTO/g, replacement: 'PROGRAMA' },
  // English
  { regex: /Projects/g, replacement: 'Programs' },
  { regex: /projects/g, replacement: 'programs' },
  { regex: /PROJECTS/g, replacement: 'PROGRAMS' },
  { regex: /Project/g, replacement: 'Program' },
  { regex: /project/g, replacement: 'program' },
  { regex: /PROJECT/g, replacement: 'PROGRAM' },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx') || dirPath.endsWith('.css') || dirPath.endsWith('.json')) {
        callback(dirPath);
      }
    }
  });
}

let modifiedFiles = 0;

walkDir(directoryToSearch, function(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  for (let rule of replacements) {
    newContent = newContent.replace(rule.regex, rule.replacement);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFiles++;
    console.log(`Modified: ${filePath}`);
  }
});

console.log(`Done! Modified ${modifiedFiles} files.`);
