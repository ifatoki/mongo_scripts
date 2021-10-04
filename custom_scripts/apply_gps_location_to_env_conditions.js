const axios = require('axios');

module.exports = async function mongoScript (client) {
  /**
   * Apply GPS location based on geocoding to all environment conditions.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  const payloadIds = await EnvironmentalConditions.distinct('payloadId');
  const bulkOp = EnvironmentalConditions.initializeUnorderedBulkOp();
  const cache = new Map();
  let count = 0;

  const processPayload = async function (payloadId) {
    const envWithLocation = await EnvironmentalConditions.findOne({ payloadId, type: 'LOCATION' })
    
    if (!envWithLocation) return;
    const [latitude, longitude] = envWithLocation.value;

    try {
      let location = cache.get(`${latitude},${longitude}`);

      if (typeof location === 'undefined') {
        const { data } = await axios.get(`https://tmg-geocode.herokuapp.com/api/geocode/json?latlng=${latitude},${longitude}`);

        if (data && data.results && data.results.length) {
          const address = data.results[0].formatted_address || '';
          const splitLocationData = address.split(',');
          let city = ''
          let country = ''

          if (splitLocationData.length >= 2) city = splitLocationData[splitLocationData.length - 2].trim();
          if (splitLocationData.length >= 1) country = splitLocationData[splitLocationData.length - 1].trim();
          location = { address, city, country };
          cache.set(`${latitude},${longitude}`, location);
        }
      }
      if (location) {
        bulkOp.find({ payloadId, location: { $exists: false } }).update({ $set: { location } });
        count++;
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error_message) {
        console.log(e.response.data.error_message);
        cache.set(`${latitude},${longitude}`, null);
        return;
      }
      console.log(e.message);
    }
  }

  for (let i = 0; i < payloadIds.length; i++) {
    const payloadId = payloadIds[i];

    if ((i + 1) % 100 === 0) console.log(`processing ${i + 1} of ${payloadIds.length} payloads.`);
    await processPayload(payloadId);
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
