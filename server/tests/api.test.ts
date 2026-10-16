import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';

describe('Green Grid API Integration Test Suite', () => {
  let adminToken: string;
  let userToken: string;
  let testUserId: string;
  let testDeviceId: string;
  let testConsumptionId: string;
  let testRenewableId: string;

  beforeAll(async () => {
    // Authenticate Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@greengrid.com', password: 'Admin@123' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // Authenticate Normal User (Alex)
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@greengrid.com', password: 'User@123' });
    expect(userRes.status).toBe(200);
    userToken = userRes.body.data.token;
    testUserId = userRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication Module', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = `test_${Date.now()}@greengrid.com`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Automated Test User',
        email: uniqueEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+1-555-9999',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(uniqueEmail);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject registration if email is already taken', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Alex',
        email: 'alex@greengrid.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@greengrid.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current user profile on /api/auth/me with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('alex@greengrid.com');
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('2. Device Management CRUD', () => {
    it('should create a new device with calculated daily kWh', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Smart Microwave Oven',
          category: 'Other',
          ratedPower: 1200,
          quantity: 1,
          usageHoursPerDay: 0.5,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.device.dailyConsumptionKwh).toBe(0.6); // 1200 * 1 * 0.5 / 1000 = 0.6
      testDeviceId = res.body.data.device.id;
    });

    it('should list all registered devices for the user', async () => {
      const res = await request(app)
        .get('/api/devices')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.devices)).toBe(true);
      expect(res.body.data.devices.length).toBeGreaterThan(0);
    });

    it('should update device parameters', async () => {
      const res = await request(app)
        .put(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          usageHoursPerDay: 1.0,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.device.dailyConsumptionKwh).toBe(1.2);
    });

    it('should reject invalid device data (negative power)', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Faulty Device',
          category: 'Other',
          ratedPower: -50,
          quantity: 1,
          usageHoursPerDay: 5,
        });

      expect(res.status).toBe(422);
    });
  });

  describe('3. Energy Consumption CRUD', () => {
    it('should record electricity consumption and auto-calculate cost', async () => {
      const res = await request(app)
        .post('/api/consumption')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deviceId: testDeviceId,
          date: new Date().toISOString(),
          energyKwh: 10.0,
          source: 'SMART_METER',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.record.energyKwh).toBe(10.0);
      expect(res.body.data.record.cost).toBeGreaterThan(0); // 10.0 * 0.15 tariff = 1.50
      testConsumptionId = res.body.data.record.id;
    });

    it('should list consumption records with pagination', async () => {
      const res = await request(app)
        .get('/api/consumption?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeLessThanOrEqual(5);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  describe('4. Renewable Energy Generation CRUD', () => {
    it('should record renewable solar generation', async () => {
      const res = await request(app)
        .post('/api/renewable')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          source: 'SOLAR',
          generationKwh: 18.5,
          date: new Date().toISOString(),
          capacityKw: 5.0,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.record.generationKwh).toBe(18.5);
      testRenewableId = res.body.data.record.id;
    });

    it('should list renewable generation entries', async () => {
      const res = await request(app)
        .get('/api/renewable')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeGreaterThan(0);
    });
  });

  describe('5. Analytics & Recommendation Engine', () => {
    it('should return complete user energy summary metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.monthly).toBeDefined();
      expect(res.body.data.monthly.renewablePercentage).toBeDefined();
      expect(res.body.data.monthly.carbonEmissions).toBeDefined();
      expect(res.body.data.monthly.carbonReduction).toBeDefined();
    });

    it('should return 30-day daily consumption timeline', async () => {
      const res = await request(app)
        .get('/api/analytics/daily?days=30')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.timeline.length).toBe(30);
    });

    it('should return personalized energy recommendations from stored data', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('6. Alerts & Notifications', () => {
    it('should retrieve user alerts list and unread count', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.alerts)).toBe(true);
    });
  });

  describe('7. Reports & CSV Export', () => {
    it('should return JSON energy report summary', async () => {
      const res = await request(app)
        .get('/api/reports/energy')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
    });

    it('should export energy report as CSV file stream', async () => {
      const res = await request(app)
        .get('/api/reports/energy/export')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('GREEN GRID — ENERGY & SUSTAINABILITY REPORT');
    });
  });

  describe('8. Role-Based Authorization & Admin Cockpit', () => {
    it('should forbid standard user from accessing admin dashboard with 403', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should permit Admin to access admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats.totalUsers).toBeGreaterThan(0);
    });

    it('should permit Admin to search users list', async () => {
      const res = await request(app)
        .get('/api/admin/users?search=alex')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });
  });

  describe('9. Cleanup & Cascade Verification', () => {
    it('should delete test device and test consumption', async () => {
      const delConsRes = await request(app)
        .delete(`/api/consumption/${testConsumptionId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(delConsRes.status).toBe(200);

      const delDevRes = await request(app)
        .delete(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(delDevRes.status).toBe(200);

      const delRenRes = await request(app)
        .delete(`/api/renewable/${testRenewableId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(delRenRes.status).toBe(200);
    });
  });
});
