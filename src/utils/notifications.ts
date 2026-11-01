/**
 * Notification, Speech Synthesis, and Service Worker alarm dispatcher
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function speakAnnouncement(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}

export function showMobileTimeStartNotification() {
  const title = 'Aegis Guard: Mobile Time Active';
  const body = 'Your mobile time is start';

  // 1. Voice announcement if available
  speakAnnouncement('Your mobile time is start');

  // 2. Browser / System notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          tag: 'timer-started',
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      }
    } catch {
      // Fallback ignored
    }
  }

  // 3. Android vibration
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
}

export function scheduleBackgroundAlarm(delayMs: number) {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_ALARM',
        delay: Math.max(0, delayMs),
        title: 'Focus Time Expired!',
        body: 'Productivity timer finished! Device Policy has locked selected apps.',
        tag: 'timer-alarm',
        requireInteraction: true,
      });
    } catch {
      // Ignored
    }
  }
}

export function triggerTimerExpiredNotification() {
  const title = '⏰ Focus Timer Expired!';
  const body = 'Your allocated productivity time is over. Selected apps are locked by Device Policy.';

  speakAnnouncement('Productivity timer expired. Apps locked by Device Policy.');

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          tag: 'timer-alarm-now',
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      }
    } catch {
      // Ignored
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([600, 200, 600, 200, 1000]);
  }
}
