/* eslint-disable no-await-in-loop */
// ref: https://cloud.google.com/functions/docs/writing/http#writing_http_files-nodejs
const modules = require('../util/modules');
// const FileType = require('file-type');
function busboyProcessor(req, res, next) {
  const busboy = new modules.Busboy({
    headers: req.headers,
    limits: {
      // Cloud functions impose this restriction anyway
      fileSize: 50 * 1024 * 1024
    }
  });
  // const fields = {};
  // This code will process each non-file field in the form.
  // busboy.on('field', function(key, val) {
  // fields[key] = val;
  // });
  const fileWrites = [];
  const uploads = {};
  const tmpdir = modules.os.tmpdir();
  // This code will process each file uploaded.
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    const filepath = modules.path.join(tmpdir, filename);
    console.log('filename...', filename, encoding, mimetype);

    uploads[`${fieldname}_${Date.now()}`] = filepath;
    // for test
    // uploads[fieldname] = filepath;
    const writeStream = modules.fs.createWriteStream(filepath);
    file.pipe(writeStream);

    // File was processed by Busboy; wait for it to be written to disk.
    const promise = new Promise(function(resolve, reject) {
      file.on('end', function() {
        writeStream.end();
      });
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    fileWrites.push(promise);
  });
  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', async function() {
    await Promise.all(fileWrites);
    // console.log(req.body);
    // console.log('Busboy finish');
    // req.body = fields;
    req.filePath = uploads;

    // rm file in memory
    // for (const key in uploads) {
    //   console.log(uploads[key]);
    //   modules.fs.unlinkSync(uploads[key]);
    // }

    // return res.send({
    //   status: 'Success',
    //   text: 'Great job???'
    // });
    next();
  });
  busboy.end(req.rawBody);
}

// ref: https://config9.com/apps/firebase/upload-files-to-firebase-storage-using-node-js/
async function upload2bucket(req, res, next) {
  let gcpResponses = [];
  let uuids = [];

  for (const key in req.filePath) {
    let uuid = modules.uuidv1();
    uuids.push(uuid);
    const mimetype = await modules.fileType.fromFile(req.filePath[key]);
    console.log(req.filePath[key]);

    let attribute = mimetype.mime.substring(0, mimetype.mime.indexOf('/'));
    if (attribute !== 'video') {
      res
        .status(401)
        .json({ code: 403, error: 'forbidden, the mime-type should be video' });
    }
    console.log(attribute.substring(0, attribute.indexOf('/')));

    gcpResponses.push(
      await modules.bucket.upload(req.filePath[key], {
        destination: `chat/public/${req.token.uid}/${key}`,
        public: true,
        // metadata: {
        // cacheControl: 'public, max-age=31536000'
        // contentType: modules.mimeType.lookup(req.filePath[key]),
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
        // }
      })
    );
    // rm file in memory
    modules.fs.unlinkSync(req.filePath[key]);
  }

  let urls = [];
  for (let i = 0; i < gcpResponses.length; i++) {
    let file = gcpResponses[i][0];
    console.log('file1234....', file, modules.bucket.id);
    urls.push(
      `https://firebasestorage.googleapis.com/v0/b/${
        modules.bucket.id
      }/o/${encodeURIComponent(file.name)}?alt=media&token=${uuids[i]}`
    );
  }
  req.urls = urls;
  console.log(urls);

  // next();
  return await Promise.all(gcpResponses);
}
module.exports = { busboyProcessor, upload2bucket };
