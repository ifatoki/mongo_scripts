module.exports = async function mongoScript (client) {
  /**
   * Convert all latLong entries in activity logs from strings to floats.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const Alerts = db.collection('Alerts');
  const alerts = Alerts.find({ $and: [{ value: { $exists: true } }, { 'value.0': { $exists: false } }] });
  const alertsCount = await alerts.count()
  let count = 0;

  const bulkOp = Alerts.initializeUnorderedBulkOp();

  await alerts.forEach((alert) => {
    let { value, _id } = alert;

    value = [Number.parseFloat(value)];
    bulkOp.find({ _id }).updateOne({ $set: { value } });
    if (count++ % 100 === 0) console.log(`${count} of ${alertsCount} items processed.`);
  });
  if (count === 0) {
    console.log('No matches found');
    return;
  }
  
  const result = await bulkOp.execute();

  if (result) {
    const { nMatched, nModified } = result;
    console.log(`${nMatched} items matched and ${nModified} items modified`);
  }
}
