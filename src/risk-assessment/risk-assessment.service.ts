import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ModelType,
  RiskAssessment,
  RiskLevel,
} from '../database/entities/risk-assessment.entity';
import { AnalyticsPipelineService } from '../analytics-pipeline/analytics-pipeline.service';
import {
  AnalyticsClientService,
  ModelPrediction,
} from '../analytics-pipeline/analytics-client.service';

const HIGH_RISK_THRESHOLD = 0.66;
const MEDIUM_RISK_THRESHOLD = 0.33;

@Injectable()
export class RiskAssessmentService {
  constructor(
    @InjectRepository(RiskAssessment)
    private readonly riskAssessmentRepository: Repository<RiskAssessment>,
    private readonly analyticsPipelineService: AnalyticsPipelineService,
    private readonly analyticsClientService: AnalyticsClientService,
  ) {}

  async runAssessment(studentId: string): Promise<RiskAssessment[]> {
    const features =
      await this.analyticsPipelineService.buildFeatureVector(studentId);

    const [classicalPrediction, deepLearningPrediction] = await Promise.all([
      this.analyticsClientService.predictClassicalMl(features),
      this.analyticsClientService.predictDeepLearning(features),
    ]);

    return Promise.all([
      this.saveAssessment(
        studentId,
        ModelType.CLASSICAL_ML,
        classicalPrediction,
      ),
      this.saveAssessment(
        studentId,
        ModelType.DEEP_LEARNING,
        deepLearningPrediction,
      ),
    ]);
  }

  private saveAssessment(
    studentId: string,
    modelType: ModelType,
    prediction: ModelPrediction,
  ): Promise<RiskAssessment> {
    const assessment = this.riskAssessmentRepository.create({
      studentId,
      modelType,
      modelVersion: prediction.modelVersion,
      riskScore: prediction.riskScore,
      riskLevel: this.toRiskLevel(prediction.riskScore),
      contributingFactors: prediction.contributingFactors,
      predictedAt: new Date(),
    });
    return this.riskAssessmentRepository.save(assessment);
  }

  private toRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= HIGH_RISK_THRESHOLD) {
      return RiskLevel.HIGH;
    }
    if (riskScore >= MEDIUM_RISK_THRESHOLD) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  }

  findByStudent(studentId: string): Promise<RiskAssessment[]> {
    return this.riskAssessmentRepository.find({
      where: { studentId },
      order: { predictedAt: 'DESC' },
    });
  }

  async findAtRisk(
    riskLevel: RiskLevel = RiskLevel.HIGH,
  ): Promise<RiskAssessment[]> {
    const current = await this.findCurrentPerStudent();
    return current
      .filter((assessment) => assessment.riskLevel === riskLevel)
      .sort((a, b) => b.predictedAt.getTime() - a.predictedAt.getTime());
  }

  // Each assessment run stores one row per model (classical ML + deep
  // learning), and re-running assessments piles up history. A student's
  // "current" risk is the more severe of their two latest per-model
  // predictions — erring toward flagging rather than missing an at-risk
  // student one model didn't catch.
  private async findCurrentPerStudent(): Promise<RiskAssessment[]> {
    const latestPerStudentAndModel = await this.riskAssessmentRepository
      .createQueryBuilder('assessment')
      .distinctOn(['assessment.studentId', 'assessment.modelType'])
      .leftJoinAndSelect('assessment.student', 'student')
      .orderBy('assessment.studentId', 'ASC')
      .addOrderBy('assessment.modelType', 'ASC')
      .addOrderBy('assessment.predictedAt', 'DESC')
      .getMany();

    const mostSevereByStudent = new Map<string, RiskAssessment>();
    for (const assessment of latestPerStudentAndModel) {
      const current = mostSevereByStudent.get(assessment.studentId);
      if (
        !current ||
        this.severityRank(assessment.riskLevel) >
          this.severityRank(current.riskLevel)
      ) {
        mostSevereByStudent.set(assessment.studentId, assessment);
      }
    }

    return Array.from(mostSevereByStudent.values());
  }

  private severityRank(riskLevel: RiskLevel): number {
    return { [RiskLevel.LOW]: 1, [RiskLevel.MEDIUM]: 2, [RiskLevel.HIGH]: 3 }[
      riskLevel
    ];
  }
}
