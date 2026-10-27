import { useState } from 'react';
import { Modal as NativeModal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MESSAGES } from '../../../core/messages/messages';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { absoluteFillStyle } from '../../../core/ui/overlayStyles';
import {
  fromIso,
  isPast,
  isSegmentsComplete,
  parseSegments,
  toBr,
  todayYmd,
  toIso,
  type YearMonth,
  type Ymd,
} from '../model/calendar';
import { placePopover, type Anchor } from '../model/popoverLayout';
import { CalendarGrid } from './CalendarGrid';
import { DateSegmentInput, type DateSegments } from './DateSegmentInput';

function segmentsOf(date: Ymd | null): DateSegments {
  if (!date) {
    return { day: '', month: '', year: '' };
  }
  const [day, month, year] = toBr(date).split('/');
  return { day, month, year };
}

interface DatePopoverProps {
  anchor: Anchor | null;
  value: string | null;
  originalValue: string | null;
  onChange: (value: string | null) => void;
  onClose: () => void;
}

export function DatePopover({ anchor, value, originalValue, onChange, onClose }: DatePopoverProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isMobile } = useViewport();
  const today = todayYmd();
  const selected = fromIso(value);
  const [segments, setSegments] = useState<DateSegments>(segmentsOf(selected));
  const [view, setView] = useState<YearMonth>({ year: (selected ?? today).year, month: (selected ?? today).month });
  const [error, setError] = useState<string | null>(null);

  const { left, top, width } = placePopover(anchor, windowWidth, windowHeight);

  const pick = (date: Ymd) => {
    onChange(toIso(date));
    onClose();
  };

  const type = (next: DateSegments) => {
    setSegments(next);
    if (!isSegmentsComplete(next.day, next.month, next.year)) {
      setError(null);
      return;
    }
    const date = parseSegments(next.day, next.month, next.year);
    if (!date) {
      setError(MESSAGES.datePicker.invalid);
    } else if (isPast(date, today) && toIso(date) !== originalValue) {
      setError(MESSAGES.datePicker.past);
    } else {
      setError(null);
      setView({ year: date.year, month: date.month });
      onChange(toIso(date));
    }
  };

  const confirm = () => {
    if (isSegmentsComplete(segments.day, segments.month, segments.year) && !error) {
      onClose();
    }
  };

  return (
    <NativeModal animationType="none" onRequestClose={onClose} transparent visible>
      <View style={styles.layer}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />
        <View accessibilityViewIsModal style={[styles.popover, { left, top, width }]}>
          <DateSegmentInput
            autoFocus={!isMobile}
            invalid={error !== null}
            onChange={type}
            onSubmit={confirm}
            value={segments}
          />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <CalendarGrid
            cellSize={Math.floor((width - theme.spacing.large * 2) / 7)}
            onSelect={pick}
            onViewChange={setView}
            selected={selected}
            today={today}
            view={view}
          />
        </View>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1 },
  backdrop: absoluteFillStyle,
  popover: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xlarge,
    borderWidth: 1,
    boxShadow: theme.shadows.medium,
    gap: theme.spacing.medium,
    padding: theme.spacing.large,
    position: 'absolute',
  },
  error: { color: theme.colors.destructive, fontFamily: theme.typography.regular, fontSize: theme.typography.label, textAlign: 'center' },
});
