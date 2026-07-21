export interface User {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  avatar: string | null;
  currency: string;
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  type: 'income' | 'expense';
  user_id: number;
  created_at: Date;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number | string;
  description: string | null;
  transaction_date: string;
  type: 'income' | 'expense';
  category_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Budget {
  id: number;
  month: number;
  year: number;
  amount: number | string;
  user_id: number;
  created_at: Date;
}

export interface RefreshToken {
  id: number;
  token: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
