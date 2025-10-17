# Call Status Explained - Ringing vs End States

## 🎯 Quick Answer

**"Ringing"** = Call is IN PROGRESS (temporary state)
**"End" States** = Call is FINISHED (final states like completed, no-answer, busy, failed)

---

## 📊 Complete Call Status Lifecycle

### Your Call Statuses (from `call.enum.ts`):

```typescript
enum CallStatus {
  RINGING = 'ringing',        // ⏳ Temporary - Phone is ringing
  IN_PROGRESS = 'in-progress', // ⏳ Temporary - Call connected, people talking
  COMPLETED = 'completed',     // ✅ Final - Call ended normally
  BUSY = 'busy',              // ✅ Final - Line was busy
  NO_ANSWER = 'no-answer',    // ✅ Final - No one picked up
  TIMEOUT = 'timeout',        // ✅ Final - Call timed out
  FAILED = 'failed',          // ✅ Final - Technical failure
}
```

---

## 🔄 Call Flow Timeline

### Scenario 1: Successful Call ✅

```
User A dials → Status: null (not set yet)
    ↓
User A calls service number → answerCall() triggered
    ↓
Status: "ringing" ⏳ (User B's phone is ringing)
    ↓
User B picks up → answerCallback() triggered
    ↓
Status: "in-progress" ⏳ (Both users talking)
    ↓
User hangs up → concludeCall() triggered
    ↓
Status: "completed" ✅ (Call ended - FINAL STATE)
```

**Duration in each status:**
- `ringing`: 0-30 seconds (until User B answers or timeout)
- `in-progress`: Variable (as long as they talk)
- `completed`: Forever (final state, never changes)

---

### Scenario 2: Missed Call (No Answer) ❌

```
User A dials → Status: null
    ↓
User A calls service number → answerCall() triggered
    ↓
Status: "ringing" ⏳ (User B's phone is ringing)
    ↓
30 seconds pass, User B doesn't answer
    ↓
dialAction() triggered with DialStatus: "no-answer"
    ↓
Tries to connect to agent → No agent available
    ↓
Status: "failed" ✅ (Call ended - FINAL STATE)
    OR
Status: "no-answer" ✅ (If concludeCall() is called - FINAL STATE)
```

---

### Scenario 3: Busy Line 📵

```
User A dials → Status: null
    ↓
User A calls service number → answerCall() triggered
    ↓
Status: "ringing" ⏳ (Trying to connect to User B)
    ↓
User B's line is busy
    ↓
dialAction() triggered with DialStatus: "busy"
    ↓
Status: "busy" ✅ (Call ended - FINAL STATE)
```

---

## 🎭 What Each Status REALLY Means

### ⏳ Temporary States (Call is Active)

#### 1. **RINGING**
- **When:** Between when User A calls and User B answers
- **Duration:** Usually 0-30 seconds
- **What's happening:** User B's phone is ringing, waiting for pickup
- **Can change to:** 
  - `in-progress` (if answered)
  - `no-answer` (if timeout)
  - `busy` (if line busy)
  - `failed` (if technical error)

**Example in logs:**
```
[LOG] Answer call received: abc-123 from +919876543210
[LOG] Call abc-123 status: null → ringing
```

#### 2. **IN_PROGRESS**
- **When:** After User B picks up, while talking
- **Duration:** As long as the conversation lasts (seconds to hours)
- **What's happening:** Both users are connected and talking
- **Can change to:**
  - `completed` (normal hangup)
  - `failed` (connection lost)

**Example in logs:**
```
[LOG] Answer callback: abc-123, status: in-progress
[LOG] Updating call abc-123 status: ringing → in-progress
```

---

### ✅ Final States (Call is Over - Never Change)

#### 3. **COMPLETED**
- **When:** Call connected successfully and ended normally
- **Duration:** Permanent (never changes)
- **What happened:** Users talked and hung up
- **Triggers:** WhatsApp notification to User B saying "You received a call from..."

**Example in logs:**
```
[LOG] Conclude call webhook: abc-123, status: completed, duration: 120s
[LOG] Call abc-123 transitioning: in-progress → completed
```

#### 4. **NO_ANSWER**
- **When:** User B's phone rang but nobody picked up
- **Duration:** Permanent
- **What happened:** Rang for 30 seconds, then timed out
- **Triggers:** WhatsApp notification saying "You missed a call from..."

**Example in logs:**
```
[LOG] Dial action received: abc-123, status: no-answer
[LOG] No agent available for call abc-123
```

#### 5. **BUSY**
- **When:** User B's line was busy
- **Duration:** Permanent
- **What happened:** User B was on another call

#### 6. **TIMEOUT**
- **When:** Similar to no-answer, but specific timeout reason
- **Duration:** Permanent

#### 7. **FAILED**
- **When:** Technical failure (network issue, invalid number, etc.)
- **Duration:** Permanent
- **What happened:** Something went wrong technically

**Example:**
```
[LOG] No agent available for call abc-123
[LOG] Call abc-123 transitioning: ringing → failed
```

---

## 🐛 THE PROBLEM YOU HAD

### Before the Fix:

```
User A calls → Status: "ringing" ⏳
    ↓
User B doesn't answer
    ↓
dialAction() tries to get agent
    ↓
No agent available
    ↓
Returns undefined ❌ (BUG!)
    ↓
Plivo doesn't know what to do
    ↓
Status STUCK at: "ringing" ❌ (FOREVER!)
```

**Result:** Database shows `callStatus = "ringing"` forever, even though call ended hours ago.

### After the Fix:

```
User A calls → Status: "ringing" ⏳
    ↓
User B doesn't answer
    ↓
dialAction() tries to get agent
    ↓
No agent available
    ↓
Returns valid XML with hangup ✅ (FIXED!)
    ↓
Updates status to "failed" ✅
    ↓
Status: "failed" ✅ (FINAL STATE)
```

