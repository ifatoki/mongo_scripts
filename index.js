const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function main(){
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  // const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority";


  const client = new MongoClient(process.env.MONGO_URI);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Perform needed action
    
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);