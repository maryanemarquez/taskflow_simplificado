import { toErrorCode } from '../src/core/api/apiContract';
import { isStaleDataError } from '../src/core/api/errorPolicy';
import { ApiRequestError, NetworkRequestError, errorMessage, fieldMessages } from '../src/core/api/httpErrors';

const FALLBACK = 'texto padrão';

describe('toErrorCode', () => {
  it('reconhece os códigos do contrato e trata os demais como desconhecidos', () => {
    expect(toErrorCode('SEM_EQUIPE')).toBe('SEM_EQUIPE');
    expect(toErrorCode('CODIGO_NOVO')).toBe('DESCONHECIDO');
    expect(toErrorCode(undefined)).toBe('DESCONHECIDO');
  });
});

describe('ApiRequestError', () => {
  it('guarda código, status e id de correlação', () => {
    const error = new ApiRequestError(
      { codigo: 'TAREFA_NAO_ENCONTRADA', mensagem: 'Tarefa não encontrada.' },
      { status: 404, requestId: 'abc-123' },
    );

    expect(error.codigo).toBe('TAREFA_NAO_ENCONTRADA');
    expect(error.status).toBe(404);
    expect(error.requestId).toBe('abc-123');
    expect(error.message).toBe('Tarefa não encontrada.');
  });

  it('sem mensagem no corpo usa a mensagem padrão', () => {
    const error = new ApiRequestError({ codigo: 'DESCONHECIDO' });

    expect(error.message).toBe('Não foi possível concluir a operação. Tente novamente.');
  });
});

describe('errorMessage', () => {
  it('usa a mensagem da API quando não há erro por campo', () => {
    const error = new ApiRequestError({ codigo: 'SEM_PERMISSAO', mensagem: 'Você não tem permissão para esta ação.' });

    expect(errorMessage(error, FALLBACK)).toBe('Você não tem permissão para esta ação.');
  });

  it('prefere o texto específico da tela para o campo, quando existe', () => {
    const error = new ApiRequestError({
      codigo: 'VALIDACAO',
      mensagem: 'Um ou mais campos são inválidos.',
      erros: [{ campo: 'prazo', codigo: 'INVALIDO', mensagem: 'O valor informado é inválido.' }],
    });

    expect(errorMessage(error, FALLBACK)).toBe('Prazo inválido. Use uma data real no formato DD/MM/AAAA.');
  });

  it('sem texto específico, usa a mensagem do campo enviada pela API', () => {
    const error = new ApiRequestError({
      codigo: 'VALIDACAO',
      mensagem: 'Um ou mais campos são inválidos.',
      erros: [{ campo: 'nome', codigo: 'TAMANHO_EXCEDIDO', mensagem: 'O valor excede o tamanho máximo permitido.' }],
    });

    expect(errorMessage(error, FALLBACK)).toBe('O valor excede o tamanho máximo permitido.');
  });

  it('anexa o código de suporte em falhas do servidor', () => {
    const error = new ApiRequestError(
      { codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro inesperado.' },
      { status: 500, requestId: 'req-9' },
    );

    expect(errorMessage(error, FALLBACK)).toBe('Ocorreu um erro inesperado. (código de suporte: req-9)');
  });

  it('não anexa o código de suporte em erros esperados', () => {
    const error = new ApiRequestError(
      { codigo: 'EMAIL_JA_CADASTRADO', mensagem: 'Já existe uma conta com este e-mail.' },
      { status: 409, requestId: 'req-9' },
    );

    expect(errorMessage(error, FALLBACK)).toBe('Já existe uma conta com este e-mail.');
  });

  it('distingue falta de conexão e tempo esgotado', () => {
    expect(errorMessage(new NetworkRequestError('network'), FALLBACK)).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    );
    expect(errorMessage(new NetworkRequestError('timeout'), FALLBACK)).toBe(
      'O servidor demorou para responder. Tente novamente.',
    );
  });

  it('qualquer outro erro usa o texto padrão informado', () => {
    expect(errorMessage(new Error('x'), FALLBACK)).toBe(FALLBACK);
    expect(errorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});

describe('fieldMessages', () => {
  it('mapeia cada campo para a sua mensagem, mantendo a primeira de cada campo', () => {
    const error = new ApiRequestError({
      codigo: 'VALIDACAO',
      mensagem: 'Um ou mais campos são inválidos.',
      erros: [
        { campo: 'titulo', codigo: 'OBRIGATORIO', mensagem: 'O campo é obrigatório.' },
        { campo: 'titulo', codigo: 'TAMANHO_EXCEDIDO', mensagem: 'O valor excede o tamanho máximo permitido.' },
        { campo: 'senha', codigo: 'SENHA_FORA_DA_POLITICA', mensagem: 'A senha deve ter 8 caracteres.' },
      ],
    });

    expect(fieldMessages(error)).toEqual({
      titulo: 'Informe o título.',
      senha: 'A senha deve ter 8 caracteres.',
    });
  });

  it('devolve vazio quando o erro não aponta campos', () => {
    expect(fieldMessages(new ApiRequestError({ codigo: 'SEM_EQUIPE' }))).toEqual({});
    expect(fieldMessages(new Error('x'))).toEqual({});
  });
});

describe('isStaleDataError', () => {
  it.each(['TAREFA_NAO_ENCONTRADA', 'CONFLITO_CONCORRENCIA', 'TRANSICAO_STATUS_INVALIDA', 'SEM_PERMISSAO'])(
    '%s indica dados desatualizados',
    (codigo) => {
      expect(isStaleDataError(new ApiRequestError({ codigo }))).toBe(true);
    },
  );

  it.each(['VALIDACAO', 'ERRO_INTERNO', 'CREDENCIAIS_INVALIDAS'])('%s não indica dados desatualizados', (codigo) => {
    expect(isStaleDataError(new ApiRequestError({ codigo }))).toBe(false);
  });

  it('erro que não é da API não indica dados desatualizados', () => {
    expect(isStaleDataError(new NetworkRequestError('network'))).toBe(false);
  });
});
