import * as async from "async";
import {asyncify} from "async";
import {CachedUser, calcFileHash, DownloadTask, IFileHash, randomSelectUser, volumeEpubName} from "./util";
import {getVolumeEpubAndCalcHash, getVolumeEpubMD5} from "./api";
import * as path from "path";
import * as fs from "fs";

/**
 *
 * @param users     User to access Yidm
 * @param taskList  Volume info to get hash
 * @param balancing Enable load-balancing
 * @return          An array contains volume info with epub md5 hash attached.
 */
export const getEPUBFileHash = async (
    users: CachedUser[],
    taskList: DownloadTask[],
    balancing = false
): Promise<IFileHash[]> => {
    return async.mapLimit(taskList,
        parseInt(process.env.ASYNC_LIMIT), asyncify(async (task: DownloadTask) => {
            const { aid, vid } = task;
            const _id = vid * 10000 + aid;  // "aid": \d\d\d\d\d matches nothing.
            const user = randomSelectUser(users);
            const resp = await getVolumeEpubMD5(
                aid, vid, user.token, user.appToken,
                balancing ? (_id & 1 ? 0 : 1) : 0
            );
            if (!resp.status)
                console.warn(`[MD5] Get book ${aid}_${vid} epub md5 failed: ${resp.msg}`);
            else console.log(`[MD5] Get book ${aid}_${vid} epub md5 ok.`);
            return resp.status ? {
                aid, vid, md5: { epub: resp.md5 }, _id} : undefined;
        }));
}

/**
 *
 * @param hashDictionary    Contains MD5 truth values for particular EPUB files
 * @param epubDirectory     Directory of the EPUB files that will be tested
 * @param concurrency       Maximum number of concurrences, override definition in .env
 * @return                  An array containing information of the EPUB files that MD5 not matched.
 */
export const localCheckEPUBFileHash = async (
    hashDictionary: IFileHash[],
    epubDirectory: string = process.env.DOWNLOAD_DIR,
    concurrency = parseInt(process.env.ASYNC_LIMIT_LOCAL)
): Promise<IFileHash[]> => {
    return async.filterLimit(
        hashDictionary, concurrency, asyncify(
            async (task: IFileHash) => {
                const { aid, vid } = task, ans = task.md5.epub;
                const fileDir = path.join(epubDirectory,
                    volumeEpubName(aid.toString(), vid.toString()));
                if (fs.existsSync(fileDir)) {
                    const md5 = await calcFileHash(fileDir);
                    return !(md5 === ans);
                } else return true;
            }
        ));
}

/**
 *
 * @param users         User to access Yidm
 * @param taskList      EPUB file info to download
 * @param balancing     Enable load-balancing
 * @param destination   Download directory, override definition in .env
 * @param concurrency   Maximum number of concurrences, override definition in .env
 * @param tolerance     Maximum retries in case of hash error, override definition in .env
 */
export const getEPUBFiles = async (
    users: CachedUser[],
    taskList: DownloadTask[],
    balancing = false,
    destination: string = process.env.DOWNLOAD_DIR,
    concurrency = parseInt(process.env.ASYNC_LIMIT),
    tolerance = parseInt(process.env.RETRY_HASHERROR)
) => {
    const naming = (aid: number, vid: number) => path.join(destination,
        volumeEpubName(aid.toString(), vid.toString()))
    return async.forEachLimit(taskList, concurrency,
        asyncify(async (task: IFileHash) => {
            const { aid, vid, _id } = task, ans = task.md5.epub;
            const fileDir = naming(aid, vid);
            if (fs.existsSync(fileDir)) {
                const md5 = await calcFileHash(fileDir);
                if (md5 === ans) {
                    console.log(`[SKIP] Book epub \t\t${_id} exist and md5 checked: \taid = ${aid}, vid = ${vid}`);
                    return;
                } else console.warn(`[EPUB] Book epub \t${_id} exist but md5 not match, re-download.`);
            }
            let ok = false;
            for (let time = tolerance; time--; ) {
                const user = randomSelectUser(users);
                const md5 = await getVolumeEpubAndCalcHash(
                    aid.toString(), vid.toString(), destination,
                    user.token, user.appToken,
                    balancing ? (_id & 1 ? 0 : 1) : 0,
                    e => console.warn(`${e.config.url} download failed.`)
                );
                // noinspection JSAssignmentUsedAsCondition
                if (ok = (md5 === ans)) break;
                else console.warn(`[MD5ERROR] Epub ID ${_id} md5 not matches, ${time} retry remaining...`);
            }
            if (!ok) console.warn(`[EPUB] Book ${aid} volume ${vid} download failed with md5 not matching.`);
            else console.log(`[EPUB] Download book \t\t${_id}: \taid = ${aid}, vid = ${vid}`);
        }));
}