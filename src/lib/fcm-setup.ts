
"use client"

import { Auth } from 'firebase/auth';
import { Database, ref, update } from 'firebase/database';

/**
 * دالة لطلب إذن الإشعارات الفيزيائية وتخزين التوكن.
 * ملاحظة: تتطلب هذه الميزة ضبط VAPID Key في لوحة تحكم Firebase Cloud Messaging.
 */
export async function requestNotificationPermission(auth: Auth, database: Database) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn("إشعارات المتصفح غير مدعومة على هذا الجهاز.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // هنا مستقبلاً يتم جلب getToken من FCM وربطه بحساب المستخدم في RTDB
      // هذا الجزء يتطلب ملف firebase-messaging-sw.js في مجلد public
      
      if (auth.currentUser) {
        await update(ref(database, `users/${auth.currentUser.uid}`), {
          notificationsEnabled: true,
          notificationsPermissionTimestamp: Date.now()
        });
      }
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
}
