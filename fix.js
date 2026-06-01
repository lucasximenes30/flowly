const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            content = content.replace(/aler"([^"]*)"/g, "alert('$1')");
            content = content.replace(/impor"([^"]+)"/g, "import('$1')");
            content = content.replace(/redirec"([^"]+)"/g, "redirect('$1')");
            content = content.replace(/spli"([^"]+)"/g, "split('$1')");
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}
processDir('app');
processDir('components');
processDir('lib');
