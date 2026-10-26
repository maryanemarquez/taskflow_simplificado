import { useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/** Subconjunto do DOM que usamos: no navegador o `View` do React Native Web é um elemento HTML. */
interface DragEventLike {
  preventDefault: () => void;
  dataTransfer: { setData: (type: string, value: string) => void; effectAllowed: string; dropEffect: string } | null;
}
interface DomNode {
  draggable: boolean;
  addEventListener: (type: string, handler: (event: DragEventLike) => void) => void;
  removeEventListener: (type: string, handler: (event: DragEventLike) => void) => void;
}

function asDomNode(node: unknown): DomNode | null {
  return node && typeof (node as DomNode).addEventListener === 'function' ? (node as DomNode) : null;
}

interface DraggableProps {
  enabled: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Torna o conteúdo arrastável no navegador (HTML5 drag and drop); fora dele não faz nada. */
export function Draggable({ enabled, onDragStart, onDragEnd, style, children }: DraggableProps) {
  const ref = useRef<unknown>(null);
  const callbacks = useRef({ onDragStart, onDragEnd });
  useEffect(() => {
    callbacks.current = { onDragStart, onDragEnd };
  });

  useEffect(() => {
    const node = asDomNode(ref.current);
    if (!enabled || !node) {
      return undefined;
    }
    const start = (event: DragEventLike) => {
      if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', 'tarefa');
        event.dataTransfer.effectAllowed = 'move';
      }
      callbacks.current.onDragStart();
    };
    const end = () => callbacks.current.onDragEnd();
    node.draggable = true;
    node.addEventListener('dragstart', start);
    node.addEventListener('dragend', end);
    return () => {
      node.draggable = false;
      node.removeEventListener('dragstart', start);
      node.removeEventListener('dragend', end);
    };
  }, [enabled]);

  return (
    <View ref={ref as never} style={style}>
      {children}
    </View>
  );
}

interface DropZoneProps {
  onEnter: () => void;
  onLeave: () => void;
  onDrop: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Área que aceita cartões soltos nela (navegador). */
export function DropZone({ onEnter, onLeave, onDrop, style, children }: DropZoneProps) {
  const ref = useRef<unknown>(null);
  const callbacks = useRef({ onEnter, onLeave, onDrop });
  useEffect(() => {
    callbacks.current = { onEnter, onLeave, onDrop };
  });

  useEffect(() => {
    const node = asDomNode(ref.current);
    if (!node) {
      return undefined;
    }
    const over = (event: DragEventLike) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      callbacks.current.onEnter();
    };
    const leave = () => callbacks.current.onLeave();
    const drop = (event: DragEventLike) => {
      event.preventDefault();
      callbacks.current.onDrop();
    };
    node.addEventListener('dragover', over);
    node.addEventListener('dragleave', leave);
    node.addEventListener('drop', drop);
    return () => {
      node.removeEventListener('dragover', over);
      node.removeEventListener('dragleave', leave);
      node.removeEventListener('drop', drop);
    };
  }, []);

  return (
    <View ref={ref as never} style={style}>
      {children}
    </View>
  );
}
