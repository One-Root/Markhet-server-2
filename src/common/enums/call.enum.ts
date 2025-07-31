enum CallType {
  VOICE = 'voice',
  CONFERENCE = 'conference',
  NOT_FOUND = 'not-found',
}

enum CallStatus {
  BUSY = 'busy',
  FAILED = 'failed',
  RINGING = 'ringing',
  TIMEOUT = 'timeout',
  NO_ANSWER = 'no-answer',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
}

enum CallCategory {
  MISSED = 'missed',
  DIALED = 'dialed',
  RECEIVED = 'received',
}

export { CallType, CallStatus, CallCategory };
