module.exports = async function get_documents_without_resourcetype_or_publicid (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const Arts = db.collection('Artworks');
  const arts = await Arts.find({ $or: [{ 'artGallery.0': { $exists: true } }, { 'relatedDocs.0': { $exists: true } }] });

  console.log(await arts.count(), 'count');
  const artIds = [];
  await arts.forEach(art => {
    let artGalleryLogs = '\tArt Gallery';
    let relatedDocLogs = '\tRelated Docs';

    const gallery = art.artGallery?.filter(doc => doc.filePath && (!doc.publicId || !doc.resourceType)) || [];
    const relatedDocs = art.relatedDocs?.filter(doc => doc.filePath && (!doc.publicId || !doc.resourceType)) || [];
    let logCount = 0;

    gallery.forEach(doc => {
      artGalleryLogs = `${artGalleryLogs}\n\t\t${doc.id} ${doc.filePath} ${doc.fileUrl}`;
      logCount++;
    });

    relatedDocs.forEach(doc => {
      relatedDocLogs = `${relatedDocLogs}\n\t\t${doc.id} ${doc.filePath} ${doc.fileUrl}`;
      logCount++;
    });

    if (logCount) {
      // artIds.push({ _id: art._id });
      // console.log(`${art._id}`);
      console.log(`ArtID ${logCount}: ${art._id}\n${artGalleryLogs}\n${relatedDocLogs}`);
    }
  })
}
