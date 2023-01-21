import {createHash} from "crypto";

export const $385 = () => {
    const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const a = {
        rotl: function (r, t) {
            return r << t | r >>> 32 - t
        }, rotr: function (r, t) {
            return r << 32 - t | r >>> t
        }, endian: function (r) {
            if (r.constructor == Number) return 16711935 & a.rotl(r, 8) | 4278255360 & a.rotl(r, 24);
            for (var t = 0; t < r.length; t++) r[t] = a.endian(r[t]);
            return r
        }, randomBytes: function (r) {
            for (var t = []; r > 0; r--) t.push(Math.floor(256 * Math.random()));
            return t
        }, bytesToWords: function (r) {
            for (var t = [], n = 0, o = 0; n < r.length; n++, o += 8) t[o >>> 5] |= r[n] << 24 - o % 32;
            return t
        }, wordsToBytes: function (r) {
            for (var t = [], n = 0; n < 32 * r.length; n += 8) t.push(r[n >>> 5] >>> 24 - n % 32 & 255);
            return t
        }, bytesToHex: function (r) {
            for (var t = [], n = 0; n < r.length; n++) t.push((r[n] >>> 4).toString(16)), t.push((15 & r[n]).toString(16));
            return t.join('')
        }, hexToBytes: function (r) {
            for (var t = [], n = 0; n < r.length; n += 2) t.push(parseInt(r.substr(n, 2), 16));
            return t
        }, bytesToBase64: function (r) {
            for (var t = [], n = 0; n < r.length; n += 3) for (var o = r[n] << 16 | r[n + 1] << 8 | r[n + 2], e = 0; e < 4; e++) 8 * n + 6 * e <= 8 * r.length ? t.push(u.charAt(o >>> 6 * (3 - e) & 63)) : t.push('=');
            return t.join('')
        }, base64ToBytes: function (r) {
            r = r.replace(/[^A-Z0-9+\/]/gi, '');
            for (var t = [], n = 0, o = 0; n < r.length; o = ++n % 4) 0 != o && t.push((u.indexOf(r.charAt(n - 1)) & Math.pow(2, -2 * o + 8) - 1) << 2 * o | u.indexOf(r.charAt(n)) >>> 6 - 2 * o);
            return t
        }
    }
    return a;
}

export const $386 = () => {
    const bin = {
        stringToBytes: function (n) {
            for (var t = [], e = 0; e < n.length; e++) t.push(255 & n.charCodeAt(e));
            return t
        }, bytesToString: function (n) {
            for (var t = [], e = 0; e < n.length; e++) t.push(String.fromCharCode(n[e]));
            return t.join('')
        }
    }
    const utf8 = {
        stringToBytes: function (n) {
            return bin.stringToBytes(unescape(encodeURIComponent(n)))
        }, bytesToString: function (n) {
            return decodeURIComponent(escape(bin.bytesToString(n)))
        }
    }
    return { utf8, bin }
}

export const $387 = () => {
    function f(n) {
        return !!n.constructor && 'function' == typeof n.constructor.isBuffer && n.constructor.isBuffer(n)
    }
    function c(n) {
        return 'function' == typeof n.readFloatLE && 'function' == typeof n.slice && f(n.slice(0, 0))
    }
    return n => (null != n && (f(n) || c(n) || !!n._isBuffer))
}

