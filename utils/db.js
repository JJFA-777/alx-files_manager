import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const dbName = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;

    this.connected = this.client.connect().then(() => {
      this.db = this.client.db(dbName);
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
    });
  }
  
  getObjectId(id) {
    try {
      return ObjectId(id);
    } catch (e) {
      return null;
    }
  }


  async isAlive() {
    await this.connected;
    return !!this.db;
  }

  async nbUsers() {
    await this.connected;
    return this.db ? this.db.collection('users').countDocuments() : 0;
  }

  async nbFiles() {
    await this.connected;
    return this.db ? this.db.collection('files').countDocuments() : 0;
  }
}

const dbClient = new DBClient();
export default dbClient;
