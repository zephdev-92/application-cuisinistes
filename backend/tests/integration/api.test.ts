import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../helpers/testApp';
import User from '../../src/models/User';
import Showroom from '../../src/models/Showroom';
import Client from '../../src/models/Client';
import { auditLogger } from '../../src/utils/auditLogger';

describe('API Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    app = createTestApp();

    // Créer un utilisateur de test et obtenir un token
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'vendeur',
      vendeurSpecialty: 'cuisiniste',
      firstName: 'Test',
      lastName: 'User',
      phone: '+33123456789'
    });

    // Simuler la connexion pour obtenir un token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  // Nettoyer l'AuditLogger après tous les tests pour éviter que Jest reste ouvert
  afterAll(() => {
    auditLogger.shutdown();
  });

  describe('Health Check', () => {
    it('devrait retourner le statut de santé de l\'API', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'API is running'
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('Authentication Routes', () => {
    describe('POST /api/auth/register', () => {
      it('devrait créer un nouvel utilisateur', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'password123',
          role: 'vendeur',
          vendeurSpecialty: 'cuisiniste',
          firstName: 'New',
          lastName: 'User',
          phone: '+33987654321'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.password).toBeUndefined();
        expect(response.body.data.token).toBeDefined();
      });

      it('devrait rejeter un utilisateur avec un email existant', async () => {
        const userData = {
          email: 'test@example.com', // Email déjà utilisé
          password: 'password123',
          role: 'vendeur',
          vendeurSpecialty: 'cuisiniste',
          firstName: 'Duplicate',
          lastName: 'User'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('devrait valider les données d\'entrée', async () => {
        const invalidUserData = {
          email: 'invalid-email',
          password: '123', // Trop court
          role: 'invalid-role'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidUserData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/login', () => {
      it('devrait connecter un utilisateur avec des identifiants valides', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(response.body.data.token).toBeDefined();
      });

      it('devrait rejeter des identifiants invalides', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('User Routes', () => {
    describe('GET /api/users/profile', () => {
      it('devrait retourner le profil de l\'utilisateur authentifié', async () => {
        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('test@example.com');
      });

      it('devrait rejeter les requêtes non authentifiées', async () => {
        const response = await request(app)
          .get('/api/users/profile')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/users/profile', () => {
      it('devrait mettre à jour le profil utilisateur', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+33111222333'
        };

        const response = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.firstName).toBe('Updated');
        expect(response.body.data.lastName).toBe('Name');
      });
    });
  });

  describe('Showroom Routes', () => {
    let testShowroom: any;

    beforeEach(async () => {
      testShowroom = await Showroom.create({
        name: 'Test Showroom',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          zipCode: '12345',
          country: 'France'
        },
        phone: '+33123456789',
        email: 'test@showroom.com',
        isActive: true
      });
    });

    describe('GET /api/showrooms', () => {
      it('devrait retourner la liste des showrooms', async () => {
        const response = await request(app)
          .get('/api/showrooms')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toBe('Test Showroom');
      });
    });

    describe('POST /api/showrooms', () => {
      it('devrait créer un nouveau showroom', async () => {
        const showroomData = {
          name: 'New Showroom',
          address: {
            street: '456 New Street',
            city: 'New City',
            zipCode: '67890',
            country: 'France'
          },
          phone: '+33987654321',
          email: 'new@showroom.com'
        };

        const response = await request(app)
          .post('/api/showrooms')
          .set('Authorization', `Bearer ${authToken}`)
          .send(showroomData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('New Showroom');
      });
    });

    describe('GET /api/showrooms/:id', () => {
      it('devrait retourner un showroom spécifique', async () => {
        const response = await request(app)
          .get(`/api/showrooms/${testShowroom._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Test Showroom');
      });

      it('devrait retourner 404 pour un showroom inexistant', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const response = await request(app)
          .get(`/api/showrooms/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Client Routes', () => {
    let testClient: any;

    beforeEach(async () => {
      testClient = await Client.create({
        firstName: 'Test',
        lastName: 'Client',
        email: 'client@example.com',
        phone: '+33123456789',
        address: {
          street: '789 Client Street',
          city: 'Client City',
          postalCode: '54321',
          country: 'France'
        },
        notes: 'Client de test',
        createdBy: testUser._id
      });
    });

    describe('GET /api/clients', () => {
      it('devrait retourner la liste des clients', async () => {
        const response = await request(app)
          .get('/api/clients')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].firstName).toBe('Test');
      });

      it('devrait supporter la pagination', async () => {
        // Créer plusieurs clients pour tester la pagination
        const clients = [];
        for (let i = 0; i < 5; i++) {
          clients.push({
            firstName: `Client${i}`,
            lastName: 'Test',
            email: `client${i}@example.com`,
            phone: '+33123456789',
            address: {
              street: '123 Test Street',
              city: 'Test City',
              postalCode: '12345',
              country: 'France'
            },
            notes: 'Client de test',
            createdBy: testUser._id
          });
        }
        await Client.insertMany(clients);

        const response = await request(app)
          .get('/api/clients?page=1&limit=3')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(3);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(3);
      });
    });

    describe('POST /api/clients', () => {
      it('devrait créer un nouveau client', async () => {
        const clientData = {
          firstName: 'New',
          lastName: 'Client',
          email: 'newclient@example.com',
          phone: '+33987654321',
          address: {
            street: '456 New Street',
            city: 'New City',
            postalCode: '67890',
            country: 'France'
          },
          notes: 'Nouveau client',
          createdBy: testUser._id
        };

        const response = await request(app)
          .post('/api/clients')
          .set('Authorization', `Bearer ${authToken}`)
          .send(clientData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.firstName).toBe('New');
      });
    });

    describe('PUT /api/clients/:id', () => {
      it('devrait mettre à jour un client', async () => {
        const updateData = {
          notes: 'Client confirmé',
          phone: '+33999888777'
        };

        const response = await request(app)
          .put(`/api/clients/${testClient._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.notes).toBe('Client confirmé');
        expect(response.body.data.phone).toBe('+33999888777');
      });
    });
  });

  describe('Admin Routes', () => {
    describe('GET /api/admin/security-stats', () => {
      it('devrait rejeter les accès non authentifiés', async () => {
        const response = await request(app)
          .get('/api/admin/security-stats')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('devrait rejeter les utilisateurs non-admin', async () => {
        const response = await request(app)
          .get('/api/admin/security-stats')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('devrait retourner 404 pour les routes inexistantes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('devrait gérer les erreurs de validation JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
