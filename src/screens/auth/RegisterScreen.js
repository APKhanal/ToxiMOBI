import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { selectAuthStatus, selectAuthError } from '../../store/slices/authSlice';
import i18n from '../../i18n';
import { spacing, typography } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const theme = useTheme();
  
  const isLoading = status === 'loading';
  
  // Clear errors when form changes
  useEffect(() => {
    setEmailError('');
  }, [email]);
  
  useEffect(() => {
    setPasswordError('');
  }, [password]);
  
  useEffect(() => {
    setConfirmPasswordError('');
  }, [confirmPassword]);
  
  useEffect(() => {
    setDisplayNameError('');
  }, [displayName]);
  
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
    
    // Name validation
    if (!displayName) {
      setDisplayNameError(i18n.t('common.requiredField'));
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError(i18n.t('common.requiredField'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(i18n.t('auth.passwordTooShort'));
      isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError(i18n.t('common.requiredField'));
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(i18n.t('auth.passwordsDontMatch'));
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleRegister = () => {
    if (validateForm()) {
      dispatch(register({ email, password, displayName }));
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
              {i18n.t('auth.createAccount')}
            </Text>
            
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}
            
            <TextInput
              label={i18n.t('auth.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
              mode="outlined"
              error={!!displayNameError}
              disabled={isLoading}
              left={<TextInput.Icon icon="account" />}
            />
            {!!displayNameError && (
              <HelperText type="error" visible={!!displayNameError}>
                {displayNameError}
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
            
            <TextInput
              label={i18n.t('auth.password')}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!passwordVisible}
              error={!!passwordError}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
            {!!passwordError && (
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>
            )}
            
            <TextInput
              label={i18n.t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!confirmPasswordVisible}
              error={!!confirmPasswordError}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={confirmPasswordVisible ? "eye-off" : "eye"}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                />
              }
            />
            {!!confirmPasswordError && (
              <HelperText type="error" visible={!!confirmPasswordError}>
                {confirmPasswordError}
              </HelperText>
            )}
            
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {i18n.t('auth.register')}
            </Button>
            
            <View style={styles.loginContainer}>
              <Text style={styles.haveAccountText}>
                {i18n.t('auth.alreadyHaveAccount')}
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                {i18n.t('auth.login')}
              </Button>
            </View>
          </View>
        </ScrollView>
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
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.s,
  },
  registerButton: {
    marginVertical: spacing.l,
    padding: spacing.xs,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  haveAccountText: {
    marginRight: spacing.s,
  },
  loginButton: {
    marginLeft: 0,
    paddingLeft: 0,
  },
});

export default RegisterScreen;
