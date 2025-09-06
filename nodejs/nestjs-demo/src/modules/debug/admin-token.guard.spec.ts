import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AdminTokenGuard } from './admin-token.guard';

describe('AdminTokenGuard', () => {
  let guard: AdminTokenGuard;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    guard = new AdminTokenGuard();

    mockRequest = {
      headers: {},
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    delete process.env.HEAPDUMP_TOKEN;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false when no environment token is set', () => {
      mockRequest.headers = { 'x-admin-token': 'some-token' };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when no token header is provided', () => {
      process.env.HEAPDUMP_TOKEN = 'expected-token';
      mockRequest.headers = {};

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when token header is not a string', () => {
      process.env.HEAPDUMP_TOKEN = 'expected-token';
      mockRequest.headers = { 'x-admin-token': ['array-token'] };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when token lengths do not match', () => {
      process.env.HEAPDUMP_TOKEN = 'expected-token';
      mockRequest.headers = { 'x-admin-token': 'short' };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when tokens do not match', () => {
      process.env.HEAPDUMP_TOKEN = 'expected-token';
      mockRequest.headers = { 'x-admin-token': 'different-token' };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return true when tokens match', () => {
      const token = 'valid-admin-token';
      process.env.HEAPDUMP_TOKEN = token;
      mockRequest.headers = { 'x-admin-token': token };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should work with unicode characters in tokens', () => {
      const token = 'token-with-unicode-🔒';
      process.env.HEAPDUMP_TOKEN = token;
      mockRequest.headers = { 'x-admin-token': token };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle case sensitive tokens correctly', () => {
      process.env.HEAPDUMP_TOKEN = 'CaseSensitiveToken';
      mockRequest.headers = { 'x-admin-token': 'casesensitivetoken' };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should handle empty tokens', () => {
      process.env.HEAPDUMP_TOKEN = '';
      mockRequest.headers = { 'x-admin-token': '' };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });
  });
});
