/* eslint-disable no-await-in-loop */
// ref: https://cloud.google.com/functions/docs/writing/http#writing_http_files-nodejs
const modules = require('../util/modules');

function busboyProcessor (req, res, next) {
  const busboy = new modules.Busboy({
    headers: req.headers,
    limits: {
      // Cloud functions impose this restriction anyway
      fileSize: 50 * 1024 * 1024
    }
  });
  const fields = {};
  // This code will process each non-file field in the form.
  busboy.on('field', function (key, val) {
    fields[key] = val;
    console.log('field...', key, val, fields[key]);
  });
  const fileWrites = [];
  const uploads = {};
  const tmpdir = modules.os.tmpdir();
  // This code will process each file uploaded.
  busboy.on('file', async function (
    fieldname,
    file,
    filename,
    encoding,
    mimetype
  ) {
    // rename file name
    const type = filename.substring(filename.indexOf('.') + 1).toLowerCase();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 7);
    const name = `${Date.now()}${randomString}`;
    filename = `${name}.${type}`;
    let filepath = modules.path.join(tmpdir, filename);
    // checkFileType(filepath);

    filename = console.log('filename...123', filename, mimetype, filepath);

    filepath = convertToMP4(type, filepath, tmpdir, name);
    uploads[fieldname] = filepath;
    const writeStream = modules.fs.createWriteStream(filepath);
    file.pipe(writeStream);

    // File was processed by Busboy; wait for it to be written to disk.
    const promise = new Promise(function (resolve, reject) {
      file.on('end', function () {
        writeStream.end();
      });
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    fileWrites.push(promise);
  });
  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', async function () {
    await Promise.all(fileWrites);
    // console.log(req.body);
    // console.log('Busboy finish');
    console.log(fields);

    req.body = fields;
    req.filePath = uploads;

    // rm file in memory
    // for (const key in uploads) {
    //   console.log(uploads[key]);
    //   modules.fs.unlinkSync(uploads[key]);
    // }
    next();
  });
  busboy.end(req.rawBody);
}

// ref: https://config9.com/apps/firebase/upload-files-to-firebase-storage-using-node-js/
async function upload2bucket (req, res, next) {
  const gcpResponses = [];
  const uuids = [];

  for (const key in req.filePath) {
    console.log('key is', key);
    // console.log(req.filePath);
    try {
      const truetype = await modules.fileType.fromFile(req.filePath[key]);

      const attribute = truetype.mime.substring(0, truetype.mime.indexOf('/'));
      if (attribute !== 'video') {
        res.status(401).json({
          code: 403,
          error: 'forbidden, the mime-type should be video'
        });
      }
      console.log(attribute.substring(0, attribute.indexOf('/')));
    } catch (error) {
      console.log(error);
    }
    const uuid = modules.uuidv1();
    uuids.push(uuid);

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

  const urls = [];
  for (let i = 0; i < gcpResponses.length; i++) {
    const file = gcpResponses[i][0];
    console.log('file.name....', file.name);
    // console.log('file1234....', file, modules.bucket.id);
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

function convertToMP4 (type, filepath, tmpdir, name) {
  if (type !== 'mp4') {
    modules
      .ffmpeg(filepath)
      .videoCodec('libx264')
      .audioCodec('libmp3lame')
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', function () {
        console.log('Finished processing');
      })
      // .save('cat.mp4');
      .save(`${tmpdir}/${name}.mp4`);
    filepath = `${tmpdir}/${name}.mp4`;
  }
  return filepath;
}
module.exports = { busboyProcessor, upload2bucket };
