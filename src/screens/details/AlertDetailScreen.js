import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, IconButton, Divider, useTheme, ActivityIndicator, Menu, Portal, Dialog, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { format } from 'date-fns';
import { fetchAlertById, markAsRead, markAsFalsePositive, selectAlertById } from '../../store/slices/alertsSlice';
import { selectChildById } from '../../store/slices/childrenSlice';
import { spacing, typography, shadows } from '../../theme';
import i18n from '../../i18n';
import { generatePDF } from '../../utils/reportGenerator';

const AlertDetailScreen = ({ route, navigation }) => {
  const { alertId } = route.params;
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [falsePositiveDialogVisible, setFalsePositiveDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  
  const dispatch = useDispatch();
  const theme = useTheme();
  const playbackPositionRef = useRef(0);
  
  // Fetch the alert data and mark as read if necessary
  const alert = useSelector(state => selectAlertById(state, alertId));
  const child = useSelector(state => alert ? selectChildById(state, alert.childId) : null);
  
  useEffect(() => {
    const loadAlert = async () => {
      try {
        await dispatch(fetchAlertById(alertId)).unwrap();
        if (alert && !alert.read) {
          dispatch(markAsRead(alertId));
        }
      } catch (error) {
        console.error('Error loading alert:', error);
        setSnackbarMessage(i18n.t('alerts.errorLoadingAlert'));
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadAlert();
    
    // Cleanup
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [dispatch, alertId]);
  
  // Load audio file
  useEffect(() => {
    if (alert?.clip_path && !sound) {
      loadAudio(alert.clip_path);
    }
  }, [alert, sound]);
  
  // Load the audio file
  const loadAudio = async (audioUrl) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };
  
  // Handle audio playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      playbackPositionRef.current = status.positionMillis;
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        playbackPositionRef.current = 0;
      }
    }
  };
  
  // Play/pause audio
  const togglePlayback = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      // If we're at the end, start from beginning
      if (playbackPositionRef.current >= playbackDuration - 100) {
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
    }
  };
  
  // Format milliseconds to mm:ss
  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Export alert as PDF
  const exportPDF = async () => {
    if (!alert) return;
    
    setExportingPdf(true);
    try {
      const pdfHtml = generatePDF(alert, child);
      const { uri } = await Print.printToFileAsync({ html: pdfHtml });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: i18n.t('alerts.exportPdfTitle'),
          UTI: 'com.adobe.pdf',
        });
      } else {
        setSnackbarMessage(i18n.t('alerts.sharingNotAvailable'));
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setSnackbarMessage(i18n.t('alerts.errorExportingPdf'));
      setSnackbarVisible(true);
    } finally {
      setExportingPdf(false);
    }
  };
  
  // Mark as false positive
  const handleMarkAsFalsePositive = async () => {
    setFalsePositiveDialogVisible(false);
    
    try {
      await dispatch(markAsFalsePositive(alertId)).unwrap();
      setSnackbarMessage(i18n.t('alerts.markedAsFalsePositive'));
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error marking as false positive:', error);
      setSnackbarMessage(i18n.t('common.errorOccurred'));
      setSnackbarVisible(true);
    }
  };
  
  // Open options menu
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  if (loading || !alert) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const alertDate = alert.timestamp ? new Date(alert.timestamp) : new Date();
  const formattedDate = format(alertDate, i18n.t('alerts.detailedDateFormat'));
  const alertTypeColor = alert.type === 'toxic' ? theme.colors.toxic : theme.colors.grooming;
  const severityColor = 
    alert.severity === 'high' ? theme.colors.high :
    alert.severity === 'medium' ? theme.colors.medium :
    theme.colors.low;
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={typography.title} numberOfLines={1} ellipsizeMode="tail">
            {i18n.t('alerts.alertDetail')}
          </Text>
          
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={openMenu}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                closeMenu();
                exportPDF();
              }} 
              title={i18n.t('alerts.exportPdf')}
              icon="file-pdf-box"
              disabled={exportingPdf}
            />
            {!alert.falsePositive && (
              <Menu.Item 
                onPress={() => {
                  closeMenu();
                  setFalsePositiveDialogVisible(true);
                }} 
                title={i18n.t('alerts.markAsFalsePositive')}
                icon="close-circle"
              />
            )}
          </Menu>
        </View>
        
        <Divider />
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Alert meta information */}
          <Card style={[styles.metaCard, shadows.small]}>
            <Card.Content style={styles.metaContent}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{i18n.t('alerts.child')}</Text>
                <Text style={styles.metaValue}>{child?.name || i18n.t('common.unknown')}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{i18n.t('alerts.timestamp')}</Text>
                <Text style={styles.metaValue}>{formattedDate}</Text>
              </View>
              
              <View style={styles.chipRow}>
                <Chip 
                  icon={alert.type === 'toxic' ? 'alert-circle' : 'account-alert'}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: alertTypeColor + '20' // 20% opacity
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
                      backgroundColor: severityColor + '20' // 20% opacity
                    }
                  ]}
                >
                  {
                    alert.severity === 'high' ? i18n.t('alerts.high') :
                    alert.severity === 'medium' ? i18n.t('alerts.medium') :
                    i18n.t('alerts.low')
                  }
                </Chip>
                
                {alert.falsePositive && (
                  <Chip 
                    icon="close-circle" 
                    style={styles.falsePositiveChip}
                  >
                    {i18n.t('alerts.falsePositive')}
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
          
          {/* Audio playback */}
          {alert.clip_path && (
            <Card style={[styles.audioCard, shadows.small]}>
              <Card.Content>
                <Text style={typography.heading}>{i18n.t('alerts.audioRecording')}</Text>
                
                <View style={styles.playerContainer}>
                  <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                    <MaterialCommunityIcons
                      name={isPlaying ? 'pause-circle' : 'play-circle'}
                      size={50}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
                      <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
                    </View>
                    
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${playbackDuration ? (playbackPosition / playbackDuration) * 100 : 0}%`,
                            backgroundColor: theme.colors.primary
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
          
          {/* Transcription */}
          <Card style={[styles.transcriptionCard, shadows.small]}>
            <Card.Content>
              <Text style={typography.heading}>{i18n.t('alerts.transcription')}</Text>
              <Text style={styles.transcriptionText}>{alert.transcription}</Text>
            </Card.Content>
          </Card>
          
          {/* Flagged content */}
          {alert.flagged && alert.flagged.length > 0 && (
            <Card style={[styles.flaggedCard, shadows.small]}>
              <Card.Content>
                <Text style={typography.heading}>{i18n.t('alerts.flaggedContent')}</Text>
                
                <View style={styles.flaggedList}>
                  {alert.flagged.map((item, index) => (
                    <View key={index} style={styles.flaggedItem}>
                      <View style={styles.flaggedHeader}>
                        <Chip 
                          style={[styles.categoryChip, { backgroundColor: theme.colors[item.category.toLowerCase()] || theme.colors.primary + '20' }]}
                        >
                          {i18n.t(`categories.${item.category.toLowerCase()}`, { defaultValue: item.category })}
                        </Chip>
                        <Chip 
                          icon="flag-variant"
                          style={[
                            styles.severityChip,
                            {
                              backgroundColor: 
                                item.severity === 'high' ? theme.colors.high + '20' :
                                item.severity === 'medium' ? theme.colors.medium + '20' :
                                theme.colors.low + '20'
                            }
                          ]}
                        >
                          {
                            item.severity === 'high' ? i18n.t('alerts.high') :
                            item.severity === 'medium' ? i18n.t('alerts.medium') :
                            i18n.t('alerts.low')
                          }
                        </Chip>
                      </View>
                      
                      <View style={styles.flaggedContent}>
                        <Text style={styles.flaggedText}>"{item.text}"</Text>
                      </View>
                      
                      {index < alert.flagged.length - 1 && <Divider style={styles.itemDivider} />}
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
          
          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
            >
              {i18n.t('common.back')}
            </Button>
            
            <Button
              mode="contained"
              onPress={exportPDF}
              icon="file-pdf-box"
              style={styles.actionButton}
              loading={exportingPdf}
              disabled={exportingPdf}
            >
              {i18n.t('alerts.exportPdf')}
            </Button>
          </View>
        </ScrollView>
        
        {/* False positive confirmation dialog */}
        <Portal>
          <Dialog
            visible={falsePositiveDialogVisible}
            onDismiss={() => setFalsePositiveDialogVisible(false)}
          >
            <Dialog.Title>{i18n.t('alerts.confirmFalsePositive')}</Dialog.Title>
            <Dialog.Content>
              <Text>{i18n.t('alerts.falsePositiveExplanation')}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setFalsePositiveDialogVisible(false)}>
                {i18n.t('common.cancel')}
              </Button>
              <Button onPress={handleMarkAsFalsePositive}>
                {i18n.t('common.confirm')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Snackbar for notifications */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: i18n.t('common.ok'),
            onPress: () => setSnackbarVisible(false),
          }}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
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
  metaCard: {
    marginBottom: spacing.m,
  },
  metaContent: {
    padding: spacing.s,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metaLabel: {
    ...typography.body,
    fontWeight: 'bold',
    flex: 1,
  },
  metaValue: {
    ...typography.body,
    flex: 2,
    textAlign: 'right',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.s,
  },
  typeChip: {
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  severityChip: {
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  falsePositiveChip: {
    marginBottom: spacing.s,
    backgroundColor: '#757575' + '20', // Grey with 20% opacity
  },
  audioCard: {
    marginBottom: spacing.m,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  playButton: {
    marginRight: spacing.m,
  },
  progressContainer: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  timeText: {
    ...typography.caption,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  transcriptionCard: {
    marginBottom: spacing.m,
  },
  transcriptionText: {
    ...typography.body,
    marginTop: spacing.m,
    lineHeight: 24,
  },
  flaggedCard: {
    marginBottom: spacing.m,
  },
  flaggedList: {
    marginTop: spacing.m,
  },
  flaggedItem: {
    marginBottom: spacing.m,
  },
  flaggedHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.s,
  },
  categoryChip: {
    marginRight: spacing.s,
    marginBottom: spacing.xs,
  },
  flaggedContent: {
    marginTop: spacing.xs,
  },
  flaggedText: {
    ...typography.body,
    fontStyle: 'italic',
  },
  itemDivider: {
    marginVertical: spacing.m,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default AlertDetailScreen;
