import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Create a new user with email and password
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's profile with display name
    await updateProfile(user, { displayName });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      createdAt: new Date(),
      lastLogin: new Date(),
      children: [],
      coParents: [],
      settings: {
        language: 'en',
        theme: 'light',
        notifications: true
      }
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Sign in a user with email and password
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await updateDoc(userDocRef, {
      lastLogin: new Date()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign out the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get current user profile data from Firestore
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    throw error;
  }
};

// Update user profile information
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: new Date()
    });
    
    // If displayName is included, update it in Firebase Auth as well
    if (profileData.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName
      });
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Update user email
export const updateUserEmail = async (newEmail, password) => {
  try {
    const user = auth.currentUser;
    
    // Re-authenticate the user before updating email
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Update email in Firebase Auth
    await updateEmail(user, newEmail);
    
    // Update email in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      email: newEmail,
      updatedAt: new Date()
    });
    
    // Send verification email
    await sendEmailVerification(user);
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    
    // Re-authenticate the user before updating password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password in Firebase Auth
    await updatePassword(user, newPassword);
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Add a co-parent invitation
export const inviteCoParent = async (userId, coParentEmail) => {
  try {
    // Create invitation in Firestore
    const invitationRef = doc(db, 'coParentInvitations', `${userId}_${coParentEmail}`);
    await setDoc(invitationRef, {
      inviterId: userId,
      email: coParentEmail,
      status: 'pending',
      createdAt: new Date(),
      children: [], // Children IDs that will be shared
    });
    
    // TODO: Send email invitation through Firebase Functions
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Accept co-parent invitation
export const acceptCoParentInvitation = async (invitationId, acceptorId) => {
  try {
    // Update invitation status
    const invitationRef = doc(db, 'coParentInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }
    
    const invitationData = invitationDoc.data();
    
    // Update the invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: new Date(),
      acceptorId
    });
    
    // Update inviter's user document to add co-parent
    const inviterRef = doc(db, 'users', invitationData.inviterId);
    const inviterDoc = await getDoc(inviterRef);
    
    if (inviterDoc.exists()) {
      const inviterData = inviterDoc.data();
      const updatedCoParents = [...(inviterData.coParents || []), {
        userId: acceptorId,
        email: invitationData.email,
        addedAt: new Date(),
        children: invitationData.children
      }];
      
      await updateDoc(inviterRef, {
        coParents: updatedCoParents
      });
    }
    
    // Update acceptor's user document to add co-parent
    const acceptorRef = doc(db, 'users', acceptorId);
    const acceptorDoc = await getDoc(acceptorRef);
    
    if (acceptorDoc.exists()) {
      const acceptorData = acceptorDoc.data();
      const updatedCoParents = [...(acceptorData.coParents || []), {
        userId: invitationData.inviterId,
        addedAt: new Date(),
        children: invitationData.children
      }];
      
      await updateDoc(acceptorRef, {
        coParents: updatedCoParents
      });
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};
