import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  isAlive() {
    return this.client.connected;
  }

  get(key) {
    return new Promise((resolve) => {
      this.client.get(key, (err, reply) => {
        if (err) resolve(null);
        else resolve(reply);
      });
    });
  }

  set(key, value, duration) {
    return new Promise((resolve) => {
      this.client.setex(key, duration, value, (err) => {
        if (err) resolve(null);
        else resolve(true);
      });
    });
  }

  del(key) {
    return new Promise((resolve) => {
      this.client.del(key, (err) => {
        if (err) resolve(null);
        else resolve(true);
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;