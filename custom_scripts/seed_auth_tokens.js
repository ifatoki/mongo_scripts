const authTokens = []

module.exports = async function seed_auth_tokens (client) {
  const db = client.db(`${process.env.DB_NAME}`);
  const AuthTokens = db.collection('AuthTokens');

  AuthTokens.insertMany(authTokens, (error, results) => {
    if (error) {
      console.log('error', error.message);
      return
    }
    console.log('**********', results)
  })
}
