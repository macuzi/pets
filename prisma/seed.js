const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.petTag.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const dogs = await prisma.category.create({
    data: { name: 'Dogs' },
  });

  const cats = await prisma.category.create({
    data: { name: 'Cats' },
  });

  const rabbits = await prisma.category.create({
    data: { name: 'Rabbits' },
  });

  console.log('Created categories');

  // Create tags
  const friendly = await prisma.tag.create({
    data: { name: 'Friendly' },
  });

  const trained = await prisma.tag.create({
    data: { name: 'Trained' },
  });

  const vaccinated = await prisma.tag.create({
    data: { name: 'Vaccinated' },
  });

  const purebred = await prisma.tag.create({
    data: { name: 'Romeo' },
  });

  const hypoallergenic = await prisma.tag.create({
    data: { name: 'Hypoallergenic' },
  });

  console.log('Created tags');

  // Create pets
  await prisma.pet.create({
    data: {
      name: 'Max',
      status: 'available',
      photoUrls: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb'],
      categoryId: dogs.id,
      tags: {
        create: [
          { tagId: friendly.id },
          { tagId: trained.id },
          { tagId: vaccinated.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Bella',
      status: 'available',
      photoUrls: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e'],
      categoryId: dogs.id,
      tags: {
        create: [
          { tagId: friendly.id },
          { tagId: purebred.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Whiskers',
      status: 'available',
      photoUrls: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'],
      categoryId: cats.id,
      tags: {
        create: [
          { tagId: friendly.id },
          { tagId: vaccinated.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Shadow',
      status: 'pending',
      photoUrls: ['https://images.unsplash.com/photo-1573865526739-10c1d3a1bc64'],
      categoryId: cats.id,
      tags: {
        create: [
          { tagId: hypoallergenic.id },
          { tagId: vaccinated.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Fluffy',
      status: 'available',
      photoUrls: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308'],
      categoryId: rabbits.id,
      tags: {
        create: [
          { tagId: friendly.id },
          { tagId: vaccinated.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Thumper',
      status: 'available',
      photoUrls: ['https://images.unsplash.com/photo-1535241749838-299277b6305f'],
      categoryId: rabbits.id,
      tags: {
        create: [
          { tagId: friendly.id },
          { tagId: trained.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Luna',
      status: 'sold',
      photoUrls: ['https://images.unsplash.com/photo-1552053831-71594a27632d'],
      categoryId: dogs.id,
      tags: {
        create: [
          { tagId: trained.id },
          { tagId: purebred.id },
          { tagId: vaccinated.id },
        ],
      },
    },
  });

  await prisma.pet.create({
    data: {
      name: 'Oliver',
      status: 'available',
      photoUrls: ['https://images.unsplash.com/photo-1574158622682-e40e69881006'],
      categoryId: cats.id,
      tags: {
        create: [
          { tagId: friendly.id },
        ],
      },
    },
  });

  console.log('Created pets');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@petstore.com',
      password: hashedPassword,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@petstore.com',
      password: hashedPassword,
    },
  });

  console.log('Created users');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
