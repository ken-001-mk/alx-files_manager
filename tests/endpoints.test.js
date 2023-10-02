const { expect } = require('chai');
const request = require('request');
const { before, after } = require('mocha');
const app = require('../server'); // Import your Express app instance
const { dbClient } = require('../utils/db');

describe('endpoints', () => {
  before(async () => {
    // Connect to MongoDB for testing
    await dbClient.connect();
  });

  after(async () => {
    // Disconnect from MongoDB after testing
    await dbClient.disconnect();
  });

  it('get /status should return status', async () => {
    expect.hasAssertions();
    const response = await request(app).get('/status');
    expect(response.status).toStrictEqual(200);
    expect(response.body).toStrictEqual({ redis: true, db: true });
  });

  it('get /stats should return stats', async () => {
    expect.hasAssertions();
    const response = await request(app).get('/stats');
    expect(response.status).toStrictEqual(200);
    expect(response.body).toStrictEqual({ users: 0, files: 0 });
  });

  it('should create a new user when POST /users is called', async () => {
    expect.hasAssertions();
    const response = await request(app).post('/users').send({ email: 'test@example.com' });
    expect(response.status).toStrictEqual(201);
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });
});
