
export interface PlayerData {
  Name: string;
  localID: string;
  money: number;
  coin: number;
  [key: string]: any;
}

export interface SiteUser { 
  email: string; 
  password: string; 
  name: string; 
  isAdmin?: boolean; 
  dateJoined: string; 
}

export interface Product { 
  id: string; 
  name: string; 
  description: string; 
  price: number; 
  category: 'CPM' | 'MARKETING'; 
  image: string; 
  vendorPhone: string;
  accountEmail?: string; 
  accountPassword?: string;
}

export interface GiftCode {
  code: string;
  accountEmail: string;
  accountPassword: string;
  createdAt: string;
}

// Add 'message' to LoginResponse to fix "Object literal may only specify known properties" error in api.ts
export interface LoginResponse {
  ok: boolean;
  auth?: string;
  error?: number;
  message?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: number;
}

export type AppView = 'shop' | 'admin-products' | 'admin-codes';
