module.exports = async function mongoScript (client) {
  /**
   * Convert all latLong entries in activity logs from strings to floats.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  const conditions = EnvironmentalConditions.find({ type: 'LOCATION', 'value.1': { $exists: true } });
  const conditionsCount = await conditions.count()
  let count = 0;

  console.log(conditionsCount, 'conditionsCount');
  const bulkOp = EnvironmentalConditions.initializeUnorderedBulkOp();

  await conditions.forEach(condition => {
    const [long, lat] = condition.value;
    const { _id } = condition;
    const value = [lat, long];

    bulkOp.find({ _id }).updateOne({ $set: { value } });
    if (count++ % 100 === 0) console.log(`${count} of ${conditionsCount} items processed.`);
  })

  if (count === 0) {
    console.log('No matches found');
    return;
  }
  const result = await bulkOp.execute();
  
  if (result) {
    const { nMatched, nModified} = result;
    console.log(`${nMatched} items matched and ${nModified} items modified`);
  }
}
