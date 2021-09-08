module.exports = async function get_all_document_paths_and_urls (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const Arts = db.collection('Artworks');
  const arts = await Arts.find({ $or: [{ 'artGallery.0': { $exists: true } }, { 'relatedDocs.0': { $exists: true } }] });

  console.log(await arts.count(), 'count');
  await arts.forEach(art => {
    let artGalleryLogs = '\tArt Gallery';
    let relatedDocLogs = '\tRelated Docs';

    art.artGallery?.forEach(doc => {
      artGalleryLogs = `${artGalleryLogs}\n\t\t${doc.id} ${doc.filePath} ${doc.fileUrl}`;
    });

    art.relatedDocs?.forEach(doc => {
      relatedDocLogs = `${relatedDocLogs}\n\t\t${doc.id} ${doc.filePath} ${doc.fileUrl}`;
    });

    console.log(`ArtID: ${art._id}\n${artGalleryLogs}\n\n${relatedDocLogs}`);
  })
}
