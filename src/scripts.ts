import {CachedUser, calcFileHash, DownloadTask, IFileHash, randomSelectUser, volumeEpubName} from "./util";
import * as async from "async";
import {getBookInfoGuest, getList, getVolumeEpubAndCalcHash, getVolumeEpubMD5} from "./api";
import * as fs from "fs";
import * as path from "path";
import {asyncify} from "async";
import {getEPUBFiles, getEPUBFileHash} from "./batch";

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
    let listWithMd5;
    try {
        listWithMd5 = await getEPUBFileHash(users, taskList, balancing);
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
    try {
        await getEPUBFiles(users, tasks, balancing);
    } catch (e) {
        console.error(e)
    }
}