// import * as yidm from '../build/esm/index.js';
const yidm = require('../build/cjs/index.js');

console.assert(yidm.encryptPass('chenruinimasile') === 'e6afde7a8ac99cce07bbbab4075e9224');
console.log(yidm.getAppToken({deviceId: yidm.randomDeviceId('Redmi K50')}), yidm.getT());