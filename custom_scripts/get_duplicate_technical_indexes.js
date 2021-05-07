module.exports = async function printDuplicateTechnicaluniqueIndexes (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const Technical = db.collection('Technicals');
  const techs = await Technical.find({});
  const uniqueIndexes = {};
  const duplicates = [];
  
  techs.forEach(tech => {
    const types = uniqueIndexes[`${tech.identifierId}`] || new Set();
    
    if (types.has(tech.identifierType)) {
      const { _id, identifierId, identifierType, authentifyId } = tech;

      duplicates.push({ _id, identifierId, identifierType, authentifyId });
      return;
    }
    
    types.add(tech.identifierType)
    uniqueIndexes[`${tech.identifierId}`] = types;
  })
  
  console.log(`\n*****************\nCOUNTS:\nTechnical Total: ${await techs.count()},\nUnique Indexes: ${Object.keys(uniqueIndexes).length},\nDuplicates: ${duplicates.length}`);
  console.log('\n*****************');
  console.log('UNIQUE INDEXES:');
  console.dir(uniqueIndexes);
  console.log('\n*****************');
  console.log('DUPLICATES:');
  console.dir(duplicates)
}
