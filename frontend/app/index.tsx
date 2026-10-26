import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useCurrentUser } from '../src/features/auth/model/authQueries';
import { MESSAGES } from '../src/core/messages/messages';
import { useToken } from '../src/core/session/session';

export default function IndexRoute() {
  const token = useToken();
  const { data, isError } = useCurrentUser();
  if (!token || isError) {
    return <Redirect href="/login" />;
  }
  if (!data) {
    return (
      <View style={styles.loading}>
        <Text>{MESSAGES.common.loading}</Text>
      </View>
    );
  }
  return <Redirect href={data.equipe ? '/dashboard' : '/sem-equipe'} />;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
