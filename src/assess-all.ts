import 'dotenv/config';

// Runs a risk assessment (classical + deep learning) and generates
// recommendations for every student, via the same REST API the frontend
// uses. Seeding only creates attendance/assessment/engagement records — the
// risk assessment/recommendation tables stay empty until something actually
// calls these endpoints, which is normally a per-student button click in
// the UI. Run this once after (re-)seeding to populate risk data for the
// whole cohort in one go.
//
// Requires a staff account to already exist (sign up via the app first).
// Usage: ASSESS_API_URL=... ASSESS_EMAIL=... ASSESS_PASSWORD=... npm run assess-all

const API_URL =
  process.env.ASSESS_API_URL ?? process.env.API_URL ?? 'http://localhost:4001';
const EMAIL = process.env.ASSESS_EMAIL;
const PASSWORD = process.env.ASSESS_PASSWORD;
const CONCURRENCY = 4;

interface PaginatedStudents {
  data: { id: string; externalId: string }[];
  total: number;
}

async function login(): Promise<string> {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Set ASSESS_EMAIL and ASSESS_PASSWORD to a staff account that already exists (sign up via the app first).',
    );
  }
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) {
    throw new Error(
      `Login failed: ${response.status} ${await response.text()}`,
    );
  }
  const body = (await response.json()) as { token: string };
  return body.token;
}

async function getAllStudentIds(
  token: string,
): Promise<{ id: string; externalId: string }[]> {
  const students: { id: string; externalId: string }[] = [];
  const limit = 100;
  let page = 1;

  while (true) {
    const response = await fetch(
      `${API_URL}/students?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to list students: ${response.status} ${await response.text()}`,
      );
    }
    const body = (await response.json()) as PaginatedStudents;
    students.push(...body.data);
    if (students.length >= body.total || body.data.length === 0) break;
    page += 1;
  }

  return students;
}

async function assessStudent(
  token: string,
  id: string,
  externalId: string,
): Promise<void> {
  const riskResponse = await fetch(
    `${API_URL}/students/${id}/risk-assessments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!riskResponse.ok) {
    console.error(
      `  ${externalId}: risk assessment failed (${riskResponse.status})`,
    );
    return;
  }

  const recResponse = await fetch(`${API_URL}/students/${id}/recommendations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!recResponse.ok) {
    console.error(
      `  ${externalId}: recommendation generation failed (${recResponse.status})`,
    );
  }
}

async function main() {
  console.log(`Logging in to ${API_URL}...`);
  const token = await login();

  console.log('Fetching students...');
  const students = await getAllStudentIds(token);
  console.log(
    `Running risk assessment + recommendations for ${students.length} students...`,
  );

  let completed = 0;
  for (let i = 0; i < students.length; i += CONCURRENCY) {
    const batch = students.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((s) => assessStudent(token, s.id, s.externalId)),
    );
    completed += batch.length;
    console.log(`  ${completed}/${students.length}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
