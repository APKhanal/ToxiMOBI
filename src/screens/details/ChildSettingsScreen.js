import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../i18n';

const ChildSettingsScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { childId } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('childSettings.title')}</Text>
        <Text style={styles.content}>Child ID: {childId}</Text>
        <Text style={styles.content}>This is a placeholder for the Child Settings Screen.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ChildSettingsScreen;
