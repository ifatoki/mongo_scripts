module.exports = async function get_blank_documents (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const RelatedDocuments = db.collection('RelatedDocuments');
  const docs = await RelatedDocuments.find({ name: { $exists: false } });

  console.log(await docs.count(), 'count');
  await docs.forEach(doc => {
    // RelatedDocuments.remove({ _id: doc._id }, (err, d) => {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //   console.log(`${d} doc with id ${doc._id} and parentId ${doc.parentId} removed`)
    // });
    console.log(`${doc._id}, with parentId ${doc.parentId}`);
  });
}

