const fs = require('fs');
const { execSync } = require('child_process');
const dir = './public/images';
const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg')) {
    const filePath = dir + '/' + file;
    const stat = fs.statSync(filePath);
    if (stat.size > 0) {
      const newFile = file.replace(/\.(png|jpeg|jpg)$/, '.webp');
      console.log('Converting', file, 'to', newFile);
      try {
        execSync(`npx -y sharp-cli@latest -i "${filePath}" -o "${dir}/${newFile}"`);
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to convert', file, e.message);
      }
    }
  }
}
