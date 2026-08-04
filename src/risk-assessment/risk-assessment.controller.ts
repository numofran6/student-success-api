import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { RiskAssessmentService } from './risk-assessment.service';
import { RiskLevel } from '../database/entities/risk-assessment.entity';

@ApiTags('risk-assessment')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class RiskAssessmentController {
  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  @Post('students/:studentId/risk-assessments')
  runAssessment(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.riskAssessmentService.runAssessment(studentId);
  }

  @Get('students/:studentId/risk-assessments')
  findByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.riskAssessmentService.findByStudent(studentId);
  }

  @Get('risk-assessments/at-risk')
  findAtRisk(@Query('riskLevel') riskLevel?: RiskLevel) {
    return this.riskAssessmentService.findAtRisk(riskLevel);
  }
}
