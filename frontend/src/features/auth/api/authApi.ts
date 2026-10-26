import { httpClient } from '../../../core/api/httpClient';
import type { CurrentUser, LoginPayload, RegistrationPayload, SessionResponse } from '../model/authTypes';

const REGISTRATION_ENDPOINT = '/api/auth/cadastro';
const LOGIN_ENDPOINT = '/api/auth/login';
const CURRENT_USER_ENDPOINT = '/api/me';

export const authApi = {
  async register(payload: RegistrationPayload): Promise<SessionResponse> {
    const response = await httpClient.post<SessionResponse>(REGISTRATION_ENDPOINT, payload);
    return response.data;
  },
  async login(payload: LoginPayload): Promise<SessionResponse> {
    const response = await httpClient.post<SessionResponse>(LOGIN_ENDPOINT, payload);
    return response.data;
  },
  async currentUser(): Promise<CurrentUser> {
    const response = await httpClient.get<CurrentUser>(CURRENT_USER_ENDPOINT);
    return response.data;
  },
};
