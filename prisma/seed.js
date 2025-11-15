import { hash } from 'bcryptjs';
import prisma from '../lib/prisma.ts'

async function main() {
  try {
    // Delete existing demo user if exists
    await prisma.user.deleteMany({
      where: { email: 'demo@example.com' },
    });

    // Create demo user with hashed password
    const hashedPassword = await hash('demo123', 10);
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    console.log('✓ Demo user created successfully');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');
    console.log(`  ID: ${demoUser.id}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
