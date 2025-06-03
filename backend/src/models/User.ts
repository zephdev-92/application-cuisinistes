import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  VENDEUR = 'vendeur',
  PRESTATAIRE = 'prestataire',
  ADMIN = 'admin'
}

// Enum pour les sous-métiers des vendeurs
export enum VendeurSpecialty {
  CUISINISTE = 'cuisiniste',
  // Autres métiers à ajouter plus tard
  MOBILIER = 'mobilier',
  ELECTROMENAGER = 'electromenager'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  specialties?: string[];
  vendeurSpecialty?: VendeurSpecialty; // Nouveau champ pour les sous-métiers des vendeurs
  showrooms?: Schema.Types.ObjectId[];
  companyName?: string;
  companyLogo?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  profileCompleted: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir un email valide'
      ]
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PRESTATAIRE
    },
    specialties: {
      type: [String],
      default: []
    },
    vendeurSpecialty: {
      type: String,
      enum: Object.values(VendeurSpecialty),
      required: function(this: IUser) {
        return this.role === UserRole.VENDEUR;
      }
    },
    showrooms: [{
      type: Schema.Types.ObjectId,
      ref: 'Showroom'
    }],
    companyName: {
      type: String,
      trim: true
    },
    companyLogo: {
      type: String, // URL du logo stocké
    },
    description: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: { type: String, default: 'France' }
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Middleware pour hacher le mot de passe avant la sauvegarde
UserSchema.pre('save', async function(next) {
  // Ne hache le mot de passe que s'il a été modifié (ou nouveau)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Générer un sel
    const salt = await bcrypt.genSalt(10);

    // Hacher le mot de passe avec le sel
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('User', UserSchema);

export default User;
