const fs = require('fs');

const $388 = fs.readFileSync('src/yidm/388.js');
fs.writeFileSync('build/yidm/388.js', $388.toString());