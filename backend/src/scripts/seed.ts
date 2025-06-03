import mongoose from 'mongoose';
import { faker } from '@faker-js/faker/locale/fr';
import bcrypt from 'bcryptjs';
import config from '../config';
import User, { UserRole, VendeurSpecialty } from '../models/User';
import Client from '../models/Client';
import Showroom from '../models/Showroom';

// Configuration du seeding
const SEED_CONFIG = {
  ADMINS: 1,
  VENDEURS: 5,
  PRESTATAIRES: 8,
  SHOWROOMS: 3,
  CLIENTS_PER_VENDEUR: 10,
};

// Spécialités possibles pour les vendeurs
const VENDEUR_SPECIALTIES = Object.values(VendeurSpecialty);

class DatabaseSeeder {
  async run() {
    try {
      // Connexion à la base de données
      await mongoose.connect(config.mongoURI);
      console.log('✅ Connecté à MongoDB');

      console.log('🌱 Début du seeding...');

      // Nettoyer la base de données
      await this.cleanDatabase();
      console.log('🧹 Base de données nettoyée');

      // Créer les données de test
      const admins = await this.createAdmins();
      console.log(`✅ ${admins.length} admin(s) créé(s)`);

      const showrooms = await this.createShowrooms();
      console.log(`✅ ${showrooms.length} showroom(s) créé(s)`);

      const vendeurs = await this.createVendeurs(showrooms);
      console.log(`✅ ${vendeurs.length} vendeur(s) créé(s)`);

      const prestataires = await this.createPrestataires(showrooms);
      console.log(`✅ ${prestataires.length} prestataire(s) créé(s)`);

      // Créer des clients pour chaque vendeur
      let totalClients = 0;
      for (const vendeur of vendeurs) {
        const clients = await this.createClientsForVendeur(vendeur._id.toString());
        totalClients += clients.length;
      }
      console.log(`✅ ${totalClients} client(s) créé(s)`);

      console.log('\n🎉 Seeding terminé avec succès !');
      console.log('\n📊 Résumé:');
      console.log(`   👨‍💼 Admins: ${admins.length}`);
      console.log(`   🏢 Showrooms: ${showrooms.length}`);
      console.log(`   🛍️ Vendeurs: ${vendeurs.length}`);
      console.log(`   🔧 Prestataires: ${prestataires.length}`);
      console.log(`   👥 Clients: ${totalClients}`);

      console.log('\n🔑 Comptes de test:');
      console.log('   Admin: admin@example.com / password');
      console.log('   Vendeur: vendeur@example.com / password');
      console.log('   Prestataire: prestataire@example.com / password');

    } catch (error) {
      console.error('❌ Erreur lors du seeding:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Déconnexion de MongoDB');
    }
  }

  private async cleanDatabase() {
    // Supprimer dans l'ordre inverse des dépendances
    await Client.deleteMany({});
    await Showroom.deleteMany({});
    await User.deleteMany({});
  }

