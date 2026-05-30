import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'sarah.jenkins@thinkcare.md' },
    update: {},
    create: {
      email: 'sarah.jenkins@thinkcare.md',
      fullName: 'Dr. Sarah Jenkins',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      patientId: 'TC-ADMIN-1',
      isOnboarded: true,
    },
  });
  console.log('Admin user seeded:', admin.email);

  // 2. Seed General User (Alex Mercer)
  const user = await prisma.user.upsert({
    where: { email: 'alex.mercer@thinkcare.md' },
    update: {},
    create: {
      email: 'alex.mercer@thinkcare.md',
      fullName: 'Alex Mercer',
      passwordHash: userPasswordHash,
      role: 'USER',
      patientId: 'TC-8492-AX',
      isOnboarded: true,
      onboarding: {
        create: {
          firstName: 'Alex',
          lastName: 'Mercer',
          dob: new Date('1982-12-04'),
          sexAtBirth: 'Male',
          bloodType: 'O-Positive',
          height: 182,
          weight: 84,
          heartRate: 72,
          bloodPressureSystolic: 118,
          bloodPressureDiastolic: 75,
          spO2: 99,
          avgSleepHours: 7.5,
          fastFoodMealsPerWeek: 1.0,
          waterCupsPerDay: 8.0,
          dailySteps: 7500,
          stressLevel: 4,
          smokingPacksPerWeek: 0,
          alcoholDrinksPerWeek: 1,
          conditions: ['Type 2 Diabetes Mellitus', 'Mild Hypertension'],
          medications: 'Metformin 500mg (Twice Daily)\nLisinopril 10mg (Once Daily)',
          allergies: 'Penicillin (Severe)\nLatex (Mild)',
        }
      }
    },
  });
  console.log('General user seeded:', user.email);

  // 3. Seed Default System Configs
  const configs = [
    { key: 'gemini_api_key', value: '' },
    { key: 'model_auto_scaling', value: 'true' },
    { key: 'model_standard_fallback', value: 'false' },
    { key: 'diagnosis_actionable_threshold', value: '85' },
    { key: 'human_review_flag_threshold', value: '60' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log('System configurations seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
