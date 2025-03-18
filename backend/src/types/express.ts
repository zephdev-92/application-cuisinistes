import { Request } from 'express';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
  file?: Express.Multer.File; 
}
