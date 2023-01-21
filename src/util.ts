import * as fs from "fs";
import {login, verifyToken} from "./api";
import * as yidm from "@kohaku/yidm-v3";

export const configEnv = () => require('dotenv').config();

export const getEnv = () => {
    configEnv();
    const usernames = String(process.env.USER_NAME).split(',');
    const passwords = String(process.env.PASSWORD).split(',');

    console.assert(usernames.length === passwords.length,
        'Incorrect yidm account configuration in env.');
    const cnt = Math.min(usernames.length, passwords.length);
    console.assert(cnt > 0, 'No yidm account configured.');

    const id = Array<{uname: string, pass: string}>();
    for (let i = 0; i < cnt; ++ i) {
        id.push({uname: usernames[i], pass: passwords[i]});
    }
    return [id];
}

const tokenCachePath = 'tmp/token.json';

export class CachedUser {
    uname: string;
    pass: string;
    uid: number;
    name: string;
    deviceId: string;
    token: string;

    get appToken() {
        return yidm.getAppToken({deviceId: this.deviceId});
    }
}

export const storeTokenCache = table =>
    fs.writeFileSync(tokenCachePath, JSON.stringify(table));

export const unsafeLoadTokenCache = () =>
    fs.existsSync(tokenCachePath) ?
        JSON.parse(fs.readFileSync(tokenCachePath).toString()) as object : {}

export const verifyAllStoredToken = async (cache: object) => {
    let table = {}
    for (const uname in cache) {
        const user = cache[uname] as CachedUser;
        let {pass, uid, name, deviceId, token} = user;
        const {status} = await verifyToken(user.token, yidm.getAppToken({deviceId}));
        if (!status) {
            console.log('Trying log in user ' + uname);
            const resp = await login(user.uname, user.pass);
            if (resp.status) {
                uid = resp.uid;
                name = resp.name;
                token = resp.token;
            } else continue;
        }
        table[uname] = { uname, pass, uid, name, deviceId, token }
    }
    return table;
}

export const initialize = async () => {
    const [ids] = getEnv();
    let cache = unsafeLoadTokenCache();
    let table = await verifyAllStoredToken(cache);
    for (const {uname, pass} of ids) {
        let uid, name, token;
        const deviceId = yidm.randomDeviceId();
        if (!!table[uname]) continue;
        console.log('Trying log in user ' + uname);
        const resp = await login(uname, pass, yidm.getAppToken({deviceId}));
        if (resp.status) {
            uid = resp.uid;
            name = resp.name;
            token = resp.token;
        } else continue;
        table[uname] = { uname, pass, uid, name, deviceId, token }
    }
    storeTokenCache(table);
    return table;
}

export const userTableToArray = table => {
    const array = Array<CachedUser>();
    for (const uname in table)
        array.push(table[uname] as CachedUser);
    return array;
}
