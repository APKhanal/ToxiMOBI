import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, IconButton, Divider, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAlerts, selectAlertsByChildId, selectAlertsStatus, selectAlertsError, selectLastDoc, markAsRead } from '../../store/slices/alertsSlice';
import { selectSelectedChild, selectSelectedChildId } from '../../store/slices/childrenSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';
import { format } from 'date-fns';

const AlertsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const selectedChildId = useSelector(selectSelectedChildId);
  const selectedChild = useSelector(selectSelectedChild);
  const alerts = useSelector(state => selectAlertsByChildId(state, selectedChildId));
  const lastDoc = useSelector(state => selectLastDoc(state, selectedChildId));
  const status = useSelector(selectAlertsStatus);
  const error = useSelector(selectAlertsError);
  
  const isLoading = status === 'loading' && !refreshing && !loading;
  
  // Load initial data
  useEffect(() => {
    if (selectedChildId) {
      dispatch(fetchAlerts({ childId: selectedChildId }));
    }
  }, [dispatch, selectedChildId]);
  
  // Handle refresh
  const onRefresh = async () => {
    if (!selectedChildId) return;
    
    setRefreshing(true);
    try {
      await dispatch(fetchAlerts({ childId: selectedChildId })).unwrap();
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Load more alerts
  const loadMore = async () => {
    if (!selectedChildId || !lastDoc || loading || status === 'loading') return;
    
    setLoading(true);
    try {
      await dispatch(fetchAlerts({ 
        childId: selectedChildId,
        lastDoc,
        pageSize: 10
      })).unwrap();
    } catch (error) {
      console.error('Error loading more alerts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to alert detail
  const handleAlertPress = (alert) => {
    // Mark as read
    if (!alert.read) {
      dispatch(markAsRead(alert.id));
    }
    
    // Navigate to detail screen
    navigation.navigate('AlertDetail', { alertId: alert.id });
  };
  
  // Render each alert item
  const renderAlertItem = ({ item }) => {
    const alert = item;
    const alertDate = alert.timestamp ? new Date(alert.timestamp) : new Date();
    const formattedDate = format(alertDate, i18n.t('alerts.dateFormat'));
    
    return (
      <Card 
        style={[
          styles.alertCard, 
          shadows.small,
          !alert.read && styles.unreadCard
        ]} 
        onPress={() => handleAlertPress(alert)}
      >
        <View style={styles.alertHeader}>
          <Chip 
            icon={alert.type === 'toxic' ? 'alert-circle' : 'account-alert'}
            style={[
              styles.typeChip,
              {
                backgroundColor: alert.type === 'toxic' 
                  ? theme.colors.toxic + '20' // 20% opacity
                  : theme.colors.grooming + '20'
              }
            ]}
          >
            {alert.type === 'toxic' ? i18n.t('alerts.toxic') : i18n.t('alerts.grooming')}
          </Chip>
          
          <Chip 
            icon="flag-variant"
            style={[
              styles.severityChip,
              {
                backgroundColor: 
                  alert.severity === 'high' ? theme.colors.high + '20' :
                  alert.severity === 'medium' ? theme.colors.medium + '20' :
                  theme.colors.low + '20'
              }
            ]}
          >
            {
              alert.severity === 'high' ? i18n.t('alerts.high') :
              alert.severity === 'medium' ? i18n.t('alerts.medium') :
              i18n.t('alerts.low')
            }
          </Chip>
          
          {!alert.read && (
            <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
        
        <Card.Content>
          <Text numberOfLines={3} style={styles.alertTranscript}>
            {alert.transcription}
          </Text>
          
          <View style={styles.alertFooter}>
            <Text style={styles.alertTimestamp}>{formattedDate}</Text>
            
            {alert.falsePositive && (
              <Chip 
                icon="close-circle" 
                style={styles.falsePositiveChip}
                size={16}
              >
                {i18n.t('alerts.markAsFalsePositive')}
              </Chip>
            )}
          </View>
        </Card.Content>
        
        <IconButton
          icon="chevron-right"
          size={24}
          style={styles.chevron}
          onPress={() => handleAlertPress(alert)}
        />
      </Card>
    );
  };
  
  // Render empty state
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>{i18n.t('common.loading')}</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={onRefresh} 
            style={styles.retryButton}
          >
            {i18n.t('common.retry')}
          </Button>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{i18n.t('alerts.noAlerts')}</Text>
      </View>
    );
  };
  
  // Render footer (load more)
  const renderFooter = () => {
    if (!lastDoc || alerts.length === 0) return null;
    
    return (
      <Button
        mode="outlined"
        onPress={loadMore}
        loading={loading}
        disabled={loading}
        style={styles.loadMoreButton}
      >
        {loading ? i18n.t('common.loading') : i18n.t('alerts.loadMore')}
      </Button>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.title}>{i18n.t('alerts.title')}</Text>
          {selectedChild && (
            <Text style={typography.subtitle}>{selectedChild.name}</Text>
          )}
        </View>
        
        <Divider />
        
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
        />
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
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  alertCard: {
    marginBottom: spacing.m,
    position: 'relative',
    overflow: 'visible',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: 'transparent', // Will be set dynamically
  },
  alertHeader: {
    flexDirection: 'row',
    padding: spacing.m,
    paddingBottom: 0,
  },
  typeChip: {
    marginRight: spacing.s,
  },
  severityChip: {},
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
  },
  alertTranscript: {
    ...typography.body,
    marginVertical: spacing.s,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  alertTimestamp: {
    ...typography.caption,
    opacity: 0.7,
  },
  falsePositiveChip: {
    height: 24,
  },
  chevron: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    marginTop: spacing.m,
    opacity: 0.7,
  },
  errorText: {
    ...typography.body,
    color: 'red',
    marginBottom: spacing.m,
  },
  retryButton: {
    marginTop: spacing.m,
  },
  loadMoreButton: {
    marginVertical: spacing.m,
  }
});

export default AlertsScreen;
