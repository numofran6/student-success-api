import { Global, Module } from '@nestjs/common';
import { ApiKeyAuthGuard } from './api-key-auth.guard';
import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AuthController],
  providers: [ApiKeyAuthGuard],
  exports: [ApiKeyAuthGuard],
})
export class AuthModule {}
