/** Falha cedo, com mensagem clara, quando uma variável obrigatória não foi definida. */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Variável de ambiente ${name} não definida. Configure-a no arquivo .env (veja .env.example).`);
  }
  return value.trim();
}

export const env = {
  // Acesso literal a `process.env.EXPO_PUBLIC_*`: é assim que o Expo substitui o valor no build.
  apiUrl: requireEnv('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),
};
