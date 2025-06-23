import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Card, 
  Chip, 
  Avatar, 
  IconButton, 
  useTheme, 
  Divider, 
  Dialog, 
  Portal, 
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  fetchCoParents, 
  inviteCoParent, 
  removeCoParent, 
  selectCoParentsByChildId, 
  selectCoParentStatus, 
  selectCoParentError 
} from '../../store/slices/childrenSlice';
import { selectChildById } from '../../store/slices/childrenSlice';
import { selectUser } from '../../store/slices/authSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';

const CoParentingScreen = ({ route, navigation }) => {
  const { childId } = route.params;
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [selectedCoParentId, setSelectedCoParentId] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const child = useSelector(state => selectChildById(state, childId));
  const coParents = useSelector(state => selectCoParentsByChildId(state, childId));
  const coParentStatus = useSelector(selectCoParentStatus);
  const coParentError = useSelector(selectCoParentError);
  const currentUser = useSelector(selectUser);
  
  const isLoading = coParentStatus === 'loading';
  
  // Load co-parents
  useEffect(() => {
    if (childId) {
      dispatch(fetchCoParents(childId));
    }
  }, [dispatch, childId]);
  
  // Clear email error when email changes
  useEffect(() => {
    setEmailError('');
  }, [email]);
  
  // Validate email
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  // Handle invite co-parent
  const handleInvite = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError(i18n.t('coParenting.enterEmail'));
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError(i18n.t('auth.invalidEmail'));
      return;
    }
    
    // Check if email is current user's email
    if (email.trim().toLowerCase() === currentUser.email.toLowerCase()) {
      setEmailError(i18n.t('coParenting.cannotInviteSelf'));
      return;
    }
    
    // Check if email already exists in co-parents
    const emailExists = coParents.some(
      parent => parent.email.toLowerCase() === email.trim().toLowerCase()
    );
    
    if (emailExists) {
      setEmailError(i18n.t('coParenting.alreadyInvited'));
      return;
    }
    
    setInviteLoading(true);
    
    try {
      await dispatch(inviteCoParent({ 
        childId, 
        email: email.trim(),
        parentName: currentUser.displayName,
        childName: child.name
      })).unwrap();
      
      // Clear form and show success message
      setEmail('');
      setSnackbarMessage(i18n.t('coParenting.inviteSent'));
      setSnackbarVisible(true);
    } catch (error) {
      setEmailError(error.message || i18n.t('common.errorOccurred'));
    } finally {
      setInviteLoading(false);
    }
  };
  
  // Open confirm dialog for removing a co-parent
  const confirmRemoveCoParent = (coParentId) => {
    setSelectedCoParentId(coParentId);
    setConfirmDialogVisible(true);
  };
  
  // Handle remove co-parent
  const handleRemoveCoParent = async () => {
    setConfirmDialogVisible(false);
    
    if (!selectedCoParentId) return;
    
    try {
      await dispatch(removeCoParent({ 
        childId, 
        coParentId: selectedCoParentId 
      })).unwrap();
      
      setSnackbarMessage(i18n.t('coParenting.coParentRemoved'));
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage(error.message || i18n.t('common.errorOccurred'));
      setSnackbarVisible(true);
    }
  };
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Render co-parent item
  const renderCoParentItem = ({ item }) => {
    const isPending = item.status === 'pending';
    const isCurrentUser = item.email.toLowerCase() === currentUser.email.toLowerCase();
    
    return (
      <Card style={styles.coParentCard}>
        <Card.Content style={styles.coParentContent}>
          <View style={styles.coParentInfo}>
            <Avatar.Text
              size={40}
              label={getInitials(item.name)}
              style={[
                styles.avatar,
                { backgroundColor: isPending ? theme.colors.disabled : theme.colors.primary }
              ]}
            />
            <View style={styles.textContainer}>
              <Text style={styles.coParentName}>
                {item.name || item.email}
                {isCurrentUser && ` (${i18n.t('coParenting.you')})`}
              </Text>
              <Text style={styles.coParentEmail}>{item.email}</Text>
              {isPending && (
                <Chip 
                  style={styles.pendingChip} 
                  textStyle={styles.pendingChipText}
                  icon="clock-outline"
                >
                  {i18n.t('coParenting.pending')}
                </Chip>
              )}
            </View>
          </View>
          
          {!isCurrentUser && (
            <IconButton
              icon="delete"
              size={20}
              onPress={() => confirmRemoveCoParent(item.id)}
              color={theme.colors.error}
              style={styles.removeButton}
            />
          )}
        </Card.Content>
      </Card>
    );
  };
  
  // Render empty state
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="account-group-outline" 
          size={64} 
          color={theme.colors.disabled} 
        />
        <Text style={styles.emptyText}>{i18n.t('coParenting.noCoParents')}</Text>
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
            <Text style={typography.title}>{i18n.t('coParenting.title')}</Text>
            {child && (
              <Text style={typography.subtitle}>{child.name}</Text>
            )}
          </View>
        </View>
        
        <Divider />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Invite form */}
          <Card style={[styles.formCard, shadows.medium]}>
            <Card.Content>
              <Text style={typography.heading}>{i18n.t('coParenting.inviteParent')}</Text>
              <Text style={styles.description}>
                {i18n.t('coParenting.inviteDescription')}
              </Text>
              
              <TextInput
                label={i18n.t('coParenting.emailAddress')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
                error={!!emailError}
                disabled={inviteLoading}
              />
              
              {!!emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
              
              <Button
                mode="contained"
                onPress={handleInvite}
                style={styles.inviteButton}
                loading={inviteLoading}
                disabled={inviteLoading || !email.trim()}
              >
                {i18n.t('coParenting.sendInvite')}
              </Button>
            </Card.Content>
          </Card>
          
          {/* Co-parents list */}
          <View style={styles.listContainer}>
            <Text style={typography.heading}>{i18n.t('coParenting.currentCoParents')}</Text>
            
            <FlatList
              data={coParents}
              renderItem={renderCoParentItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmptyList}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
          
          {/* Instructions */}
          <Card style={[styles.infoCard, shadows.small]}>
            <Card.Content>
              <View style={styles.infoHeaderRow}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.infoTitle}>{i18n.t('coParenting.howItWorks')}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoNumber}>1</Text>
                <Text style={styles.infoText}>{i18n.t('coParenting.step1')}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoNumber}>2</Text>
                <Text style={styles.infoText}>{i18n.t('coParenting.step2')}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoNumber}>3</Text>
                <Text style={styles.infoText}>{i18n.t('coParenting.step3')}</Text>
              </View>
            </Card.Content>
          </Card>
          
          {/* Back button */}
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            {i18n.t('common.back')}
          </Button>
        </ScrollView>
        
        {/* Confirmation dialog */}
        <Portal>
          <Dialog
            visible={confirmDialogVisible}
            onDismiss={() => setConfirmDialogVisible(false)}
          >
            <Dialog.Title>{i18n.t('coParenting.confirmRemove')}</Dialog.Title>
            <Dialog.Content>
              <Text>{i18n.t('coParenting.removeWarning')}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmDialogVisible(false)}>
                {i18n.t('common.cancel')}
              </Button>
              <Button onPress={handleRemoveCoParent} color={theme.colors.error}>
                {i18n.t('common.remove')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl,
  },
  formCard: {
    marginBottom: spacing.l,
  },
  description: {
    ...typography.body,
    marginVertical: spacing.m,
  },
  input: {
    marginBottom: spacing.s,
  },
  errorText: {
    color: 'red',
    marginBottom: spacing.s,
  },
  inviteButton: {
    marginTop: spacing.m,
  },
  listContainer: {
    marginBottom: spacing.l,
  },
  listContent: {
    marginTop: spacing.s,
  },
  coParentCard: {
    marginBottom: spacing.s,
  },
  coParentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coParentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  coParentName: {
    ...typography.subheading,
  },
  coParentEmail: {
    ...typography.caption,
    opacity: 0.7,
  },
  pendingChip: {
    marginTop: spacing.xs,
    height: 24,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9C4',
  },
  pendingChipText: {
    fontSize: 10,
  },
  removeButton: {
    margin: 0,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    opacity: 0.7,
    marginTop: spacing.m,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: spacing.l,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  infoTitle: {
    ...typography.subheading,
    marginLeft: spacing.s,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  infoNumber: {
    ...typography.body,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'center',
    marginRight: spacing.s,
  },
  infoText: {
    ...typography.body,
    flex: 1,
  },
  backButton: {
    marginTop: spacing.l,
  },
});

export default CoParentingScreen;
