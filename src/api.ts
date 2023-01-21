import axios from "axios";
import * as yidm from '@kohaku/yidm-v3';

const v3ua = 'RN(0.52.0) Yidmos Yidm(V3) Android';

const randomAppToken = () =>
    yidm.getAppToken({deviceId: yidm.randomDeviceId()});

export const source = axios.create({
    baseURL: 'https://source.yidm.com',
    timeout: 1000,
    headers: {
        'User-Agent': v3ua,
        'cahce-control': 'max-age=10800',
        'Accept-Encoding': 'gzip',
        'Accept': 'application/json'
    }
})

export const dl = axios.create({
    baseURL: 'https://down.yidm.com',
    timeout: 1000,
    headers: {
        'User-Agent': v3ua,
        'Accept-Encoding': 'gzip'
    }
})

export const dl2 = axios.create({
    baseURL: 'https://down2.yidm.com',
    timeout: 1000,
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