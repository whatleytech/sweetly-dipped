import { PackageOption, PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdditionalDesignOptions() {
  const additionalDesignOptions = [
    {
      name: 'Sprinkles',
      description: 'Custom sprinkles decoration',
      basePrice: 10,
      largePriceIncrease: 0,
      perDozenPrice: null,
      sortOrder: 1,
    },
    {
      name: 'Gold or silver painted',
      description: 'Gold or silver painted accents',
      basePrice: 20,
      largePriceIncrease: 0,
      perDozenPrice: null,
      sortOrder: 2,
    },
    {
      name: 'Edible images or logos',
      description: 'Custom edible images or logos printed on treats',
      basePrice: 40,
      largePriceIncrease: 20,
      perDozenPrice: 15,
      sortOrder: 3,
    },
    {
      name: 'Individually wrapped treats',
      description: 'Each treat individually wrapped',
      basePrice: 40,
      largePriceIncrease: 20,
      perDozenPrice: 15,
      sortOrder: 4,
    },
  ];

  for (const option of additionalDesignOptions) {
    const existing = await prisma.additionalDesignOption.findFirst({
      where: { name: option.name },
    });

    if (existing) {
      await prisma.additionalDesignOption.update({
        where: { id: existing.id },
        data: option,
      });
    } else {
      await prisma.additionalDesignOption.create({
        data: option,
      });
    }
  }

  console.log('Additional design options seeded successfully');
}

async function seedUnavailablePeriods() {
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

  await prisma.unavailablePeriod.deleteMany({});
  for (const period of unavailablePeriods) {
    await prisma.unavailablePeriod.create({ data: period });
  }

  console.log('Unavailable periods seeded successfully');
}

async function seedTimeSlots() {
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

  await prisma.timeSlot.deleteMany({});
  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot });
  }

  console.log('Time slots seeded successfully');
}

async function seedTreatOptions() {
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

  console.log('Treat options seeded successfully');
}

async function seedPackageOptions() {
  const packageOptions: Omit<
    PackageOption,
    'id' | 'createdAt' | 'updatedAt'
  >[] = [
    {
      packageId: 'small',
      label: 'Small',
      price: 110,
      description: '3 dozen – 36 treats',
      isActive: true,
      sortOrder: 1,
    },
    {
      packageId: 'medium',
      label: 'Medium',
      price: 180,
      description: '5 dozen – 60 treats',
      isActive: true,
      sortOrder: 2,
    },
    {
      packageId: 'large',
      label: 'Large',
      price: 280,
      description: '8 dozen – 96 treats',
      isActive: true,
      sortOrder: 3,
    },
    {
      packageId: 'xl',
      label: 'XL',
      price: 420,
      description: '12 dozen – 144 treats (Requires at least one month notice)',
      isActive: true,
      sortOrder: 4,
    },
    {
      packageId: 'by-dozen',
      label: 'By the dozen',
      price: null,
      description: 'No package — order by the dozen',
      isActive: true,
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

  console.log('Package options seeded successfully');
}

async function main() {
  await Promise.all([
    seedPackageOptions(),
    seedTreatOptions(),
    seedTimeSlots(),
    seedUnavailablePeriods(),
    seedAdditionalDesignOptions(),
  ]);

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
