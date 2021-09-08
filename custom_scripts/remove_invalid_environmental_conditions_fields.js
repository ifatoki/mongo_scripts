module.exports = async function remove_invalid_environmental_conditions_fields (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  const conditions = await EnvironmentalConditions.find({$or: [ { value2: { $exists: true } }, { value3: { $exists: true } }, { lastModifiedDate: { $exists: true }}] });

  console.log(await conditions.count(), 'count');
  const bulkOp = EnvironmentalConditions.initializeUnorderedBulkOp();
  
  bulkOp.find({$or: [ { value2: { $exists: true } }, { value3: { $exists: true } }, { lastModifiedDate: { $exists: true }}] }).update({ $unset: { value2: '', value3: '', lastModifiedDate: ''} });
  // bulkOp.find({ payloadId: { $exists: true }}).update({ $unset: { payloadId: ''} });
  const result = await bulkOp.execute();
  
  if (result) {
    const { nMatched, nModified} = result;
    console.log(`${nMatched} items matched and ${nModified} items modified`);
  }
}
