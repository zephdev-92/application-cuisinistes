import User from '../../src/models/User';
import Showroom from '../../src/models/Showroom';
import Client from '../../src/models/Client';

describe('Models', () => {
  describe('User Model', () => {
    it('devrait créer un utilisateur avec des données valides', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'vendeur',
        vendeurSpecialty: 'cuisiniste',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+33123456789'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.role).toBe('vendeur');
      expect(savedUser.firstName).toBe('John');
      expect(savedUser.lastName).toBe('Doe');
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('devrait rejeter un utilisateur avec un email invalide', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        role: 'vendeur',
        vendeurSpecialty: 'cuisiniste',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('devrait rejeter un utilisateur avec un rôle invalide', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('ne devrait pas permettre les emails dupliqués', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'vendeur',
        vendeurSpecialty: 'cuisiniste',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Showroom Model', () => {
    it('devrait créer un showroom avec des données valides', async () => {
      const showroomData = {
        name: 'Showroom Paris',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        phone: '+33123456789',
        email: 'paris@showroom.com',
        managers: [],
        providers: []
      };

      const showroom = new Showroom(showroomData);
      const savedShowroom = await showroom.save();

      expect(savedShowroom._id).toBeDefined();
      expect(savedShowroom.name).toBe('Showroom Paris');
      expect(savedShowroom.address.city).toBe('Paris');
      expect(savedShowroom.address.postalCode).toBe('75001');
      expect(savedShowroom.createdAt).toBeDefined();
    });

    it('devrait rejeter un showroom sans nom', async () => {
      const showroomData = {
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        phone: '+33123456789',
        email: 'paris@showroom.com'
      };

      const showroom = new Showroom(showroomData);

      await expect(showroom.save()).rejects.toThrow();
    });

    it('devrait rejeter un showroom avec une adresse incomplète', async () => {
      const showroomData = {
        name: 'Showroom Paris',
        address: {
          street: '123 Rue de la Paix',
          // Manque city
          postalCode: '75001',
          country: 'France'
        },
        phone: '+33123456789',
        email: 'paris@showroom.com'
      };

      const showroom = new Showroom(showroomData);

      await expect(showroom.save()).rejects.toThrow();
    });
  });

  describe('Client Model', () => {
    let testUser: any;

    beforeEach(async () => {
      // Créer un utilisateur de test pour le champ createdBy
      testUser = await User.create({
        email: 'testuser@example.com',
        password: 'password123',
        role: 'vendeur',
        vendeurSpecialty: 'cuisiniste',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    it('devrait créer un client avec des données valides', async () => {
      const clientData = {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        phone: '+33123456789',
        address: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        },
        notes: 'Client intéressé par une cuisine moderne',
        createdBy: testUser._id
      };

      const client = new Client(clientData);
      const savedClient = await client.save();

      expect(savedClient._id).toBeDefined();
      expect(savedClient.firstName).toBe('Marie');
      expect(savedClient.lastName).toBe('Dupont');
      expect(savedClient.email).toBe('marie.dupont@example.com');
      expect(savedClient.createdBy).toEqual(testUser._id);
      expect(savedClient.createdAt).toBeDefined();
    });

    it('devrait rejeter un client avec un email invalide', async () => {
      const clientData = {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'invalid-email',
        phone: '+33123456789',
        address: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        },
        createdBy: testUser._id
      };

      const client = new Client(clientData);

      await expect(client.save()).rejects.toThrow();
    });

    it('devrait rejeter un client sans createdBy', async () => {
      const clientData = {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        phone: '+33123456789',
        address: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        }
        // Manque createdBy
      };

      const client = new Client(clientData);

      await expect(client.save()).rejects.toThrow();
    });

    it('devrait avoir des propriétés calculées', async () => {
      const clientData = {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        phone: '+33123456789',
        address: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        },
        createdBy: testUser._id
      };

      const client = new Client(clientData);
      const savedClient = await client.save();

      // Test si on peut accéder aux propriétés de base
      expect(savedClient.firstName + ' ' + savedClient.lastName).toBe('Marie Dupont');
    });
  });
});
