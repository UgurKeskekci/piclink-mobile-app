import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GuestScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Here is the guest screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GuestScreen;