export const $384 = () => {
    const o = $385(), s = $386().utf8, a = $387(), g = $386().bin;
    const obj_u = {
        _ff: function (r, n, t, e, i, o, s) {
            var a = r + (n & t | ~n & e) + (i >>> 0) + s;
            return (a << o | a >>> 32 - o) + n
        },
        _gg: function (r, n, t, e, i, o, s) {
            var a = r + (n & e | t & ~e) + (i >>> 0) + s;
            return (a << o | a >>> 32 - o) + n
        },
        _hh: function (r, n, t, e, i, o, s) {
            var a = r + (n ^ t ^ e) + (i >>> 0) + s;
            return (a << o | a >>> 32 - o) + n
        },
        _ii: function (r, n, t, e, i, o, s) {
            var a = r + (t ^ (n | ~e)) + (i >>> 0) + s;
            return (a << o | a >>> 32 - o) + n
        },
        _blocksize: 16,
        _digestsize: 16
    }
    function func_r(n, t) {
        n.constructor == String ? n = t && 'binary' === t.encoding ? g.stringToBytes(n) : s.stringToBytes(n) : a(n) ? n = Array.prototype.slice.call(n, 0) : Array.isArray(n) || (n = n.toString());
        for (var e = o.bytesToWords(n), i = 8 * n.length, u = 1732584193, f = -271733879, c = -1732584194, l = 271733878, y = 0; y < e.length; y++) e[y] = 16711935 & (e[y] << 8 | e[y] >>> 24) | 4278255360 & (e[y] << 24 | e[y] >>> 8);
        e[i >>> 5] |= 128 << i % 32, e[14 + (i + 64 >>> 9 << 4)] = i;
        var _ = obj_u._ff, v = obj_u._gg, h = obj_u._hh, d = obj_u._ii;
        for (y = 0; y < e.length; y += 16) {
            var b = u, T = f, B = c, S = l;
            f = d(f = d(f = d(f = d(f = h(f = h(f = h(f = h(f = v(f = v(f = v(f = v(f = _(f = _(f = _(f = _(f, c = _(c, l = _(l, u = _(u, f, c, l, e[y + 0], 7, -680876936), f, c, e[y + 1], 12, -389564586), u, f, e[y + 2], 17, 606105819), l, u, e[y + 3], 22, -1044525330), c = _(c, l = _(l, u = _(u, f, c, l, e[y + 4], 7, -176418897), f, c, e[y + 5], 12, 1200080426), u, f, e[y + 6], 17, -1473231341), l, u, e[y + 7], 22, -45705983), c = _(c, l = _(l, u = _(u, f, c, l, e[y + 8], 7, 1770035416), f, c, e[y + 9], 12, -1958414417), u, f, e[y + 10], 17, -42063), l, u, e[y + 11], 22, -1990404162), c = _(c, l = _(l, u = _(u, f, c, l, e[y + 12], 7, 1804603682), f, c, e[y + 13], 12, -40341101), u, f, e[y + 14], 17, -1502002290), l, u, e[y + 15], 22, 1236535329), c = v(c, l = v(l, u = v(u, f, c, l, e[y + 1], 5, -165796510), f, c, e[y + 6], 9, -1069501632), u, f, e[y + 11], 14, 643717713), l, u, e[y + 0], 20, -373897302), c = v(c, l = v(l, u = v(u, f, c, l, e[y + 5], 5, -701558691), f, c, e[y + 10], 9, 38016083), u, f, e[y + 15], 14, -660478335), l, u, e[y + 4], 20, -405537848), c = v(c, l = v(l, u = v(u, f, c, l, e[y + 9], 5, 568446438), f, c, e[y + 14], 9, -1019803690), u, f, e[y + 3], 14, -187363961), l, u, e[y + 8], 20, 1163531501), c = v(c, l = v(l, u = v(u, f, c, l, e[y + 13], 5, -1444681467), f, c, e[y + 2], 9, -51403784), u, f, e[y + 7], 14, 1735328473), l, u, e[y + 12], 20, -1926607734), c = h(c, l = h(l, u = h(u, f, c, l, e[y + 5], 4, -378558), f, c, e[y + 8], 11, -2022574463), u, f, e[y + 11], 16, 1839030562), l, u, e[y + 14], 23, -35309556), c = h(c, l = h(l, u = h(u, f, c, l, e[y + 1], 4, -1530992060), f, c, e[y + 4], 11, 1272893353), u, f, e[y + 7], 16, -155497632), l, u, e[y + 10], 23, -1094730640), c = h(c, l = h(l, u = h(u, f, c, l, e[y + 13], 4, 681279174), f, c, e[y + 0], 11, -358537222), u, f, e[y + 3], 16, -722521979), l, u, e[y + 6], 23, 76029189), c = h(c, l = h(l, u = h(u, f, c, l, e[y + 9], 4, -640364487), f, c, e[y + 12], 11, -421815835), u, f, e[y + 15], 16, 530742520), l, u, e[y + 2], 23, -995338651), c = d(c, l = d(l, u = d(u, f, c, l, e[y + 0], 6, -198630844), f, c, e[y + 7], 10, 1126891415), u, f, e[y + 14], 15, -1416354905), l, u, e[y + 5], 21, -57434055), c = d(c, l = d(l, u = d(u, f, c, l, e[y + 12], 6, 1700485571), f, c, e[y + 3], 10, -1894986606), u, f, e[y + 10], 15, -1051523), l, u, e[y + 1], 21, -2054922799), c = d(c, l = d(l, u = d(u, f, c, l, e[y + 8], 6, 1873313359), f, c, e[y + 15], 10, -30611744), u, f, e[y + 6], 15, -1560198380), l, u, e[y + 13], 21, 1309151649), c = d(c, l = d(l, u = d(u, f, c, l, e[y + 4], 6, -145523070), f, c, e[y + 11], 10, -1120210379), u, f, e[y + 2], 15, 718787259), l, u, e[y + 9], 21, -343485551), u = u + b >>> 0, f = f + T >>> 0, c = c + B >>> 0, l = l + S >>> 0
        }
        return o.endian([u, f, c, l])
    }
    return function (r, n) {
        if (void 0 === r || null === r) throw new Error('Illegal argument ' + r);
        let t = o.wordsToBytes(func_r(r, n));
        return n && n.asBytes ? t : n && n.asString ? g.bytesToString(t) : o.bytesToHex(t)
    }
}

