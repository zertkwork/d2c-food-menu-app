import { describe, it, expect, beforeAll } from 'bun:test';
import request from 'supertest';

// Set env before importing app so env loader validates
process.env.PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'test-paystack';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost';
process.env.PAYMENT_MODE = process.env.PAYMENT_MODE || 'stub';
process.env.ADAPTER_STUB_DB = 'true';
process.env.PORT = process.env.PORT || '0';

import app from '../adapters/express/app';
import { env } from '../adapters/express/config/env';

console.log('TEST ENV ADAPTER_STUB_DB=', env.ADAPTER_STUB_DB);

describe('Express adapter contract tests', () => {
  it('POST /orders returns contract shape with stub', async () => {
    const resp = await request(app)
      .post('/orders')
    .send({ customerName: 'Alice', phone: '123', deliveryAddress: 'Addr', items: [{ menuItemId: 1, quantity: 1 }], total: 0 });

    expect(resp.status).toBe(200);
    expect(resp.body).toHaveProperty('orderId');
    expect(resp.body).toHaveProperty('trackingId');
    expect(resp.body).toHaveProperty('paystackAuthUrl');
    expect(resp.body).toHaveProperty('paystackReference');
  });

  it('POST /auth/login returns session and user when stubbed', async () => {
    const resp = await request(app)
      .post('/auth/login')
      .send({ username: 'user', password: 'pass' });

    expect(resp.status).toBe(200);
    expect(resp.body).toHaveProperty('session');
    expect(resp.body).toHaveProperty('user');
    expect(resp.body.user).toHaveProperty('id');
    expect(resp.body.user).toHaveProperty('username');
  });

  it('POST /auth/register returns 201 with created user when stubbed', async () => {
    const resp = await request(app)
      .post('/auth/register')
      .send({ username: 'newuser', password: 'Password1', role: 'admin' });

    expect(resp.status).toBe(201);
    expect(resp.body).toHaveProperty('id');
    expect(resp.body).toHaveProperty('username');
    expect(resp.body).toHaveProperty('role');
  });

  it('GET /auth/me enforces auth and returns 200 when token provided', async () => {
    // without token -> 401
    const resp1 = await request(app).get('/auth/me');
    expect(resp1.status).toBe(401);

    // with token -> 200 (stubbed)
    const token = require('jsonwebtoken').sign({ sub: '1' }, process.env.JWT_SECRET);
    const resp2 = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(resp2.status).toBe(200);
    expect(resp2.body).toHaveProperty('id');
    expect(resp2.body).toHaveProperty('username');
  });
});
