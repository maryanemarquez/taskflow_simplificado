import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { useViewport } from '../../../core/theme/useViewport';
import { Brand } from '../../../core/ui/Brand';
import { Icon, type IconName } from '../../../core/ui/Icon';

interface TopLink {
  prompt: string;
  label: string;
  route: string;
}

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  icon?: IconName;
  topLink?: TopLink;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, icon, topLink, children }: AuthLayoutProps) {
  const viewport = useViewport();
  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.background}>
      <View style={[styles.header, viewport.isMobile && styles.headerMobile]}>
        <Brand />
        <View style={styles.spacer} />
        {topLink ? (
          <View style={styles.topLink}>
            {!viewport.isMobile ? <Text style={styles.prompt}>{topLink.prompt}</Text> : null}
            <Pressable accessibilityRole="button" onPress={() => router.replace(topLink.route)}>
              <Text style={styles.link}>{topLink.label}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <View style={[styles.content, viewport.isMobile && styles.mobileContent]}>
        {icon ? (
          <View style={styles.icon}>
            <Icon color={theme.colors.primary} name={icon} size={22} />
          </View>
        ) : null}
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: theme.colors.surface, flex: 1 },
  page: { flexGrow: 1, paddingBottom: theme.spacing.hero },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.xlarge,
  },
  headerMobile: { paddingHorizontal: theme.spacing.large },
  spacer: { flexGrow: 1 },
  topLink: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small },
  prompt: { color: theme.colors.textSecondary, fontFamily: theme.typography.regular, fontSize: theme.typography.small },
  link: { color: theme.colors.primary, fontFamily: theme.typography.semibold, fontSize: theme.typography.small },
  content: {
    alignSelf: 'center',
    gap: theme.spacing.xlarge,
    marginVertical: 'auto',
    maxWidth: theme.layout.authContentWidth,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.hero,
    width: '100%',
  },
  mobileContent: { paddingVertical: theme.spacing.section },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.xlarge,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heading: { gap: theme.spacing.small },
  title: { color: theme.colors.text, fontFamily: theme.typography.bold, fontSize: theme.typography.heading },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.body * theme.layout.subtitleLineHeight,
  },
});
