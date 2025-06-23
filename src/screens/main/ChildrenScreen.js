import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Button, FAB, useTheme, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchChildren, selectAllChildren, selectChildrenStatus, selectChildrenError } from '../../store/slices/childrenSlice';
import { selectUser } from '../../store/slices/authSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';
import { getChildInitials, getColorFromString } from '../../utils/helpers';

const ChildrenScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const user = useSelector(selectUser);
  const children = useSelector(selectAllChildren);
  const status = useSelector(selectChildrenStatus);
  const error = useSelector(selectChildrenError);
  
  const isLoading = status === 'loading' && !refreshing;
  
  // Load initial data
  useEffect(() => {
    if (user) {
      dispatch(fetchChildren(user.uid));
    }
  }, [dispatch, user]);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user) {
        await dispatch(fetchChildren(user.uid)).unwrap();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Navigate to child profile
  const handleChildPress = (child) => {
    navigation.navigate('ChildProfile', { childId: child.id });
  };
  
  // Navigate to child settings
  const handleSettingsPress = (child, event) => {
    // Prevent triggering parent card press
    event.stopPropagation();
    navigation.navigate('ChildSettings', { childId: child.id });
  };
  
  // Navigate to add child screen
  const handleAddChild = () => {
    navigation.navigate('AddChild');
  };
  
  // Render each child item
  const renderChildItem = ({ item }) => {
    const child = item;
    const initials = getChildInitials(child.name);
    const avatarColor = getColorFromString(child.name);
    
    const hasGroomingEnabled = child.settings?.groomingDetection === true;
    const hasToxicEnabled = child.settings?.toxicDetection === true;
    
    return (
      <Card 
        style={[styles.childCard, shadows.small]} 
        onPress={() => handleChildPress(child)}
      >
        <Card.Content style={styles.childCardContent}>
          <View style={styles.childAvatarContainer}>
            <Avatar.Text 
              size={60} 
              label={initials}
              style={{ backgroundColor: avatarColor }}
            />
            {child.coParents && child.coParents.length > 0 && (
              <View style={styles.coParentBadge}>
                <MaterialCommunityIcons 
                  name="account-multiple" 
                  size={12} 
                  color="white" 
                />
              </View>
            )}
          </View>
          
          <View style={styles.childInfo}>
            <Text style={typography.heading}>{child.name}</Text>
            
            <View style={styles.detectionContainer}>
              <View style={[styles.detectionItem, { opacity: hasToxicEnabled ? 1 : 0.5 }]}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={14}
                  color={theme.colors.toxic}
                  style={styles.detectionIcon}
                />
                <Text style={styles.detectionText}>
                  {hasToxicEnabled 
                    ? i18n.t('children.toxicEnabled') 
                    : i18n.t('children.toxicDisabled')}
                </Text>
              </View>
              
              <View style={[styles.detectionItem, { opacity: hasGroomingEnabled ? 1 : 0.5 }]}>
                <MaterialCommunityIcons
                  name="account-alert"
                  size={14}
                  color={theme.colors.grooming}
                  style={styles.detectionIcon}
                />
                <Text style={styles.detectionText}>
                  {hasGroomingEnabled 
                    ? i18n.t('children.groomingEnabled') 
                    : i18n.t('children.groomingDisabled')}
                </Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {i18n.t('children.alertsCount', { count: child.alertsCount || 0 })}
              </Text>
              <Text style={styles.statsText}>
                {i18n.t('children.coParentsCount', { count: child.coParents?.length || 0 })}
              </Text>
            </View>
          </View>
          
          <IconButton
            icon="cog"
            size={24}
            onPress={(e) => handleSettingsPress(child, e)}
            style={styles.settingsButton}
          />
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
        <MaterialCommunityIcons
          name="account-child-outline"
          size={64}
          color={theme.colors.disabled}
        />
        <Text style={styles.emptyTitle}>{i18n.t('children.noChildren')}</Text>
        <Text style={styles.emptyText}>{i18n.t('children.addYourFirst')}</Text>
        <Button
          mode="contained"
          onPress={handleAddChild}
          icon="plus"
          style={styles.emptyButton}
        >
          {i18n.t('children.addChild')}
        </Button>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.title}>{i18n.t('children.title')}</Text>
        </View>
        
        <Divider />
        
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        
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
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  childCard: {
    marginBottom: spacing.m,
  },
  childCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  childAvatarContainer: {
    position: 'relative',
    marginRight: spacing.m,
  },
  coParentBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  detectionContainer: {
    marginTop: spacing.xs,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detectionIcon: {
    marginRight: 4,
  },
  detectionText: {
    ...typography.caption,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  statsText: {
    ...typography.caption,
    marginRight: spacing.m,
    opacity: 0.7,
  },
  settingsButton: {
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
  },
  emptyTitle: {
    ...typography.heading,
    marginTop: spacing.m,
  },
  emptyText: {
    ...typography.body,
    marginTop: spacing.s,
    textAlign: 'center',
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
  emptyButton: {
    marginTop: spacing.l,
  },
  fab: {
    position: 'absolute',
    margin: spacing.m,
    right: 0,
    bottom: 0,
  },
});

export default ChildrenScreen;
