import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Get the latest alert for a specific child
export const getLatestChildAlert = async (childId) => {
  try {
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('childId', '==', childId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const alertsSnapshot = await getDocs(alertsQuery);
    
    if (alertsSnapshot.empty) {
      return null;
    }
    
    const alertDoc = alertsSnapshot.docs[0];
    const alertData = alertDoc.data();
    
    // Generate clip URL if exists
    let clipUrl = null;
    if (alertData.clip_path) {
      try {
        clipUrl = await getDownloadURL(ref(storage, alertData.clip_path));
      } catch (error) {
        console.error('Error getting audio clip URL:', error);
      }
    }
    
    return {
      id: alertDoc.id,
      ...alertData,
      clipUrl
    };
  } catch (error) {
    throw error;
  }
};

// Get alerts for a specific child with pagination
export const getChildAlerts = async (childId, lastAlertDoc = null, pageSize = 10) => {
  try {
    let alertsQuery;
    
    if (lastAlertDoc) {
      alertsQuery = query(
        collection(db, 'alerts'),
        where('childId', '==', childId),
        orderBy('timestamp', 'desc'),
        startAfter(lastAlertDoc),
        limit(pageSize)
      );
    } else {
      alertsQuery = query(
        collection(db, 'alerts'),
        where('childId', '==', childId),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );
    }
    
    const alertsSnapshot = await getDocs(alertsQuery);
    
    if (alertsSnapshot.empty) {
      return {
        alerts: [],
        lastDoc: null
      };
    }
    
    const alerts = [];
    
    // Process each alert document
    for (const doc of alertsSnapshot.docs) {
      const alertData = doc.data();
      
      // Generate clip URL if exists
      let clipUrl = null;
      if (alertData.clip_path) {
        try {
          clipUrl = await getDownloadURL(ref(storage, alertData.clip_path));
        } catch (error) {
          console.error(`Error getting audio clip URL for alert ${doc.id}:`, error);
        }
      }
      
      alerts.push({
        id: doc.id,
        ...alertData,
        clipUrl
      });
    }
    
    return {
      alerts,
      lastDoc: alertsSnapshot.docs[alertsSnapshot.docs.length - 1]
    };
  } catch (error) {
    throw error;
  }
};

// Get a single alert by ID
export const getAlertById = async (alertId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    const alertDoc = await getDoc(alertRef);
    
    if (!alertDoc.exists()) {
      throw new Error('Alert not found');
    }
    
    const alertData = alertDoc.data();
    
    // Generate clip URL if exists
    let clipUrl = null;
    if (alertData.clip_path) {
      try {
        clipUrl = await getDownloadURL(ref(storage, alertData.clip_path));
      } catch (error) {
        console.error('Error getting audio clip URL:', error);
      }
    }
    
    return {
      id: alertDoc.id,
      ...alertData,
      clipUrl
    };
  } catch (error) {
    throw error;
  }
};

// Mark alert as read
export const markAlertAsRead = async (alertId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      read: true,
      readAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Mark alert as false positive
export const markAlertAsFalsePositive = async (alertId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      falsePositive: true,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Add a note to an alert
export const addAlertNote = async (alertId, note) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    const alertDoc = await getDoc(alertRef);
    
    if (!alertDoc.exists()) {
      throw new Error('Alert not found');
    }
    
    const alertData = alertDoc.data();
    const notes = alertData.notes || [];
    
    const newNote = {
      id: Date.now().toString(),
      text: note,
      createdAt: Timestamp.now()
    };
    
    await updateDoc(alertRef, {
      notes: [...notes, newNote],
      updatedAt: Timestamp.now()
    });
    
    return newNote;
  } catch (error) {
    throw error;
  }
};

