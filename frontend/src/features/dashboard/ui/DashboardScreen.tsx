import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
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
  const { data, isError, refetch } = useDashboard();
  return (
    <View style={styles.page}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>{MESSAGES.dashboard.title}</Text>
        <Text style={styles.subtitle}>{MESSAGES.dashboard.subtitle}</Text>
      </View>
      {isError ? (
        <View style={styles.section}>
          <Text style={styles.message}>{MESSAGES.dashboard.error}</Text>
          <Pressable accessibilityRole="button" onPress={() => refetch()}>
            <Text style={styles.retry}>{MESSAGES.dashboard.retry}</Text>
          </Pressable>
        </View>
      ) : null}
      {!isError && !data ? <Text style={styles.message}>{MESSAGES.common.loading}</Text> : null}
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
  heading: { gap: theme.spacing.xsmall },
  subtitle: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.body },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.pageHeading },
  section: { gap: theme.spacing.large },
  sectionTitle: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.body + 2 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.large },
  message: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular },
  retry: { color: theme.colors.primary, fontFamily: theme.typography.semibold },
});
