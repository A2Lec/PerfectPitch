"use client";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleDaily(): void {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    // Use periodic sync if available (Chrome/Edge)
    if ("periodicSync" in registration) {
      (registration as any).periodicSync.register("daily-reminder", {
        minInterval: 24 * 60 * 60 * 1000,
      }).catch(() => {
        // Fallback: use simple notification scheduling
        scheduleFallbackNotification();
      });
    } else {
      scheduleFallbackNotification();
    }
  });
}

function scheduleFallbackNotification(): void {
  const now = new Date();
  const target = new Date();
  target.setHours(9, 0, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  const delay = target.getTime() - now.getTime();

  setTimeout(() => {
    showNotification();
    scheduleFallbackNotification();
  }, delay);
}

function showNotification(): void {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("PerfectPitch", {
        body: "C'est l'heure de votre entraînement quotidien !",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png",
        tag: "daily-reminder",
      });
    });
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}
