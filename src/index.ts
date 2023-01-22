import * as yidm from '@kohaku/yidm-v3';
import {
    axiosDownloadFile,
    configEnv, downloadURLs, DownloadTask, getAllDownloadTask,
    getAllImageURL,
    initializeTokenCache,
    loadJSON, loadTaskFromLog,
    saveJSON,
    unsafeLoadTokenCache,
    userTableToArray, IFileHash
} from "./util";
import {getVolumeEpubAndCalcHash, setAxiosRetry} from "./api";
import {crawlBookEpub, crawlBookFileHash, crawlBookInfo, crawlBookList} from "./scripts";
import * as path from "path";
import * as async from "async";
import {asyncify} from "async";
import * as fs from "fs";

configEnv();

const main = async () => {

    /// Step 1. Login accounts and make token cache.
    ///=============================================================================
    const userTable = await initializeTokenCache();
    // const userTable = unsafeLoadTokenCache();
    const users = userTableToArray(userTable);
    // console.log(users);
    setAxiosRetry();

    /// Step 2. Get the list of all book.
    ///=============================================================================
    // const bookList = await crawlBookList(users[0]);
    // const bookList = loadJSON(process.env.BOOKLIST_DIR) as Array<any>;
    // console.log(bookList);

    /// Step 3. Calculate the image URLs and try to download.
    ///=============================================================================
    // const imageURL = getAllImageURL(bookList);
    // saveJSON('tmp/imageURL.json', imageURL);
    // saveJSON('tmp/imageURL.pretty.json', imageURL, true);
    // const imageURL = loadJSON('tmp/imageURL.json') as string[];
    // TODO: Some image cannot download. All of them in L size.
    // await downloadURLs(imageURL);

    /// Step 4. Get the volume information of books.
    ///=============================================================================
    // const bookInfo = await crawlBookInfo(bookList, true);
    // const bookInfo = loadJSON(process.env.BOOKINFO_DIR) as Array<any>;
    // console.log(bookInfo);

    /// Step 5. Construct the download tasks and get MD5 hash.
    ///=============================================================================
    // let downloadTasks = getAllDownloadTask(bookInfo);
    // let downloadTasks = loadTaskFromLog();
    // let downloadTasks = loadJSON('tmp/downTasks.json') as DownloadTask[];
    // console.log(downloadTasks, downloadTasks.length);
    // downloadTasks = await crawlBookFileHash(users, downloadTasks, true, true);

    /// Step 6. Load file info and try to download epub.
    ///=============================================================================
    // const fileHash = loadJSON(process.env.FILEINFO_DIR) as IFileHash[];
    // await crawlBookEpub(users, fileHash, true);


    debugger;
}

console.log(yidm.getAppToken());

main().then();
