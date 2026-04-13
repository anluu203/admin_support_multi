// Firebase Messaging Service Worker
const urlParams = new URL(location).searchParams;
const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  projectId: urlParams.get('projectId'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
};

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Bỏ qua bước chờ và chiếm quyền kiểm soát ngay lập tức
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// CHỈ SỬ DỤNG onBackgroundMessage ĐỂ XỬ LÝ BACKGROUND
// Xóa toàn bộ listener 'push' cũ
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Tin nhắn mới';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Bạn có một tin nhắn mới',
    icon: '/notification-icon.htm',
    badge: '/message-icon.png',
    data: payload.data || {},
    // Tùy chỉnh thêm các thuộc tính khác nếu cần
    requireInteraction: payload.data?.type === 'urgent',
    actions: [
      { action: 'view', title: 'Mở chat' },
      { action: 'dismiss', title: 'Bỏ qua' }
    ]
  };

  // Trả về promise để đảm bảo Service Worker không bị tắt trước khi hiển thị xong
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Nếu đã có tab chat đang mở thì focus vào đó, nếu không thì mở mới
        for (const client of clientList) {
          if (client.url.includes('/chat') && 'focus' in client) return client.focus();
        }
        return clients.openWindow('/chat');
      })
    );
  }
});