  private async createAdmins() {
    const admins = [];

    // Admin par défaut
    const defaultAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+33 1 23 45 67 89',
      role: UserRole.ADMIN,
      profileCompleted: true,
      active: true,
      address: {
        street: '1 Place de la République',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      }
    });
    admins.push(defaultAdmin);

    // Admins supplémentaires
    for (let i = 1; i < SEED_CONFIG.ADMINS; i++) {
      const admin = await User.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: await bcrypt.hash('password', 10),
        phone: faker.phone.number(),
        role: UserRole.ADMIN,
        profileCompleted: true,
        active: true,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France'
        }
      });
      admins.push(admin);
    }

    return admins;
  }

  private async createShowrooms() {
    const showrooms = [];

    // Showrooms prédéfinis
    const showroomData = [
      {
        name: 'Showroom Cuisines Paris',
        address: {
          street: '25 Avenue des Champs-Élysées',
          city: 'Paris',
          postalCode: '75008',
          country: 'France'
        },
        phone: '+33 1 42 12 34 56',
        email: 'paris@cuisines-demo.fr',
        website: 'https://cuisines-demo.fr'
      },
      {
        name: 'Showroom Mobilier Lyon',
        address: {
          street: '15 Rue de la République',
          city: 'Lyon',
          postalCode: '69002',
          country: 'France'
        },
        phone: '+33 4 78 12 34 56',
        email: 'lyon@mobilier-demo.fr',
        website: 'https://mobilier-demo.fr'
      },
      {
        name: 'Électroménager Marseille',
        address: {
          street: '30 La Canebière',
          city: 'Marseille',
          postalCode: '13001',
          country: 'France'
        },
        phone: '+33 4 91 12 34 56',
        email: 'marseille@electro-demo.fr',
        website: 'https://electro-demo.fr'
      }
    ];

    for (const data of showroomData) {
      const showroom = await Showroom.create(data);
      showrooms.push(showroom);
    }

    // Showrooms supplémentaires si nécessaire
    for (let i = showroomData.length; i < SEED_CONFIG.SHOWROOMS; i++) {
      const showroom = await Showroom.create({
        name: `Showroom ${faker.company.name()}`,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France'
        },
        phone: faker.phone.number(),
        email: faker.internet.email(),
        website: faker.internet.url()
      });
      showrooms.push(showroom);
    }

    return showrooms;
  }

  private async createVendeurs(showrooms: any[]) {
    const vendeurs = [];

    // Vendeur par défaut (cuisiniste)
    const defaultVendeur = await User.create({
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'vendeur@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+33 1 23 45 67 90',
      role: UserRole.VENDEUR,
      vendeurSpecialty: VendeurSpecialty.CUISINISTE,
      companyName: 'Cuisines Design',
      description: 'Spécialiste en cuisines modernes et contemporaines avec 15 ans d\'expérience',
      showrooms: [showrooms[0]._id], // Associé au premier showroom
      address: {
        street: '123 Avenue des Cuisines',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      profileCompleted: true,
      active: true
    });
    vendeurs.push(defaultVendeur);

    // Mettre à jour le showroom pour inclure ce vendeur comme manager
    await Showroom.findByIdAndUpdate(showrooms[0]._id, {
      $push: { managers: defaultVendeur._id }
    });

    // Vendeurs supplémentaires
    for (let i = 1; i < SEED_CONFIG.VENDEURS; i++) {
      const specialty = VENDEUR_SPECIALTIES[i % VENDEUR_SPECIALTIES.length];
      const showroom = showrooms[i % showrooms.length];

      const vendeur = await User.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: await bcrypt.hash('password', 10),
        phone: faker.phone.number(),
        role: UserRole.VENDEUR,
        vendeurSpecialty: specialty,
        companyName: faker.company.name(),
        description: faker.lorem.sentences(2),
        showrooms: [showroom._id],
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France'
        },
        profileCompleted: true,
        active: true
      });
      vendeurs.push(vendeur);

      // Mettre à jour le showroom
      await Showroom.findByIdAndUpdate(showroom._id, {
        $push: { managers: vendeur._id }
      });
    }

    return vendeurs;
  }

  private async createPrestataires(showrooms: any[]) {
    const prestataires = [];

    // Prestataire par défaut
    const defaultPrestataire = await User.create({
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'prestataire@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '+33 1 23 45 67 91',
      role: UserRole.PRESTATAIRE,
      specialties: ['Installation cuisine', 'Plomberie', 'Électricité'],
      companyName: 'Services Pro',
      description: 'Artisan spécialisé dans l\'installation de cuisines équipées',
      showrooms: [showrooms[0]._id],
      address: {
        street: '45 Rue des Artisans',
        city: 'Paris',
        postalCode: '75012',
        country: 'France'
      },
      profileCompleted: true,
      active: true
    });
    prestataires.push(defaultPrestataire);

    // Mettre à jour le showroom
    await Showroom.findByIdAndUpdate(showrooms[0]._id, {
      $push: { providers: defaultPrestataire._id }
    });

    // Prestataires supplémentaires
    const specialtiesOptions = [
      ['Installation cuisine', 'Plomberie'],
      ['Électricité', 'Éclairage'],
      ['Carrelage', 'Faïence'],
      ['Peinture', 'Finitions'],
      ['Menuiserie', 'Agencement'],
      ['Électroménager', 'SAV'],
      ['Domotique', 'Automatismes'],
      ['Livraison', 'Manutention']
    ];

    for (let i = 1; i < SEED_CONFIG.PRESTATAIRES; i++) {
      const showroom = showrooms[i % showrooms.length];
      const specialties = specialtiesOptions[i % specialtiesOptions.length];

      const prestataire = await User.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: await bcrypt.hash('password', 10),
        phone: faker.phone.number(),
        role: UserRole.PRESTATAIRE,
        specialties: specialties,
        companyName: faker.company.name(),
        description: faker.lorem.sentences(2),
        showrooms: [showroom._id],
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France'
        },
        profileCompleted: faker.datatype.boolean({ probability: 0.8 }),
        active: true
      });
      prestataires.push(prestataire);

      // Mettre à jour le showroom
      await Showroom.findByIdAndUpdate(showroom._id, {
        $push: { providers: prestataire._id }
      });
    }

    return prestataires;
  }

  private async createClientsForVendeur(vendeurId: string) {
    const clients = [];

    for (let i = 0; i < SEED_CONFIG.CLIENTS_PER_VENDEUR; i++) {
      const client = await Client.create({
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
        createdBy: vendeurId
      });
      clients.push(client);
    }

    return clients;
  }
}

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run()
    .then(() => {
      console.log('✅ Seeding terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale lors du seeding:', error);
      process.exit(1);
    });
}

export default DatabaseSeeder;
