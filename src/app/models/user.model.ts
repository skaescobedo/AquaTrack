// Interfaces existentes de auth
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

// Nuevas interfaces para gestión de usuarios
export interface UserOut {
  usuario_id: number;
  username: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  email: string;
  is_admin_global: boolean;
  status: string;
}

export interface UserCreate {
  username: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  email: string;
  password: string;
  is_admin_global: boolean;
  granja_id?: number;
  rol_id?: number;
}

export interface UserUpdate {
  nombre?: string;
  apellido1?: string;
  apellido2?: string;
  email?: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

export interface AssignUserToFarm {
  granja_id: number;
  rol_id: number;
  additional_scopes?: string[];
}

export interface UserFarm {
  usuario_granja_id: number;
  granja_id: number;
  granja_nombre: string;
  rol_id: number;
  rol_nombre: string;
  status: string;
  scopes: string[];
  created_at: string;
}