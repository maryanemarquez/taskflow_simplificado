/** Papel da conta escolhido no cadastro: DONO cria a própria equipe; MEMBRO entra numa equipe de um Dono. */
export type AccountType = 'DONO' | 'MEMBRO';

export interface RegistrationPayload {
  nome: string;
  email: string;
  senha: string;
  tipo: AccountType;
}

/** Formulário de cadastro: o tipo começa vazio e precisa ser escolhido. */
export type RegistrationForm = Omit<RegistrationPayload, 'tipo'> & { tipo: AccountType | null };

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface SessionResponse {
  tipo: string;
  accessToken: string;
  accessTokenExpiraEm: string;
}

export type Role = 'DONO' | 'MEMBRO';

export interface CurrentUser {
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
  equipe: {
    id: number;
    nome: string;
    papel: Role;
  } | null;
}
