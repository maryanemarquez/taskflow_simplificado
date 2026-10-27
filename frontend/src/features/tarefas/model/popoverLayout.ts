export interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const POPOVER_WIDTH = 296;
export const POPOVER_HEIGHT = 372;
const GAP = 6;
const MARGIN = 8;
const FALLBACK_TOP = 48;

export interface PopoverPlacement {
  left: number;
  top: number;
  width: number;
}

/** Posição do calendário: abaixo do campo se couber, senão acima; sempre dentro da janela. Sem âncora, fica perto do topo. */
export function placePopover(anchor: Anchor | null, windowWidth: number, windowHeight: number): PopoverPlacement {
  const width = Math.min(POPOVER_WIDTH, windowWidth - MARGIN * 2);
  const left = Math.max(MARGIN, Math.min(anchor?.x ?? MARGIN, windowWidth - width - MARGIN));
  const below = (anchor?.y ?? 0) + (anchor?.height ?? 0) + GAP;
  const fitsBelow = below + POPOVER_HEIGHT <= windowHeight - MARGIN;
  const top = anchor ? Math.max(MARGIN, fitsBelow ? below : anchor.y - POPOVER_HEIGHT - GAP) : FALLBACK_TOP;
  return { left, top, width };
}
