import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Card, Button, Avatar, FAB, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchChildren, selectChild, selectAllChildren, selectSelectedChild, selectChildrenStatus } from '../../store/slices/childrenSlice';
import { fetchLatestAlert, selectAlertsByChildId, selectAlertsStatus } from '../../store/slices/alertsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { setChildMenuVisible, toggleChildMenu, selectChildMenuVisible } from '../../store/slices/uiSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';
import { formatDistanceToNow } from 'date-fns';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const user = useSelector(selectUser);
  const children = useSelector(selectAllChildren);
  const selectedChild = useSelector(selectSelectedChild);
  const childrenStatus = useSelector(selectChildrenStatus);
  const alertsStatus = useSelector(selectAlertsStatus);
  const childMenuVisible = useSelector(selectChildMenuVisible);
  
  const isLoading = childrenStatus === 'loading' || alertsStatus === 'loading';
  
  // Get alerts for the selected child
  const childAlerts = useSelector(state => 
    selectedChild ? selectAlertsByChildId(state, selectedChild.id) : []
  );
  
  // Latest alert is the first one in the array (sorted by timestamp desc)
  const latestAlert = childAlerts && childAlerts.length > 0 ? childAlerts[0] : null;
  
  // Load initial data
  useEffect(() => {
    if (user) {
      dispatch(fetchChildren(user.uid));
    }
  }, [dispatch, user]);
  
  // Fetch latest alert when selected child changes
  useEffect(() => {
    if (selectedChild) {
      dispatch(fetchLatestAlert(selectedChild.id));
    }
  }, [dispatch, selectedChild]);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user) {
        await dispatch(fetchChildren(user.uid)).unwrap();
        if (selectedChild) {
          await dispatch(fetchLatestAlert(selectedChild.id)).unwrap();
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Navigate to child profile
  const handleChildPress = (child) => {
    dispatch(selectChild(child.id));
    navigation.navigate('ChildProfile', { childId: child.id });
  };
  
  // Navigate to alert detail
  const handleAlertPress = (alert) => {
    navigation.navigate('AlertDetail', { alertId: alert.id });
  };
  
  // Navigate to add child screen
  const handleAddChild = () => {
    navigation.navigate('Children', { screen: 'AddChild' });
  };
  
  // Navigate to analytics
  const handleViewAnalytics = () => {
    navigation.navigate('Analytics', { childId: selectedChild?.id });
  };
  
  // Navigate to all alerts
  const handleViewAllAlerts = () => {
    navigation.navigate('Alerts');
  };
  
  // Select a child from the dropdown
  const handleSelectChild = (childId) => {
    dispatch(selectChild(childId));
    dispatch(setChildMenuVisible(false));
  };
  
  // Render child selection menu
  const renderChildMenu = () => {
    if (!childMenuVisible) return null;
    
    return (
      <Card style={[styles.childMenu, shadows.medium]}>
        <Card.Content>
          <FlatList
            data={children}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Button
                mode={selectedChild?.id === item.id ? 'contained' : 'text'}
                onPress={() => handleSelectChild(item.id)}
                style={styles.childMenuItem}
              >
                {item.name}
              </Button>
            )}
            ListFooterComponent={
              <Button
                mode="outlined"
                onPress={handleAddChild}
                icon="plus"
                style={styles.addChildButton}
              >
                {i18n.t('home.addChild')}
              </Button>
            }
          />
        </Card.Content>
      </Card>
    );
  };
  
  // Render statistics cards
  const renderStatCards = () => {
    if (!selectedChild) return null;
    
    // In a real app, these would be calculated from actual data
    const toxicAlerts = childAlerts.filter(alert => alert.type === 'toxic').length;
    const groomingAlerts = childAlerts.filter(alert => alert.type === 'grooming').length;
    const alertsToday = childAlerts.filter(alert => {
      const today = new Date();
      const alertDate = new Date(alert.timestamp);
      return (
        alertDate.getDate() === today.getDate() &&
        alertDate.getMonth() === today.getMonth() &&
        alertDate.getFullYear() === today.getFullYear()
      );
    }).length;
    
    return (
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, shadows.small]}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.statNumber}>{alertsToday}</Text>
            <Text style={styles.statLabel}>{i18n.t('home.alertsToday')}</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, shadows.small]}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={theme.colors.toxic}
            />
            <Text style={styles.statNumber}>{toxicAlerts}</Text>
            <Text style={styles.statLabel}>{i18n.t('home.toxicAlerts')}</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, shadows.small]}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="account-alert"
              size={24}
              color={theme.colors.grooming}
            />
            <Text style={styles.statNumber}>{groomingAlerts}</Text>
            <Text style={styles.statLabel}>{i18n.t('home.groomingAlerts')}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  };
  
  // Render latest alert card
  const renderLatestAlert = () => {
    if (!selectedChild) return null;
    
    if (!latestAlert) {
      return (
        <Card style={[styles.alertCard, shadows.medium]}>
          <Card.Content style={styles.emptyAlertContent}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={48}
              color={theme.colors.disabled}
            />
            <Text style={styles.emptyAlertText}>{i18n.t('home.noAlerts')}</Text>
          </Card.Content>
        </Card>
      );
    }
    
    const alertTime = latestAlert.timestamp ? formatDistanceToNow(new Date(latestAlert.timestamp), { addSuffix: true }) : '';
    
    return (
      <Card 
        style={[styles.alertCard, shadows.medium]} 
        onPress={() => handleAlertPress(latestAlert)}
      >
        <Card.Title
          title={i18n.t('home.latestAlert')}
          subtitle={alertTime}
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon={latestAlert.type === 'toxic' ? 'alert-circle' : 'account-alert'}
              color="white"
              style={{
                backgroundColor: latestAlert.type === 'toxic' ? theme.colors.toxic : theme.colors.grooming
              }}
            />
          )}
        />
        <Card.Content>
          <View style={styles.alertChips}>
            <Chip 
              icon={latestAlert.type === 'toxic' ? 'alert-circle' : 'account-alert'}
              style={[
                styles.typeChip,
                {
                  backgroundColor: latestAlert.type === 'toxic' 
                    ? theme.colors.toxic + '20' // 20% opacity
                    : theme.colors.grooming + '20'
                }
              ]}
            >
              {latestAlert.type === 'toxic' ? i18n.t('alerts.toxic') : i18n.t('alerts.grooming')}
            </Chip>
            
            <Chip 
              icon="flag-variant"
              style={[
                styles.severityChip,
                {
                  backgroundColor: 
                    latestAlert.severity === 'high' ? theme.colors.high + '20' :
                    latestAlert.severity === 'medium' ? theme.colors.medium + '20' :
                    theme.colors.low + '20'
                }
              ]}
            >
              {
                latestAlert.severity === 'high' ? i18n.t('alerts.high') :
                latestAlert.severity === 'medium' ? i18n.t('alerts.medium') :
                i18n.t('alerts.low')
              }
            </Chip>
          </View>
          
          <Text numberOfLines={3} style={styles.alertTranscript}>
            {latestAlert.transcription}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => handleAlertPress(latestAlert)}>
            {i18n.t('common.view')}
          </Button>
        </Card.Actions>
      </Card>
    );
  };
  
  // Empty state when no children
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="account-child-outline"
          size={64}
          color={theme.colors.disabled}
        />
        <Text style={styles.emptyText}>{i18n.t('home.noChildren')}</Text>
        <Text style={styles.emptySubtext}>{i18n.t('home.addYourFirst')}</Text>
        <Button
          mode="contained"
          onPress={handleAddChild}
          icon="plus"
          style={styles.emptyButton}
        >
          {i18n.t('home.addChild')}
        </Button>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.container}>
        {/* Header with user greeting and child selection */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={typography.subtitle}>
              {i18n.t('home.welcome')}, {user?.displayName?.split(' ')[0] || ''}
            </Text>
          </View>
          
          {children.length > 0 && (
            <View style={styles.childSelector}>
              <Button
                mode="outlined"
                onPress={() => dispatch(toggleChildMenu())}
                icon={childMenuVisible ? "chevron-up" : "chevron-down"}
                style={styles.childSelectorButton}
              >
                {selectedChild?.name || i18n.t('home.selectChild')}
              </Button>
              {renderChildMenu()}
            </View>
          )}
        </View>
        
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{i18n.t('home.loading')}</Text>
          </View>
        ) : children.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Statistics cards */}
            {renderStatCards()}
            
            {/* Latest alert */}
            <View style={styles.sectionHeader}>
              <Text style={typography.heading}>{i18n.t('home.mostRecentAlert')}</Text>
              <Button
                mode="text"
                onPress={handleViewAllAlerts}
                disabled={!childAlerts.length}
              >
                {i18n.t('home.viewAll')}
              </Button>
            </View>
            {renderLatestAlert()}
            
            {/* Analytics button */}
            <Button
              mode="outlined"
              onPress={handleViewAnalytics}
              icon="chart-line"
              style={styles.analyticsButton}
            >
              {i18n.t('navigation.analytics')}
            </Button>
          </ScrollView>
        )}
        
        {/* Add child FAB */}
        {children.length > 0 && (
          <FAB
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            icon="plus"
            onPress={handleAddChild}
            color="white"
          />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    flex: 1,
  },
  childSelector: {
    position: 'relative',
    zIndex: 1,
  },
  childSelectorButton: {
    minWidth: 150,
  },
  childMenu: {
    position: 'absolute',
    right: 0,
    top: '100%',
    width: 200,
    maxHeight: 300,
    zIndex: 2,
  },
  childMenuItem: {
    marginVertical: spacing.xs,
  },
  addChildButton: {
    marginTop: spacing.m,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl + spacing.l, // Extra space for FAB
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statContent: {
    alignItems: 'center',
    padding: spacing.xs,
  },
  statNumber: {
    ...typography.title,
    marginVertical: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  alertCard: {
    marginBottom: spacing.m,
  },
  alertChips: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  typeChip: {
    marginRight: spacing.s,
  },
  severityChip: {},
  alertTranscript: {
    ...typography.body,
    marginTop: spacing.s,
  },
  emptyAlertContent: {
    alignItems: 'center',
    padding: spacing.l,
  },
  emptyAlertText: {
    ...typography.body,
    marginTop: spacing.m,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.m,
  },
  analyticsButton: {
    marginTop: spacing.m,
  },
  fab: {
    position: 'absolute',
    margin: spacing.m,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.heading,
    marginTop: spacing.m,
  },
  emptySubtext: {
    ...typography.body,
    marginTop: spacing.s,
    marginBottom: spacing.l,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyButton: {
    marginTop: spacing.m,
  },
});

export default HomeScreen;
