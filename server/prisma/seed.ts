import { PrismaClient, Role, ConsumptionSource, RenewableSource, AlertType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Green Grid database seeding...');

  // 1. Clean existing records (cascading deletes handle child records)
  await prisma.alert.deleteMany();
  await prisma.energyConsumption.deleteMany();
  await prisma.renewableGeneration.deleteMany();
  await prisma.device.deleteMany();
  await prisma.energySettings.deleteMany();
  await prisma.energyTariff.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Purged existing records.');

  // 2. Hash default passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // 3. Create Energy Tariff
  const activeTariff = await prisma.energyTariff.create({
    data: {
      name: 'Standard Residential Green-Net',
      ratePerKwh: 7.50, // ₹7.50 / kWh
      fixedCharge: 125.00, // ₹125.00 monthly base grid charge
      effectiveFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // Archive tariff for historical reference
  await prisma.energyTariff.create({
    data: {
      name: 'Off-Peak Winter Tier (Legacy)',
      ratePerKwh: 6.50,
      fixedCharge: 100.00,
      effectiveFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      effectiveTo: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      isActive: false,
    },
  });

  console.log('⚡ Created active and historical energy tariffs.');

  // 4. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@greengrid.com',
      password: adminPassword,
      phone: '+1 (555) 019-9000',
      role: Role.ADMIN,
      isActive: true,
      settings: {
        create: {
          dailyConsumptionLimit: 30.0,
          monthlyConsumptionLimit: 800.0,
          monthlyCostLimit: 8000.0,
          carbonFactor: 0.82,
          alertEnabled: true,
        },
      },
    },
  });

  // 5. Create 3 Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alex Green (Eco Leader)',
      email: 'alex@greengrid.com',
      password: userPassword,
      phone: '+1 (555) 011-2345',
      role: Role.USER,
      isActive: true,
      settings: {
        create: {
          dailyConsumptionLimit: 22.0,
          monthlyConsumptionLimit: 550.0,
          monthlyCostLimit: 5000.0,
          carbonFactor: 0.82,
          alertEnabled: true,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Sam Rivera (Smart Home)',
      email: 'sam@greengrid.com',
      password: userPassword,
      phone: '+1 (555) 012-3456',
      role: Role.USER,
      isActive: true,
      settings: {
        create: {
          dailyConsumptionLimit: 18.0,
          monthlyConsumptionLimit: 450.0,
          monthlyCostLimit: 4500.0,
          carbonFactor: 0.82,
          alertEnabled: true,
        },
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Jordan Lee (Solar Pro)',
      email: 'jordan@greengrid.com',
      password: userPassword,
      phone: '+1 (555) 013-4567',
      role: Role.USER,
      isActive: true,
      settings: {
        create: {
          dailyConsumptionLimit: 25.0,
          monthlyConsumptionLimit: 600.0,
          monthlyCostLimit: 6000.0,
          carbonFactor: 0.82,
          alertEnabled: true,
        },
      },
    },
  });

  console.log('👥 Created 1 Admin and 3 Normal Users.');

  // 6. Create Devices for Alex Green (user1)
  const devicesUser1 = await Promise.all([
    prisma.device.create({
      data: {
        userId: user1.id,
        name: 'Inverter Air Conditioner',
        category: 'AC',
        ratedPower: 1500, // 1.5 kW
        quantity: 2,
        usageHoursPerDay: 6.5,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user1.id,
        name: 'French Door Refrigerator',
        category: 'Refrigerator',
        ratedPower: 220,
        quantity: 1,
        usageHoursPerDay: 24,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user1.id,
        name: 'Smart Front-Load Washer',
        category: 'Washing Machine',
        ratedPower: 900,
        quantity: 1,
        usageHoursPerDay: 1.5,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user1.id,
        name: '65-inch OLED TV',
        category: 'Television',
        ratedPower: 140,
        quantity: 2,
        usageHoursPerDay: 4.0,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user1.id,
        name: 'Home Office Workstation',
        category: 'Computer',
        ratedPower: 350,
        quantity: 1,
        usageHoursPerDay: 8.0,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user1.id,
        name: 'Recessed LED Downlights',
        category: 'Lighting',
        ratedPower: 60,
        quantity: 12,
        usageHoursPerDay: 5.0,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user1.id,
        name: 'Instant Water Heater',
        category: 'Water Heater',
        ratedPower: 2500,
        quantity: 1,
        usageHoursPerDay: 1.2,
        isActive: true,
      },
    }),
  ]);

  // Devices for Sam Rivera (user2)
  await Promise.all([
    prisma.device.create({
      data: {
        userId: user2.id,
        name: 'Split AC Living Room',
        category: 'AC',
        ratedPower: 1200,
        quantity: 1,
        usageHoursPerDay: 5,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user2.id,
        name: 'Double Door Fridge',
        category: 'Refrigerator',
        ratedPower: 200,
        quantity: 1,
        usageHoursPerDay: 24,
        isActive: true,
      },
    }),
    prisma.device.create({
      data: {
        userId: user2.id,
        name: 'Submersible Water Pump',
        category: 'Pump',
        ratedPower: 1100,
        quantity: 1,
        usageHoursPerDay: 1.0,
        isActive: true,
      },
    }),
  ]);

  console.log('🔌 Created electrical devices across users.');

  // 7. Seed 30 Days of Historical Consumption & Renewable Generation
  const now = new Date();
  const tariffRate = activeTariff.ratePerKwh;

  console.log('📅 Generating 30 days of realistic daily metrics...');

  for (let i = 29; i >= 0; i--) {
    const entryDate = new Date(now);
    entryDate.setDate(now.getDate() - i);
    entryDate.setHours(12, 0, 0, 0);

    // Weather/season variation factor (sinusoidal)
    const dayVariation = 1.0 + Math.sin(i / 3.0) * 0.2 + (Math.random() - 0.5) * 0.15;

    // --- User 1: Alex Green ---
    // Primary AC Consumption
    const acKwh = Number((1.5 * 2 * 6.5 * dayVariation * 0.85).toFixed(2));
    await prisma.energyConsumption.create({
      data: {
        userId: user1.id,
        deviceId: devicesUser1[0].id,
        date: entryDate,
        energyKwh: acKwh,
        cost: Number((acKwh * tariffRate).toFixed(2)),
        source: ConsumptionSource.SMART_METER,
      },
    });

    // Refrigerator baseline
    const fridgeKwh = Number((0.22 * 24 * (0.95 + Math.random() * 0.1)).toFixed(2));
    await prisma.energyConsumption.create({
      data: {
        userId: user1.id,
        deviceId: devicesUser1[1].id,
        date: entryDate,
        energyKwh: fridgeKwh,
        cost: Number((fridgeKwh * tariffRate).toFixed(2)),
        source: ConsumptionSource.SMART_METER,
      },
    });

    // General Household Consumption
    const otherKwh = Number((5.5 * dayVariation).toFixed(2));
    await prisma.energyConsumption.create({
      data: {
        userId: user1.id,
        deviceId: null,
        date: entryDate,
        energyKwh: otherKwh,
        cost: Number((otherKwh * tariffRate).toFixed(2)),
        source: ConsumptionSource.MANUAL,
      },
    });

    // Solar PV Generation for Alex (5 kW rooftop system)
    // Cloudy vs Sunny days
    const sunnyFactor = i % 5 === 0 ? 0.35 : (0.8 + Math.random() * 0.3);
    const solarKwh = Number((5.0 * 4.2 * sunnyFactor).toFixed(2)); // ~14 - 23 kWh/day
    await prisma.renewableGeneration.create({
      data: {
        userId: user1.id,
        source: RenewableSource.SOLAR,
        generationKwh: solarKwh,
        date: entryDate,
        capacityKw: 5.0,
      },
    });

    // --- User 2: Sam Rivera (Moderate consumer) ---
    const samTotalKwh = Number((14.0 * dayVariation).toFixed(2));
    await prisma.energyConsumption.create({
      data: {
        userId: user2.id,
        date: entryDate,
        energyKwh: samTotalKwh,
        cost: Number((samTotalKwh * tariffRate).toFixed(2)),
        source: ConsumptionSource.SMART_METER,
      },
    });

    // --- User 3: Jordan Lee (High renewable prosumer with Wind + Solar) ---
    const jordanKwh = Number((22.0 * dayVariation).toFixed(2));
    await prisma.energyConsumption.create({
      data: {
        userId: user3.id,
        date: entryDate,
        energyKwh: jordanKwh,
        cost: Number((jordanKwh * tariffRate).toFixed(2)),
        source: ConsumptionSource.SMART_METER,
      },
    });

    const jordanSolar = Number((8.0 * 4.0 * sunnyFactor).toFixed(2));
    await prisma.renewableGeneration.create({
      data: {
        userId: user3.id,
        source: RenewableSource.SOLAR,
        generationKwh: jordanSolar,
        date: entryDate,
        capacityKw: 8.0,
      },
    });
  }

  // 8. Seed Realistic Threshold Alerts
  await prisma.alert.createMany({
    data: [
      {
        userId: user1.id,
        type: AlertType.HIGH_CONSUMPTION,
        title: 'Daily Consumption Threshold Breached',
        message: 'Your total energy consumption on yesterday exceeded your target limit of 22.0 kWh.',
        threshold: 22.0,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user1.id,
        type: AlertType.DEVICE_OVERUSE,
        title: 'Air Conditioner Overuse Warning',
        message: 'Inverter Air Conditioner operated for more than 8.5 hours today. Consider increasing thermostat to 24°C.',
        threshold: 8.0,
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user1.id,
        type: AlertType.LOW_RENEWABLE_RATIO,
        title: 'Low Solar Coverage Alert',
        message: 'Due to overcast weather, your rooftop solar generated only 7.3 kWh today (covering 28% of load).',
        threshold: 40.0,
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user2.id,
        type: AlertType.HIGH_COST,
        title: 'Monthly Bill Projection Warning',
        message: 'At current consumption rates, your projected electricity bill will exceed Rs. 5,000.00 this cycle.',
        threshold: 5000.0,
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('🔔 Seeded notifications & alerts.');
  console.log('✅ Seeding complete!');
  console.log('----------------------------------------------------');
  console.log('🔑 Login Credentials:');
  console.log('  Admin User : admin@greengrid.com / Admin@123');
  console.log('  Normal User: alex@greengrid.com  / User@123');
  console.log('  Normal User: sam@greengrid.com   / User@123');
  console.log('  Normal User: jordan@greengrid.com/ User@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
