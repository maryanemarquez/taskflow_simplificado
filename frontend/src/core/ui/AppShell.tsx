import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { CurrentUser } from '../../features/auth/model/authTypes';
import { MESSAGES } from '../messages/messages';
import { theme } from '../theme/theme';
import { useViewport } from '../theme/useViewport';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  user: CurrentUser;
  children: ReactNode;
}

/** Estrutura das telas autenticadas: menu lateral (gaveta no celular), topo e conteúdo. */
export function AppShell({ user, children }: AppShellProps) {
  const { isMobile } = useViewport();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <View style={styles.root}>
      {!isMobile ? <Sidebar user={user} /> : null}
      <View style={styles.main}>
        <Topbar onMenu={() => setDrawerOpen(true)} user={user} />
        <ScrollView contentContainerStyle={[styles.content, isMobile && styles.contentMobile]} style={styles.scroll}>
          {children}
        </ScrollView>
      </View>
      {isMobile && drawerOpen ? (
        <View style={styles.drawer}>
          <Pressable
            accessibilityLabel={MESSAGES.common.close}
            accessibilityRole="button"
            onPress={() => setDrawerOpen(false)}
            style={styles.backdrop}
          />
          <Sidebar onNavigate={() => setDrawerOpen(false)} user={user} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: theme.colors.background, flex: 1, flexDirection: 'row' },
  main: { flex: 1, minWidth: 0 },
  scroll: { flex: 1 },
  content: {
    alignSelf: 'center',
    gap: theme.spacing.xlarge,
    maxWidth: theme.layout.contentMaxWidth,
    padding: theme.spacing.page,
    width: '100%',
  },
  contentMobile: { padding: theme.spacing.large },
  drawer: { ...StyleSheet.absoluteFill as object, flexDirection: 'row', zIndex: 10 },
  backdrop: { ...StyleSheet.absoluteFill as object, backgroundColor: theme.colors.overlay },
});
