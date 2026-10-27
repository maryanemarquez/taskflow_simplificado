import { QueryClientProvider } from '@tanstack/react-query';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { queryClient } from '../src/core/api/queryClient';
import { RenderError } from '../src/core/ui/RenderError';

/** O Expo Router mostra este componente quando uma tela falha ao ser desenhada. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <RenderError onRetry={retry} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
