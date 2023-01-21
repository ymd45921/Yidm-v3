import {CachedUser} from "./util";
import * as async from "async";
import {getList} from "./api";
import * as fs from "fs";
import * as path from "path";

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