import request from 'supertest';
import app from '../index';

describe('Server', () => {
  it('should start and respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should return 404 for unknown routes', async () => {
    await request(app)
      .get('/unknown')
      .expect(404);
  });

  it('should handle CORS preflight requests', async () => {
    await request(app)
      .options('/preview')
      .set('Origin', 'http://localhost:3000')
      .expect(200);
  });
});