export const $737 = () => {
    const a = $384();
    const tmp_d_default = e => a(e, undefined);
    const CryptoStr = function (e) {    /* default  */
        let t = {
            a: 'c',
            b: 'd',
            c: 'e',
            d: 'f',
            e: 'b',
            f: 'a'
        }, r = [];
        for (let f = 0, u = (e = (e =
            <string>(tmp_d_default(tmp_d_default(tmp_d_default(e)))))
            .split('').reverse()).length;
             f < u; f++)
            r.push(t[e[f]] ? t[e[f]] : e[f]);
        return r.join('')
    };
    const CryptoEditStr = function (e) {
        let t = {
            a: 'c',
            b: 'd',
            c: 'e',
            d: 'f',
            e: 'b',
            f: 'a'
        }, r = [];
        for (let f = 0, u = (e = (e =
            <string>(tmp_d_default(e))).split('').reverse()).length;
             f < u; f++) r.push(t[e[f]] ? t[e[f]] : e[f]);
        return r.join('')
    }
    return {
        CryptoStr, CryptoEditStr
    };
}

export const $383 = () => {
    // TODO: Call Java native function `YidmToken.todayAppToken`
    return {
        generateToken: (deviceId: string): string => {
            const hash = createHash('md5');
            const fake = hash.update(deviceId + (new Date).getTime() + 'yidmcom!@%^$$&**');
            console.warn('Call Java native function `YidmToken.todayAppToken`!');
            return `${deviceId}.${fake}`;
        }
    }
}

import $388 from './388.js';

export const $382 = (deviceId = '4a7dfc007829226d899926431c17ed2e') => {
    const ig = $383(), p_default = $384(), f_default = $388;
    const getRNAppToken = () => ig.generateToken(deviceId);
    const getAppToken = (date?: Date) => {
        return f_default(deviceId, p_default, date) as string;
    }
    return {
        DEVICEID: deviceId, getAppToken, getRNAppToken
    }
}
