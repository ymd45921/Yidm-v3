const yidm = require('../build');

console.assert(yidm.encryptPass('chenruinimasile') === 'e6afde7a8ac99cce07bbbab4075e9224');
console.log(yidm.getAppToken({deviceId: yidm.randomDeviceId('Redmi K50')}), yidm.getT());