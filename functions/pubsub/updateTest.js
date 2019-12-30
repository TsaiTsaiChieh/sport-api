function updateTest() {
  console.log('This will be run every 1 minutes!');
  return null;
}
exports.scheduledFunction = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(updateTest);
