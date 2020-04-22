const modules = require('../util/modules');

async function convertMov (req, res) {
  const file = modules.fs.createWriteStream('heart.MOV');
  const uuid = modules.uuidv1();
  const dataURL =
    'https://firebasestorage.googleapis.com/v0/b/sport19y0715.appspot.com/o/chat%2Fpublic%2Fssa8LE669NbzsNpjXcCCDsdVmxj2%2F15814931712569d2c4fda-08fe-ba25-b9ac-5498b6f49015.MOV?alt=media&token=36a20660-fa43-4d18-b06c-884fbcc16b0f';

  modules.https
    .get(dataURL, async function (res) {
      res.pipe(file);
      // console.log('statusCode:', res.statusCode);
      // console.log('headers:', res.headers);
      // res.on('data', function(d) {
      // });

      // console.log(
      //   `https://firebasestorage.googleapis.com/v0/b/${
      //     modules.bucket.id
      //   }/o/${encodeURIComponent('file.mp4')}?alt=media&token=${uuid}`
      // );
    })
    .on('error', function (e) {
      console.error('error happened in https get... ', e);
    });
  await modules.bucket.upload('heart.MOV', {
    destination: `chat/public/${req.token.uid}/heart.MOV`,
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000'
      // firebaseStorageDownloadTokens: uuid
    }
  });
  // convertToMP4(filepath, tmpdir, name);
  // res.json('ok');
  // res.json(
  //   `https://firebasestorage.googleapis.com/v0/b/${
  //     modules.bucket.id
  //   }/o/${encodeURIComponent(
  //     `chat/public/${req.token.uid}/file.mp4`
  //   )}?alt=media&token=${uuid}`
  // );
  // res.json(
  //   `https://firebasestorage.googleapis.com/v0/b/${
  //     modules.bucket.id
  //   }/o/${encodeURIComponent(
  //     `chat/public/${req.token.uid}/file.mp4`
  //   )}?alt=media&token=${uuid}`
  // );
  res.json('ok');
}
function convertToMP4 (filepath, tmpdir, name) {
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

  return filepath;
}
module.exports = convertMov;
