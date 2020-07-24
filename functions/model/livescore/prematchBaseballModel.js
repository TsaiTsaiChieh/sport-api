function prematchBaseball(args) {
  return new Promise(async function(resolve, reject) {
    console.log(args);
    return resolve(args);
  });
}

module.exports = prematchBaseball;
