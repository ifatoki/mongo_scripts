
module.exports = async function printDuplicateTechnicaluniqueIndexesFromArtsTechnical (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const Artworks = db.collection('Artworks');
  const arts = await Artworks.find({ $or: [{ 'technical.0.identifierId': { $exists: true } }, { 'technical.1.identifierId': { $exists: true } }] });
  console.log(arts, 'arts')
  const outputTextArray = [];
  const uniqueIndexes = {};
  const duplicates = [];
  let techCount = 0;

  arts.forEach((art) => {
    console.log('I just got in here');
    let count = 0;

    art.technical.forEach(tech => {
      if (!tech.identifierId) return;
      const data = {
        createdDate: new Date(),
        ...tech
      };
      data.active = data.active === 'yes';
      delete data.id;

    
      const types = uniqueIndexes[`${tech.identifierId}`] || new Set();
      if (types.has(tech.identifierType)) {
        const { _id, identifierId, identifierType, authentifyId } = tech;

        duplicates.push({ _id, identifierId, identifierType, authentifyId });
        return;
      }
      
      types.add(tech.identifierType)
      uniqueIndexes[`${tech.identifierId}`] = types;
      count++;
    });
    outputTextArray.push(`Fetched ${count} ${art._id} identifiers successfully`);
    techCount += count;
  });
  console.log(`\n*****************\nCOUNTS:\nTechnical Total: ${techCount},\nUnique Indexes: ${Object.keys(uniqueIndexes).length},\nDuplicates: ${duplicates.length} ${await arts.count()}`);
  console.log('\n*****************');
  console.log('UNIQUE INDEXES:');
  console.dir(uniqueIndexes);
  console.log('\n*****************');
  console.log('DUPLICATES:');
  console.dir(duplicates)
  console.log(outputTextArray.join('\n'));
}