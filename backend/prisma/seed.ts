// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/fr';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const SEED_COUNT = {
  ADMINS: 1,
  CUISINISTES: 5,
  CLIENTS_PER_CUISINISTE: 10,
};

enum UserRole {
  ADMIN = 'ADMIN',
  CUISINISTE = 'CUISINISTE',
  //PRESTATAIRE = 'PRESTATAIRE'
}

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données avant le seeding
  await cleanDatabase();

  console.log('🧹 Base de données nettoyée');

  // Créer des utilisateurs admin
  const admins = await createAdmins();
  console.log(`✅ ${admins.length} admins créés`);

  // Créer des utilisateurs cuisinistes
  const cuisinistes = await createCuisinistes();
  console.log(`✅ ${cuisinistes.length} cuisinistes créés`);

  // Créer des clients, projets et rendez-vous
  const clients: any[] = [];

  for (const cuisiniste of cuisinistes) {
    const cuisinisteClients = await createClients(cuisiniste.id);
    console.log(`✅ ${cuisinisteClients.length} clients créés pour le cuisiniste ${cuisiniste.firstName}`);
    clients.push(...cuisinisteClients);
  }
}

// Fonction pour nettoyer la base de données
async function cleanDatabase() {
  // Supprimer toutes les données dans l'ordre inverse des dépendances

  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
}

// Fonction pour créer des administrateurs
async function createAdmins() {
  const admins: any[] = [];

  // Créer un admin par défaut
  const defaultAdmin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+33 1 23 45 67 89',
      role: UserRole.ADMIN,
      profileCompleted: true,
      active: true
    }
  });

  admins.push(defaultAdmin);

  // Créer des admins supplémentaires si nécessaire
  for (let i = 1; i < SEED_COUNT.ADMINS; i++) {
    const admin = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: await bcrypt.hash('password', 10),
        phone: faker.phone.number(),
        role: UserRole.ADMIN,
        profileCompleted: true,
        active: true
      }
    });

    admins.push(admin);
  }

  return admins;
}

// Fonction pour créer des cuisinistes
async function createCuisinistes() {
  const cuisinistes: any[] = [];

  // Créer un cuisiniste par défaut
  const defaultCuisiniste = await prisma.user.create({
    data: {
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'cuisiniste@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+33 1 23 45 67 90',
      role: UserRole.CUISINISTE,
      companyName: 'Cuisines Design',
      description: 'Spécialiste en cuisines modernes et contemporaines',
      address: {
        street: '123 Avenue des Cuisines',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      profileCompleted: true,
      active: true
    }
  });

  cuisinistes.push(defaultCuisiniste);

  // Créer des cuisinistes supplémentaires si nécessaire
  for (let i = 1; i < SEED_COUNT.CUISINISTES; i++) {
    const cuisiniste = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: await bcrypt.hash('password', 10),
        phone: faker.phone.number(),
        role: UserRole.CUISINISTE,
        companyName: faker.company.name(),
        description: faker.lorem.sentence(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France'
        },
        profileCompleted: true,
        active: true
      }
    });

    cuisinistes.push(cuisiniste);
  }

  return cuisinistes;
}

// Fonction pour créer des clients
async function createClients(cuisinisteId: string) {
  const clients: any[] = [];

  for (let i = 0; i < SEED_COUNT.CLIENTS_PER_CUISINISTE; i++) {
    const client = await prisma.client.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France'
        },
        notes: faker.lorem.paragraph(),
        createdById: cuisinisteId
      }
    });

    clients.push(client);
  }

  return clients;
}

// Exécuter le script de seeding
main()
  .catch(e => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
