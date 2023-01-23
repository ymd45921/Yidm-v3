import * as yidm from '@kohaku/yidm-v3';
import {
    configEnv, downloadURLs, DownloadTask, getAllDownloadTask,
    getAllImageURL,
    initializeTokenCache,
    loadJSON, loadTaskFromLog,
    saveJSON,
    unsafeLoadTokenCache,
    userTableToArray, IFileHash
} from "./util";
import {setAxiosRetry} from "./api";
import {crawlBookEpub, crawlBookFileHash, crawlBookInfo, crawlBookList} from "./scripts";
import {localCheckEPUBFileHash} from "./batch";

configEnv();

const main = async () => {

    /// Step 1. Login accounts and make token cache.
    ///=============================================================================
    const userTable = await initializeTokenCache(true);
    // const userTable = await initializeTokenCache(false);    // TODO: Issue when uname is email.
    // const userTable = unsafeLoadTokenCache();
    const users = userTableToArray(userTable);
    setAxiosRetry();

    /// Step 2. Get the list of all book.
    ///=============================================================================
    const bookList = await crawlBookList(users[0]);
    // const bookList = loadJSON(process.env.BOOKLIST_DIR) as Array<any>;
    // console.log(bookList);

    /// Step 3. Calculate the image URLs and try to download.
    ///=============================================================================
    const imageURL = getAllImageURL(bookList);
    saveJSON('tmp/imageURL.json', imageURL);
    // saveJSON('tmp/imageURL.pretty.json', imageURL, true);
    // const imageURL = loadJSON('tmp/imageURL.json') as string[];
    // TODO: Some image cannot download. All of them in L size.
    await downloadURLs(imageURL);

    /// Step 4. Get the volume information of books.
    ///=============================================================================
    const bookInfo = await crawlBookInfo(bookList, true);
    // const bookInfo = loadJSON(process.env.BOOKINFO_DIR) as Array<any>;
    // console.log(bookInfo);

    /// Step 5. Construct the download tasks and get MD5 hash.
    ///=============================================================================
    let downloadTasks = getAllDownloadTask(bookInfo);
    // let downloadTasks = loadTaskFromLog();
    // let downloadTasks = loadJSON('tmp/downTasks.json') as DownloadTask[];
    await crawlBookFileHash(users, downloadTasks, true, true);

    /// Step 6. Load file info and try to download epub.
    ///=============================================================================
    const fileHash = loadJSON(process.env.FILEINFO_DIR) as IFileHash[];
    const taskList = await localCheckEPUBFileHash(fileHash);
    // saveJSON('tmp/taskList.json', taskList);
    // const taskList = (loadJSON('tmp/taskList.json') as IFileHash[]).reverse();
    console.log(`[INFO] Still ${taskList.length}/${fileHash.length} epub need to download.`);
    await crawlBookEpub(users, taskList, true);


    debugger;
}

console.log(yidm.getAppToken());

main().then();
