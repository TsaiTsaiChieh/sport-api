const modules = require('../util/modules');
const router = modules.express.Router();
// const verification = require('../util/verification');

router.get('team', require('../controller/history/teamController'));
