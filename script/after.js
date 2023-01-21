const fs = require('fs');
// import * as fs from "fs";

const $388 = fs.readFileSync('src/yidm/388.js');
fs.writeFileSync('build/cjs/yidm/388.js', $388.toString());
fs.writeFileSync('build/esm/yidm/388.js', $388.toString());