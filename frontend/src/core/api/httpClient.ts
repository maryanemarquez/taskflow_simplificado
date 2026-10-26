import axios, { isAxiosError } from 'axios';
import { ApiRequestError, type ApiProblem } from './httpErrors';
import { session } from '../session/session';
import { MESSAGES } from '../messages/messages';

const AUTHORIZATION_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';
const UNAUTHORIZED = 401;

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) {
    config.headers.set(AUTHORIZATION_HEADER, `${BEARER_PREFIX}${token}`);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError<ApiProblem>(error) && error.response?.data) {
      if (error.response.status === UNAUTHORIZED && session.getToken()) {
        session.clear();
      }
      return Promise.reject(new ApiRequestError(error.response.data));
    }
    return Promise.reject(error ?? new Error(MESSAGES.errors.generic));
  },
);
