import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { UpdateRecommendationStatusDto } from './dto/update-recommendation-status.dto';

@ApiTags('recommendations')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('students/:studentId/recommendations')
  generateForStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.recommendationsService.generateForStudent(studentId);
  }

  @Get('students/:studentId/recommendations')
  findByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.recommendationsService.findByStudent(studentId);
  }

  @Get('recommendations/early-warnings')
  findPendingEarlyWarnings() {
    return this.recommendationsService.findPendingEarlyWarnings();
  }

  @Patch('recommendations/:id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecommendationStatusDto,
  ) {
    return this.recommendationsService.updateStatus(id, dto);
  }
}
