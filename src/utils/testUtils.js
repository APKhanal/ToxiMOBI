/**
 * ToxiGuard Test Utilities
 * Helper functions and mocks for testing
 */

/**
 * Mock Firebase functionality for testing
 * @returns {Object} - Mock Firebase implementation
 */
export const mockFirebase = () => {
  // Create a mock implementation of Firebase
  return {
    initializeApp: jest.fn().mockReturnValue({
      name: 'ToxiGuard',
      options: {
        apiKey: 'mock-api-key',
        authDomain: 'mock-auth-domain',
        projectId: 'mock-project-id',
        storageBucket: 'mock-storage-bucket',
        messagingSenderId: 'mock-sender-id',
        appId: 'mock-app-id',
        measurementId: 'mock-measurement-id',
      },
    }),
    apps: [],
  };
};

/**
 * Mock child data for testing
 * @param {Object} overrides - Properties to override in the mock data
 * @returns {Object} - Mock child object
 */
export const mockChild = (overrides = {}) => ({
  id: 'child-1',
  name: 'Test Child',
  age: 10,
  parentId: 'user-1',
  settings: {
    toxicDetection: true,
    groomingDetection: true,
    toxicSeverityThreshold: 'medium',
    groomingSeverityThreshold: 'low',
  },
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Mock alert data for testing
 * @param {Object} overrides - Properties to override in the mock data
 * @returns {Object} - Mock alert object
 */
export const mockAlert = (overrides = {}) => ({
  id: 'alert-1',
  childId: 'child-1',
  type: 'toxic',
  severity: 'medium',
  transcription: 'This is a test transcription with some toxic content.',
  timestamp: '2023-01-02T12:30:00.000Z',
  flagged: [
    {
      category: 'profanity',
      text: 'toxic content',
      severity: 'medium',
    },
  ],
  clip_path: 'https://example.com/audio/clip1.mp3',
  reviewed: false,
  falsePositive: false,
  ...overrides,
});

/**
 * Mock user data for testing
 * @param {Object} overrides - Properties to override in the mock data
 * @returns {Object} - Mock user object
 */
export const mockUser = (overrides = {}) => ({
  uid: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  ...overrides,
});

/**
 * Mock analytics data for testing
 * @param {Object} overrides - Properties to override in the mock data
 * @returns {Object} - Mock analytics object
 */
export const mockAnalytics = (overrides = {}) => ({
  summary: {
    totalAlerts: 24,
    toxicAlerts: 16,
    groomingAlerts: 8,
    avgSeverity: 0.5,
  },
  trends: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    toxicData: [3, 2, 5, 1, 2, 1, 2],
    groomingData: [1, 0, 2, 3, 1, 0, 1],
    toxicTotal: 16,
    groomingTotal: 8,
  },
  categories: [
    { name: 'profanity', count: 10, color: '#FF9800' },
    { name: 'harassment', count: 6, color: '#E53935' },
    { name: 'sexualContent', count: 5, color: '#AD1457' },
    { name: 'personalInfo', count: 3, color: '#0288D1' },
  ],
  ...overrides,
});

/**
 * Mock co-parent data for testing
 * @param {Object} overrides - Properties to override in the mock data
 * @returns {Object} - Mock co-parent object
 */
export const mockCoParent = (overrides = {}) => ({
  id: 'coparent-1',
  email: 'coparent@example.com',
  name: 'Co Parent',
  status: 'accepted', // 'pending', 'accepted', 'rejected'
  childId: 'child-1',
  invitedBy: 'user-1',
  invitedAt: '2023-01-01T12:00:00.000Z',
  ...overrides,
});

/**
 * Helper to create a mock store state
 * @param {Object} overrides - Properties to override in the mock state
 * @returns {Object} - Mock Redux store state
 */
export const mockStoreState = (overrides = {}) => {
  const defaultState = {
    auth: {
      status: 'idle',
      user: null,
      error: null,
    },
    children: {
      status: 'idle',
      children: [],
      selectedChildId: null,
      error: null,
      coParents: [],
      coParentStatus: 'idle',
      coParentError: null,
    },
    alerts: {
      status: 'idle',
      alerts: [],
      error: null,
      analytics: null,
    },
    ui: {
      language: 'en',
      themeMode: 'light',
      isAppReady: true,
    },
  };

  // Deep merge the overrides with the default state
  return deepMerge(defaultState, overrides);
};

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge into target
 * @returns {Object} - Merged object
 */
const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} - True if the value is an object
 */
const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

/**
 * Wait for a specified time (for async testing)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after the wait time
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a test renderer wrapper with necessary providers
 * @param {React.ReactNode} children - Child components to render
 * @param {Object} options - Configuration options
 * @returns {Object} - Test renderer wrapper
 */
export const createTestWrapper = (children, options = {}) => {
  // This function would create a wrapper with Redux Provider, Paper Provider,
  // and Navigation Container for testing components
  // Implementation would depend on testing framework
};
