import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const token = req.headers['x-admin-token'];

    const expectedToken = process.env.HEAPDUMP_TOKEN;
    if (!expectedToken || !token || typeof token !== 'string') {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    if (expectedToken.length !== token.length) {
      return false;
    }

    try {
      const expectedBuffer = Buffer.from(expectedToken, 'utf8');
      const tokenBuffer = Buffer.from(token, 'utf8');

      if (timingSafeEqual(expectedBuffer, tokenBuffer)) {
        // (optional) check IP allowlist here
        return true;
      }
    } catch {
      // Handle any potential errors during buffer creation or comparison
      return false;
    }

    return false;
  }
}
