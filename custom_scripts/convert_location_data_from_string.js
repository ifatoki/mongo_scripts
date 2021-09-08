module.exports = async function mongoScript (client) {
  /**
   * Convert all latLong entries in activity logs from strings to floats.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const ActivityLogs = db.collection('ActivityLogs');
  const logs = ActivityLogs.find({ 'latLong.1': { $exists: true } });
  const logCount = await logs.count()
  let count = 0;

  const bulkOp = ActivityLogs.initializeUnorderedBulkOp();

  await logs.forEach(log => {
    const [lat, long] = log.latLong;
    const { _id } = log;
    const latLong = [Number.parseFloat(lat), Number.parseFloat(long)];

    bulkOp.find({ _id }).updateOne({ $set: { latLong } });
    if (count++ % 100 === 0) console.log(`${count} of ${logCount} items processed.`);
  })

  const result = await bulkOp.execute();
  
  if (result) {
    const { nMatched, nModified} = result;
    console.log(`${nMatched} items matched and ${nModified} items modified`);
  }


  // const promises = [];
  // await logs.forEach(log => {
  //   const [lat, long] = log.latLong;
  //   const { _id } = log;
  //   const latLong = [Number.parseFloat(lat), Number.parseFloat(long)];

  //   promises.push(ActivityLogs.updateOne({ _id }, { $set: { latLong } }));
  //   if (count++ % 100 === 0) console.log(`${count} of ${logCount} items processed.`);
  // })

  // return Promise.allSettled(promises)
  //   .then((results) => {
  //     let successCount = 0;
  //     let failedCount = 0;

  //     results.forEach(result => {
  //       if (result.status === 'fulfilled') successCount++
  //       else failedCount++;
  //     })
  //     console.log(`${successCount} records modified successfully and ${failedCount} failed`);
  //   });
}