'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';
import { revalidatePath } from 'next/cache';
import {
  runRiskAssessment,
  generateRecommendations,
  updateRecommendationStatus,
} from '@/lib/server/api';
import type { RecommendationStatus } from '@/lib/types';

interface ActionResult {
  error?: string;
}

function toErrorResult(err: unknown, fallback: string): ActionResult {
  // A 401 from lib/server/api.ts calls redirect('/login'), which Next.js
  // implements by throwing — let that propagate instead of turning it into
  // an on-page error message.
  if (isRedirectError(err)) throw err;
  return { error: err instanceof Error ? err.message : fallback };
}

export async function runRiskAssessmentAction(studentId: string): Promise<ActionResult> {
  try {
    await runRiskAssessment(studentId);
  } catch (err) {
    return toErrorResult(err, 'Could not run the risk assessment.');
  }
  revalidatePath('/', 'layout');
  return {};
}

export async function generateRecommendationsAction(studentId: string): Promise<ActionResult> {
  try {
    await generateRecommendations(studentId);
  } catch (err) {
    return toErrorResult(err, 'Could not generate recommendations.');
  }
  revalidatePath('/', 'layout');
  return {};
}

export async function updateRecommendationStatusAction(
  id: string,
  status: RecommendationStatus,
): Promise<ActionResult> {
  try {
    await updateRecommendationStatus(id, status);
  } catch (err) {
    return toErrorResult(err, 'Could not update the recommendation.');
  }
  revalidatePath('/', 'layout');
  return {};
}
