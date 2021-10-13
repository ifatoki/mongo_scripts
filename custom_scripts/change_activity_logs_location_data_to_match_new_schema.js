const axios = require('axios');

const mongoScript = async function (client) {
  /**
   * Change activity logs location data to match new schema.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const ActivityLogs = db.collection('ActivityLogs');
  const activityLogs = await ActivityLogs.find({ 'latLong.1': { $exists: true } }).toArray();
  const logCount = activityLogs.length;
  const bulkOp = ActivityLogs.initializeUnorderedBulkOp();
  const cache = new Map();
  let count = 0;
  
  const processLog = async function (log) {
    const { _id, latLong } = log
    const [lat, lng] = latLong;

    try {
      let location = cache.get(`${lat},${lng}`);
      
      if (!location) {
        const { data } = await axios.get(`https://tmg-geocode.herokuapp.com/api/geocode/json?latlng=${lat},${lng}`);

        if (data && data.results && data.results.length) {
          const address = data.results[0].formatted_address || '';
          const splitLocationData = address.split(',');
          let city = ''
          let country = ''
  
          if (splitLocationData.length >= 2) city = splitLocationData[splitLocationData.length - 2].trim();
          if (splitLocationData.length >= 1) country = splitLocationData[splitLocationData.length - 1].trim();
          location = { address, city, country };
          cache.set(`${lat},${lng}`, location);
        }
      }
      if (location) {
        bulkOp.find({ _id }).updateOne({ $set: { location }, $unset: { country: '', city: '', address: '' } });
        count++;
      }
    } catch (e) {
      console.log(e);
    }
  }

  for (let i = 0; i < activityLogs.length; i++) {
    const log = activityLogs[i];

    if ((i + 1) % 100 === 0) console.log(`processing ${i + 1} of ${logCount} logs.`);
    await processLog(log);
  }

  if (count === 0) {
    console.log('no match found');
    return;
  }
  const result = await bulkOp.execute();

  if (result) {
    const { nMatched, nModified } = result;
    console.log(`${nMatched} items matched and ${nModified} items modified`);
  }
}

module.exports = mongoScript;