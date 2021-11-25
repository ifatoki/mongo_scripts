const mongoScript = async function (client) {
  /**
   * Change activity logs to match new logging schema.
   */

  const db = client.db(`${process.env.DB_NAME}`);
  const ActivityLogs = db.collection('ActivityLogs');
  const activityLogs = await ActivityLogs.find({
    $or: [
      { collectionName: { $exists: true } },
      { country: { $exists: true } },
      { city: { $exists: true } },
      { address: { $exists: true } }
    ]
  })
    .sort({ createdDate: -1 })
    .toArray();
  const logCount = activityLogs.length;
  const promises = [];
  const CHILD_OBJECTS = {
    tracker: 1010,
    nfc: 1007,
    uhf: 1008,
    fingerprint: 1009,
    nft: 1011,
    qr: 1012,
    viewer: 1013,
    document: 1005,
    'current status location': 1017,
    'current status': 1016,
    status: 1014,
    identifier: 1018,
    label: 1015
  };
  const COLLECTION_NAME_OBJECTS = {
    artist: 2001,
    art: 1001,
    threshold: 1002,
    compan: 3001,
    profile: 4001
  }
  const ACTIONS = {
    create: 101,
    add: 101,
    upload: 101,
    delete: 102,
    remove: 102,
    edit: 103,
    transfer: 104,
    'moved successfully': 104,
    enable: 105,
    disable: 106,
    view: 107,
    print: 108
  }
  const fromQueue = [];
  const toQueue = [];
  const processLog = function (log) {
    const prevAction = (log.action || '').toLowerCase();
    const prevCollectionName = (log.collectionName || '').toLowerCase();
    const prevRecordId = log.recordId;
    const newLog = { ...log };

    delete newLog.collectionName;
    delete newLog.action;
    delete newLog.recordId;

    try {
      let deleteLogId;

      // set action;
      for (object of Object.keys(ACTIONS)) {
        if (prevAction.includes(object)) {
          newLog.action = ACTIONS[object];
          break;
        }
      }

      // set errorValue;
      if (prevAction.includes('fail') && prevAction.includes('reason')) {
        const index = prevAction.indexOf('reason') + 8;

        newLog.errorValue = log.action.slice(index);
      }

      // set multiOpValue;
      if (prevAction.includes('multiple')) {
        const actionArr = log.action.split(' ');

        newLog.multiOpValue = {
          successCount: +actionArr[3],
          failCount: +actionArr[5]
        }
        newLog.action = newLog.action + 100;
      }

      // set recordType, recordId, parentTypes and parentIds
      let found = false;
      for(object of Object.keys(CHILD_OBJECTS)) {
        if (prevAction.includes(object)) {
          found = true;
          newLog.recordType = CHILD_OBJECTS[object];
          newLog.parentTypes = [1001];
          newLog.parentIds = [prevRecordId];
          if (newLog.action === ACTIONS['moved successfully']) {
            if (prevAction.includes('moved successfully to')) {
              toQueue.push(log);
            } else {
              fromQueue.push(log);
            }

            if (fromQueue.length > 0 && toQueue.length > 0) {
              const toLog = toQueue.shift();
              const fromLog = fromQueue.shift();
              const parentFromId = fromLog.action.slice(-17);
              const parentToId = toLog.action.slice(-17);

              newLog.parentTypes = [1001, 1001];
              newLog.parentIds = [parentFromId, parentToId];
              deleteLogId = fromLog._id;
              if (fromLog._id === log._id) deleteLogId = toLog._id;
            } else {
              return;
            }
          }
          break;
        }
      }

      if (!found) {
        for (object of Object.keys(COLLECTION_NAME_OBJECTS)) {
          if (prevCollectionName.includes(object)) {
            newLog.recordType = COLLECTION_NAME_OBJECTS[object];
            newLog.recordId = prevRecordId;
            if (prevAction.includes('_for_') || prevAction.includes('_from_')) {
              const id = log.action.slice(-17);

              newLog.parentTypes = [1001];
              newLog.parentIds = [id];
            }
            if (newLog.action === ACTIONS.transfer) {
              newLog.parentTypes = [4001, 4001]
            }
            break;
          }
        }
      }

      promises.push(ActivityLogs.replaceOne({ _id: log._id }, newLog));
      if (deleteLogId) {
        promises.push(ActivityLogs.deleteOne({ _id: deleteLogId }));
      }
    } catch (e) {
      console.log(e);
    }
  }

  for (let i = 0; i < activityLogs.length; i++) {
    const log = activityLogs[i];

    if ((i + 1) % 100 === 0) console.log(`processing ${i + 1} of ${logCount} logs.`);
    processLog(log);
  }

  if (fromQueue.length > 0) {
    console.log(`${fromQueue.length} 'source' art transfer logs left unprocessed because no matching 'destination' logs. ${fromQueue.map(({ _id }) => _id)}`);
  }
  if (toQueue.length > 0) {
    console.log(`${toQueue.length} 'destination' art transfer logs left unprocessed because no matching 'source' logs. ${toQueue.map(({ _id }) => _id)}`);
  }

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

module.exports = mongoScript;