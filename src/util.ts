import * as fs from "fs";
import {login, verifyToken} from "./api";
import * as yidm from "@kohaku/yidm-v3";
import axios, {AxiosResponse} from "axios";
import * as path from "path";
import {promisify} from "util";
import * as stream from "stream";
import * as async from "async";
import {asyncify} from "async";
import * as crypto from "crypto";

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

export const retry = (times: number, fn: Function) => {
    fn().catch(err => times > 1 ? retry(times - 1, fn) : Promise.reject(err));
}

export const pause = (during: number) => new Promise(resolve => setTimeout(resolve, during));

export const delayRetry = (
    times: number, fn: Function, delay = 1000) => {
    fn().catch(err => times > 1 ?
        pause(delay).then(() => delayRetry(times - 1, fn, delay)) :
        Promise.reject(err));
}

export const storeTokenCache = table =>
    fs.writeFileSync(tokenCachePath, JSON.stringify(table));

export const unsafeLoadTokenCache = () =>
    fs.existsSync(tokenCachePath) ?
        JSON.parse(fs.readFileSync(tokenCachePath).toString()) as object : {}

export const loadJSON = (path: string) =>
    JSON.parse(fs.readFileSync(path).toString()) as object;

export const saveJSON = (path: string, data: object, pretty = false) =>
    fs.writeFileSync(path, JSON.stringify(data, null, pretty ? '\t' : undefined));

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

export const initializeTokenCache = async (renew = false) => {
    const [ids] = getEnv();
    let cache = renew ? {} : unsafeLoadTokenCache();
    let table = await verifyAllStoredToken(cache);
    for (let {uname, pass} of ids) {
        let uid, name, token;
        const deviceId = yidm.randomDeviceId();
        if (!!table[uname]) continue;
        console.log('Trying log in user ' + uname);
        const resp = await login(uname, pass, yidm.getAppToken({deviceId}));
        if (resp.status) {
            uid = resp.uid;
            name = resp.name;
            token = resp.token;
            uname = resp.uname;
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

export const volumeEpubName = (
    aid: string, vid: string, dir?: string
) => path.join(dir ?? '', `${aid}_${vid}.epub`);

const streamFinished = promisify(stream.finished);

export const axiosDownloadFile = async (
    axiosStream: Promise<AxiosResponse<any, any>>,
    path: string,
    onRejected?: (reason: any) => (void | PromiseLike<void>)
) => {
    const io = fs.createWriteStream(path)
    return axiosStream.then(res => {
        res.data.pipe(io);
        return streamFinished(io);
    }).catch(onRejected);
}

export const axiosDownloadFileAndCalcHash = async (
    axiosStream: Promise<AxiosResponse<any, any>>,
    path: string,
    onRejected?: (reason: any) => (void | PromiseLike<void>)
) => {
    const io = fs.createWriteStream(path);
    const hash = crypto.createHash('md5');
    let md5 = '';
    return axiosStream.then(res => {
        // console.log(res.headers);    // contains content-disposition and content-type
        res.data.pipe(io);
        res.data.on('data', chunk => hash.update(chunk));
        res.data.on('end', () => (md5 = hash.digest('hex')));
        return streamFinished(io).then(() => md5);
    }).catch(onRejected);
}

export const getAllImageURL = (bookList: any[]) => {
    let list = [], cnt = 0;
    for (const ii of bookList) {
        const base = ii.cover;
        if (path.extname(base) !== '')
            list.push(base as string);
        if (!!ii.size) {
            for (const key in ii.size)
                list.push(base + ii.size[key]);
            if (++cnt % 256 === 0)
                console.log(`Processed ${cnt} book(s) cover URL.`);
        }
    }
    console.log(`Processed ${cnt} book(s) cover URL at all.`);
    return list;
}

export const downloadStream = (url: string) => {
    return axios.get(url, {
        responseType: 'stream'
    })
}

export const getAllDownloadTask = (rawBookInfo: any[])
    : Array<{aid: number, vid: number}> =>
    rawBookInfo.reduce((ret: Array<{aid: number, vid: number}>, ii) => {
        if (typeof ii?.volumes !== 'object') return ret;
        // Some volumes are not arrays, but number-indexed object (contains -1).
        // ret.push(...<Array<any>>(ii.volumes).map(iii => ({
        //     aid: parseInt(ii.aid), vid: parseInt(iii.vid)
        // })));
        for (const key in ii.volumes) {
            const iii = ii.volumes[key];
            ret.push({ aid: parseInt(ii.aid), vid: parseInt(iii.vid) });
        }
        return ret;
    }, [] as Array<{aid: number, vid: number}>);

export type DownloadTask = {aid: number, vid: number};

export const loadTaskFromLog = (path = 'tmp/input.log') => {
    const downloadTasks = fs.readFileSync(path).toString().split('\n').map(
        line => {
            const splits = line.split(' ');
            return {aid: parseInt(splits[2]), vid: parseInt(splits[4])};
        }
    );
    saveJSON('tmp/downTasks.json', downloadTasks);
    saveJSON('tmp/downTasks.pretty.json', downloadTasks, true);
    return downloadTasks;
}

export const downloadURLs = (
    urls: string[], naming = (url: string) => encodeURIComponent(url)) => {
    return async.forEachLimit(urls,
        parseInt(process.env.ASYNC_LIMIT_GUEST), asyncify(url => {
            const req = downloadStream(url);
            return axiosDownloadFile(
                req, path.join(process.env.COVER_DIR, naming(url)),
                e => { console.warn(e.config.url, 'download failed.'); }
            );
        }));
}

export interface IFileHash
    extends DownloadTask{
    md5: {
       epub: string;
    },
    _id: number;
}

export const calcFileHash = (
    file: string
) => {
    const stream = fs.createReadStream(file);
    const hash = crypto.createHash('md5');
    let md5 = '';
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => (md5 = hash.digest('hex')));
    return streamFinished(stream).then(() => md5);
}

export const randomSelectUser = (
    users: CachedUser[]
) => users[
    Math.floor(Math.random() * users.length * 45921) % users.length];
