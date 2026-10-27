import axios, { isAxiosError, isCancel, type InternalAxiosRequestConfig } from 'axios';
import { REQUEST_ID_HEADER, UNKNOWN_ERROR_CODE, isApiProblem } from './apiContract';
import { applyErrorPolicy, type RequestInfo } from './errorPolicy';
import { ApiRequestError, NetworkRequestError } from './httpErrors';
import { env } from '../config/env';
import { MESSAGES } from '../messages/messages';
import { session } from '../session/session';

const AUTHORIZATION_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';
export const REQUEST_TIMEOUT_MS = 15_000;
const TIMEOUT_CODES: ReadonlySet<string> = new Set(['ECONNABORTED', 'ETIMEDOUT']);

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/** O backend reaproveita o id enviado; assim ele existe mesmo quando não há resposta (rede, tempo esgotado). */
function newRequestId(): string | undefined {
  return globalThis.crypto?.randomUUID?.();
}

function headerText(headers: unknown, name: string): string | undefined {
  const reader = headers as { get?: (header: string) => unknown } | undefined;
  const value = reader?.get?.(name);
  return typeof value === 'string' && value ? value : undefined;
}

function describeRequest(config: InternalAxiosRequestConfig | undefined): RequestInfo {
  return { method: config?.method?.toUpperCase(), path: config?.url?.split('?')[0] };
}

/** Converte a falha do axios em `ApiRequestError` (houve resposta) ou `NetworkRequestError` (não houve). */
function toRequestError(error: unknown): unknown {
  if (isCancel(error)) {
    return error;
  }
  if (!isAxiosError(error)) {
    return error ?? new Error(MESSAGES.errors.generic);
  }
  const requestId =
    headerText(error.response?.headers, REQUEST_ID_HEADER) ?? headerText(error.config?.headers, REQUEST_ID_HEADER);
  const failure = error.response
    ? new ApiRequestError(isApiProblem(error.response.data) ? error.response.data : { codigo: UNKNOWN_ERROR_CODE }, {
        status: error.response.status,
        requestId,
      })
    : new NetworkRequestError(TIMEOUT_CODES.has(error.code ?? '') ? 'timeout' : 'network', requestId);
  applyErrorPolicy(failure, describeRequest(error.config));
  return failure;
}

httpClient.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) {
    config.headers.set(AUTHORIZATION_HEADER, `${BEARER_PREFIX}${token}`);
  }
  const requestId = newRequestId();
  if (requestId) {
    config.headers.set(REQUEST_ID_HEADER, requestId);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toRequestError(error)),
);
