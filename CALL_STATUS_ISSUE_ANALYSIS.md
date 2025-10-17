# Call Status Issue - Ringing vs Call Ended

## 🔴 THE PROBLEM

You're experiencing calls stuck in **"ringing"** status while others properly show **"ended"** statuses (completed/busy/no-answer/etc.).

---

## 📊 CALL STATUS FLOW (Current Implementation)

### Status Update Points:

```
1. initiateCall()          → No status set (NULL initially)
2. answerCall()           → Status = "ringing" (from Plivo)
3. answerCallback()       → Status = "in-progress" or "ringing" 
4. concludeCall()         → Status = "completed"/"no-answer"/"busy"/"timeout"/"failed"
```

### The Critical Endpoints:

| Endpoint | Plivo Event | When Called | Status Updated |
|----------|-------------|-------------|----------------|
| `/calls/answer` | Incoming call received | User A dials service number | `ringing` |
| `/calls/answer-callback` | Dial leg answered/connected | User B picks up (or doesn't) | `in-progress` |
| `/calls/end` | Call ended | Either party hangs up | `completed`/`no-answer`/etc. |
| `/calls/dial-action` | Dial attempt completed | If first dial fails | `busy`/`failed` |

---

## 🐛 ROOT CAUSES

### Issue #1: Missing `concludeCall` Webhook ⚠️ **CRITICAL**

**Problem:** The `/calls/end` endpoint (which calls `concludeCall`) may not be triggered by Plivo in certain scenarios.

**Why it happens:**
```typescript
// In answerCall() - Line 309-327
const dial = response.addDial({
  timeout: '30',
  callerId: toNumber,
  method: 'POST',
  action: `${process.env.SERVER_ENDPOINT}/calls/dial-action`,  // ✅ Has action URL
  dialMusic: `...`,
  callbackUrl: `${process.env.SERVER_ENDPOINT}/calls/answer-callback`,  // ✅ Has callback
  // ❌ MISSING: No hangupUrl configured!
});
```

**Plivo Documentation says:**
- `action` URL is called when dial completes (answered or not)
- `callbackUrl` is called for dial events (answer, connect)
- **BUT** the main call hangup goes to the URL configured in the initial `make_call` or application settings

**Your code doesn't explicitly set where hangup callbacks go!**

### Issue #2: No Fallback for Failed Webhooks

If Plivo sends the `/calls/end` webhook but your server:
- Is temporarily down
- Returns 5xx error
- Takes too long to respond (timeout)

**Result:** Plivo doesn't retry, and the call stays in "ringing" forever.

### Issue #3: `answerCallback` Logic Issue

```typescript
// Line 338-344
async answerCallback(answerCallbackDto: AnswerCallbackDto) {
  const { CallUUID: callUUID, CallStatus: callStatus } = answerCallbackDto;
  const call = await this.findByCallUUID(callUUID);
  await this.update(call.id, { callStatus });
}
```

**Problem:** This blindly updates status to whatever Plivo sends. If Plivo sends "ringing" again, it overwrites previous status.

### Issue #4: No Status Validation

There's no validation that status transitions are valid:
```
❌ POSSIBLE: completed → ringing (shouldn't happen)
❌ POSSIBLE: no-answer → in-progress (shouldn't happen)
```

### Issue #5: Race Condition with Multiple Callbacks

Plivo can send callbacks in this order:
```
1. answerCallback (status: "ringing")
2. answerCallback (status: "in-progress") 
3. dialActionCallback (status: "completed")
4. concludeCall (status: "completed")
```

If #3 arrives before #4, but #4 never arrives, status stays as whatever #3 set.

---

## 🔍 DIAGNOSTIC QUERIES

### Find calls stuck in "ringing" status:

```sql
SELECT 
    id, 
    "callUUID", 
    "callStatus",
    "createdAt",
    EXTRACT(EPOCH FROM (NOW() - "createdAt"))/60 as minutes_old
FROM calls 
WHERE "callStatus" = 'ringing'
  AND "createdAt" < NOW() - INTERVAL '5 minutes'
ORDER BY "createdAt" DESC;
```

### Find calls with incomplete data:

```sql
SELECT 
    id,
    "callUUID",
    "callStatus",
    duration,
    "hangupCause",
    "endStamp"
FROM calls 
WHERE "callStatus" IN ('ringing', 'in-progress')
  AND "createdAt" < NOW() - INTERVAL '10 minutes';
```

---

## 🎯 THE FIXES

### Fix #1: Configure Hangup URL in Call Initiation

**Problem:** You're not making the actual Plivo call anywhere! The `initiateCall` only creates a DB record.

**Looking at the flow:**
1. User A calls `POST /calls/initiate` → Creates DB record
2. User A manually dials service number → Plivo triggers `/calls/answer`
3. Your server connects them

**This means the Plivo call is configured at the Plivo Application level, not in code.**

**Solution:** Configure your Plivo Application to send hangup callbacks:

```
Plivo Dashboard → Voice → Applications → [Your App]
  - Answer URL: https://your-domain.com/calls/answer
  - Hangup URL: https://your-domain.com/calls/end  ← ADD THIS!
```

### Fix #2: Add Hangup URL to XML Response

Update `answerCall()` to specify hangup handling:

```typescript
async answerCall(answerCallDto: AnswerCallDto) {
  // ... existing code ...
  
  const response = Plivo.Response();
  
  // Configure recording with hangup callback
  response.addRecord({
    redirect: 'false',
    maxLength: '3600',
    startOnDialAnswer: 'true',
    recordSession: 'true',
    action: `${process.env.SERVER_ENDPOINT}/calls/recording`,
  });

  const dial = response.addDial({
    timeout: '30',
    callerId: toNumber,
    method: 'POST',
    action: `${process.env.SERVER_ENDPOINT}/calls/dial-action`,
    dialMusic: `${process.env.SERVER_ENDPOINT}/calls/caller-tune/${CallType.VOICE}`,
    callbackUrl: `${process.env.SERVER_ENDPOINT}/calls/answer-callback`,
    hangupOnStar: 'true',  // Allow user to hangup with *
    timeLimit: '3600',      // 1 hour max
    // Note: Plivo sends hangup to the Answer URL by default
  });

  dial.addNumber(call[match].mobileNumber);
  
  await this.update(call.id, payload);
  
  return response.toXML();
}
```

### Fix #3: Add Status Transition Validation

```typescript
// Add this helper method
private isValidStatusTransition(from: CallStatus, to: CallStatus): boolean {
  const validTransitions = {
    [CallStatus.RINGING]: [CallStatus.IN_PROGRESS, CallStatus.NO_ANSWER, CallStatus.BUSY, CallStatus.FAILED, CallStatus.TIMEOUT],
    [CallStatus.IN_PROGRESS]: [CallStatus.COMPLETED, CallStatus.FAILED, CallStatus.BUSY],
    [CallStatus.COMPLETED]: [], // Terminal state
    [CallStatus.NO_ANSWER]: [], // Terminal state
    [CallStatus.BUSY]: [],      // Terminal state
    [CallStatus.FAILED]: [],    // Terminal state
    [CallStatus.TIMEOUT]: [],   // Terminal state
  };

  if (!from) return true; // Initial state
  return validTransitions[from]?.includes(to) ?? false;
}

// Update the update method
async update(id: string, updateCallDto: UpdateCallDto): Promise<Call> {
  const call = await this.findOne(id);

  // Validate status transition
  if (updateCallDto.callStatus && call.callStatus) {
    if (!this.isValidStatusTransition(call.callStatus, updateCallDto.callStatus)) {
      this.logger.warn(
        `Invalid status transition for call ${id}: ${call.callStatus} → ${updateCallDto.callStatus}`
      );
      // Don't update status if transition is invalid
      delete updateCallDto.callStatus;
    }
  }

  Object.assign(call, updateCallDto);
  return this.callRepository.save(call);
}
```

### Fix #4: Add Fallback Status Cleanup Job

Create a scheduled job to clean up stuck calls:

```typescript
// In call.service.ts
async cleanupStuckCalls(): Promise<void> {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  // Find calls stuck in non-terminal states
  const stuckCalls = await this.callRepository.find({
    where: {
      callStatus: In([CallStatus.RINGING, CallStatus.IN_PROGRESS]),
      createdAt: LessThan(fiveMinutesAgo),
    },
  });

  for (const call of stuckCalls) {
    this.logger.warn(`Cleaning up stuck call: ${call.id} (${call.callUUID})`);
    
    // Try to get call details from Plivo
    try {
      const callDetails = await this.client.calls.get(call.callUUID);
      
      // Update with real status from Plivo
      await this.update(call.id, {
        callStatus: this.mapPlivoStatus(callDetails.callState),
        duration: callDetails.duration || 0,
        endStamp: callDetails.endTime || new Date().toISOString(),
      });
    } catch (error) {
      // If Plivo doesn't have the call, mark as failed
      this.logger.error(`Failed to get call details from Plivo: ${error.message}`);
      await this.update(call.id, {
        callStatus: CallStatus.FAILED,
        hangupCause: 'webhook_not_received',
        endStamp: new Date().toISOString(),
      });
    }
  }
}

private mapPlivoStatus(plivoState: string): CallStatus {
  const statusMap = {
    'ANSWER': CallStatus.IN_PROGRESS,
    'HANGUP': CallStatus.COMPLETED,
    'CANCEL': CallStatus.NO_ANSWER,
    'BUSY': CallStatus.BUSY,
    'FAILED': CallStatus.FAILED,
    'NO_ANSWER': CallStatus.NO_ANSWER,
  };
  return statusMap[plivoState] || CallStatus.FAILED;
}
```

### Fix #5: Add Idempotency Check

```typescript
async concludeCall(concludeCallDto: ConcludeCallDto) {
  const { CallUUID: callUUID, ...rest } = concludeCallDto;

  const call = await this.findByCallUUID(callUUID);

  // Idempotency: Don't process if already in terminal state
  const terminalStates = [
    CallStatus.COMPLETED, 
    CallStatus.BUSY, 
    CallStatus.TIMEOUT, 
    CallStatus.NO_ANSWER,
    CallStatus.FAILED
  ];
  
  if (terminalStates.includes(call.callStatus)) {
    this.logger.warn(`Call ${callUUID} already in terminal state: ${call.callStatus}`);
    return; // Already processed
  }

  // Rest of the logic...
  await this.update(call.id, {
    callStatus: concludeCallDto.CallStatus,
    duration: concludeCallDto.Duration,
    // ... rest
  });
}
```

### Fix #6: Add Comprehensive Logging

```typescript
async answerCallback(answerCallbackDto: AnswerCallbackDto) {
  const { CallUUID: callUUID, CallStatus: callStatus } = answerCallbackDto;

  this.logger.log(`Answer callback received: ${callUUID}, status: ${callStatus}`);
  this.logger.debug(`Full callback data: ${JSON.stringify(answerCallbackDto)}`);

  const call = await this.findByCallUUID(callUUID);
  
  this.logger.log(`Current call status: ${call.callStatus} → New status: ${callStatus}`);

  await this.update(call.id, { callStatus });
}
```

---

## 🔧 IMMEDIATE ACTIONS

### 1. Check Plivo Dashboard Configuration ⚡ **DO THIS FIRST**

```
Plivo Dashboard → Voice → Applications → [Your Application]

Required settings:
✅ Answer URL: https://your-domain.com/calls/answer
✅ Answer Method: POST
✅ Hangup URL: https://your-domain.com/calls/end  ← CHECK THIS!
✅ Hangup Method: POST
✅ Message URL: (if using SMS)
```

### 2. Check Your Server Logs

Look for:
- Requests to `/calls/end` endpoint
- Any errors in `concludeCall` method
- Missing callbacks for specific callUUIDs

### 3. Test Plivo Webhook Delivery

```bash
# Check if your server is reachable
curl -X POST https://your-domain.com/calls/end \
  -H "Content-Type: application/json" \
  -d '{"CallUUID":"test-123","CallStatus":"completed","Duration":30}'
```

### 4. Query Your Database

```sql
-- Find pattern in stuck calls
SELECT 
    "callStatus",
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (NOW() - "createdAt"))/60) as avg_minutes_stuck
FROM calls 
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY "callStatus"
ORDER BY count DESC;
```

---

## 📋 SUMMARY OF THE ISSUE

**What's happening:**
1. ✅ User A calls service number → `answerCall()` sets status to "ringing"
2. ✅ User B's phone rings → `answerCallback()` keeps status as "ringing" or "in-progress"
3. ❌ Call ends → `/calls/end` webhook **NOT BEING CALLED** or **FAILING**
4. ❌ Call stuck in "ringing" forever

**Most likely cause:**
- **Hangup URL not configured in Plivo Application settings**
- **OR** Webhooks failing but no retry/fallback mechanism

**Quick fix:**
1. Add Hangup URL in Plivo Dashboard
2. Add cleanup job for stuck calls
3. Add logging to track webhook delivery

**Long-term fix:**
- Implement all 6 fixes above
- Add monitoring/alerting for stuck calls
- Add idempotency and status validation
- Query Plivo API as fallback

---

## 🎯 TESTING THE FIX

After implementing fixes, test:

```typescript
// Test 1: Normal call
1. Initiate call
2. Answer call
3. Hang up
4. Verify status = "completed"

// Test 2: Unanswered call
1. Initiate call
2. Don't answer
3. Wait for timeout
4. Verify status = "no-answer" or "timeout"

// Test 3: Busy call
1. Initiate call to busy number
2. Verify status = "busy"

// Test 4: Network failure simulation
1. Initiate call
2. Block webhook from Plivo
3. Wait 5+ minutes
4. Run cleanup job
5. Verify status updated by polling Plivo API
```

---

**Next Steps:** 
1. Check Plivo Dashboard for Hangup URL configuration
2. Implement the 6 fixes above
3. Add the cleanup scheduled job
4. Add comprehensive logging
5. Monitor for 24 hours

Would you like me to implement these fixes in the code?

