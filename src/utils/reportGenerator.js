/**
 * ToxiGuard Report Generator
 * Generates PDF reports for alerts
 */

import { formatDateTime } from './helpers';
import i18n from '../i18n';

/**
 * Generate HTML for a PDF report of an alert
 * @param {Object} alert - Alert object
 * @param {Object} child - Child object
 * @returns {string} - HTML content for PDF
 */
export const generatePDF = (alert, child) => {
  if (!alert) return '';
  
  const alertDate = alert.timestamp ? new Date(alert.timestamp) : new Date();
  const formattedDate = formatDateTime(alertDate);
  const childName = child?.name || i18n.t('common.unknown');
  const alertType = alert.type === 'toxic' ? i18n.t('alerts.toxic') : i18n.t('alerts.grooming');
  const alertSeverity = 
    alert.severity === 'high' ? i18n.t('alerts.high') :
    alert.severity === 'medium' ? i18n.t('alerts.medium') :
    i18n.t('alerts.low');
  
  const typeColor = alert.type === 'toxic' ? '#E53935' : '#8E24AA';
  const severityColor = 
    alert.severity === 'high' ? '#F44336' :
    alert.severity === 'medium' ? '#FFC107' :
    '#4CAF50';
  
  // Generate flagged items HTML
  let flaggedItemsHtml = '';
  if (alert.flagged && alert.flagged.length > 0) {
    alert.flagged.forEach(item => {
      const categoryText = i18n.t(`categories.${item.category.toLowerCase()}`, { defaultValue: item.category });
      const severityText = 
        item.severity === 'high' ? i18n.t('alerts.high') :
        item.severity === 'medium' ? i18n.t('alerts.medium') :
        i18n.t('alerts.low');
      
      flaggedItemsHtml += `
        <div class="flagged-item">
          <div class="flagged-header">
            <span class="category-tag" style="background-color: ${getCategoryColor(item.category)}20;">
              ${categoryText}
            </span>
            <span class="severity-tag" style="background-color: ${getSeverityColor(item.severity)}20;">
              ${severityText}
            </span>
          </div>
          <div class="flagged-content">
            <p class="flagged-text">"${item.text}"</p>
          </div>
        </div>
      `;
    });
  } else {
    flaggedItemsHtml = `<p>${i18n.t('alerts.noFlaggedContent')}</p>`;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${i18n.t('alerts.alertReport')}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
        }
        h1 {
          font-size: 24px;
          margin: 0 0 5px 0;
          color: #FF5722;
        }
        h2 {
          font-size: 18px;
          margin: 0 0 20px 0;
          font-weight: normal;
          color: #757575;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .info-table th {
          text-align: left;
          padding: 10px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
          width: 30%;
        }
        .info-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .tag {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          margin-right: 5px;
        }
        .type-tag {
          background-color: ${typeColor}20;
          color: ${typeColor};
        }
        .severity-tag {
          background-color: ${severityColor}20;
          color: ${severityColor};
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .transcription {
          white-space: pre-wrap;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          font-family: monospace;
          line-height: 1.5;
        }
        .flagged-item {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .flagged-header {
          margin-bottom: 10px;
        }
        .category-tag, .severity-tag {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-right: 5px;
        }
        .flagged-text {
          font-style: italic;
          margin: 0;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .footer {
          margin-top: 50px;
          font-size: 12px;
          color: #757575;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .timestamp {
          font-style: italic;
          margin-top: 5px;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ToxiGuard</h1>
        <h2>${i18n.t('alerts.alertReport')}</h2>
      </div>
      
      <div class="section">
        <table class="info-table">
          <tr>
            <th>${i18n.t('alerts.child')}</th>
            <td>${childName}</td>
          </tr>
          <tr>
            <th>${i18n.t('alerts.timestamp')}</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>${i18n.t('alerts.type')}</th>
            <td>
              <span class="tag type-tag">${alertType}</span>
            </td>
          </tr>
          <tr>
            <th>${i18n.t('alerts.severity')}</th>
            <td>
              <span class="tag severity-tag">${alertSeverity}</span>
            </td>
          </tr>
          ${alert.falsePositive ? `
          <tr>
            <th>${i18n.t('alerts.falsePositive')}</th>
            <td>
              <span style="color: #757575; font-style: italic;">${i18n.t('alerts.markedAsFalsePositive')}</span>
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <div class="section">
        <h3 class="section-title">${i18n.t('alerts.transcription')}</h3>
        <div class="transcription">
          ${alert.transcription || i18n.t('alerts.noTranscription')}
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title">${i18n.t('alerts.flaggedContent')}</h3>
        <div class="flagged-list">
          ${flaggedItemsHtml}
        </div>
      </div>
      
      <div class="footer">
        <p>${i18n.t('alerts.reportGeneratedBy')} ToxiGuard</p>
        <p class="timestamp">${i18n.t('alerts.generatedOn')} ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Get color for a category
 * @param {string} category - Category name
 * @returns {string} - Hex color
 */
const getCategoryColor = (category) => {
  const categoryColors = {
    profanity: '#FF9800',      // Orange
    harassment: '#E53935',     // Red variant
    hateSpeech: '#D32F2F',     // Darker red
    threatOfViolence: '#C62828', // Darkest red
    sexualContent: '#AD1457',  // Pink
    personalInfo: '#0288D1',   // Blue
    default: '#757575',        // Grey
  };
  
  if (!category) return categoryColors.default;
  return categoryColors[category.toLowerCase()] || categoryColors.default;
};

/**
 * Get color for a severity level
 * @param {string} severity - Severity level
 * @returns {string} - Hex color
 */
const getSeverityColor = (severity) => {
  if (severity === 'high') return '#F44336';  // Red
  if (severity === 'medium') return '#FFC107'; // Amber
  return '#4CAF50'; // Green (low)
};
