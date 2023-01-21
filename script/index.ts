import * as fs from 'fs';
import * as path from "path";

const iterateDir = (
    dir: string,
    cb: (path: string, dir: boolean) => any = (a, b) => {}
) => {
    const _dir = fs.readdirSync(dir);
    const tree = {}
    for (const file of _dir) {
        const _path = path.join(dir, file);
        if (fs.statSync(_path).isDirectory()) {
            tree[file] = iterateDir(_path, cb);
            cb(_path, true);
        } else {
            tree[file] = _path;
            cb(_path, false);
        }
    }
    return tree;
}

const jsToRename = Array<string>();
iterateDir('build/esm', (
    file, isDir) => {
    if (isDir) return;
    if (path.extname(file) === '.js' &&
        path.basename(file) !== '388.js')
        jsToRename.push(file);
});

for (const file of jsToRename) {
    fs.rename(file, file.replace('.js', '.mjs'), () => {});
}
