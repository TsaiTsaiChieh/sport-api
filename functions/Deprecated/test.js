const modules = require('../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU3NjgwNTQwNiwiZXhwIjoxNTc2ODA5MDA2LCJpc3MiOiJzcG9ydDE5eTA3MTVAYXBwc3BvdC5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoic3BvcnQxOXkwNzE1QGFwcHNwb3QuZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6IlUwOTRlNDZmODBhZmZlOGZiZjJjZDczNGNlMDUyN2EzOSJ9.bCkGoMgsCJRKY7FN7ePadosKywbLth5c9Lt3XjDE2kdjDAGGIXZ1ggkaMlbu80_cxatgQIQNDB7OQwuIrBWf3-aBrby9bspXpnU3C_Eamc-d8Uzsyx2wzsLa73geJD1-8PYiBTZ19Xp7pgBSNF9f6uPcxcbwUmik8d3xacYpTxSoTXQMcxBpD8R_DtEMrR6JRMm5OPRHC4TIN8AQ3NUNGxHpVL0iyyqlH014DZotz2seopQHQBMP9BtJanRTlmx-sC0yh8InWgKIkS8ukp2UZxkI90PUw6E1pHRWHcfL_-rSpOq_JIvclzpVnzrJsrgYgE1V3QE6zqgid9W2s34lfw'

const expiresIn = 60 * 60 * 24 * 7 * 1000;
// firebaseAdmin.auth().createSessionCookie(token, {expiresIn}).then(token_response=> {
//     console.log(token_response);
// })

// const nowTimeStamp = firebaseAdmin.firestore.Timestamp.now();
// console.log(nowTimeStamp)
// console.log(nowTimeStamp._seconds+nowTimeStamp._nanoseconds)
// const token = await userRecord.getIdToken();

// const decodedIdToken = await firebaseAdmin.auth().verifyIdToken(token);
// const sessionCookie = await firebaseAdmin.auth().createSessionCookie(token, {expiresIn});
async function test() {
    const accuser = await modules.getSnapshot('accuse_users', 'lz3c3ju6G0TilDOdgCQt4I7I8ep1');
    console.log(accuser.data());
}

async function test2() {
    const temp = await modules.getSnapshot('users', 'bgrNF4In68NxJiw7PWu1zXVb2Wr2');
    console.log(temp.exists);
    console.log(temp.data());
}

async function test3() {
    // const uniqueName = modules.firestore.collection('uniqueName').doc('測試2').add({uid: '111'});
    const uniqueName = modules.firestore.collection('uniqueName').doc('fcOLEEu6sYWouQ9XlPnd').set({uid13: '1111'}, {merge: true});
    console.log(uniqueName)
}

async function test4() {
    const uniqueName = modules.firestore.collection('uniqueName').doc('fcOLEEu6sYWouQ9XlPnd').set({uid13: '1111'}, {merge: true});
    console.log(uniqueName)
}


const schema = {
    type: 'object',
    required: ['avatar'],
    properties: {
        avatar: {type: 'string', format: 'url'}
    }
};

// const avatar = 'https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg';
//
// const valid = modules.ajv.validate(schema, {avatar: avatar});
//
// console.log(valid)

