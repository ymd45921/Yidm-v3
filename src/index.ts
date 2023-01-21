import {$382, $737} from "./yidm/module";
import * as crypto from "crypto";

const md5 = (text: string, salt = '') => {
    const hash = crypto.createHash('md5');
    return hash.update(text + salt).digest('hex');
}

const rand = () => Math.random().toString();

export const encryptPass =
    (pass: string) => $737().CryptoStr(pass);

export const getAppToken = (op: {
    deviceId?: string, date?: Date
} = {}) => $382(op.deviceId).getAppToken(op.date);

export const randomDeviceId = (_?: string) =>
    _ ? md5(_) : md5(rand(), `nnm.kawaii_${rand()}_+/!@%^$$&**`);

export const getT = () => (new Date).getTime();