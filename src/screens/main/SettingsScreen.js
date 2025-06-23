import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text, Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setTheme, selectTheme } from '../../store/slices/uiSlice';
import { selectUser, logout } from '../../store/slices/authSlice';
import { selectLanguage } from '../../store/slices/uiSlice';
import { spacing, typography } from '../../theme';
import i18n from '../../i18n';
import { LANGUAGES } from '../../i18n/constants';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const currentTheme = useSelector(selectTheme);
  const currentLanguage = useSelector(selectLanguage);
  const user = useSelector(selectUser);
  
  const isDarkMode = currentTheme === 'dark';
  
  // Toggle dark/light theme
  const toggleTheme = () => {
    dispatch(setTheme(isDarkMode ? 'light' : 'dark'));
  };
  
  // Navigate to profile screen
  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };
  
  // Navigate to language screen
  const handleLanguagePress = () => {
    navigation.navigate('Language');
  };
  
  // Navigate to theme screen
  const handleThemeSettingsPress = () => {
    navigation.navigate('Theme');
  };
  
  // Navigate to notifications screen
  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };
  
  // Navigate to about screen
  const handleAboutPress = () => {
    navigation.navigate('About');
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };
  
  // Get language display name
  const getLanguageDisplayName = (code) => {
    const language = LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code;
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.title}>{i18n.t('settings.title')}</Text>
        </View>
        
        <Divider />
        
        <ScrollView style={styles.scrollView}>
          {/* Account settings */}
          <List.Section>
            <List.Subheader>{i18n.t('settings.account')}</List.Subheader>
            
            <List.Item
              title={i18n.t('settings.profile')}
              description={user?.email}
              left={props => <List.Icon {...props} icon="account" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleProfilePress}
            />
          </List.Section>
          
          <Divider />
          
          {/* Appearance settings */}
          <List.Section>
            <List.Subheader>{i18n.t('settings.appearance')}</List.Subheader>
            
            <List.Item
              title={i18n.t('settings.darkMode')}
              description={i18n.t(isDarkMode ? 'settings.darkModeOn' : 'settings.darkModeOff')}
              left={props => (
                <List.Icon 
                  {...props} 
                  icon={isDarkMode ? "weather-night" : "weather-sunny"} 
                  color={isDarkMode ? theme.colors.accent : theme.colors.primary} 
                />
              )}
              right={props => (
                <Switch 
                  value={isDarkMode} 
                  onValueChange={toggleTheme} 
                  color={theme.colors.primary}
                />
              )}
            />
            
            <List.Item
              title={i18n.t('settings.theme')}
              description={i18n.t('settings.themeDescription')}
              left={props => <List.Icon {...props} icon="palette" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleThemeSettingsPress}
            />
            
            <List.Item
              title={i18n.t('settings.language')}
              description={getLanguageDisplayName(currentLanguage)}
              left={props => <List.Icon {...props} icon="translate" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleLanguagePress}
            />
          </List.Section>
          
          <Divider />
          
          {/* Notification settings */}
          <List.Section>
            <List.Subheader>{i18n.t('settings.notifications')}</List.Subheader>
            
            <List.Item
              title={i18n.t('settings.notificationSettings')}
              description={i18n.t('settings.notificationDescription')}
              left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleNotificationsPress}
            />
          </List.Section>
          
          <Divider />
          
          {/* About and support */}
          <List.Section>
            <List.Subheader>{i18n.t('settings.aboutAndSupport')}</List.Subheader>
            
            <List.Item
              title={i18n.t('settings.about')}
              description={i18n.t('settings.aboutDescription')}
              left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleAboutPress}
            />
            
            <List.Item
              title={i18n.t('settings.privacyPolicy')}
              left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="open-in-new" />}
              onPress={() => {/* Open privacy policy */}}
            />
            
            <List.Item
              title={i18n.t('settings.termsOfService')}
              left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
              right={props => <List.Icon {...props} icon="open-in-new" />}
              onPress={() => {/* Open terms of service */}}
            />
          </List.Section>
          
          {/* Logout button */}
          <View style={styles.logoutContainer}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              style={styles.logoutButton}
              color={theme.colors.error}
            >
              {i18n.t('auth.logout')}
            </Button>
          </View>
          
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              {i18n.t('settings.version', { version: '1.0.0' })}
            </Text>
          </View>
        </ScrollView>
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
    padding: spacing.m,
  },
  scrollView: {
    flex: 1,
  },
  logoutContainer: {
    padding: spacing.l,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    borderColor: 'red',
  },
  versionContainer: {
    padding: spacing.m,
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  versionText: {
    ...typography.caption,
    opacity: 0.7,
  },
});

export default SettingsScreen;
