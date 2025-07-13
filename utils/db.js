import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const dbName = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
    });

    this.db = null;

    this.client.connect()
      .then(() => {
        this.db = this.client.db(dbName);
        console.log('MongoDB connection successful');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        this.db = null;
      });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.db ? this.db.collection('users').countDocuments() : 0;
  }

  async nbFiles() {
    return this.db ? this.db.collection('files').countDocuments() : 0;
  }

  async waitForConnection() {
    const maxRetries = 20;
    let retries = 0;

    while (!this.isAlive() && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries += 1;
    }

    if (!this.isAlive()) {
      throw new Error('MongoDB connection failed after waiting');
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
