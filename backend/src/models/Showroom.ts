// models/Showroom.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IShowroom extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  managers: mongoose.Types.ObjectId[];
  providers: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowroomSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  managers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  providers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Assurez-vous que le modèle est exporté correctement
export default mongoose.model<IShowroom>('Showroom', ShowroomSchema);
