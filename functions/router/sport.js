const express = require('express');
const router = express.Router();

router.get('/', require('../controller/sport/getSports'));
// ?day=2016-12-01&page=0&sport_id=1
router.get('/events', require('../controller/sport/getEventsController'));
// for testing pubsub
router.get('/upcoming', require('../pubsub/getUpcomingEvent'));
module.exports = router;
