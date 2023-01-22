import {CachedUser, DownloadTask, IFileHash} from "./util";
import * as async from "async";
import {getBookInfoGuest, getList, getVolumeEpubAndCalcHash, getVolumeEpubMD5} from "./api";
import * as fs from "fs";
import * as path from "path";
import {asyncify} from "async";

export const crawlBookList = async (
    user: CachedUser,
    pageSize = 18,
    pretty = false
) => {
    let breakFlag = false, now = 1, sign = 0;
    const bookList = [];
    while (!breakFlag) {
        const resp = await getList(now, pageSize, user.token, user.appToken);
        if (!resp.status) console.warn('GetList fail: ', resp);
        else {
            const data = resp.data as Array<any>;
            if (data.length < pageSize || !data.length) breakFlag = true;
            const newSign = data[0].articleid;
            if (newSign === sign) break;
            else sign = newSign;
            for (const index in data) {
                const ii = parseInt(index);
                bookList.push({...data[index], _id: (now - 1) * pageSize + ii});
            }
            console.log(`Get page ${now ++} of book list.`);
        }
    }
    fs.writeFileSync(process.env.BOOKLIST_DIR, JSON.stringify(bookList));
    if (pretty) {
        const out = (path.extname(process.env.BOOKLIST_DIR)) ? String(process.env.BOOKLIST_DIR)
                .replace(".json", ".pretty.json") :
            path.basename(process.env.BOOKLIST_DIR) + ".pretty.json";
        fs.writeFileSync(out, JSON.stringify(bookList, null, "\t"));
    }
    return bookList;
}

export const crawlBookInfo = async (
    rawBookList: Array<any>,
    pretty = false
) => {
    const aidList = rawBookList.map(i => parseInt(i.articleid));
    let bookInfo;
    try {
        bookInfo = await async.mapLimit(aidList as number[],
            parseInt(process.env.ASYNC_LIMIT_GUEST), asyncify(async aid => {
                const resp = await getBookInfoGuest(aid);
                if (resp.status) console.log(`Get book ${aid} info ok.`)
                return resp.status ? {...resp.data, aid} : undefined;
            }));
    } catch (e) {
        console.error(e);
    } finally {
        fs.writeFileSync(process.env.BOOKINFO_DIR, JSON.stringify(bookInfo));
        if (pretty) {
            const out = (path.extname(process.env.BOOKINFO_DIR)) ? String(process.env.BOOKINFO_DIR)
                    .replace(".json", ".pretty.json") :
                path.basename(process.env.BOOKINFO_DIR) + ".pretty.json";
            fs.writeFileSync(out, JSON.stringify(bookInfo, null, "\t"));
        }
    }
    return bookInfo;
}

export const crawlBookFileHash = async (
    users: CachedUser[],
    taskList: DownloadTask[],
    balancing = false,
    pretty = false
) => {
    let listWithMd5, n = users.length;
    try {
        listWithMd5 = await async.mapLimit(taskList,
            parseInt(process.env.ASYNC_LIMIT), asyncify(async (task: DownloadTask) => {
                const { aid, vid } = task;
                const _id = vid * 10000 + aid;  // "aid": \d\d\d\d\d matches nothing.
                const resp = await getVolumeEpubMD5(
                    aid, vid, users[_id % n].token, users[_id % n].appToken,
                    balancing ? (_id & 1 ? 0 : 1) : 0
                );
                if (!resp.status)
                    console.warn(`Get book ${aid} volume ${vid} epub md5 failed: ${resp.msg}`);
                else console.log(`Get book ${aid} volume ${vid} epub md5 ok.`);
                return resp.status ? {
                    aid, vid, md5: { epub: resp.md5 }, _id} : undefined;
            }));
    } catch (e) {
        console.error(e);
    } finally {
        fs.writeFileSync(process.env.FILEINFO_DIR, JSON.stringify(listWithMd5));
        if (pretty) {
            const out = (path.extname(process.env.FILEINFO_DIR)) ? String(process.env.FILEINFO_DIR)
                    .replace(".json", ".pretty.json") :
                path.basename(process.env.FILEINFO_DIR) + ".pretty.json";
            fs.writeFileSync(out, JSON.stringify(listWithMd5, null, "\t"));
        }
    }
    return listWithMd5;
}

export const crawlBookEpub = async (
    users: CachedUser[],
    tasks: IFileHash[],
    balancing = false
) => {
    const n = users.length;
    try {
        let cnt = 0;
        await async.forEachLimit(tasks,
            parseInt(process.env.ASYNC_LIMIT),
            asyncify(async (task: IFileHash) => {
                const { aid, vid, _id } = task, ans = task.md5.epub;
                let ok = false;
                for (let time = 3; time--; ) {
                    const md5 = await getVolumeEpubAndCalcHash(
                        aid.toString(), vid.toString(), process.env.DOWNLOAD_DIR,
                        users[_id % n].token, users[_id % n].appToken,
                        balancing ? (_id & 1 ? 0 : 1) : 0,
                        e => console.warn(`${e.config.url} download failed.`)
                    );
                    // noinspection JSAssignmentUsedAsCondition
                    if (ok = (md5 === ans)) break;
                    else console.warn(`Epub ID ${_id} md5 not matches, ${time} retry remaining...`);
                }
                if (!ok) console.warn(`[EPUB] Book ${aid} volume ${vid} download failed with md5 not matching.`);
                else console.log(`[EPUB] Download book \t\t${_id}: \taid = ${aid}, vid = ${vid}`);
            }));
    } catch (e) {
        console.error(e)
    }
}