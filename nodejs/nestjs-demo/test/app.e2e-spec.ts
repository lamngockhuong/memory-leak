import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

// Ensure Jest types are available
/// <reference types="jest" />

describe('Memory Leak Demo (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000); // Increased timeout for app initialization

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up any running leaks after each test
    try {
      await request(app.getHttpServer()).post('/memory-leak/timer/stop');
      await request(app.getHttpServer()).post('/memory-leak/cache/stop');
      await request(app.getHttpServer()).post('/memory-leak/closure/stop');
      await request(app.getHttpServer()).post('/memory-leak/event/stop');
      await request(app.getHttpServer()).post(
        '/memory-leak/global-variable/stop',
      );
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Root Endpoint', () => {
    it('/ (GET) should return hello message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Health Endpoints', () => {
    it('/health/ready (GET) should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect('ok');
    });
  });

  describe('Memory Leak - Overall Status', () => {
    it('/memory-leak/status (GET) should return overall status', async () => {
      const response = await request(app.getHttpServer())
        .get('/memory-leak/status')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('patterns');
      expect(response.body).toHaveProperty('memory');

      expect(response.body.patterns).toHaveProperty('timer');
      expect(response.body.patterns).toHaveProperty('cache');
      expect(response.body.patterns).toHaveProperty('closure');
      expect(response.body.patterns).toHaveProperty('event');
      expect(response.body.patterns).toHaveProperty('globalVariable');

      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('external');
    });
  });

  describe('Timer Leak Endpoints', () => {
    it('/memory-leak/timer/start (POST) should start timer leak', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory-leak/timer/start')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('activeTimers');
      expect(typeof response.body.activeTimers).toBe('number');
      expect(response.body.activeTimers).toBeGreaterThan(0);
    });

    it('/memory-leak/timer/status (GET) should return timer status', async () => {
      // Start leak first
      await request(app.getHttpServer()).post('/memory-leak/timer/start');

      const response = await request(app.getHttpServer())
        .get('/memory-leak/timer/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('activeTimers');
      expect(typeof response.body.activeTimers).toBe('number');
    });

    it('/memory-leak/timer/stop (POST) should stop timer leaks', async () => {
      // Start leak first
      await request(app.getHttpServer()).post('/memory-leak/timer/start');

      const response = await request(app.getHttpServer())
        .post('/memory-leak/timer/stop')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stoppedTimers');
      expect(response.body).toHaveProperty('activeTimers');
      expect(typeof response.body.stoppedTimers).toBe('number');
      expect(typeof response.body.activeTimers).toBe('number');
    });
  });

  describe('Cache Leak Endpoints', () => {
    it('/memory-leak/cache/start (POST) should start cache leak', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory-leak/cache/start')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('size');
      expect(response.body.stats).toHaveProperty('memoryUsage');
      expect(response.body.stats).toHaveProperty('maxSize');
      expect(typeof response.body.stats.size).toBe('number');
      expect(typeof response.body.stats.maxSize).toBe('number');
    });

    it('/memory-leak/cache/status (GET) should return cache status', async () => {
      // Start leak first
      await request(app.getHttpServer()).post('/memory-leak/cache/start');

      const response = await request(app.getHttpServer())
        .get('/memory-leak/cache/status')
        .expect(200);

      expect(response.body).toHaveProperty('isLeaking');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.isLeaking).toBe('boolean');
    });

    it('/memory-leak/cache/stats (GET) should return cache stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/memory-leak/cache/stats')
        .expect(200);

      expect(response.body).toHaveProperty('size');
      expect(response.body).toHaveProperty('memoryUsage');
      expect(response.body).toHaveProperty('maxSize');
      expect(typeof response.body.size).toBe('number');
      expect(typeof response.body.memoryUsage).toBe('string');
      expect(typeof response.body.maxSize).toBe('number');
    });

    it('/memory-leak/cache/stop (POST) should stop cache leak', async () => {
      // Start leak first
      await request(app.getHttpServer()).post('/memory-leak/cache/start');

      const response = await request(app.getHttpServer())
        .post('/memory-leak/cache/stop')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('clearedEntries');
      expect(response.body).toHaveProperty('stats');
      expect(typeof response.body.clearedEntries).toBe('number');
    });
  });

  describe('Closure Leak Endpoints', () => {
    it('/memory-leak/closure/start (POST) should start closure leak', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory-leak/closure/start')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('activeClosures');
      expect(response.body.stats).toHaveProperty('totalMemoryAllocated');
      expect(response.body.stats).toHaveProperty('isLeaking');
      expect(typeof response.body.stats.activeClosures).toBe('number');
      expect(typeof response.body.stats.totalMemoryAllocated).toBe('number');
      expect(typeof response.body.stats.isLeaking).toBe('boolean');
    });

    it('/memory-leak/closure/status (GET) should return closure status', async () => {
      const response = await request(app.getHttpServer())
        .get('/memory-leak/closure/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('activeClosures');
      expect(response.body.stats).toHaveProperty('totalMemoryAllocated');
      expect(response.body.stats).toHaveProperty('isLeaking');
    });

    it('/memory-leak/closure/stop (POST) should stop closure leak', async () => {
      // Start leak first
      await request(app.getHttpServer()).post('/memory-leak/closure/start');

      const response = await request(app.getHttpServer())
        .post('/memory-leak/closure/stop')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('activeClosures');
      expect(response.body.stats).toHaveProperty('totalMemoryAllocated');
      expect(response.body.stats).toHaveProperty('isLeaking');
      expect(typeof response.body.stats.activeClosures).toBe('number');
      expect(typeof response.body.stats.totalMemoryAllocated).toBe('number');
      expect(typeof response.body.stats.isLeaking).toBe('boolean');
    });
  });

  describe('Event Leak Endpoints', () => {
    it('/memory-leak/event/start (POST) should start event leak', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory-leak/event/start')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('activeListeners');
      expect(response.body.stats).toHaveProperty('totalMemoryAllocated');
      expect(response.body.stats).toHaveProperty('isLeaking');
      expect(typeof response.body.stats.activeListeners).toBe('number');
      expect(typeof response.body.stats.totalMemoryAllocated).toBe('number');
      expect(typeof response.body.stats.isLeaking).toBe('boolean');
    });

    it('/memory-leak/event/status (GET) should return event status', async () => {
      const response = await request(app.getHttpServer())
        .get('/memory-leak/event/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('activeListeners');
      expect(response.body.stats).toHaveProperty('totalMemoryAllocated');
      expect(response.body.stats).toHaveProperty('isLeaking');
    });

    it('/memory-leak/event/trigger (POST) should trigger event', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory-leak/event/trigger')
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('/memory-leak/event/stop (POST) should stop event leak', async () => {
      // Start leak first
      await request(app.getHttpServer()).post('/memory-leak/event/start');

      const response = await request(app.getHttpServer())
        .post('/memory-leak/event/stop')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
    });
  });

  describe('Global Variable Leak Endpoints', () => {
    it('/memory-leak/global-variable/start (POST) should start global variable leak', async () => {
      const response = await request(app.getHttpServer())
        .post('/memory-leak/global-variable/start')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('leakedArrays');
      expect(response.body.stats).toHaveProperty('estimatedMemoryMB');
      expect(response.body.stats).toHaveProperty('isLeaking');
      expect(typeof response.body.stats.leakedArrays).toBe('number');
      expect(typeof response.body.stats.estimatedMemoryMB).toBe('number');
      expect(typeof response.body.stats.isLeaking).toBe('boolean');
    });

    it('/memory-leak/global-variable/status (GET) should return global variable status', async () => {
      const response = await request(app.getHttpServer())
        .get('/memory-leak/global-variable/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('leakedArrays');
      expect(response.body.stats).toHaveProperty('estimatedMemoryMB');
      expect(response.body.stats).toHaveProperty('isLeaking');
    });

    it('/memory-leak/global-variable/stop (POST) should stop global variable leak', async () => {
      // Start leak first
      await request(app.getHttpServer()).post(
        '/memory-leak/global-variable/start',
      );

      const response = await request(app.getHttpServer())
        .post('/memory-leak/global-variable/stop')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('stats');
    });
  });

  describe('Debug Endpoints', () => {
    it('/internal/debug/heapdump (POST) should require admin token', async () => {
      await request(app.getHttpServer())
        .post('/internal/debug/heapdump')
        .expect(403);
    });

    it('/internal/debug/heapdump (POST) should create heapdump with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/internal/debug/heapdump')
        .set('x-admin-token', 'heapdump_demo')
        .expect(202);

      expect(response.text).toBe('dump started');
    });
  });

  describe('Memory Leak Scenarios', () => {
    it('should demonstrate increasing memory usage with cache leak', async () => {
      // Get initial status
      const initialResponse = await request(app.getHttpServer()).get(
        '/memory-leak/cache/stats',
      );
      const initialSize = initialResponse.body.size;

      // Start cache leak
      await request(app.getHttpServer()).post('/memory-leak/cache/start');

      // Wait a moment for leak to accumulate
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Get status after leak
      const afterLeakResponse = await request(app.getHttpServer()).get(
        '/memory-leak/cache/stats',
      );
      const afterLeakSize = afterLeakResponse.body.size;

      // Cache should have grown
      expect(afterLeakSize).toBeGreaterThan(initialSize);

      // Stop the leak
      const stopResponse = await request(app.getHttpServer()).post(
        '/memory-leak/cache/stop',
      );

      expect(stopResponse.body.clearedEntries).toBeGreaterThan(0);
    }, 10000); // Increased timeout for this scenario

    it('should demonstrate timer accumulation', async () => {
      // Get initial timer count
      const initialResponse = await request(app.getHttpServer()).get(
        '/memory-leak/timer/status',
      );
      const initialTimers = initialResponse.body.activeTimers;

      // Start timer leak multiple times
      await request(app.getHttpServer()).post('/memory-leak/timer/start');
      await request(app.getHttpServer()).post('/memory-leak/timer/start');
      await request(app.getHttpServer()).post('/memory-leak/timer/start');

      // Check timer count increased
      const afterResponse = await request(app.getHttpServer()).get(
        '/memory-leak/timer/status',
      );
      const afterTimers = afterResponse.body.activeTimers;

      expect(afterTimers).toBeGreaterThan(initialTimers);

      // Stop all timers
      const stopResponse = await request(app.getHttpServer()).post(
        '/memory-leak/timer/stop',
      );

      expect(stopResponse.body.stoppedTimers).toBeGreaterThan(0);
      expect(stopResponse.body.activeTimers).toBe(0);
    });

    it('should demonstrate global variable accumulation', async () => {
      // Start global variable leak
      await request(app.getHttpServer()).post(
        '/memory-leak/global-variable/start',
      );

      // Wait for some accumulation
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Check status shows leaking
      const statusResponse = await request(app.getHttpServer()).get(
        '/memory-leak/global-variable/status',
      );

      expect(statusResponse.body.stats.isLeaking).toBe(true);
      expect(statusResponse.body.stats.leakedArrays).toBeGreaterThan(0);
      expect(statusResponse.body.stats.estimatedMemoryMB).toBeGreaterThan(0);
    }, 10000); // Increased timeout

    it('should show overall status reflects all active leaks', async () => {
      // Start multiple leaks
      await request(app.getHttpServer()).post('/memory-leak/timer/start');
      await request(app.getHttpServer()).post('/memory-leak/cache/start');
      await request(app.getHttpServer()).post('/memory-leak/closure/start');

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check overall status
      const statusResponse = await request(app.getHttpServer()).get(
        '/memory-leak/status',
      );

      // Should show active patterns
      expect(statusResponse.body.patterns.timer.activeTimers).toBeGreaterThan(
        0,
      );
      expect(statusResponse.body.patterns.cache.isLeaking).toBe(true);
      expect(statusResponse.body.patterns.closure.isLeaking).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent endpoints gracefully', async () => {
      await request(app.getHttpServer())
        .get('/memory-leak/nonexistent')
        .expect(404);
    });

    it('should handle invalid HTTP methods', async () => {
      await request(app.getHttpServer())
        .delete('/memory-leak/timer/start')
        .expect(404);
    });

    it('should handle starting leak when already running', async () => {
      // Start cache leak
      await request(app.getHttpServer()).post('/memory-leak/cache/start');

      // Try to start again
      const response = await request(app.getHttpServer())
        .post('/memory-leak/cache/start')
        .expect(201);

      // Should indicate already running
      expect(response.body.message).toContain('already');
    });
  });
});
