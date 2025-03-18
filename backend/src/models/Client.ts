import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
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
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      index: true
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: { type: String, default: 'France' }
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Création d'index pour la recherche
ClientSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export default mongoose.model<IClient>('Client', ClientSchema);
