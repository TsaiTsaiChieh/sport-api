const modules = require('../util/modules');
const router = modules.express.Router();
// const verification = require('../util/verification');

router.get('/acceptLeague', require('../controller/general/acceptLeagueController'));

module.exports = router;
