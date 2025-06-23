import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';

// Create a new child profile
export const createChildProfile = async (userId, childData) => {
  try {
    // Create a reference to a new child document with auto-generated ID
    const childRef = doc(collection(db, 'children'));
    
    // Prepare child data with default settings
    const newChildData = {
      ...childData,
      parentId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      coParentIds: [],
      settings: {
        toxicCategories: {
          profanity: { enabled: true, severity: 2 },
          harassment: { enabled: true, severity: 3 },
          hateSpeech: { enabled: true, severity: 3 },
          threatOfViolence: { enabled: true, severity: 3 },
          sexualContent: { enabled: true, severity: 3 },
          personalInfo: { enabled: true, severity: 3 }
        },
        groomingDetection: {
          enabled: true,
          customPhrases: []
        },
        whitelist: [],
        notificationThreshold: 2, // Minimum severity to trigger notification (1-3)
        notificationsEnabled: true
      }
    };
    
    // Save the new child document
    await setDoc(childRef, newChildData);
    
    // Update the user's children array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      children: arrayUnion(childRef.id)
    });
    
    return {
      id: childRef.id,
      ...newChildData
    };
  } catch (error) {
    throw error;
  }
};

// Get a child profile by ID
export const getChildProfile = async (childId) => {
  try {
    const childRef = doc(db, 'children', childId);
    const childDoc = await getDoc(childRef);
    
    if (childDoc.exists()) {
      return {
        id: childDoc.id,
        ...childDoc.data()
      };
    } else {
      throw new Error('Child profile not found');
    }
  } catch (error) {
    throw error;
  }
};

// Get all child profiles for a user (including those shared by co-parents)
export const getUserChildren = async (userId) => {
  try {
    // Get user document to access children IDs
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const childrenIds = userData.children || [];
    
    // Get profiles of directly owned children
    const childrenProfiles = [];
    
    for (const childId of childrenIds) {
      try {
        const childProfile = await getChildProfile(childId);
        childrenProfiles.push(childProfile);
      } catch (error) {
        console.error(`Error fetching child profile ${childId}:`, error);
      }
    }
    
    // Query for children where this user is a co-parent
    const sharedChildrenQuery = query(
      collection(db, 'children'),
      where('coParentIds', 'array-contains', userId)
    );
    
    const sharedChildrenSnapshot = await getDocs(sharedChildrenQuery);
    sharedChildrenSnapshot.forEach(doc => {
      childrenProfiles.push({
        id: doc.id,
        ...doc.data(),
        isShared: true
      });
    });
    
    // Sort by name
    return childrenProfiles.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    throw error;
  }
};

