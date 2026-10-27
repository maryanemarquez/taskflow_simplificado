import { StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { PageHeader } from '../../../core/ui/PageHeader';
import { QueryStatus } from '../../../core/ui/LoadError';
import { STATUS_META } from '../../tarefas/model/statusMeta';
import { STATUS_ORDER } from '../../tarefas/model/taskRules';
import type { StatusCounts } from '../api/dashboardApi';
import { useDashboard } from '../model/useDashboard';
import { StatusCard } from './StatusCard';

function Section({ title, counts }: { title: string; counts: StatusCounts }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cards}>
        {STATUS_ORDER.map((status) => (
          <StatusCard
            key={status}
            color={STATUS_META[status].color}
            count={counts[status]}
            icon={STATUS_META[status].icon}
            label={MESSAGES.tasks.status[status]}
            section={title}
            softColor={STATUS_META[status].soft}
          />
        ))}
      </View>
    </View>
  );
}

export function DashboardScreen() {
  const { data, error, isError, refetch } = useDashboard();
  return (
    <View style={styles.page}>
      <PageHeader subtitle={MESSAGES.dashboard.subtitle} title={MESSAGES.dashboard.title} />
      <QueryStatus
        data={data}
        error={error}
        fallback={MESSAGES.dashboard.error}
        isError={isError}
        onRetry={() => void refetch()}
      />
      {data ? (
        <>
          <Section counts={data.equipe} title={MESSAGES.dashboard.team} />
          <Section counts={data.minhasTarefas} title={MESSAGES.dashboard.mine} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: theme.spacing.xlarge },
  section: { gap: theme.spacing.large },
  sectionTitle: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.sectionTitle },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large },
});
