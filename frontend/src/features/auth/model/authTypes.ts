/** Papel da pessoa: DONO cria a própria equipe (e o escolhe no cadastro); MEMBRO entra numa equipe de um Dono. */
export type Role = 'DONO' | 'MEMBRO';

export interface RegistrationPayload {
  nome: string;
  email: string;
  senha: string;
  tipo: Role;
}

/** Formulário de cadastro: o tipo começa vazio e precisa ser escolhido. */
export type RegistrationForm = Omit<RegistrationPayload, 'tipo'> & { tipo: Role | null };

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface SessionResponse {
  tipo: string;
  accessToken: string;
  accessTokenExpiraEm: string;
}

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
