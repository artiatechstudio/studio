
"use client"

import { Auth } from 'firebase/auth';
import { Database, ref, update } from 'firebase/database';

/**
 * دالة لطلب إذن الإشعارات الفيزيائية وتخزين التوكن.
 * ملاحظة: تتطلب هذه الميزة ضبط VAPID Key في لوحة تحكم Firebase Cloud Messaging.
 */
export async function requestNotificationPermission(auth: Auth, database: Database) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // هنا مستقبلاً يتم جلب getToken من FCM وربطه بحساب المستخدم في RTDB
      // للسماح للسيرفر بإرسال إشعارات لهذا الجهاز تحديداً.
      if (auth.currentUser) {
        await update(ref(database, `users/${auth.currentUser.uid}`), {
          notificationsEnabled: true
        });
      }
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
}
