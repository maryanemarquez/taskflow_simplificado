import { httpClient } from '../../../core/api/httpClient';
import type { Role } from '../../auth/model/authTypes';

export interface Member {
  id: number;
  nome: string;
  email: string;
  papel: Role;
}

const MEMBERS_ENDPOINT = '/api/membros';

export const membrosApi = {
  async list(): Promise<Member[]> {
    const response = await httpClient.get<Member[]>(MEMBERS_ENDPOINT);
    return response.data;
  },
  async add(email: string): Promise<Member> {
    const response = await httpClient.post<Member>(MEMBERS_ENDPOINT, { email });
    return response.data;
  },
  async remove(id: number): Promise<void> {
    await httpClient.delete(`${MEMBERS_ENDPOINT}/${id}`);
  },
};
