# Payment Tracking Flow

Full lifecycle of a payment-type task: from initial amount entry through marking the
advance paid, receiving a deadline reminder, and finally closing the task when the
balance is settled.

Payment updates go through the `updatePayment` Cloud Function which atomically
syncs the budget's actual cost and schedules/cancels FCM reminder notifications.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore
    participant CF as Cloud Function (updatePayment)
    participant FCM as Firebase Cloud Messaging

    U->>UI: Open payment task "תשלום מקדמה לאולם"
    UI->>FS: getDoc(doc(db, 'tasks', taskId))
    UI->>FS: getDoc(doc(db, 'taskPayments', taskId))
    FS-->>UI: { task, payment: { total: 35000, advance: 10000, balance: 25000, closingDate, paymentStatus: 'unpaid' } }
    UI-->>U: Payment card — advance / balance / deadline displayed

    Note over U: Couple just paid the venue advance

    U->>UI: Toggle "מקדמה שולמה" ✓
    U->>UI: Enter amount: ₪10,000
    U->>UI: Tap "שמור שינויים"

    UI->>CF: httpsCallable('updatePayment')({ taskId, coupleId, advancePaid: true, advanceAmount: 10000 })

    rect rgb(245, 250, 245)
        Note over CF,FS: Atomic batch (Admin SDK)
        CF->>FS: batch.update(doc(db, 'taskPayments', taskId), { advancePaid: true, advanceAmount: 10000 })
        CF->>FS: batch.update(doc(db, 'budget', coupleId), { actualCost += 10000 in relevant category })
        CF->>FS: batch.commit()
    end

    CF->>FS: addDoc(collection(db, 'scheduledNotifications'), { coupleId, taskId, fireAt: closingDate − 7days, message: "יתרת תשלום לאולם — 7 ימים" })
    CF->>FCM: scheduleMessage(coupleId, fireAt, message)

    CF-->>UI: { payment, budgetDelta: { actualCost: +10000 } }

    UI->>UI: Payment card: advance row shows ✅ paid
    UI->>UI: Balance row shows 🔴 ₪25,000 outstanding
    UI->>UI: Invalidate React Query ['budget'] — donut ring and category bar update
    UI-->>U: Payment progress visible

    Note over FCM: 7 days before deadline — scheduled notification fires

    FCM->>U: Push notification: "תשלום יתרה לאולם — 7 ימים נותרו"

    U->>UI: Opens task from notification deep link
    UI->>FS: getDoc(doc(db, 'taskPayments', taskId))
    FS-->>UI: Current payment state
    UI-->>U: Payment card with balance outstanding

    U->>UI: Toggle "יתרה שולמה" ✓ + amount: ₪25,000
    U->>UI: Tap "שמור שינויים"

    UI->>CF: httpsCallable('updatePayment')({ taskId, coupleId, balancePaid: true, balanceAmount: 25000 })

    rect rgb(245, 250, 245)
        Note over CF,FS: Atomic batch — close task on full payment
        CF->>FS: batch.update(doc(db, 'taskPayments', taskId), { balancePaid: true, paymentStatus: 'fully_paid' })
        CF->>FS: batch.update(doc(db, 'tasks', taskId), { status: 'closed' })
        CF->>FS: batch.update(doc(db, 'budget', coupleId), { actualCost updated for category })
        CF->>FS: batch.delete(scheduled notification doc for taskId)
        CF->>FS: batch.commit()
    end

    CF-->>UI: { payment, task }
    UI->>UI: Task status → "סגור" (sage green badge + strikethrough in list)
    UI-->>U: Task complete ✓
```
