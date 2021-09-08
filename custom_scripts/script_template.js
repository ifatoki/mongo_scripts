module.exports = async function mongoScript (client) {
  /**
   * Write script description here
   */

  const db = client.db(`${process.env.DB_NAME}`);
  
  // Write your script here.
}