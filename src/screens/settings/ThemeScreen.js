import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, RadioButton, Divider, Button, useTheme, IconButton, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setTheme, selectThemeMode } from '../../store/slices/uiSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';

const ThemeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Get current theme from store
  const currentTheme = useSelector(selectThemeMode);
  
  // Local state for selected theme (to show selection before applying)
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  
  // Apply theme change
  const handleApplyTheme = () => {
    // Only dispatch if theme changed
    if (selectedTheme !== currentTheme) {
      dispatch(setTheme(selectedTheme));
    }
    
    // Navigate back
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.titleContainer}>
            <Text style={typography.title}>{i18n.t('settings.theme')}</Text>
          </View>
        </View>
        
        <Divider />
        
        <View style={styles.content}>
          {/* Theme options */}
          <View style={styles.optionsContainer}>
            <Card 
              style={[
                styles.themeCard, 
                selectedTheme === 'light' && styles.selectedCard
              ]}
              onPress={() => setSelectedTheme('light')}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.themeIconContainer}>
                  <MaterialCommunityIcons
                    name="white-balance-sunny"
                    size={32}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.themeTitle}>
                  {i18n.t('settings.lightTheme')}
                </Text>
                <RadioButton
                  value="light"
                  status={selectedTheme === 'light' ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedTheme('light')}
                  color={theme.colors.primary}
                />
              </Card.Content>
            </Card>
            
            <Card 
              style={[
                styles.themeCard, 
                selectedTheme === 'dark' && styles.selectedCard
              ]}
              onPress={() => setSelectedTheme('dark')}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.themeIconContainer}>
                  <MaterialCommunityIcons
                    name="moon-waning-crescent"
                    size={32}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.themeTitle}>
                  {i18n.t('settings.darkTheme')}
                </Text>
                <RadioButton
                  value="dark"
                  status={selectedTheme === 'dark' ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedTheme('dark')}
                  color={theme.colors.primary}
                />
              </Card.Content>
            </Card>
            
            <Card 
              style={[
                styles.themeCard, 
                selectedTheme === 'system' && styles.selectedCard
              ]}
              onPress={() => setSelectedTheme('system')}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.themeIconContainer}>
                  <MaterialCommunityIcons
                    name="theme-light-dark"
                    size={32}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.themeTitle}>
                  {i18n.t('settings.systemTheme')}
                </Text>
                <Text style={styles.themeDescription}>
                  {i18n.t('settings.systemDefault')}
                </Text>
                <RadioButton
                  value="system"
                  status={selectedTheme === 'system' ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedTheme('system')}
                  color={theme.colors.primary}
                />
              </Card.Content>
            </Card>
          </View>
          
          {/* Preview */}
          <Card style={[styles.previewCard, shadows.medium]}>
            <Card.Content>
              <Text style={typography.subheading}>
                {i18n.t('settings.preview')}
              </Text>
              <Text style={styles.previewDescription}>
                {selectedTheme === 'light' 
                  ? i18n.t('settings.lightThemePreview')
                  : selectedTheme === 'dark'
                    ? i18n.t('settings.darkThemePreview')
                    : i18n.t('settings.systemThemePreview')
                }
              </Text>
            </Card.Content>
          </Card>
          
          {/* Action buttons */}
          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleApplyTheme}
              style={styles.applyButton}
            >
              {i18n.t('common.apply')}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              {i18n.t('common.cancel')}
            </Button>
          </View>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
  },
  titleContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.m,
    justifyContent: 'space-between',
  },
  optionsContainer: {
    marginVertical: spacing.m,
  },
  themeCard: {
    marginBottom: spacing.m,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: 'rgba(98, 0, 238, 0.5)',
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  themeTitle: {
    ...typography.subheading,
    marginBottom: spacing.xs,
  },
  themeDescription: {
    ...typography.caption,
    opacity: 0.7,
    marginBottom: spacing.s,
  },
  previewCard: {
    marginBottom: spacing.l,
  },
  previewDescription: {
    ...typography.body,
    marginTop: spacing.s,
    opacity: 0.7,
  },
  footer: {
    marginTop: 'auto',
  },
  applyButton: {
    marginBottom: spacing.s,
  },
  cancelButton: {
    marginBottom: spacing.m,
  },
});

export default ThemeScreen;
