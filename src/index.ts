import {$382, $737} from "./yidm/module";

export const encryptPass =
    (pass: string) => $737().CryptoStr(pass);

export const getAppToken = $382().getAppToken;

