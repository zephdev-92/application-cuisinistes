// Interface représentant un showroom
export interface Showroom {
    _id: string;
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
    managers: string[]; // IDs des cuisinistes
    providers: string[]; // IDs des prestataires
    createdAt: string;
    updatedAt: string;
  }
