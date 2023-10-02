const redis = require('redis');
const { promisify } = require('util');

// constructor that creates a client to Redis
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }

  // check if redis client is connected
  isAlive() {
    // return true if connected
    return this.client.connected;
  }

  //  returns the Redis value stored for this key
  async get(key) {
    return this.getAsync(key);
  }

  // takes a string key, a value and a duration in second as arguments to store it in Redis
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  // remove the value in Redis for this key
  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
