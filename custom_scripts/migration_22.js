module.exports = async function migration_22 (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const EnvironmentalConditions = db.collection('EnvironmentalConditions');
  const conditions = await EnvironmentalConditions.find({ type: { $exists: true }, 'value.0': { $exists: false } });

  console.log(await conditions.count(), 'count');
  let conditionCount = 0;

  await conditions.forEach(condition => {
    const value = [+condition.value];

    if (condition.value2) value.push(+condition.value2);
    if (condition.value3) value.push(+condition.value3);
    EnvironmentalConditions.update({ _id: condition._id }, { $set: { value } });
    conditionCount++;
    console.log(conditionCount + ' done!');
  });
  console.log(`Migrated ${conditionCount} environment conditions successfully`);
}
