// const Random = require('meteor-random');
const isLogDB = true;
const baseCollections = ['Artworks', 'Artists', 'AuthTokens', 'RelatedDocuments', 'TechnicalAssignments', 'userSessionCollection'];
const logsCollections = ['ActivityLogs'];
const ids = [
  'K32t5HPt7jdDfbFLH',
  'iqypKWz4LbsMtGTc4',
  'yPuv25eAASaDWyRFs',
  'XRnNGrCCFAu388KmE',
  'TMhTiGCCPzJQWnngY',
  'Y6E3zE5KtJXLweLzd',
  '5r5cRxaaf39uydrBG',
  'KFXCXiZGGEGkhbucr',
  'QRK8JETLmyXCYXPnR',
  'aowGBGEieq6kajWcw',
  'tAN8KS5cpZreCLPmu',
  '6udYxddyb4aArC72y',
  'SH8RDWjwNb3n7xoMy',
  'kva6CzXEXgqxzCdMx',
  'ux8H4NKJ79wRdbzxt',
  'fwDj7CJgTe9rhqtKw',
  'wy42YagQC3eYeiaHg',
  'CNAjocxDxxpgGevhk',
  'jKzvxse8GThkENM5i',
  'aGD49ERdcgKTuhEob',
  'syDK7f3jncDWZfngd',
  'oXETqnzvdpfRP7gbY',
  'R9TuhZu66YEqygYBv',
  'a4ATsJxjS83DvWJzj',
  'A9SqBvw8uctyG4bGJ',
  'uHFMNYBTxWXXN8eNc',
  'i7wYXnFdP9E5ntZGs',
  '3ewfiovE6j9dgpy2Q',
  'E5Pzr9YwdQ7vTdWma'
];


module.exports = async function reassign_prod_art_to_admin (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const collections = isLogDB ? logsCollections : baseCollections;

  for (collectionName of collections) {
    const Collection = db.collection(collectionName);
    const collection = await Collection.find({ createdBy: { $in: ids } });
    const createdBy = 'xjMSnPmQP5bxjg2SR';

    console.log(await collection.count(), 'count');

    const bulkOp = Collection.initializeUnorderedBulkOp();
    if (collectionName === 'role-assignment') {
      bulkOp.find({ 'user.id': { $in: ids } }).update({ $set: { 'user.id': createdBy } })
    } else if (collectionName === 'userSessionCollection') {
      bulkOp.find({ 'userId': { $in: ids } }).update({ $set: { userId: createdBy } })
    } else {
      bulkOp.find({ createdBy: { $in: ids } }).update({ $set: { createdBy } })
    }
    const result = await bulkOp.execute();
    
    if (result) {
      const { nMatched, nModified} = result;
      console.log(`${nMatched} ${collectionName} matched and ${nModified} ${collectionName} modified`);
    }
  }
}
