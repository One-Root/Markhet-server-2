// event queue enum
enum EventQueue {
  DEFAULT = 'default',
  NOTIFICATION = 'notification',
}

// default event enum
enum DefaultEvent {
  LOG = 'log',
}

// notification event enum
enum NotificationEvent {
  PUSH = 'send-push',
  SMS = 'send-sms',
  WHATSAPP = 'send-whatsapp',
  APP = 'send-app',
  CHATRACE_RTH = 'send-RTH-chatrace',
}

export { EventQueue, DefaultEvent, NotificationEvent };
