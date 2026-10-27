import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RenderError } from '../src/core/ui/RenderError';

describe('RenderError', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mostra a falha, registra UI_FALHA_RENDER sem detalhes e permite tentar de novo', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const onRetry = jest.fn();

    render(<RenderError onRetry={onRetry} />);

    expect(screen.getByText('Algo deu errado')).toBeTruthy();
    expect(screen.getByText('Não foi possível exibir esta tela. Tente novamente.')).toBeTruthy();
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith('[taskflow] Falha ao desenhar a tela', { evento: 'UI_FALHA_RENDER' });

    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
