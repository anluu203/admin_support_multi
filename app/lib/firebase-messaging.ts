import {
  getMessaging,
  getToken,
  MessagePayload,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { getApp } from "./firebase";
import { adminChatApi } from "../features/admin-chat/api/adminChatApi";

let messaging: Messaging | null = null;

export function getFirebaseMessaging(): Messaging {
  if (!messaging) {
    messaging = getMessaging(getApp());
  }
  return messaging;
}

async function registerServiceWorker(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    console.log("[FCM] Registering service worker...");
    // Truyền cấu hình qua tham số URL thay vì dùng postMessage dễ bị xịt khi SW chưa active
    const firebaseConfig = new URLSearchParams({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    }).toString();

    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${firebaseConfig}`,
    );
    // Chờ cho đến khi Service Worker thực sự vào trạng thái 'active'
    await navigator.serviceWorker.ready;
    console.log("[FCM] Service worker registered successfully with URL params");
    return registration;
  } else {
    console.warn("[FCM] Service workers not supported");
    return undefined;
  }
}
export async function requestNotificationPermission(adminId: string) {
  if (typeof window === "undefined") return;
  console.log("[FCM] Requesting notification permission for admin:", adminId);
  const permission = await Notification.requestPermission();
  console.log("[FCM] Notification permission:", permission);
  if (permission === "granted") {
    // Đăng ký service worker trước và lấy object registration
    const registration = await registerServiceWorker();

    const messaging = getFirebaseMessaging();
    console.log("[FCM] Getting FCM token...");
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    console.log("[FCM] FCM token obtained:", token);
    // Gửi token về backend để lưu
    console.log("[FCM] Sending token to backend...");
    await adminChatApi.saveFcmToken(token);
    console.log("[FCM] Token sent to backend successfully");
    return token;
  }
  console.log("[FCM] Notification permission denied");
  return null;
}

export function listenForegroundNotification(
  onPush: (payload: MessagePayload) => void,
) {
  if (typeof window === "undefined") return;
  console.log("[FCM] Setting up foreground notification listener");
  const messaging = getFirebaseMessaging();
  onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message received:", payload);
    onPush(payload);
  });
}

export async function requestNotificationPermissionWithConfirm(
  adminId: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  console.log("[FCM] Showing confirm dialog for notification permission");

  const confirmed = window.confirm(
    "Bạn có muốn nhận thông báo push khi có tin nhắn mới từ khách hàng?\n\n" +
      "Điều này sẽ giúp bạn không bỏ lỡ tin nhắn quan trọng khi đang làm việc khác.",
  );

  if (!confirmed) {
    console.log("[FCM] Người dùng từ chối nhận thông báo");
    return false;
  }

  console.log("[FCM] Người dùng chấp nhận, tiếp tục yêu cầu quyền thông báo");
  const token = await requestNotificationPermission(adminId);
  return token !== null;
}
