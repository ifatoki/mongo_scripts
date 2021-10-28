const axios = require('axios');

module.exports = async function mongoScript (client) {
  /**
   * Apply GPS location based on geocoding to all environment conditions.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  const payloads = await EnvironmentalConditions.find({ type: "LOCATION", location: { $exists: false } }).toArray();
  const promises = [];
  const cache = new Map();
  let count = 0;

  const processPayload = async function (payload) {
    const { payloadId, value } = payload;
    const [latitude, longitude] = value;

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
        promises.push(EnvironmentalConditions.updateMany({ payloadId }, { $set: { location } }));
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

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];

    if ((i + 1) % 100 === 0) console.log(`processing ${i + 1} of ${payloads.length} payloads.`);
    await processPayload(payload);
  }

  // if (count === 0) {
  //   console.log('no match found');
  //   return;
  // }
  // const result = await bulkOp.execute();

  // if (result) {
  //   const { nMatched, nModified } = result;
  //   console.log(`${nMatched} items matched and ${nModified} items modified`);
  // }
  const results = await Promise.allSettled(promises)
  const result = results.reduce((cumm, updateResult) => {
    if (updateResult.status === 'fulfilled') {
      const { matchedCount = 0, modifiedCount = 0 } = updateResult.value;

      cumm.nMatched += matchedCount;
      cumm.nModified += modifiedCount;
    }
    return cumm;
  }, {
    nMatched: 0,
    nModified: 0
  });
  const { nMatched, nModified } = result;

  console.log(`${nMatched} items matched and ${nModified} items modified`);
}
