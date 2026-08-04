import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'];
    const expectedKey = this.configService.get<string>('auth.apiKey');

    if (!expectedKey) {
      throw new UnauthorizedException(
        'API_KEY is not configured on the server',
      );
    }
    if (providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