// Update a child profile
export const updateChildProfile = async (childId, updateData) => {
  try {
    const childRef = doc(db, 'children', childId);
    
    // Don't allow updating parentId through this method
    const { parentId, ...safeUpdateData } = updateData;
    
    await updateDoc(childRef, {
      ...safeUpdateData,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete a child profile
export const deleteChildProfile = async (userId, childId) => {
  try {
    // Get child profile to verify ownership
    const childRef = doc(db, 'children', childId);
    const childDoc = await getDoc(childRef);
    
    if (!childDoc.exists()) {
      throw new Error('Child profile not found');
    }
    
    const childData = childDoc.data();
    
    // Verify that the user is the parent of this child
    if (childData.parentId !== userId) {
      throw new Error('You do not have permission to delete this profile');
    }
    
    // Delete the child document
    await deleteDoc(childRef);
    
    // Remove child ID from user's children array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      children: arrayRemove(childId)
    });
    
    // Also remove from any co-parents' lists
    if (childData.coParentIds && childData.coParentIds.length > 0) {
      for (const coParentId of childData.coParentIds) {
        const coParentRef = doc(db, 'users', coParentId);
        const coParentDoc = await getDoc(coParentRef);
        
        if (coParentDoc.exists()) {
          // Check if coParent has this child in their shared children list
          const coParentData = coParentDoc.data();
          if (coParentData.coParents) {
            for (let i = 0; i < coParentData.coParents.length; i++) {
              const coParent = coParentData.coParents[i];
              if (coParent.children && coParent.children.includes(childId)) {
                // Remove this child ID from the children array
                coParent.children = coParent.children.filter(id => id !== childId);
                
                // Update the co-parent document
                await updateDoc(coParentRef, {
                  coParents: coParentData.coParents
                });
                break;
              }
            }
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Update child toxic categories settings
export const updateToxicCategories = async (childId, categories) => {
  try {
    const childRef = doc(db, 'children', childId);
    
    await updateDoc(childRef, {
      'settings.toxicCategories': categories,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Update grooming detection settings
export const updateGroomingSettings = async (childId, groomingSettings) => {
  try {
    const childRef = doc(db, 'children', childId);
    
    await updateDoc(childRef, {
      'settings.groomingDetection': groomingSettings,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Update whitelist words
export const updateWhitelist = async (childId, whitelist) => {
  try {
    const childRef = doc(db, 'children', childId);
    
    await updateDoc(childRef, {
      'settings.whitelist': whitelist,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (childId, threshold, enabled) => {
  try {
    const childRef = doc(db, 'children', childId);
    
    await updateDoc(childRef, {
      'settings.notificationThreshold': threshold,
      'settings.notificationsEnabled': enabled,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Share a child profile with a co-parent
export const shareChildWithCoParent = async (childId, coParentId) => {
  try {
    const childRef = doc(db, 'children', childId);
    const childDoc = await getDoc(childRef);
    
    if (!childDoc.exists()) {
      throw new Error('Child profile not found');
    }
    
    // Add co-parent ID to child's co-parents array
    await updateDoc(childRef, {
      coParentIds: arrayUnion(coParentId),
      updatedAt: new Date()
    });
    
    // Update the co-parent relationship to include this child
    const childData = childDoc.data();
    const parentId = childData.parentId;
    
    const parentRef = doc(db, 'users', parentId);
    const parentDoc = await getDoc(parentRef);
    
    if (parentDoc.exists()) {
      const parentData = parentDoc.data();
      let updated = false;
      
      if (parentData.coParents) {
        for (let i = 0; i < parentData.coParents.length; i++) {
          if (parentData.coParents[i].userId === coParentId) {
            // Add child ID to children array if not already present
            if (!parentData.coParents[i].children) {
              parentData.coParents[i].children = [childId];
            } else if (!parentData.coParents[i].children.includes(childId)) {
              parentData.coParents[i].children.push(childId);
            }
            updated = true;
            break;
          }
        }
      }
      
      if (updated) {
        await updateDoc(parentRef, {
          coParents: parentData.coParents
        });
      }
    }
    
    // Do the same for the co-parent's document
    const coParentRef = doc(db, 'users', coParentId);
    const coParentDoc = await getDoc(coParentRef);
    
    if (coParentDoc.exists()) {
      const coParentData = coParentDoc.data();
      let updated = false;
      
      if (coParentData.coParents) {
        for (let i = 0; i < coParentData.coParents.length; i++) {
          if (coParentData.coParents[i].userId === parentId) {
            // Add child ID to children array if not already present
            if (!coParentData.coParents[i].children) {
              coParentData.coParents[i].children = [childId];
            } else if (!coParentData.coParents[i].children.includes(childId)) {
              coParentData.coParents[i].children.push(childId);
            }
            updated = true;
            break;
          }
        }
      }
      
      if (updated) {
        await updateDoc(coParentRef, {
          coParents: coParentData.coParents
        });
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Remove sharing of a child profile with a co-parent
export const removeChildSharing = async (childId, coParentId) => {
  try {
    const childRef = doc(db, 'children', childId);
    const childDoc = await getDoc(childRef);
    
    if (!childDoc.exists()) {
      throw new Error('Child profile not found');
    }
    
    // Remove co-parent ID from child's co-parents array
    await updateDoc(childRef, {
      coParentIds: arrayRemove(coParentId),
      updatedAt: new Date()
    });
    
    // Update the co-parent relationship to remove this child
    const childData = childDoc.data();
    const parentId = childData.parentId;
    
    const parentRef = doc(db, 'users', parentId);
    const parentDoc = await getDoc(parentRef);
    
    if (parentDoc.exists()) {
      const parentData = parentDoc.data();
      let updated = false;
      
      if (parentData.coParents) {
        for (let i = 0; i < parentData.coParents.length; i++) {
          if (parentData.coParents[i].userId === coParentId && parentData.coParents[i].children) {
            // Remove child ID from children array
            parentData.coParents[i].children = parentData.coParents[i].children.filter(id => id !== childId);
            updated = true;
            break;
          }
        }
      }
      
      if (updated) {
        await updateDoc(parentRef, {
          coParents: parentData.coParents
        });
      }
    }
    
    // Do the same for the co-parent's document
    const coParentRef = doc(db, 'users', coParentId);
    const coParentDoc = await getDoc(coParentRef);
    
    if (coParentDoc.exists()) {
      const coParentData = coParentDoc.data();
      let updated = false;
      
      if (coParentData.coParents) {
        for (let i = 0; i < coParentData.coParents.length; i++) {
          if (coParentData.coParents[i].userId === parentId && coParentData.coParents[i].children) {
            // Remove child ID from children array
            coParentData.coParents[i].children = coParentData.coParents[i].children.filter(id => id !== childId);
            updated = true;
            break;
          }
        }
      }
      
      if (updated) {
        await updateDoc(coParentRef, {
          coParents: coParentData.coParents
        });
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};
