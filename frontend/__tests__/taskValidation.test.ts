import { validateTask } from '../src/features/tarefas/model/taskValidation';

describe('validateTask', () => {
  it('aceita título e descrição dentro dos limites', () => {
    expect(validateTask({ titulo: 'a'.repeat(150), descricao: 'b'.repeat(2000) })).toEqual({});
  });

  it('exige título', () => {
    expect(validateTask({ titulo: '   ', descricao: '' }).titulo).toBe('Informe o título.');
  });

  it('recusa título acima de 150 caracteres', () => {
    expect(validateTask({ titulo: 'a'.repeat(151), descricao: '' }).titulo).toBe('O título pode ter no máximo 150 caracteres.');
  });

  it('recusa descrição acima de 2000 caracteres', () => {
    expect(validateTask({ titulo: 'ok', descricao: 'b'.repeat(2001) }).descricao).toBe(
      'A descrição pode ter no máximo 2000 caracteres.',
    );
  });

  it('ignora espaços nas pontas, como o envio faz', () => {
    expect(validateTask({ titulo: ` ${'a'.repeat(150)} `, descricao: '' })).toEqual({});
  });

  it('conta caracteres, não unidades UTF-16 (emoji vale 1)', () => {
    expect(validateTask({ titulo: '😀'.repeat(150), descricao: '' })).toEqual({});
    expect(validateTask({ titulo: '😀'.repeat(151), descricao: '' }).titulo).toBeDefined();
  });
});
