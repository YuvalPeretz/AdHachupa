# Create New Task

User taps the FAB (+) on the Tasks screen. A bottom sheet slides up with the full task form.
Task creation is a direct Firestore write. The task type determines which sub-type
detail document is created alongside the base task document.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore

    U->>UI: Tap FAB (+) on Tasks screen
    UI-->>U: Bottom sheet slides up "משימה חדשה"

    U->>UI: Type task name (e.g. "הדפסת הזמנות")
    U->>UI: Select type icon: Vendor / Payment / Decision / Reminder
    U->>UI: Select category chip (e.g. הזמנות)
    U->>UI: Select priority chip (הכרחי / לוגיסטי / אסתטי / אישי)
    U->>UI: Select event from dropdown
    U->>UI: Pick due date (optional)
    U->>UI: Select responsible person (avatar chip — partner 1 or 2)

    U->>UI: Tap "הוסף משימה"
    UI->>UI: Validate: name must not be empty

    UI->>FS: addDoc(collection(db, 'tasks'), { coupleId, eventId, name, type, category, priority, status: 'not_started', closingDate, responsible })
    FS-->>UI: DocumentReference { id: taskId }

    alt type == 'payment'
        UI->>FS: setDoc(doc(db, 'taskPayments', taskId), { coupleId, estimatedCost: 0, billingUnit: 'per_item', advancePaid: false, balancePaid: false, paymentStatus: 'unpaid' })
    else type == 'vendor'
        UI->>FS: setDoc(doc(db, 'taskVendorConfigs', taskId), { coupleId, vendorOptions: [] })
    else type == 'decision'
        UI->>FS: setDoc(doc(db, 'taskDecisions', taskId), { coupleId, options: [], finalDecision: null })
    else type == 'reminder'
        UI->>FS: setDoc(doc(db, 'taskReminders', taskId), { coupleId, reminderDate: closingDate, notifyEnabled: true, linkedTaskId: null })
    end

    FS-->>UI: Write acknowledged

    UI->>UI: Dismiss bottom sheet
    UI->>UI: Invalidate React Query ['tasks'] — task row inserted in correct category section
    UI-->>U: Task appears with "טרם התחיל" badge (gray outline)
```
