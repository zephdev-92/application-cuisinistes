import { Request } from 'express';
import { UserRole } from '../models/User';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: Types.ObjectId;
    role: UserRole;
    email?: string;
  };
  file?: Express.Multer.File;
}
