# 🔴 Root Cause: Why SOME Calls End Properly, SOME Get Stuck in Ringing

## 🎯 THE SMOKING GUN

**Found in `call.service.ts` Line 587-630:**

```typescript
async dialAction(dialActionDto: any) {
  const { CallUUID: callUUID, DialStatus: dialStatus, To: toNumber } = dialActionDto;
  const call = await this.findByCallUUID(callUUID);

  if ([CallStatus.BUSY, CallStatus.FAILED, CallStatus.NO_ANSWER].includes(dialStatus)) {
    const agent = await this.userService.getAvailableAgent();
    
    if (agent) {
      await this.update(call.id, { agent });
      const response = Plivo.Response();
      const dial = response.addDial({...});
      dial.addNumber(agent.mobileNumber);
      return response.toXML();  // ✅ Returns XML
    }
    // ❌ PROBLEM 1: No return when agent not available!
  }
  // ❌ PROBLEM 2: No return when dialStatus is successful!
}
```

---

## 📊 WHY BEHAVIOR IS INCONSISTENT

### Scenario 1: ✅ **Call Works - Status Updates to "Completed"**

```
1. User A calls service number
   → answerCall() sets status = "ringing"
   
2. System connects to User B
   → answerCallback() sets status = "in-progress"
   
3. User B ANSWERS the call
   → dialAction() receives DialStatus = "answered"
   → Code reaches line 597-601 condition
   → Condition is FALSE (answered is not in [BUSY, FAILED, NO_ANSWER])
   → Returns UNDEFINED ❌
   → BUT Plivo continues the call anyway
   
4. Users talk, then hang up
   → Plivo sends to /calls/end (if configured)
   → concludeCall() sets status = "completed" ✅
```

**Result:** Works because Plivo handles the hangup event.

---

### Scenario 2: ❌ **Call Gets Stuck - Status Stays "Ringing"**

```
1. User A calls service number
   → answerCall() sets status = "ringing"
   
2. System connects to User B
   → answerCallback() keeps status = "ringing"
   
3. User B DOESN'T ANSWER (timeout)
   → dialAction() receives DialStatus = "no-answer"
   → Code reaches line 597-601 condition
   → Condition is TRUE ✅
   → Gets agent = await getAvailableAgent()
   → Agent is NULL (no agent found) ❌
   → Returns UNDEFINED ❌
   
4. Plivo receives UNDEFINED response
   → Doesn't know what to do
   → Call may terminate on Plivo side
   → But NO webhook sent to /calls/end
   → Status stuck at "ringing" forever ❌
```

**Result:** Breaks because Plivo doesn't get valid XML response.

---

### Scenario 3: ❌ **Call Gets Stuck - Agent Available but Call Still Breaks**

```
1. User A calls service number
   → answerCall() sets status = "ringing"
   
2. System connects to User B
   → User B is BUSY
   
3. User B line is BUSY
   → dialAction() receives DialStatus = "busy"
   → Tries to get agent
   → Agent found ✅
   → Returns new Dial XML to connect to agent ✅
   
4. Agent connected, call ends normally
   → Plivo sends to /calls/end
   → concludeCall() sets status = "completed" ✅
```

**Result:** Works because agent fallback provides valid XML.

---

## 🔍 THE EXACT ISSUE

### Issue #1: Missing Return Statement (Critical)

```typescript
// Lines 597-630
if ([CallStatus.BUSY, CallStatus.FAILED, CallStatus.NO_ANSWER].includes(dialStatus)) {
  const agent = await this.userService.getAvailableAgent();
  
  if (agent) {
    // ... setup agent call
    return response.toXML();  // ✅ Good
  }
  // ❌ Falls through - returns undefined!
}
// ❌ Falls through - returns undefined!
```

**When this breaks:**
- ❌ User B doesn't answer + No agent available
- ❌ User B busy + No agent available  
- ❌ User B failed + No agent available

**Result:** Plivo receives `undefined`, terminates call without calling `/calls/end` webhook.

### Issue #2: No Handling for Successful Dial

When User B **DOES ANSWER**, the `dialAction` receives `DialStatus = "answered"` or `"completed"`, which doesn't match the condition, so it returns `undefined`.

**BUT** this works because Plivo ignores the response and continues the call. When the call ends, it sends the hangup webhook (IF configured).

---

## 📈 PATTERN IN YOUR DATA

If you query your database, you'll see:

