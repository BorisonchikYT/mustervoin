self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    event.waitUntil(
      self.registration.showNotification(data.title ?? 'MusterVoin', {
        body: data.body ?? 'Не забудь отметить день.',
        icon: '/icon.svg',
      })
    );
  });
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/book'));
  });