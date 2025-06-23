import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../../services/authService';
import i18n from '../../i18n';
import { spacing, typography } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState('');
  
  const theme = useTheme();
  
  // Clear errors when form changes
  useEffect(() => {
    setEmailError('');
    setError('');
  }, [email]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError(i18n.t('common.requiredField'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(i18n.t('auth.invalidEmail'));
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setSnackbarMessage(i18n.t('auth.passwordResetSent'));
      setSnackbarVisible(true);
      // Clear form
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={[typography.title, styles.title]}>
              {i18n.t('auth.resetPassword')}
            </Text>
            
            <Text style={styles.instructions}>
              {i18n.t('auth.resetPasswordInstructions')}
            </Text>
            
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}
            
            <TextInput
              label={i18n.t('auth.email')}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
              disabled={isLoading}
              left={<TextInput.Icon icon="email" />}
            />
            {!!emailError && (
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>
            )}
            
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.resetButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {i18n.t('auth.send')}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
              disabled={isLoading}
            >
              {i18n.t('auth.backToLogin')}
            </Button>
          </View>
        </ScrollView>
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={5000}
          action={{
            label: i18n.t('common.ok'),
            onPress: () => navigation.navigate('Login'),
          }}
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
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: spacing.l,
    flex: 1,
  },
  title: {
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  instructions: {
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.m,
  },
  resetButton: {
    marginVertical: spacing.l,
    padding: spacing.xs,
  },
  backButton: {
    marginBottom: spacing.m,
  },
});

export default ForgotPasswordScreen;
