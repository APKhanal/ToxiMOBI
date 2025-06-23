import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Divider, Menu, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchAlertAnalytics, selectAlertAnalytics, selectAlertsStatus } from '../../store/slices/alertsSlice';
import { selectSelectedChild, selectChildById } from '../../store/slices/childrenSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';
import { calculatePercentage } from '../../utils/helpers';

const screenWidth = Dimensions.get('window').width - spacing.m * 2;

const AnalyticsScreen = ({ route, navigation }) => {
  const { childId } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'
  const [menuVisible, setMenuVisible] = useState(false);
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'pie'
  
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Get data
  const analytics = useSelector(selectAlertAnalytics);
  const status = useSelector(selectAlertsStatus);
  const isLoading = status === 'loading' && !refreshing;
  
  // Get child from ID or use selected child
  const child = useSelector(state => 
    childId ? selectChildById(state, childId) : selectSelectedChild(state)
  );
  
  // Load analytics data
  useEffect(() => {
    if (child) {
      dispatch(fetchAlertAnalytics({ childId: child.id, timeRange }));
    }
  }, [dispatch, child, timeRange]);
  
  // Handle refresh
  const onRefresh = async () => {
    if (!child) return;
    
    setRefreshing(true);
    try {
      await dispatch(fetchAlertAnalytics({ childId: child.id, timeRange })).unwrap();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Toggle time range menu
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  // Switch time range
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    closeMenu();
  };
  
  // Switch chart type
  const toggleChartType = () => {
    const types = ['line', 'bar', 'pie'];
    const currentIndex = types.indexOf(chartType);
    const nextIndex = (currentIndex + 1) % types.length;
    setChartType(types[nextIndex]);
  };
  
  // Get appropriate title for time range
  const getTimeRangeTitle = () => {
    switch (timeRange) {
      case 'day': return i18n.t('analytics.today');
      case 'week': return i18n.t('analytics.thisWeek');
      case 'month': return i18n.t('analytics.thisMonth');
      case 'year': return i18n.t('analytics.thisYear');
      default: return i18n.t('analytics.thisWeek');
    }
  };
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => theme.colors.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };
  
  // Render alert trends chart
  const renderAlertTrendsChart = () => {
    if (!analytics || !analytics.trends) return null;
    
    const trends = analytics.trends;
    
    // Get chart data
    const chartData = {
      labels: trends.labels || [],
      datasets: [
        {
          data: trends.toxicData || [],
          color: (opacity = 1) => theme.colors.toxic,
          strokeWidth: 2,
        },
        {
          data: trends.groomingData || [],
          color: (opacity = 1) => theme.colors.grooming,
          strokeWidth: 2,
        },
      ],
      legend: [i18n.t('alerts.toxic'), i18n.t('alerts.grooming')],
    };
    
    if (chartType === 'line') {
      return (
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      );
    } else {
      // For pie chart, we need to transform data
      const pieData = [
        {
          name: i18n.t('alerts.toxic'),
          count: trends.toxicTotal || 0,
          color: theme.colors.toxic,
          legendFontColor: theme.colors.text,
          legendFontSize: 12,
        },
        {
          name: i18n.t('alerts.grooming'),
          count: trends.groomingTotal || 0,
          color: theme.colors.grooming,
          legendFontColor: theme.colors.text,
          legendFontSize: 12,
        },
      ];
      
      return (
        <PieChart
          data={pieData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      );
    }
  };
  
  // Render category distribution chart
  const renderCategoryChart = () => {
    if (!analytics || !analytics.categories || analytics.categories.length === 0) return null;
    
    const categoryData = analytics.categories.map(cat => ({
      name: i18n.t(`categories.${cat.name.toLowerCase()}`, { defaultValue: cat.name }),
      count: cat.count,
      color: cat.color || theme.colors[cat.name.toLowerCase()] || theme.colors.primary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));
    
    return (
      <PieChart
        data={categoryData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    );
  };
  
  // Render stat cards
  const renderStatCards = () => {
    if (!analytics || !analytics.summary) return null;
    
    const { totalAlerts, toxicAlerts, groomingAlerts, avgSeverity } = analytics.summary;
    
    // Calculate percentages
    const toxicPercentage = calculatePercentage(toxicAlerts, totalAlerts);
    const groomingPercentage = calculatePercentage(groomingAlerts, totalAlerts);
    
    // Map severity to text
    let severityText = i18n.t('alerts.low');
    let severityColor = theme.colors.low;
    if (avgSeverity >= 0.66) {
      severityText = i18n.t('alerts.high');
      severityColor = theme.colors.high;
    } else if (avgSeverity >= 0.33) {
      severityText = i18n.t('alerts.medium');
      severityColor = theme.colors.medium;
    }
    
    return (
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, shadows.small]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statNumber}>{totalAlerts}</Text>
            <Text style={styles.statLabel}>{i18n.t('analytics.totalAlerts')}</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, shadows.small]}>
          <Card.Content style={styles.statContent}>
            <View style={styles.percentageContainer}>
              <View style={styles.percentageItem}>
                <View style={[styles.dot, { backgroundColor: theme.colors.toxic }]} />
                <Text style={styles.percentageValue}>{toxicPercentage}%</Text>
              </View>
              <View style={styles.percentageItem}>
                <View style={[styles.dot, { backgroundColor: theme.colors.grooming }]} />
                <Text style={styles.percentageValue}>{groomingPercentage}%</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>{i18n.t('analytics.alertTypes')}</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, shadows.small]}>
          <Card.Content style={styles.statContent}>
            <Text style={[styles.statNumber, { color: severityColor }]}>{severityText}</Text>
            <Text style={styles.statLabel}>{i18n.t('analytics.avgSeverity')}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  };
  
  // Loading state
  if (isLoading && !analytics) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
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
            <Text style={typography.title}>{i18n.t('analytics.title')}</Text>
            {child && (
              <Text style={typography.subtitle}>{child.name}</Text>
            )}
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="calendar-range"
                size={24}
                onPress={openMenu}
              />
            }
          >
            <Menu.Item 
              onPress={() => handleTimeRangeChange('day')} 
              title={i18n.t('analytics.today')}
              icon={timeRange === 'day' ? "check" : "calendar-today"} 
            />
            <Menu.Item 
              onPress={() => handleTimeRangeChange('week')} 
              title={i18n.t('analytics.thisWeek')}
              icon={timeRange === 'week' ? "check" : "calendar-week"} 
            />
            <Menu.Item 
              onPress={() => handleTimeRangeChange('month')} 
              title={i18n.t('analytics.thisMonth')}
              icon={timeRange === 'month' ? "check" : "calendar-month"} 
            />
            <Menu.Item 
              onPress={() => handleTimeRangeChange('year')} 
              title={i18n.t('analytics.thisYear')}
              icon={timeRange === 'year' ? "check" : "calendar"} 
            />
          </Menu>
        </View>
        
        <Divider />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Summary stats */}
          {renderStatCards()}
          
          {/* Alert trends chart */}
          <Card style={[styles.chartCard, shadows.medium]}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <Text style={typography.heading}>{i18n.t('analytics.alertTrends')}</Text>
                <View style={styles.chartActions}>
                  <Text style={styles.timeRangeText}>{getTimeRangeTitle()}</Text>
                  <IconButton
                    icon={
                      chartType === 'line' ? 'chart-line' : 
                      chartType === 'bar' ? 'chart-bar' : 
                      'chart-pie'
                    }
                    size={20}
                    onPress={toggleChartType}
                  />
                </View>
              </View>
              
              {analytics && analytics.trends ? (
                renderAlertTrendsChart()
              ) : (
                <View style={styles.emptyChart}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={48}
                    color={theme.colors.disabled}
                  />
                  <Text style={styles.emptyChartText}>{i18n.t('analytics.noData')}</Text>
                </View>
              )}
              
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.toxic }]} />
                  <Text style={styles.legendText}>{i18n.t('alerts.toxic')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.grooming }]} />
                  <Text style={styles.legendText}>{i18n.t('alerts.grooming')}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Category distribution chart */}
          <Card style={[styles.chartCard, shadows.medium]}>
            <Card.Content>
              <Text style={typography.heading}>{i18n.t('analytics.categoryDistribution')}</Text>
              
              {analytics && analytics.categories && analytics.categories.length > 0 ? (
                renderCategoryChart()
              ) : (
                <View style={styles.emptyChart}>
                  <MaterialCommunityIcons
                    name="chart-pie"
                    size={48}
                    color={theme.colors.disabled}
                  />
                  <Text style={styles.emptyChartText}>{i18n.t('analytics.noData')}</Text>
                </View>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.m,
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
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: spacing.xs,
  },
  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  percentageValue: {
    ...typography.subheading,
  },
  chartCard: {
    marginBottom: spacing.m,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  chartActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRangeText: {
    ...typography.caption,
    opacity: 0.7,
  },
  chart: {
    marginVertical: spacing.m,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    ...typography.body,
    opacity: 0.7,
    marginTop: spacing.s,
  },
  backButton: {
    marginTop: spacing.l,
  },
});

export default AnalyticsScreen;
