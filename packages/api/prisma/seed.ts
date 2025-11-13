import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  // Seed PackageOptions
  const packageOptions = [
    {
      packageId: 'small',
      label: 'Small (3 dozen – 36 treats)',
      price: 110,
      sortOrder: 1,
    },
    {
      packageId: 'medium',
      label: 'Medium (5 dozen – 60 treats)',
      price: 180,
      sortOrder: 2,
    },
    {
      packageId: 'large',
      label: 'Large (8 dozen – 96 treats)',
      price: 280,
      sortOrder: 3,
    },
    {
      packageId: 'xl',
      label: 'XL (12 dozen – 144 treats)',
      price: 420,
      description: 'Requires at least one month notice',
      sortOrder: 4,
    },
    {
      packageId: 'by-dozen',
      label: 'No package — order by the dozen',
      price: null,
      sortOrder: 5,
    },
  ];

  for (const option of packageOptions) {
    await prisma.packageOption.upsert({
      where: { packageId: option.packageId },
      update: option,
      create: option,
    });
  }

  // Seed TreatOptions
  const treatOptions = [
    {
      treatKey: 'riceKrispies',
      label: 'Chocolate covered Rice Krispies',
      price: 40,
      sortOrder: 1,
    },
    {
      treatKey: 'oreos',
      label: 'Chocolate covered Oreos',
      price: 30,
      sortOrder: 2,
    },
    {
      treatKey: 'pretzels',
      label: 'Chocolate dipped pretzels',
      price: 30,
      sortOrder: 3,
    },
    {
      treatKey: 'marshmallows',
      label: 'Chocolate covered marshmallow pops',
      price: 40,
      sortOrder: 4,
    },
  ];

  for (const option of treatOptions) {
    await prisma.treatOption.upsert({
      where: { treatKey: option.treatKey },
      update: option,
      create: option,
    });
  }

  // Seed TimeSlots
  const timeSlots = [
    // Monday
    {
      dayOfWeek: 'Monday',
      startHour: 8,
      startMinute: 0,
      startTimeOfDay: 'morning',
      endHour: 9,
      endMinute: 0,
      endTimeOfDay: 'morning',
    },
    {
      dayOfWeek: 'Monday',
      startHour: 5,
      startMinute: 0,
      startTimeOfDay: 'evening',
      endHour: 8,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
    // Tuesday
    {
      dayOfWeek: 'Tuesday',
      startHour: 8,
      startMinute: 0,
      startTimeOfDay: 'morning',
      endHour: 9,
      endMinute: 0,
      endTimeOfDay: 'morning',
    },
    {
      dayOfWeek: 'Tuesday',
      startHour: 5,
      startMinute: 0,
      startTimeOfDay: 'evening',
      endHour: 8,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
    // Wednesday
    {
      dayOfWeek: 'Wednesday',
      startHour: 8,
      startMinute: 0,
      startTimeOfDay: 'morning',
      endHour: 9,
      endMinute: 0,
      endTimeOfDay: 'morning',
    },
    {
      dayOfWeek: 'Wednesday',
      startHour: 5,
      startMinute: 0,
      startTimeOfDay: 'evening',
      endHour: 8,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
    // Thursday
    {
      dayOfWeek: 'Thursday',
      startHour: 8,
      startMinute: 0,
      startTimeOfDay: 'morning',
      endHour: 9,
      endMinute: 0,
      endTimeOfDay: 'morning',
    },
    {
      dayOfWeek: 'Thursday',
      startHour: 5,
      startMinute: 0,
      startTimeOfDay: 'evening',
      endHour: 8,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
    // Friday
    {
      dayOfWeek: 'Friday',
      startHour: 8,
      startMinute: 0,
      startTimeOfDay: 'morning',
      endHour: 9,
      endMinute: 0,
      endTimeOfDay: 'morning',
    },
    {
      dayOfWeek: 'Friday',
      startHour: 5,
      startMinute: 0,
      startTimeOfDay: 'evening',
      endHour: 8,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
    // Saturday
    {
      dayOfWeek: 'Saturday',
      startHour: 9,
      startMinute: 0,
      startTimeOfDay: 'morning',
      endHour: 12,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
    // Sunday
    {
      dayOfWeek: 'Sunday',
      startHour: 3,
      startMinute: 0,
      startTimeOfDay: 'evening',
      endHour: 7,
      endMinute: 0,
      endTimeOfDay: 'evening',
    },
  ];

  // Delete existing time slots and recreate to avoid duplicates
  await prisma.timeSlot.deleteMany({});
  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot });
  }

  // Seed UnavailablePeriods
  const unavailablePeriods = [
    {
      startDate: '2025-08-28',
      endDate: '2025-09-03',
      reason: 'Vacation',
    },
    {
      startDate: '2025-10-09',
      endDate: '2025-10-13',
      reason: 'Business trip',
    },
    {
      startDate: '2025-11-15',
      endDate: null,
      reason: 'Personal appointment',
    },
  ];

  // Delete existing unavailable periods and recreate
  await prisma.unavailablePeriod.deleteMany({});
  for (const period of unavailablePeriods) {
    await prisma.unavailablePeriod.create({ data: period });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


