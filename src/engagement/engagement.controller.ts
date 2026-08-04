import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { EngagementService } from './engagement.service';
import { CreateEngagementRecordDto } from './dto/create-engagement-record.dto';

@ApiTags('engagement')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post('engagement-records')
  create(@Body() dto: CreateEngagementRecordDto) {
    return this.engagementService.create(dto);
  }

  @Get('students/:studentId/engagement-records')
  findByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.engagementService.findByStudent(studentId);
  }

  @Get('students/:studentId/engagement-summary')
  getSummary(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.engagementService.getSummary(studentId);
  }
}
