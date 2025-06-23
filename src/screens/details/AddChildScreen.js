import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, Snackbar, ToggleButton, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addChild } from '../../store/slices/childrenSlice';
import { selectUser } from '../../store/slices/authSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';

const AddChildScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [toxicEnabled, setToxicEnabled] = useState(true);
  const [groomingEnabled, setGroomingEnabled] = useState(true);
  const [toxicSeverity, setToxicSeverity] = useState('medium');
  const [groomingSeverity, setGroomingSeverity] = useState('low');
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector(selectUser);
  
  // Clear errors when form changes
  React.useEffect(() => {
    setNameError('');
  }, [name]);
  
  React.useEffect(() => {
    setAgeError('');
  }, [age]);
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError(i18n.t('common.requiredField'));
      isValid = false;
    }
    
    if (age) {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
        setAgeError(i18n.t('children.invalidAge'));
        isValid = false;
      }
    }
    
    return isValid;
  };
  
  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const newChild = {
        name: name.trim(),
        age: age ? parseInt(age, 10) : null,
        parentId: user.uid,
        settings: {
          toxicDetection: toxicEnabled,
          groomingDetection: groomingEnabled,
          toxicSeverityThreshold: toxicSeverity,
          groomingSeverityThreshold: groomingSeverity,
        },
        createdAt: new Date().toISOString(),
      };
      
      await dispatch(addChild(newChild)).unwrap();
      
      setSnackbarMessage(i18n.t('children.childAdded'));
      setSnackbarVisible(true);
      
      // Reset form
      setName('');
      setAge('');
      setToxicEnabled(true);
      setGroomingEnabled(true);
      setToxicSeverity('medium');
      setGroomingSeverity('low');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error adding child:', error);
      setSnackbarMessage(i18n.t('common.errorOccurred'));
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Render severity selection buttons
  const renderSeverityButtons = (value, onValueChange, disabled) => {
    return (
      <ToggleButton.Row 
        onValueChange={onValueChange} 
        value={value}
        style={styles.toggleRow}
      >
        <ToggleButton 
          icon={() => <MaterialCommunityIcons name="flag" size={16} color={disabled ? theme.colors.disabled : theme.colors.low} />}
          value="low"
          disabled={disabled}
          style={[
            styles.toggleButton,
            value === 'low' && { backgroundColor: theme.colors.low + '20' }
          ]}
        />
        <ToggleButton 
          icon={() => <MaterialCommunityIcons name="flag" size={16} color={disabled ? theme.colors.disabled : theme.colors.medium} />}
          value="medium"
          disabled={disabled}
          style={[
            styles.toggleButton,
            value === 'medium' && { backgroundColor: theme.colors.medium + '20' }
          ]}
        />
        <ToggleButton 
          icon={() => <MaterialCommunityIcons name="flag" size={16} color={disabled ? theme.colors.disabled : theme.colors.high} />}
          value="high"
          disabled={disabled}
          style={[
            styles.toggleButton,
            value === 'high' && { backgroundColor: theme.colors.high + '20' }
          ]}
        />
      </ToggleButton.Row>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={typography.title}>{i18n.t('children.addChild')}</Text>
        </View>
        
        <Divider />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={typography.heading}>{i18n.t('children.basicInfo')}</Text>
            
            <TextInput
              label={i18n.t('children.name')}
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              error={!!nameError}
              disabled={loading}
              autoCapitalize="words"
              autoFocus
            />
            {!!nameError && (
              <HelperText type="error" visible={!!nameError}>
                {nameError}
              </HelperText>
            )}
            
            <TextInput
              label={i18n.t('children.age')}
              value={age}
              onChangeText={setAge}
              style={styles.input}
              mode="outlined"
              error={!!ageError}
              disabled={loading}
              keyboardType="numeric"
              maxLength={2}
            />
            {!!ageError && (
              <HelperText type="error" visible={!!ageError}>
                {ageError}
              </HelperText>
            )}
            <HelperText type="info">
              {i18n.t('children.ageOptional')}
            </HelperText>
          </View>
          
          <View style={styles.formSection}>
            <Text style={typography.heading}>{i18n.t('children.detectionSettings')}</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color={toxicEnabled ? theme.colors.toxic : theme.colors.disabled}
                  style={styles.settingIcon}
                />
                <View style={styles.settingTexts}>
                  <Text style={styles.settingLabel}>
                    {i18n.t('children.toxicDetection')}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {i18n.t('children.toxicDetectionDesc')}
                  </Text>
                </View>
              </View>
              <ToggleButton
                icon={toxicEnabled ? "check" : "close"}
                value={toxicEnabled}
                onPress={() => setToxicEnabled(!toxicEnabled)}
                style={styles.toggleSwitch}
                color={toxicEnabled ? theme.colors.primary : theme.colors.disabled}
              />
            </View>
            
            <View style={[styles.severityContainer, !toxicEnabled && styles.disabled]}>
              <Text style={styles.severityLabel}>
                {i18n.t('children.minimumSeverity')}:
              </Text>
              {renderSeverityButtons(toxicSeverity, setToxicSeverity, !toxicEnabled)}
              <Text style={styles.severityHint}>
                {toxicSeverity === 'low' 
                  ? i18n.t('children.allAlerts')
                  : toxicSeverity === 'medium'
                    ? i18n.t('children.mediumAndAbove')
                    : i18n.t('children.highOnly')
                }
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name="account-alert"
                  size={24}
                  color={groomingEnabled ? theme.colors.grooming : theme.colors.disabled}
                  style={styles.settingIcon}
                />
                <View style={styles.settingTexts}>
                  <Text style={styles.settingLabel}>
                    {i18n.t('children.groomingDetection')}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {i18n.t('children.groomingDetectionDesc')}
                  </Text>
                </View>
              </View>
              <ToggleButton
                icon={groomingEnabled ? "check" : "close"}
                value={groomingEnabled}
                onPress={() => setGroomingEnabled(!groomingEnabled)}
                style={styles.toggleSwitch}
                color={groomingEnabled ? theme.colors.primary : theme.colors.disabled}
              />
            </View>
            
            <View style={[styles.severityContainer, !groomingEnabled && styles.disabled]}>
              <Text style={styles.severityLabel}>
                {i18n.t('children.minimumSeverity')}:
              </Text>
              {renderSeverityButtons(groomingSeverity, setGroomingSeverity, !groomingEnabled)}
              <Text style={styles.severityHint}>
                {groomingSeverity === 'low' 
                  ? i18n.t('children.allAlerts')
                  : groomingSeverity === 'medium'
                    ? i18n.t('children.mediumAndAbove')
                    : i18n.t('children.highOnly')
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              {i18n.t('common.cancel')}
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {i18n.t('common.save')}
            </Button>
          </View>
        </ScrollView>
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: spacing.m,
  },
  formSection: {
    marginBottom: spacing.l,
  },
  input: {
    marginTop: spacing.s,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.m,
  },
  settingIcon: {
    marginRight: spacing.s,
  },
  settingTexts: {
    flex: 1,
  },
  settingLabel: {
    ...typography.subheading,
  },
  settingDescription: {
    ...typography.caption,
    opacity: 0.7,
  },
  toggleSwitch: {
    borderRadius: 20,
  },
  severityContainer: {
    marginLeft: spacing.xl,
    marginBottom: spacing.m,
  },
  disabled: {
    opacity: 0.5,
  },
  severityLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  toggleRow: {
    marginVertical: spacing.xs,
  },
  toggleButton: {
    borderWidth: 1,
  },
  severityHint: {
    ...typography.caption,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  divider: {
    marginVertical: spacing.m,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default AddChildScreen;
