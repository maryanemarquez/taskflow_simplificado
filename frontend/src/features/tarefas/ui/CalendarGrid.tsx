import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { Icon } from '../../../core/ui/Icon';
import {
  addMonths,
  compareYearMonth,
  compareYmd,
  isPast,
  monthMatrix,
  type YearMonth,
  type Ymd,
} from '../model/calendar';

interface CalendarGridProps {
  view: YearMonth;
  selected: Ymd | null;
  today: Ymd;
  cellSize: number;
  onViewChange: (next: YearMonth) => void;
  onSelect: (date: Ymd) => void;
}

/** Mês com semanas de domingo a sábado; dias anteriores a hoje ficam desabilitados. */
export function CalendarGrid({ view, selected, today, cellSize, onViewChange, onSelect }: CalendarGridProps) {
  const monthName = MESSAGES.datePicker.months[view.month - 1];
  const canGoBack = compareYearMonth(view, today) > 0;
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>{`${monthName} ${view.year}`}</Text>
        <View style={styles.arrows}>
          <Pressable
            accessibilityLabel={MESSAGES.datePicker.previousMonth}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canGoBack }}
            disabled={!canGoBack}
            onPress={() => onViewChange(addMonths(view, -1))}
            style={[styles.arrow, !canGoBack && styles.arrowDisabled]}
          >
            <Icon color={theme.colors.textSecondary} name="chevron-up" size={18} />
          </Pressable>
          <Pressable
            accessibilityLabel={MESSAGES.datePicker.nextMonth}
            accessibilityRole="button"
            onPress={() => onViewChange(addMonths(view, 1))}
            style={styles.arrow}
          >
            <Icon color={theme.colors.textSecondary} name="chevron-down" size={18} />
          </Pressable>
        </View>
      </View>
      <View style={styles.week}>
        {MESSAGES.datePicker.weekdays.map((weekday) => (
          <Text key={weekday} style={[styles.weekday, { width: cellSize }]}>{weekday}</Text>
        ))}
      </View>
      {monthMatrix(view).map((week) => (
        <View key={`${week[0].date.month}-${week[0].date.day}`} style={styles.week}>
          {week.map(({ date, inMonth }) => {
            const past = isPast(date, today);
            const isSelected = selected !== null && compareYmd(date, selected) === 0;
            const isToday = compareYmd(date, today) === 0;
            return (
              <Pressable
                accessibilityLabel={MESSAGES.datePicker.fullDate(date.day, MESSAGES.datePicker.months[date.month - 1].toLowerCase(), date.year)}
                accessibilityRole="button"
                accessibilityState={{ disabled: past, selected: isSelected }}
                disabled={past}
                key={`${date.month}-${date.day}`}
                onPress={() => onSelect(date)}
                style={[styles.cell, { height: cellSize, width: cellSize }]}
              >
                <View style={[styles.day, isToday && !isSelected && styles.today, isSelected && styles.selected]}>
                  <Text
                    style={[
                      styles.dayText,
                      !inMonth && styles.outside,
                      past && styles.past,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {date.day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 2 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: theme.spacing.small, paddingHorizontal: theme.spacing.xsmall },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.body },
  arrows: { flexDirection: 'row', gap: theme.spacing.xsmall },
  arrow: { alignItems: 'center', borderRadius: theme.radii.medium, height: 28, justifyContent: 'center', width: 28 },
  arrowDisabled: { opacity: theme.states.unavailableOpacity },
  week: { flexDirection: 'row' },
  weekday: { color: theme.colors.textSecondary, fontFamily: theme.typography.semibold, fontSize: theme.typography.caption, paddingVertical: theme.spacing.xsmall, textAlign: 'center' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  day: { alignItems: 'center', borderRadius: theme.radii.pill, height: '88%', justifyContent: 'center', width: '88%' },
  today: { borderColor: theme.colors.primary, borderWidth: 1 },
  selected: { backgroundColor: theme.colors.primary },
  dayText: { color: theme.colors.text, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  outside: { color: theme.colors.textSecondary },
  past: { color: theme.colors.border, textDecorationLine: 'none' },
  selectedText: { color: theme.colors.surface, fontFamily: theme.typography.bold },
});
