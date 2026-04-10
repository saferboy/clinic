// Backend API dan keladigan auth response type lari

export interface BackendLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      full_name: string | null;
      login: string;
      email: string | null;
      phone: string | null;
      role: {
        id: number;
        name: string;
        permissions: Record<string, any>;
      };
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
  };
}

export interface BackendRefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
  };
}

export interface BackendUserResponse {
  success: boolean;
  data: {
    id: number;
    login: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    status: string;
    role_id: number | null;
    role: {
      id: number;
      name: string;
      permissions: Record<string, any>;
    } | null;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  fullName: string | null;
  login: string;
  email: string | null;
  phone: string | null;
  role: {
    id: number;
    name: string;
    permissions: Record<string, any>;
  };
}
