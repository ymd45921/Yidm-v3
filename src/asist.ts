// noinspection JSUnusedLocalSymbols

import {configEnv, IFileHash, loadJSON, saveJSON, unsafeLoadTokenCache, userTableToArray, volumeEpubName} from "./util";
import * as async from "async";
import * as fs from "fs";
import {asyncify} from "async";
import * as path from "path";
import {getEPUBFileHash, getEPUBFiles, localCheckEPUBFileHash} from "./batch";

const taskList = (loadJSON('tmp/taskList.json') as IFileHash[]);
const $userCache = userTableToArray(unsafeLoadTokenCache());

const copyFilesInCollection = (
    collection: IFileHash[],
    destination = 'tmp/out2/',
    source: string = process.env.DOWNLOAD_DIR
) => {
    return async.forEachLimit(
        collection, parseInt(process.env.ASYNC_LIMIT_LOCAL),
        asyncify(async (task: IFileHash) => {
            const {aid, vid} = task,
                name = volumeEpubName(aid.toString(), vid.toString());
            const fileDir = path.join(source, name);
            if (fs.existsSync(fileDir))
                fs.copyFileSync(fileDir, path.join(destination, name));
            else console.log(`${name} is not exists`);
        })
    )
}

const getMD5HashInCollection = async (
    collection: IFileHash[],
    json = 'tmp/aux_MD5.json'
) => {
    const resp = await getEPUBFileHash(
        $userCache, collection, true
    );
    saveJSON(json, resp, true);
    return resp;
}

const compareFileHash = (
    a: IFileHash, b: IFileHash
): number => Math.sign(a._id - b._id);

const compareMD5Set = (
    sortedNew: IFileHash[], sortedOld: IFileHash[]
) => {
    if (sortedNew.length !== sortedOld.length) return -1;
    let cnt: number;
    for (let i = cnt = 0; i < sortedNew.length; ++ i) {
        if (sortedNew[i].vid !== sortedOld[i].vid) return -1;
        if (sortedNew[i].md5.epub !== sortedOld[i].md5.epub) ++cnt;
    }
    return cnt;
}

(async () => {

    configEnv();

    // await copyFilesInCollection(taskList);
    // const reGotMD5 = await getMD5HashInCollection(taskList);
    const reGotMD5 = loadJSON('tmp/aux_MD5.json') as IFileHash[];
    // const sortedNew = reGotMD5.sort(compareFileHash);
    // const sortedOld = taskList.sort(compareFileHash);

    // const reallyNG = await localCheckEPUBFileHash(reGotMD5, 'tmp/out2/', 256);
    // saveJSON('tmp/aux_reallyNG.json', reallyNG, true);
    const reallyNG = loadJSON('tmp/aux_reallyNG.json') as IFileHash[];
    // await copyFilesInCollection(reallyNG, 'tmp/out3/', 'tmp/out2/');
    await getEPUBFiles($userCache, reallyNG, true, 'tmp/out3', 24, 3);
})()