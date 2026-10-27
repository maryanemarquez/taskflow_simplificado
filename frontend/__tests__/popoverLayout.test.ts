import { placePopover, POPOVER_HEIGHT, POPOVER_WIDTH } from '../src/features/tarefas/model/popoverLayout';

const anchor = { x: 100, y: 200, width: 300, height: 43 };

describe('placePopover', () => {
  it('abre abaixo do campo quando cabe', () => {
    expect(placePopover(anchor, 1200, 900)).toEqual({ left: 100, top: 249, width: POPOVER_WIDTH });
  });

  it('abre acima do campo quando não cabe abaixo', () => {
    const result = placePopover({ ...anchor, y: 700 }, 1200, 900);
    expect(result.top).toBe(700 - POPOVER_HEIGHT - 6);
  });

  it('não sai pela direita da janela', () => {
    expect(placePopover({ ...anchor, x: 1100 }, 1200, 900).left).toBe(1200 - POPOVER_WIDTH - 8);
  });

  it('encolhe em janelas estreitas', () => {
    expect(placePopover(anchor, 280, 900)).toMatchObject({ left: 8, width: 264 });
  });

  it('sem âncora, fica perto do topo', () => {
    expect(placePopover(null, 1200, 900)).toEqual({ left: 8, top: 48, width: POPOVER_WIDTH });
  });

  it('nunca sobe acima da margem', () => {
    expect(placePopover({ ...anchor, y: 10 }, 1200, 300).top).toBe(8);
  });
});