**Result:** Database correctly shows `callStatus = "failed"` with reason `no_agent_available`.

---

## 📊 Database Query to See the Difference

### Check Current Call States:

```sql
SELECT 
    "callStatus",
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE "createdAt" < NOW() - INTERVAL '5 minutes') as old_stuck_calls,
    AVG(duration) as avg_duration_seconds
FROM calls 
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY "callStatus"
ORDER BY count DESC;
```

**Before Fix, you'd see:**
```
callStatus   | count | old_stuck_calls | avg_duration
-------------|-------|-----------------|-------------
ringing      | 450   | 380 ⚠️         | 0
completed    | 320   | 0               | 125
no-answer    | 180   | 0               | 0
in-progress  | 85    | 72 ⚠️          | 0
```
*Many old calls stuck in "ringing" or "in-progress"*

**After Fix, you'll see:**
```
callStatus   | count | old_stuck_calls | avg_duration
-------------|-------|-----------------|-------------
completed    | 520   | 0 ✅           | 125
failed       | 280   | 0 ✅           | 0
no-answer    | 180   | 0 ✅           | 0
ringing      | 12    | 0 ✅           | 0
in-progress  | 8     | 0 ✅           | 0
```
*Only currently active calls in "ringing" or "in-progress"*

---

## 🎯 How to Tell if a Call is "Done"

### Simple Rule:

**Temporary (Call Active):**
- `ringing` - Still trying to connect
- `in-progress` - Currently talking

**Final (Call Done):**
- `completed` - Successfully ended
- `no-answer` - Missed call
- `busy` - Line was busy
- `timeout` - Timed out
- `failed` - Technical failure

### In Code:

```typescript
const ACTIVE_STATES = [CallStatus.RINGING, CallStatus.IN_PROGRESS];
const FINAL_STATES = [
  CallStatus.COMPLETED, 
  CallStatus.NO_ANSWER, 
  CallStatus.BUSY, 
  CallStatus.TIMEOUT, 
  CallStatus.FAILED
];

// Check if call is done
const isCallFinished = FINAL_STATES.includes(call.callStatus);

// Check if call is still active
const isCallActive = ACTIVE_STATES.includes(call.callStatus);
```

---

## 🕐 Expected Duration in Each Status

| Status | Expected Duration | If Longer Than | Problem |
|--------|------------------|----------------|---------|
| `ringing` | 5-30 seconds | 2 minutes | Stuck! |
| `in-progress` | Variable (1 sec - hours) | Check if call really active | May be stuck |
| `completed` | Forever | N/A | This is normal |
| `no-answer` | Forever | N/A | This is normal |
| `busy` | Forever | N/A | This is normal |
| `failed` | Forever | N/A | This is normal |

---

## 📈 Real-World Examples from Your System

### Example 1: Normal Call (What Should Happen)
```json
{
  "id": "call-123",
  "callUUID": "abc-def-456",
  "callStatus": "completed",  // ✅ Final state
  "duration": 245,            // 4 minutes 5 seconds
  "createdAt": "2024-01-15T10:30:00Z",
  "endStamp": "2024-01-15T10:34:05Z",
  "from": { "name": "Farmer A" },
  "to": { "name": "Buyer B" },
  "agent": null               // No agent needed
}
```

### Example 2: Stuck Call (The Bug You Had)
```json
{
  "id": "call-456",
  "callUUID": "xyz-789-abc",
  "callStatus": "ringing",    // ❌ Stuck in temporary state!
  "duration": null,           // No duration recorded
  "createdAt": "2024-01-15T08:00:00Z",  // 2.5 hours ago!
  "endStamp": null,           // No end timestamp
  "from": { "name": "Farmer C" },
  "to": { "name": "Buyer D" },
  "agent": null               // Tried to get agent, failed, returned undefined
}
```

### Example 3: Fixed Call (After Our Changes)
```json
{
  "id": "call-789",
  "callUUID": "def-456-ghi",
  "callStatus": "failed",     // ✅ Proper final state
  "duration": 0,              // No conversation
  "createdAt": "2024-01-15T14:20:00Z",
  "endStamp": "2024-01-15T14:20:32Z",
  "hangupCause": "no_agent_available",  // Clear reason
  "from": { "name": "Farmer E" },
  "to": { "name": "Buyer F" },
  "agent": null               // No agent, but handled properly
}
```

---

## 🎓 Summary

### **Ringing**:
- ⏳ **Temporary state** 
- Phone is ringing, waiting for answer
- Should only last **5-30 seconds**
- Must transition to a final state

### **End States** (completed/no-answer/busy/failed/timeout):
- ✅ **Final states**
- Call is over
- **Never change**
- Stay forever in database

### **The Bug**:
Some calls got stuck in "ringing" and never transitioned to end state because code returned `undefined` to Plivo.

### **The Fix**:
Now always returns valid XML to Plivo, ensuring every call transitions to a proper final state.

---

## ✅ How to Verify It's Working

Run this query to find stuck calls:

```sql
-- Should return 0 rows (or very few active calls)
SELECT 
    id,
    "callUUID",
    "callStatus",
    "createdAt",
    NOW() - "createdAt" as time_stuck
FROM calls 
WHERE "callStatus" IN ('ringing', 'in-progress')
  AND "createdAt" < NOW() - INTERVAL '5 minutes'
ORDER BY "createdAt" DESC;
```

**Before fix:** Hundreds of rows
**After fix:** 0 rows (except truly active calls)

---

**Bottom line:** "Ringing" is temporary (like "waiting in line"), "Ended" states are permanent (like "transaction complete"). Your bug was calls getting stuck "waiting in line" forever! Now fixed. ✅

