import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ApiRequestError, NetworkRequestError } from '../src/core/api/httpErrors';
import { session } from '../src/core/session/session';
import { authApi } from '../src/features/auth/api/authApi';
import { LoginScreen } from '../src/features/auth/ui/LoginScreen';
import { RegistrationScreen } from '../src/features/auth/ui/RegistrationScreen';
import { renderWithClient } from './testUtils';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../src/features/auth/api/authApi', () => ({
  authApi: { register: jest.fn(), login: jest.fn(), currentUser: jest.fn() },
}));

const SESSION = { tipo: 'Bearer', accessToken: 'token-teste', accessTokenExpiraEm: '2026-10-20T20:15:00Z' };

const fillRegistration = (password: string, type: 'Dono' | 'Membro' | null = 'Dono') => {
  if (type) {
    fireEvent.press(screen.getByRole('button', { name: type }));
  }
  fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'Ana@Taskflow.invalid ');
  fireEvent.changeText(screen.getByLabelText('Senha'), password);
  fireEvent.press(screen.getByRole('button', { name: 'Criar minha conta' }));
};

const fillLogin = () => {
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@taskflow.invalid');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha1234');
  fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
};

beforeEach(() => {
  jest.resetAllMocks();
  session.clear();
});

it('HIST-001-auth/C01 - cadastro envia nome, e-mail normalizado e senha, e inicia a sessão', async () => {
  jest.mocked(authApi.register).mockResolvedValue(SESSION);
  renderWithClient(<RegistrationScreen />);

  fillRegistration('Senha1234');

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  expect(authApi.register).toHaveBeenCalledWith({
    nome: 'Ana',
    email: 'ana@taskflow.invalid',
    senha: 'Senha1234',
    tipo: 'DONO',
  });
  expect(session.getToken()).toBe('token-teste');
});

it('HIST-001-auth/C14 - cadastro como Membro envia o tipo MEMBRO', async () => {
  jest.mocked(authApi.register).mockResolvedValue(SESSION);
  renderWithClient(<RegistrationScreen />);

  fillRegistration('Senha1234', 'Membro');

  await waitFor(() => expect(authApi.register).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'MEMBRO' })));
});

it('HIST-001-auth/C15 - cadastro sem escolher o tipo é bloqueado antes do envio', async () => {
  renderWithClient(<RegistrationScreen />);

  fillRegistration('Senha1234', null);

  expect(await screen.findByText('Escolha o tipo de conta.')).toBeTruthy();
  expect(authApi.register).not.toHaveBeenCalled();
});

it('HIST-001-auth/C03 - senha de 72 bytes é enviada sem truncamento', async () => {
  const password = 'a1' + 'á'.repeat(35);
  expect(new TextEncoder().encode(password)).toHaveLength(72);
  jest.mocked(authApi.register).mockResolvedValue(SESSION);
  renderWithClient(<RegistrationScreen />);

  fillRegistration(password);

  await waitFor(() => expect(authApi.register).toHaveBeenCalledWith(expect.objectContaining({ senha: password })));
});

it('HIST-001-auth/C04 - senha de 73 bytes é rejeitada antes do envio', async () => {
  renderWithClient(<RegistrationScreen />);

  fillRegistration('a1' + 'á'.repeat(35) + 'a');

  expect(await screen.findByText('A senha é muito longa.')).toBeTruthy();
  expect(authApi.register).not.toHaveBeenCalled();
});

it('HIST-001-auth/C05 - senha fora da política é rejeitada antes do envio', async () => {
  renderWithClient(<RegistrationScreen />);

  fillRegistration('somenteletras');

  expect(await screen.findByText('A senha precisa ter ao menos 8 caracteres, com letra e número.')).toBeTruthy();
  expect(authApi.register).not.toHaveBeenCalled();
});

it('HIST-001-auth/C07 - e-mail já cadastrado mostra a mensagem da API', async () => {
  const problem = { codigo: 'EMAIL_JA_CADASTRADO', mensagem: 'Já existe uma conta com este e-mail.' };
  jest.mocked(authApi.register).mockRejectedValue(new ApiRequestError(problem));
  renderWithClient(<RegistrationScreen />);

  fillRegistration('Senha1234');

  expect(await screen.findByText('Já existe uma conta com este e-mail.')).toBeTruthy();
  expect(session.getToken()).toBeNull();
});

it('HIST-001-auth/C09 - login válido guarda o token e abre a página inicial', async () => {
  jest.mocked(authApi.login).mockResolvedValue(SESSION);
  renderWithClient(<LoginScreen />);

  fillLogin();

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  expect(authApi.login).toHaveBeenCalledWith({ email: 'ana@taskflow.invalid', senha: 'Senha1234' });
  expect(session.getToken()).toBe('token-teste');
});

it('HIST-001-auth/C10 - login inválido mostra a mensagem genérica', async () => {
  const problem = { codigo: 'CREDENCIAIS_INVALIDAS', mensagem: 'E-mail ou senha inválidos.' };
  jest.mocked(authApi.login).mockRejectedValue(new ApiRequestError(problem));
  renderWithClient(<LoginScreen />);

  fillLogin();

  expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
  expect(router.replace).not.toHaveBeenCalled();
});

it('HIST-001-auth/C10 - falha de rede não é apresentada como credencial inválida', async () => {
  jest.mocked(authApi.login).mockRejectedValue(new NetworkRequestError('network'));
  renderWithClient(<LoginScreen />);

  fillLogin();

  expect(
    await screen.findByText('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'),
  ).toBeTruthy();
  expect(screen.queryByText('E-mail ou senha inválidos.')).toBeNull();
});

it('HIST-001-auth/C10 - erro inesperado usa a mensagem padrão, não a de credencial', async () => {
  jest.mocked(authApi.login).mockRejectedValue(new Error('falha'));
  renderWithClient(<LoginScreen />);

  fillLogin();

  expect(await screen.findByText('Não foi possível concluir a operação. Tente novamente.')).toBeTruthy();
  expect(screen.queryByText('E-mail ou senha inválidos.')).toBeNull();
});

it('HIST-001-auth/C07 - erro de campo da API aparece no campo, sem banner genérico', async () => {
  const problem = {
    codigo: 'VALIDACAO',
    mensagem: 'Um ou mais campos são inválidos.',
    erros: [
      {
        campo: 'senha',
        codigo: 'SENHA_FORA_DA_POLITICA',
        mensagem: 'A senha deve ter no mínimo 8 caracteres, com ao menos uma letra e um número.',
      },
    ],
  };
  jest.mocked(authApi.register).mockRejectedValue(new ApiRequestError(problem, { status: 400 }));
  renderWithClient(<RegistrationScreen />);

  fillRegistration('Senha1234');

  expect(
    await screen.findByText('A senha deve ter no mínimo 8 caracteres, com ao menos uma letra e um número.'),
  ).toBeTruthy();
  expect(screen.queryByText('Não foi possível concluir o cadastro. Tente novamente.')).toBeNull();
});

it('HIST-001-auth/C07 - e-mail já cadastrado aparece uma única vez, no campo e-mail', async () => {
  const problem = { codigo: 'EMAIL_JA_CADASTRADO', mensagem: 'Já existe uma conta com este e-mail.' };
  jest.mocked(authApi.register).mockRejectedValue(new ApiRequestError(problem, { status: 409 }));
  renderWithClient(<RegistrationScreen />);

  fillRegistration('Senha1234');

  expect(await screen.findAllByText('Já existe uma conta com este e-mail.')).toHaveLength(1);
});