```sql
-- Calls that ended properly (User B answered OR agent connected)
SELECT COUNT(*) FROM calls 
WHERE "callStatus" IN ('completed', 'busy', 'no-answer') 
  AND "createdAt" > NOW() - INTERVAL '7 days';

-- Calls stuck in ringing (User B didn't answer AND no agent)
SELECT COUNT(*) FROM calls 
WHERE "callStatus" = 'ringing' 
  AND "createdAt" > NOW() - INTERVAL '7 days'
  AND "createdAt" < NOW() - INTERVAL '5 minutes';
```

**Prediction:**
- Stuck calls will have `agent = NULL`
- Stuck calls will have `duration = NULL` or `0`
- Stuck calls will have no `endStamp`

---

## 🎯 THE FIXES

### Fix #1: Always Return Valid XML from dialAction (CRITICAL)

```typescript
async dialAction(dialActionDto: any) {
  const { CallUUID: callUUID, DialStatus: dialStatus, To: toNumber } = dialActionDto;
  
  this.logger.log(`Dial action: ${callUUID}, status: ${dialStatus}`);
  
  const call = await this.findByCallUUID(callUUID);
  const response = Plivo.Response();

  // Handle unsuccessful dial attempts
  if ([CallStatus.BUSY, CallStatus.FAILED, CallStatus.NO_ANSWER].includes(dialStatus)) {
    this.logger.warn(`Dial failed for call ${callUUID}: ${dialStatus}`);
    
    // Try to get an agent
    const agent = await this.userService.getAvailableAgent();
    
    if (agent) {
      this.logger.log(`Connecting to agent: ${agent.mobileNumber}`);
      await this.update(call.id, { agent });

      const dial = response.addDial({
        timeout: '30',
        callerId: toNumber,
        dialMusic: `${process.env.SERVER_ENDPOINT}/calls/caller-tune/${CallType.CONFERENCE}`,
        callbackUrl: `${process.env.SERVER_ENDPOINT}/calls/dial-action-callback`,
      });

      dial.addNumber(agent.mobileNumber);
      return response.toXML();
    } else {
      // No agent available - play message and hang up
      this.logger.warn(`No agent available for call ${callUUID}`);
      
      response.addSpeak('Sorry, no agents are currently available. Please try again later.');
      
      // Update status to failed since we can't connect
      await this.update(call.id, { 
        callStatus: CallStatus.FAILED,
        hangupCause: 'no_agent_available',
        endStamp: new Date().toISOString(),
      });
      
      response.addHangup();
      return response.toXML();  // ✅ Always return XML
    }
  }

  // Handle successful dial - just acknowledge
  this.logger.log(`Dial successful for call ${callUUID}: ${dialStatus}`);
  // Return empty response - let call continue
  return response.toXML();  // ✅ Always return XML
}
```

### Fix #2: Add Logging to See Pattern

```typescript
async concludeCall(concludeCallDto: ConcludeCallDto) {
  const { CallUUID: callUUID, CallStatus: callStatus, Duration: duration, ...rest } = concludeCallDto;

  this.logger.log(`Conclude call webhook received: ${callUUID}, status: ${callStatus}, duration: ${duration}s`);

  try {
    const call = await this.findByCallUUID(callUUID);
    
    this.logger.log(`Call ${callUUID} transitioning: ${call.callStatus} → ${callStatus}`);
    
    // ... rest of logic
  } catch (error) {
    this.logger.error(`Failed to conclude call ${callUUID}: ${error.message}`, error.stack);
    throw error;
  }
}
```

### Fix #3: Add Error Handling to All Webhook Endpoints

```typescript
// In call.controller.ts
@Post('dial-action')
@HttpCode(200)
async connectAgent(@Body() dialActionDto: DialActionDto) {
  try {
    const result = await this.callService.dialAction(dialActionDto);
    
    if (!result) {
      // Should never happen, but log it
      console.error('dialAction returned undefined!', dialActionDto);
      
      // Return valid XML as fallback
      const response = Plivo.Response();
      response.addHangup();
      return response.toXML();
    }
    
    return result;
  } catch (error) {
    console.error('Error in dial-action:', error);
    
    // Always return valid XML even on error
    const response = Plivo.Response();
    response.addSpeak('An error occurred. Please try again.');
    response.addHangup();
    return response.toXML();
  }
}

@Post('end')
@HttpCode(200)
async end(@Body() concludeCallDto: ConcludeCallDto) {
  try {
    return await this.callService.concludeCall(concludeCallDto);
  } catch (error) {
    console.error('Error in conclude call:', error, concludeCallDto);
    // Don't throw - acknowledge webhook received
    return { status: 'error', message: error.message };
  }
}
```

