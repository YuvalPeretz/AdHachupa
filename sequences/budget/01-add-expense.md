# Add Expense

User taps FAB (+) on the Budget screen to log a new expense item.
Key behaviour: selecting "per guest" billing unit triggers a live total calculation
based on confirmed/expected guest count read directly from Firestore.

The expense is written directly to Firestore. A Firestore-triggered Cloud Function
(`recalculateBreakeven`) fires after each write to update the budget summary.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore
    participant CF as Cloud Function trigger (recalculateBreakeven)

    U->>UI: Tap FAB (+) on Budget screen
    UI-->>U: Bottom sheet "הוסף הוצאה"

    U->>UI: Enter item name: "הדפסת הזמנות"
    U->>UI: Select category chip: הזמנות
    U->>UI: Select billing unit: "per item" (לפי פריט)
    U->>UI: Enter estimated cost: ₪800

    Note over U: User realises invitations are priced per guest

    U->>UI: Switch billing unit to "per guest" (לפי אורח)

    UI->>FS: getDoc(doc(db, 'events', eventId))
    FS-->>UI: { guestCountExpected: 180 }

    UI-->>U: Hint: "מחיר ליחידה × 180 אורחים"
    U->>UI: Enter unit price: ₪15
    UI->>UI: Live calculate: ₪15 × 180 = ₪2,700 (updated on each keystroke)
    UI-->>U: Total field shows ₪2,700

    U->>UI: Select priority: "רשות"
    U->>UI: Select event: חתונה
    U->>UI: Select responsible: עדי

    U->>UI: Tap "הוסף הוצאה"

    UI->>FS: addDoc(collection(db, 'budgetExpenses'), { coupleId, name, category: 'invitations', estimatedCost: 2700, actualCost: null, billingUnit: 'per_guest', unitPrice: 15, guestCount: 180, eventId, priority: 'optional', responsible })
    FS-->>UI: DocumentReference { id: expenseId }

    Note over CF: Firestore onCreate trigger fires on budgetExpenses/{expenseId}
    CF->>FS: updateDoc(doc(db, 'budget', coupleId), { categories.invitations.allocated += 2700 })
    CF->>CF: recalculateBreakeven(coupleId) — see sequences/budget/02-breakeven-calculation.md

    UI->>UI: Invalidate React Query ['budget'] — re-fetches updated budget doc
    UI->>UI: New row appears in הזמנות category breakdown
    UI->>UI: Donut ring and "נותרו" chip reflect new allocation
    UI-->>U: Sheet dismisses — expense visible in list
```
