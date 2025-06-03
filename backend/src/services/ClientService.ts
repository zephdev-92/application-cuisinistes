import Client, { IClient } from '../models/Client';
import { AppError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

export interface CreateClientDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
  createdBy: string;
}

export interface UpdateClientDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
}

export interface ClientFilters {
  search?: string;
  createdBy?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  clients: IClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ClientService {
  /**
   * Créer un nouveau client
   */
  static async createClient(clientData: CreateClientDTO): Promise<IClient> {
    // Vérifier si l'utilisateur créateur existe
    if (!Types.ObjectId.isValid(clientData.createdBy)) {
      throw new AppError('ID utilisateur invalide', 400);
    }

    // Vérifier si un client avec le même email existe déjà pour ce vendeur
    const existingClient = await Client.findOne({
      email: clientData.email,
      createdBy: clientData.createdBy
    });

    if (existingClient) {
      throw new AppError('Un client avec cet email existe déjà dans votre liste', 400);
    }

    try {
      const client = await Client.create(clientData);
      return client;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Un client avec cet email existe déjà', 400);
      }
      throw new AppError('Erreur lors de la création du client', 500);
    }
  }

  /**
   * Obtenir un client par son ID
   */
  static async getClientById(clientId: string, userId?: string): Promise<IClient> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('ID client invalide', 400);
    }

    const query: any = { _id: clientId };

    // Si un userId est fourni, vérifier que le client appartient à cet utilisateur
    if (userId) {
      query.createdBy = userId;
    }

    const client = await Client.findOne(query).populate('createdBy', 'firstName lastName email');

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }

    return client;
  }

  /**
   * Obtenir tous les clients avec pagination et filtres
   */
  static async getClients(filters: ClientFilters = {}): Promise<PaginatedClients> {
    const {
      search,
      createdBy,
      city,
      page = 1,
      limit = 10
    } = filters;

    // Construction de la requête
    const query: any = {};

    if (createdBy) {
      if (!Types.ObjectId.isValid(createdBy)) {
        throw new AppError('ID utilisateur invalide', 400);
      }
      query.createdBy = createdBy;
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculs de pagination
    const skip = (page - 1) * limit;
    const total = await Client.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Récupération des clients
    const clients = await Client.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };
  }

  /**
   * Mettre à jour un client
   */
  static async updateClient(
    clientId: string,
    updateData: UpdateClientDTO,
    userId?: string
  ): Promise<IClient> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('ID client invalide', 400);
    }

    const query: any = { _id: clientId };

    // Si un userId est fourni, vérifier que le client appartient à cet utilisateur
    if (userId) {
      query.createdBy = userId;
    }

    // Vérifier si le client existe
    const existingClient = await Client.findOne(query);
    if (!existingClient) {
      throw new AppError('Client non trouvé', 404);
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.email && updateData.email !== existingClient.email) {
      const emailExists = await Client.findOne({
        email: updateData.email,
        createdBy: existingClient.createdBy,
        _id: { $ne: clientId }
      });

      if (emailExists) {
        throw new AppError('Un client avec cet email existe déjà dans votre liste', 400);
      }
    }

    try {
      const client = await Client.findByIdAndUpdate(
        clientId,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName email');

      return client!;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Un client avec cet email existe déjà', 400);
      }
      throw new AppError('Erreur lors de la mise à jour du client', 500);
    }
  }

  /**
   * Supprimer un client
   */
  static async deleteClient(clientId: string, userId?: string): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('ID client invalide', 400);
    }

    const query: any = { _id: clientId };

    // Si un userId est fourni, vérifier que le client appartient à cet utilisateur
    if (userId) {
      query.createdBy = userId;
    }

    const client = await Client.findOneAndDelete(query);

    if (!client) {
      throw new AppError('Client non trouvé', 404);
    }
  }

  /**
   * Rechercher des clients
   */
  static async searchClients(searchTerm: string, userId?: string, limit = 10): Promise<IClient[]> {
    const query: any = {
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError('ID utilisateur invalide', 400);
      }
      query.createdBy = userId;
    }

    return Client.find(query)
      .populate('createdBy', 'firstName lastName email')
      .limit(limit)
      .sort({ firstName: 1, lastName: 1 });
  }

  /**
   * Obtenir les statistiques des clients pour un vendeur
   */
  static async getClientStats(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('ID utilisateur invalide', 400);
    }

    const stats = await Client.aggregate([
      { $match: { createdBy: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          clientsWithPhone: {
            $sum: {
              $cond: [{ $ne: ['$phone', null] }, 1, 0]
            }
          },
          clientsWithAddress: {
            $sum: {
              $cond: [{ $ne: ['$address', null] }, 1, 0]
            }
          },
          citiesCount: {
            $addToSet: '$address.city'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalClients: 1,
          clientsWithPhone: 1,
          clientsWithAddress: 1,
          uniqueCities: { $size: { $filter: { input: '$citiesCount', cond: { $ne: ['$$this', null] } } } }
        }
      }
    ]);

    return stats[0] || {
      totalClients: 0,
      clientsWithPhone: 0,
      clientsWithAddress: 0,
      uniqueCities: 0
    };
  }

  /**
   * Obtenir les clients récents pour un vendeur
   */
  static async getRecentClients(userId: string, limit = 5): Promise<IClient[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('ID utilisateur invalide', 400);
    }

    return Client.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('firstName lastName email phone createdAt');
  }

  /**
   * Exporter les clients en CSV (structure de base)
   */
  static async exportClients(userId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('ID utilisateur invalide', 400);
    }

    const clients = await Client.find({ createdBy: userId })
      .sort({ firstName: 1, lastName: 1 });

    return clients.map(client => ({
      'Prénom': client.firstName,
      'Nom': client.lastName,
      'Email': client.email,
      'Téléphone': client.phone || '',
      'Rue': client.address?.street || '',
      'Ville': client.address?.city || '',
      'Code postal': client.address?.postalCode || '',
      'Pays': client.address?.country || '',
      'Notes': client.notes || '',
      'Date de création': client.createdAt.toLocaleDateString('fr-FR')
    }));
  }
}