// Get child's alert statistics
export const getChildAlertStats = async (childId, timeRange = 30) => {
  try {
    // Calculate the date for timeRange days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    const startTimestamp = Timestamp.fromDate(startDate);
    
    // Query alerts for this child within the time range
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('childId', '==', childId),
      where('timestamp', '>=', startTimestamp),
      orderBy('timestamp', 'desc')
    );
    
    const alertsSnapshot = await getDocs(alertsQuery);
    
    if (alertsSnapshot.empty) {
      return {
        total: 0,
        byType: {
          toxic: 0,
          grooming: 0
        },
        byCategory: {},
        averageSeverity: 0,
        trend: []
      };
    }
    
    // Initialize statistics
    let totalToxic = 0;
    let totalGrooming = 0;
    let severitySum = 0;
    const categoryCount = {};
    const dayCount = {};
    
    // Calculate days in range for the trend
    for (let i = 0; i <= timeRange; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dayCount[dateStr] = 0;
    }
    
    // Process each alert
    alertsSnapshot.forEach(doc => {
      const alert = doc.data();
      
      // Count by type
      if (alert.type === 'toxic') {
        totalToxic++;
      } else if (alert.type === 'grooming') {
        totalGrooming++;
      }
      
      // Add to severity sum
      if (alert.severity) {
        severitySum += alert.severity;
      }
      
      // Count by category
      if (alert.flagged && Array.isArray(alert.flagged)) {
        alert.flagged.forEach(flag => {
          if (flag.category) {
            categoryCount[flag.category] = (categoryCount[flag.category] || 0) + 1;
          }
        });
      }
      
      // Add to daily count for trend
      const alertDate = alert.timestamp.toDate().toISOString().split('T')[0];
      if (dayCount[alertDate] !== undefined) {
        dayCount[alertDate]++;
      }
    });
    
    // Convert daily counts to trend array
    const trend = Object.keys(dayCount)
      .sort()
      .map(date => ({
        date,
        count: dayCount[date]
      }));
    
    // Calculate average severity
    const totalAlerts = alertsSnapshot.size;
    const averageSeverity = totalAlerts > 0 ? (severitySum / totalAlerts) : 0;
    
    return {
      total: totalAlerts,
      byType: {
        toxic: totalToxic,
        grooming: totalGrooming
      },
      byCategory: categoryCount,
      averageSeverity,
      trend
    };
  } catch (error) {
    throw error;
  }
};

// Generate and export an alert report as PDF
export const exportAlertAsPdf = async (alertId) => {
  try {
    // Get the alert data
    const alert = await getAlertById(alertId);
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    // Format the timestamp
    const timestamp = alert.timestamp.toDate().toLocaleString();
    
    // Format the flagged items
    let flaggedItemsHtml = '';
    if (alert.flagged && Array.isArray(alert.flagged)) {
      flaggedItemsHtml = alert.flagged.map(flag => `
        <div class="flagged-item">
          <h4>${flag.text || 'Unknown'}</h4>
          <p>Category: ${flag.category || 'Uncategorized'}</p>
          <p>Severity: ${flag.severity || 'Unknown'}</p>
        </div>
      `).join('');
    }
    
    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ToxiGuard Alert Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          h1 {
            color: #e74c3c;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .alert-header {
            background-color: ${alert.type === 'toxic' ? '#e74c3c' : '#9b59b6'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            color: #555;
          }
          .transcription {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ddd;
            white-space: pre-wrap;
          }
          .flagged-item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #fff5f5;
            border-left: 4px solid #e74c3c;
            border-radius: 3px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            color: #777;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>ToxiGuard Alert Report</h1>
        
        <div class="alert-header">
          <h2>${alert.type === 'toxic' ? 'Toxic Speech Alert' : 'Grooming Alert'}</h2>
          <p>Date & Time: ${timestamp}</p>
        </div>
        
        <div class="section">
          <h2>Alert Information</h2>
          <p><strong>Alert ID:</strong> ${alert.id}</p>
          <p><strong>Type:</strong> ${alert.type}</p>
          ${alert.severity ? `<p><strong>Severity:</strong> ${alert.severity}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>Transcription</h2>
          <div class="transcription">
            ${alert.transcription || 'No transcription available'}
          </div>
        </div>
        
        ${alert.flagged && alert.flagged.length > 0 ? `
        <div class="section">
          <h2>Flagged Content</h2>
          ${flaggedItemsHtml}
        </div>
        ` : ''}
        
        ${alert.notes && alert.notes.length > 0 ? `
        <div class="section">
          <h2>Notes</h2>
          ${alert.notes.map(note => `
            <p><strong>${new Date(note.createdAt.toDate()).toLocaleString()}</strong>: ${note.text}</p>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by ToxiGuard Parent Companion App</p>
          <p>Export Date: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Generate the PDF file
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      // Define a filename
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
      const pdfName = `toxiguard_alert_${alert.id}_${timestamp}.pdf`;
      
      // Copy the file to a sharing directory with a better name
      const fileCopyUri = FileSystem.documentDirectory + pdfName;
      await FileSystem.copyAsync({
        from: uri,
        to: fileCopyUri
      });
      
      // Share the PDF
      await Sharing.shareAsync(fileCopyUri);
      
      return {
        success: true,
        uri: fileCopyUri
      };
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    throw error;
  }
};

// Download audio clip for offline listening
export const downloadAudioClip = async (alert) => {
  try {
    if (!alert.clipUrl) {
      throw new Error('No audio clip URL available');
    }
    
    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
    const audioFileName = `toxiguard_audio_${alert.id}_${timestamp}.mp3`;
    const fileUri = FileSystem.documentDirectory + audioFileName;
    
    // Download the file
    const downloadResumable = FileSystem.createDownloadResumable(
      alert.clipUrl,
      fileUri,
      {},
      downloadProgress => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${progress * 100}%`);
      }
    );
    
    const { uri } = await downloadResumable.downloadAsync();
    
    return {
      success: true,
      uri
    };
  } catch (error) {
    throw error;
  }
};
