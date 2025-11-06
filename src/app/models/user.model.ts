export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  is_admin_global: boolean;
  is_active: boolean;
  farms: FarmMembership[];
}

export interface FarmMembership {
  granja_id: number;
  granja_nombre: string;
  rol: 'admin_granja' | 'biologo' | 'operador' | 'consultor';
  scopes: string[];
  is_active: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
}