
const configEnv = () => require('dotenv').config();

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