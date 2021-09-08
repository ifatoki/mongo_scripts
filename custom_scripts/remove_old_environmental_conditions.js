module.exports = async function remove_old_environmental_conditions (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  const conditions = await EnvironmentalConditions.find({value: { $exists: false }, type: { $exists: false }});

  console.log(await conditions.count(), 'count');
  const bulkOp = EnvironmentalConditions.initializeUnorderedBulkOp();
  
  bulkOp.find({value: { $exists: false }, type: { $exists: false }}).remove();
  const result = await bulkOp.execute();
  
  if (result) {
    const { nMatched, nRemoved} = result;
    console.log(`${nMatched} items matched and ${nRemoved} items removed`);
  }
}
