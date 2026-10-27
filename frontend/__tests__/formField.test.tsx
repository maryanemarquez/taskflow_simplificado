import { render, screen } from '@testing-library/react-native';
import { FormField } from '../src/core/ui/FormField';
import { LoginScreen } from '../src/features/auth/ui/LoginScreen';
import { RegistrationScreen } from '../src/features/auth/ui/RegistrationScreen';
import { renderWithClient } from './testUtils';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

describe('FormField', () => {
  it('repassa limite e dicas de autopreenchimento ao campo', () => {
    render(
      <FormField
        field={{ label: 'E-mail', value: '', onChangeText: jest.fn(), autoComplete: 'email', textContentType: 'emailAddress', maxLength: 150 }}
      />,
    );

    const input = screen.getByLabelText('E-mail');
    expect(input.props.maxLength).toBe(150);
    expect(input.props.autoComplete).toBe('email');
    expect(input.props.textContentType).toBe('emailAddress');
  });

  it('não repete o rótulo como placeholder', () => {
    render(<FormField field={{ label: 'Nome', value: '', onChangeText: jest.fn() }} />);

    expect(screen.getByLabelText('Nome').props.placeholder).toBeUndefined();
  });
});

describe('autopreenchimento das telas de acesso', () => {
  it('login usa e-mail e senha atual', () => {
    renderWithClient(<LoginScreen />);

    expect(screen.getByLabelText('E-mail').props.autoComplete).toBe('email');
    expect(screen.getByLabelText('Senha').props.autoComplete).toBe('current-password');
  });

  it('cadastro usa nome, e-mail e senha nova, com limites', () => {
    renderWithClient(<RegistrationScreen />);

    expect(screen.getByLabelText('Nome').props).toMatchObject({ autoComplete: 'name', maxLength: 100 });
    expect(screen.getByLabelText('E-mail').props).toMatchObject({ autoComplete: 'email', maxLength: 150 });
    expect(screen.getByLabelText('Senha').props.autoComplete).toBe('new-password');
  });
});
