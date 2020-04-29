const modules = require('../util/modules');
inserttest();
async function inserttest() {
  for (let i = 0; i < 10; i++) {
    ab(i);
  }
}
async function ab(i) {
  const timesPerLoop = 4;
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    console.log(i);

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log('checkmatch_ESoccer success');
      clearInterval(timerForStatus2);
    }
  }, 3000);
}
