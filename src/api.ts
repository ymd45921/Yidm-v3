import axios from "axios";
import * as yidm from '@kohaku/yidm-v3';
import {axiosDownloadFile, volumeEpubName} from "./util";
import * as path from "path";

const v3ua = 'RN(0.52.0) Yidmos Yidm(V3) Android';

const randomAppToken = () =>
    yidm.getAppToken({deviceId: yidm.randomDeviceId()});

export const source = axios.create({
    baseURL: 'https://source.yidm.com',
    timeout: parseInt(process.env.API_TIMEOUT),
    headers: {
        'User-Agent': v3ua,
        'cahce-control': 'max-age=10800',
        'Accept-Encoding': 'gzip',
        'Accept': 'application/json'
    }
})

export const dl = axios.create({
    baseURL: 'https://down.yidm.com',
    timeout: parseInt(process.env.API_TIMEOUT),
    headers: {
        'User-Agent': v3ua,
        'Accept-Encoding': 'gzip'
    }
})

export const dl2 = axios.create({
    baseURL: 'https://down2.yidm.com',
    timeout: parseInt(process.env.API_TIMEOUT),
    headers: {
        'User-Agent': v3ua,
        'Accept-Encoding': 'gzip'
    }
})

export const getListGuest = async (
    page: number, pageSize: number | 'android' | 'pc'
) => {
    if (pageSize === 'android') pageSize = 5;
    else if (pageSize === 'pc') pageSize = 18;
    const appToken = randomAppToken();
    const resp = await source.get('/article/getArticles.php', {
        params: {
            type: 'update',
            page, pageSize, appToken
        },
        headers: { appToken }
    });
    return resp.data;
}

export const getList = async (
    page: number, pageSize: number | 'android' | 'pc',
    token: string, appToken?: string
) => {
    if (pageSize === 'android') pageSize = 5;
    else if (pageSize === 'pc') pageSize = 18;
    appToken ??= randomAppToken();
    const resp = await source.get('/article/getArticles.php', {
        params: {
            type: 'update',
            page, pageSize,
            appToken, token
        },
        headers: { appToken }
    });
    return resp.data;
}

export const login = async (
    username: string,
    password: string,
    appToken?: string
) => {
    appToken ??= randomAppToken();
    const resp = await source.get('/login.php', {
        params: {
            emailCode: '',
            invite: '',
            appToken,
            type: 'android',
            _t: yidm.getT(),
            uname: username,
            pass: yidm.encryptPass(password)
        },
        headers: { appToken }
    });
    if (resp.data.status)
        console.assert(resp.data.token === resp.data.info?.token,
            'Tokens are different in user info and response body.');
    let {token, uid, name} = resp.data.info ?? {};
    return {
        status: resp.data.status,
        msg: resp.data.msg,
        token, uid, name
    };
}

export const verifyToken = async (
    token: string,
    appToken?: string
) => {
    appToken ??= randomAppToken();
    const resp = await source.get('/verifyToken.php', {
        params: {
            appToken, token, _t: yidm.getT()
        },
        headers: {
            appToken, token
        }
    });
    let {status, msg} = resp.data;
    msg ??= '';
    return { status, msg }
}

export const getBookInfoGuest = async (
    aid: number, appToken?: string
) => {
    appToken ??= randomAppToken();
    const resp = await source.get('/article/getArticleInfo.php', {
        params: { aid, format: 1, appToken },
        headers: { appToken }
    });
    let { status, data, msg } = resp.data;
    msg ??= '';
    return { status, data: <{detail: object, volumes: object}>data, msg }
}

export const getVolumeEpubMD5 = async (
    aid: number, vid: number, token: string, appToken?: string, route: 0 | 1 = 0
) => {
    appToken ??= randomAppToken();
    const resp = await (route ? dl : dl2).get('/downVolumeEpub.php', {
        params: { aid, vid, token, appToken, isCreate: 1 },
        headers: { appToken }
    }).catch(() => ({data: {status: 0, md5: '', msg: `epub ID: ${aid}:${vid}`}}));
    let { status, md5, msg } = resp.data;
    msg ??= '';
    return { status, md5, msg };
}

export const getVolumeEpub = async (
    aid: string, vid: string, dir: string,
    token: string, appToken?: string, route: 0 | 1 = 0
) => {
    appToken ??= randomAppToken();
    const promise = (route ? dl : dl2).get('/downVolumeEpub.php', {
        params: { aid, vid, token, appToken },
        headers: { appToken },
        responseType: "stream"
    });
    if (path.extname(dir) === '')
        dir = path.join(dir, volumeEpubName(aid, vid));
    return axiosDownloadFile(promise, dir);
}