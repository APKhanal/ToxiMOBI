import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, RadioButton, Divider, Button, useTheme, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setLanguage, selectLanguage } from '../../store/slices/uiSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';
import { LANGUAGES } from '../../i18n/constants';

const LanguageScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Get current language from store
  const currentLanguage = useSelector(selectLanguage);
  
  // Local state for selected language (to show selection before applying)
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  
  // Apply language change
  const handleApplyLanguage = () => {
    // Only dispatch if language changed
    if (selectedLanguage !== currentLanguage) {
      dispatch(setLanguage(selectedLanguage));
      
      // Change i18n language immediately
      i18n.changeLanguage(selectedLanguage);
    }
    
    // Navigate back
    navigation.goBack();
  };
  
  // Render each language option
  const renderLanguageItem = ({ item }) => {
    const isSelected = selectedLanguage === item.code;
    
    return (
      <View>
        <View style={styles.languageItem}>
          <View style={styles.languageInfo}>
            <Text style={styles.languageName}>{item.name}</Text>
            <Text style={styles.languageNative}>{item.nativeName}</Text>
          </View>
          
          <RadioButton
            value={item.code}
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={() => setSelectedLanguage(item.code)}
            color={theme.colors.primary}
          />
        </View>
        <Divider />
      </View>
    );
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
            <Text style={typography.title}>{i18n.t('settings.language')}</Text>
          </View>
        </View>
        
        <Divider />
        
        <View style={styles.content}>
          <FlatList
            data={LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            style={styles.list}
          />
          
          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleApplyLanguage}
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
    justifyContent: 'space-between',
  },
  list: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    ...typography.subheading,
  },
  languageNative: {
    ...typography.caption,
    opacity: 0.7,
  },
  footer: {
    padding: spacing.m,
  },
  applyButton: {
    marginBottom: spacing.s,
  },
  cancelButton: {
    marginBottom: spacing.m,
  },
});

export default LanguageScreen;
