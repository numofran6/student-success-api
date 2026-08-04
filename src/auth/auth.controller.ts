import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

@ApiTags('auth')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyAuthGuard)
@Controller('auth')
export class AuthController {
  @Get('session')
  getSession(): { ok: true } {
    return { ok: true };
  }
}
