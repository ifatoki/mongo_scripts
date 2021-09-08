module.exports = async function mongoScript (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  
  // Write your script here.
}