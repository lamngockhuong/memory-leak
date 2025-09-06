import { ReadinessService } from './readiness.service';

describe('ReadinessService', () => {
  let service: ReadinessService;

  beforeEach(() => {
    service = new ReadinessService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be ready by default', () => {
    expect(service.isReady()).toBe(true);
  });

  it('should set ready state to false', () => {
    service.setReady(false);
    expect(service.isReady()).toBe(false);
  });

  it('should set ready state to true', () => {
    service.setReady(false);
    service.setReady(true);
    expect(service.isReady()).toBe(true);
  });

  it('should toggle ready state correctly', () => {
    // Start ready
    expect(service.isReady()).toBe(true);

    // Set to not ready
    service.setReady(false);
    expect(service.isReady()).toBe(false);

    // Set back to ready
    service.setReady(true);
    expect(service.isReady()).toBe(true);
  });
});
