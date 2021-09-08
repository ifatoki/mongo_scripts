module.exports = async function get_thumbnail_images_without_filepath (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const Arts = db.collection('Artworks');
  const arts = await Arts.find({ artGallery: { $exists: true } });

  console.log(await arts.count(), 'count');
  const artIds = [];
  await arts.forEach(art => {
    let artGalleryLogs = '\tArt Gallery';

    const gallery = art.artGallery?.filter(doc => doc.isThumbnail && !doc.filePath) || [];
    let logCount = 0;

    gallery.forEach(doc => {
      artGalleryLogs = `${artGalleryLogs}\n\t\t${doc.id} ${doc.filePath} ${doc.fileUrl}`;
      logCount++;
    });

    if (logCount) {
      // artIds.push({ _id: art._id });
      // console.log(`${art._id}`);
      console.log(`ArtID: ${art._id}\n${artGalleryLogs}`);
    }
  })
}
