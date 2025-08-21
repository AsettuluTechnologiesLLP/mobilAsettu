// src/utils/permission.ts
import { Alert, Platform } from 'react-native';
import {
  check,
  checkNotifications,
  openSettings,
  PERMISSIONS,
  request,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

import logger from '../utils/logger';

const isAndroid = Platform.OS === 'android';
const ANDROID_API = isAndroid ? Number(Platform.Version) : 0;

// ---------- shared helper ----------
async function askIfNeeded(permission: string, label: string): Promise<boolean> {
  try {
    const status = await check(permission as any);
    if (status === RESULTS.GRANTED) return true;

    const next = await request(permission as any);
    if (next === RESULTS.GRANTED) return true;

    if (next === RESULTS.BLOCKED) {
      Alert.alert(
        `${label} Permission`,
        `Please enable ${label} permission in Settings to use this feature.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    } else {
      Alert.alert(
        `${label} Permission`,
        `${label} permission was not granted. Some features may not work.`,
      );
    }
    logger.warn(`Permission denied: ${label} (${permission}) → ${next}`);
    return false;
  } catch (e) {
    logger.error(`Permission error: ${label}`, e);
    return false;
  }
}

// ---------- 1) Location (When in Use) ----------
export async function requestLocationWhenInUse(): Promise<boolean> {
  const perm = isAndroid
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION // precise; OS may downscope to coarse
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  return askIfNeeded(perm, 'Location');
}

// ---------- 2) Camera (Photo/Video) ----------
export async function requestCameraPermission(): Promise<boolean> {
  const perm = isAndroid ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
  return askIfNeeded(perm, 'Camera');
}

// ---------- 3) Photos / Media – Read (Gallery) ----------
export async function requestMediaRead(): Promise<boolean> {
  if (isAndroid) {
    if (ANDROID_API >= 33) {
      // Ask both images + video since your app can pick either
      const okImages = await askIfNeeded(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, 'Photos');
      const okVideo = await askIfNeeded(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO, 'Videos');
      return okImages && okVideo;
    }
    // API ≤ 32
    return askIfNeeded(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, 'Storage');
  } else {
    // iOS reads from the photo library
    return askIfNeeded(PERMISSIONS.IOS.PHOTO_LIBRARY, 'Photo Library');
  }
}

// ---------- 4) Photos / Media – Write (Save to Gallery) ----------
export async function requestMediaWrite(): Promise<boolean> {
  if (isAndroid) {
    // Modern Android (10+) saves via MediaStore; no separate runtime permission required.
    // For legacy API ≤ 28 you might need WRITE_EXTERNAL_STORAGE, but we avoid it unless necessary.
    return true;
  } else {
    // iOS needs the "Add Only" permission for saving to Photos
    return askIfNeeded(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY, 'Photo Library (Add)');
  }
}

// ---------- 5) Contacts – Read ----------
export async function requestContactsRead(): Promise<boolean> {
  const perm = isAndroid ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS;
  return askIfNeeded(perm, 'Contacts');
}

// ---------- 6) Notifications (Push) ----------
export async function requestNotificationsIfNeeded(): Promise<boolean> {
  if (isAndroid) {
    if (ANDROID_API < 33) return true; // no runtime permission prior to Android 13
    const post = (PERMISSIONS.ANDROID as any).POST_NOTIFICATIONS;
    if (!post) return true;
    return askIfNeeded(post, 'Notifications');
  } else {
    const current = await checkNotifications();
    if (current.status === 'granted') return true;

    const { status } = await requestNotifications(['alert', 'sound', 'badge']);
    if (status === 'granted') return true;

    Alert.alert('Notifications', 'Please enable notifications in Settings to stay updated.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => openSettings() },
    ]);
    logger.warn('Notification permission denied (iOS)', current);
    return false;
  }
}

// ---------- Optional bulk: exactly these six ----------
export async function requestAppPermissions(): Promise<boolean> {
  const results = await Promise.all([
    requestLocationWhenInUse(),
    requestCameraPermission(),
    requestMediaRead(),
    requestMediaWrite(),
    requestContactsRead(),
    requestNotificationsIfNeeded(),
  ]);

  if (results.includes(false)) {
    Alert.alert(
      'Permissions',
      'Some permissions were not granted. Certain features may be limited.',
    );
    return false;
  }
  return true;
}