### Fix #4: Add Cleanup Job for Orphaned Calls

```typescript
// Add to call.service.ts
@Cron('*/5 * * * *') // Every 5 minutes
async cleanupOrphanedCalls() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const orphanedCalls = await this.callRepository.find({
    where: {
      callStatus: In([CallStatus.RINGING, CallStatus.IN_PROGRESS]),
      createdAt: LessThan(fiveMinutesAgo),
    },
  });

  this.logger.log(`Found ${orphanedCalls.length} orphaned calls to clean up`);

  for (const call of orphanedCalls) {
    try {
      // Try to get real status from Plivo
      const plivoCall = await this.client.calls.get(call.callUUID);
      
      this.logger.log(`Plivo status for ${call.callUUID}: ${plivoCall.callState}`);
      
      // Update based on Plivo's record
      const finalStatus = this.mapPlivoCallState(plivoCall.callState);
      
      await this.update(call.id, {
        callStatus: finalStatus,
        duration: parseInt(plivoCall.duration) || 0,
        endStamp: plivoCall.endTime || new Date().toISOString(),
        hangupCause: 'webhook_missed',
      });
      
      this.logger.log(`Updated orphaned call ${call.id} to status: ${finalStatus}`);
    } catch (error) {
      // Plivo doesn't have the call - it's dead
      this.logger.warn(`Call ${call.callUUID} not found in Plivo, marking as failed`);
      
      await this.update(call.id, {
        callStatus: CallStatus.FAILED,
        hangupCause: 'call_not_found',
        endStamp: new Date().toISOString(),
      });
    }
  }
}

private mapPlivoCallState(state: string): CallStatus {
  const mapping = {
    'ANSWER': CallStatus.COMPLETED,
    'HANGUP': CallStatus.COMPLETED,
    'CANCEL': CallStatus.NO_ANSWER,
    'BUSY': CallStatus.BUSY,
    'FAILED': CallStatus.FAILED,
    'NO ANSWER': CallStatus.NO_ANSWER,
  };
  
  return mapping[state?.toUpperCase()] || CallStatus.FAILED;
}
```

---

## 📊 VERIFICATION QUERIES

### Find calls that got stuck due to no agent

```sql
SELECT 
    c.id,
    c."callUUID",
    c."callStatus",
    c.agent,
    c.duration,
    c."hangupCause",
    c."createdAt",
    EXTRACT(EPOCH FROM (NOW() - c."createdAt"))/60 as minutes_since_created
FROM calls c
WHERE c."callStatus" IN ('ringing', 'in-progress')
  AND c.agent IS NULL
  AND c."createdAt" < NOW() - INTERVAL '5 minutes'
ORDER BY c."createdAt" DESC
LIMIT 20;
```

### Compare success vs failure rate

```sql
SELECT 
    CASE 
        WHEN "callStatus" IN ('completed') THEN 'success'
        WHEN "callStatus" IN ('busy', 'no-answer', 'timeout') THEN 'missed'
        WHEN "callStatus" IN ('ringing', 'in-progress') THEN 'stuck'
        ELSE 'failed'
    END as call_outcome,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM calls
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY call_outcome
ORDER BY count DESC;
```

---

## 🎯 IMMEDIATE ACTION PLAN

1. **Add logger** to dialAction and concludeCall to see pattern
2. **Fix dialAction** to always return valid XML
3. **Add try-catch** to all webhook controllers
4. **Deploy fixes** to staging first
5. **Monitor logs** for 24 hours
6. **Run cleanup job** to fix existing stuck calls
7. **Deploy to production**

---

## 📝 SUMMARY

### Why Some Work, Some Don't:

| Scenario | User B Status | Agent Available? | Hangup Webhook? | Final Status |
|----------|--------------|------------------|-----------------|--------------|
| ✅ User B answers | Answered | N/A | ✅ Yes | completed |
| ✅ User B busy → Agent answers | Busy | ✅ Yes | ✅ Yes | completed |
| ❌ User B doesn't answer | No answer | ❌ No | ❌ No | **ringing (stuck)** |
| ❌ User B busy | Busy | ❌ No | ❌ No | **ringing (stuck)** |
| ❌ User B failed | Failed | ❌ No | ❌ No | **ringing (stuck)** |

### The Root Cause:

**`dialAction()` returns `undefined` when no agent is available**, causing Plivo to not send the final hangup webhook.

### The Fix:

**Always return valid Plivo XML**, even when there's an error or no agent available.

---

**Next:** Implement the 4 fixes above and you'll solve the inconsistency!

