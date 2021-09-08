db.getCollection('ActivityLogs')
  .find({ 'latLong.1': { $exists: true } })
  .forEach(log => {
    const [lat, long] = log.latLong;

    log.latLong = [Number.parseFloat(lat), Number.parseFloat(long)];
    db.ActivityLogs.save(log);
  })