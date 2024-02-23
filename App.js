import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Bizim repoyu private yap babacan!</Text>
      <Text>Open up App.js to start working on your!</Text>
      <Text>Deneme'''Test</Text>
      <Text>EGEYİ DENİYORUM</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
