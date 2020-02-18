const modules = require('../../util/modules');

async function converter(req, res) {
  // console.log(req.body);
  download(req.body.URL, './uploads/test.mov', res)
    .then(function(body) {
      return res.json(body);
    })
    .catch(function(err) {
      return res.json(err);
    });
}
function download(url, dest, cb) {
  return new Promise(function(resolve, reject) {
    const file = modules.fs.createWriteStream(dest);
    const request = modules.https
      .get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          // file.close(cb); // close() is async, call cb after close completes.
          convert(dest, './uploads/test.mp4', function(err) {
            if (!err) {
              console.log('conversion complete');
              modules.fs.unlinkSync(dest);
              resolve('ok');
            }
          });
        });
      })
      .on('error', function(err) {
        // Handle errors
        modules.fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
        reject('no');
        return cb('error by TC...', err.message);
      });
  });
}

function convert(input, output, callback) {
  modules
    .ffmpeg(input)
    .videoCodec('libx264')
    .audioCodec('libmp3lame')
    .output(output)
    .on('end', function() {
      console.log('conversion ended');
      callback(null);
    })
    .on('error', function(err) {
      console.log('error by TC... ', err.code, err.msg);
      callback(err);
    })
    .run();
}
async function upload() {
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
  });
}
module.exports = converter;
