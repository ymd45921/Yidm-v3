import * as yidm from '@kohaku/yidm-v3';
import {configEnv, initialize, unsafeLoadTokenCache, userTableToArray} from "./util";
import {getList} from "./api";
import {crawlBookList} from "./scripts";

configEnv();

const main = async () => {
    // const userTable = await initialize();
    const userTable = unsafeLoadTokenCache();
    const users = userTableToArray(userTable);
    console.log(users);
    const resp = await getList(625, 5, users[0].token, users[0].appToken);
    console.log(resp);
    const bookList = await crawlBookList(users[0]);
    debugger;
}

console.log(yidm.getAppToken());

main().then();
