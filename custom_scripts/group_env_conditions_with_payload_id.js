const Random = require('meteor-random');

module.exports = async function group_env_conditions_with_payload_id (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  await EnvironmentalConditions.createIndex({ publicArtId: 1, createdDate: 1 });
  const conditions = await EnvironmentalConditions.find({ payloadId: { $exists: false } }).sort({ publicArtId: 1, createdDate: 1 });

  console.log(await conditions.count(), 'count');
  const bulkOp = EnvironmentalConditions.initializeUnorderedBulkOp();
  const defaultAvailableFields = {
    LOCATION: true,
    HUMIDITY: true,
    TEMPERATURE: true,
    VIBRATION: true,
    AIR_QUALITY: true,
    AIR_PRESSURE: true,
    HI_G: true,
    LOW_G: true,
    GYRO: true,
    COLOR: true,
    BATTERY_PERCENT_REMAINING: true
  }
  let availableFields = { ...defaultAvailableFields };
  let currentDate = Date.now();
  let payloadId;
  let currentArtId;
  let count = 0;

  await conditions.forEach(env => {
    const { createdDate, _id, type, publicArtId } = env;

    if (currentArtId !== publicArtId || !availableFields[type] || Math.abs(currentDate - createdDate) > 1500 ) {
      currentArtId = publicArtId;
      availableFields = { ...defaultAvailableFields };
      currentDate = createdDate;
      payloadId = Random.id();
    }

    bulkOp.find({ _id }).updateOne({ $set: { payloadId } });
    availableFields[type] = false;
    if (++count % 100000 === 0) {
      console.log(`${count} items processed.`);
    }
  });
  
  const result = await bulkOp.execute();
  
  if (result) {
    const { nMatched, nModified} = result;
    console.log(`${nMatched} items matched and ${nModified} items modified`);
  }
}
