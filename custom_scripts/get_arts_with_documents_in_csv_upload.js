module.exports = async function get_arts_with_documents_in_csv_upload (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const Arts = db.collection('Artworks');
  const arts = await Arts.find({ $or: [{ 'artGallery.0': { $exists: true } }, { 'relatedDocs.0': { $exists: true } }] });

  console.log(await arts.count(), 'count');
  const artIds = [];
  await arts.forEach(art => {
    let artGalleryLogs = '\tArt Gallery';
    let relatedDocLogs = '\tRelated Docs';

    const gallery = art.artGallery?.filter(doc => doc.filePath?.includes('csvUploadImages')) || [];
    const relatedDocs = art.relatedDocs?.filter(doc => doc.filePath?.includes('csvUploadImages')) || [];
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
      console.log(`ArtID: ${art._id}\n${artGalleryLogs}\n\n${relatedDocLogs}`);
    }
  })
  // console.log(await Arts.deleteMany({ $or: artIds }));
}
