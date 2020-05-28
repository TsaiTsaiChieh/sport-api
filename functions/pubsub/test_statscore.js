const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');

async function test_statscore(req, res) {
  try {
    const pbpURL =
      'https://api.statscore.com/v2/events/3330182?token=dd0509a109c9549d6bb541bd76bfb281';
    const data = await axiosForURL(pbpURL);

    for (
      let i = 0;
      i <
      data.api.data.competition.season.stage.group.event.events_incidents
        .length;
      i++
    ) {
      console.log(
        data.api.data.competition.season.stage.group.event.events_incidents[i]
          .incident_name
      );
    }

    res.json(data);
  } catch (err) {
    console.log(err);
  }
}
async function axiosForURL(URL) {
  return new Promise(async function (resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at test_statscore by DY`));
    }
  });
}
module.exports = test_statscore;
