import { theme } from '../../../core/theme/theme';
import type { IconName } from '../../../core/ui/Icon';
import type { TaskStatus } from '../api/tarefasApi';

interface StatusMeta {
  icon: IconName;
  color: string;
  soft: string;
}

/** Ícone e cores de cada status, compartilhados por Dashboard, Lista e Kanban. */
export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  PENDENTE: { icon: 'clock', color: theme.colors.status.pending, soft: theme.colors.status.pendingSoft },
  EM_ANDAMENTO: { icon: 'loader', color: theme.colors.status.development, soft: theme.colors.status.developmentSoft },
  CONCLUIDA: { icon: 'check-circle', color: theme.colors.status.done, soft: theme.colors.status.doneSoft },
};
