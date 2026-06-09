# Breakeven Calculation

How the system computes the couple's financial breakeven in real time.
The `recalculateBreakeven` Cloud Function is triggered by three Firestore events
and updates the budget document's breakeven fields atomically.

```mermaid
sequenceDiagram
    participant FS as Firestore
    participant CF as Cloud Function trigger (recalculateBreakeven)

    Note over CF: Three Firestore triggers call recalculateBreakeven

    rect rgb(250, 248, 240)
        Note over FS,CF: Trigger A — New expense written to budgetExpenses/{expenseId}
        FS->>CF: onCreate trigger fires
        CF->>CF: recalculateBreakeven(coupleId)
    end

    rect rgb(240, 250, 240)
        Note over FS,CF: Trigger B — Gift logged to guestGifts/{giftId}
        FS->>CF: onCreate trigger fires
        CF->>CF: recalculateBreakeven(coupleId)
    end

    rect rgb(240, 245, 255)
        Note over FS,CF: Trigger C — Guest RSVP updated in guests/{guestId}
        FS->>CF: onUpdate trigger fires (rsvpStatus changed to 'confirmed')
        CF->>FS: getDoc(doc(db, 'budget', coupleId))
        FS-->>CF: { averageGiftPerGuest }
        CF->>FS: setDoc(doc(db, 'guestGifts', guestId + '_estimated'), { coupleId, guestId, estimatedAmount: avgGift, isEstimate: true })
        CF->>CF: recalculateBreakeven(coupleId)
    end

    Note over CF,FS: recalculateBreakeven — runs after each trigger

    CF->>FS: getDocs(query(collection(db, 'budgetExpenses'), where('coupleId', '==', coupleId)))
    CF->>FS: getDocs(query(collection(db, 'guestGifts'), where('coupleId', '==', coupleId), where('isEstimate', '==', false)))
    CF->>FS: getDocs(query(collection(db, 'guestGifts'), where('coupleId', '==', coupleId), where('isEstimate', '==', true)))
    CF->>FS: getDocs(query(collection(db, 'guests'), where('coupleId', '==', coupleId), where('rsvpStatus', '==', 'confirmed')))

    FS-->>CF: { totalExpenses: 53500, actualGifts: 22000, estimatedGifts: 12000, confirmedCount: 103 }

    CF->>CF: breakeven = totalExpenses − (actualGifts + estimatedGifts)
    Note over CF: breakeven = 53500 − 34000 = 19500 (deficit)

    CF->>CF: rsvpBreakeven = totalExpenses − (actualGifts + avgGift × confirmedCount)
    Note over CF: rsvpBreakeven = 53500 − (22000 + 600×103) = −30300 (surplus if all confirm)

    CF->>FS: updateDoc(doc(db, 'budget', coupleId), { breakeven: 19500, rsvpBreakeven: -30300, lastCalculated: serverTimestamp() })

    Note over FS: React Query ['budget'] will pick up the update on next refetch
    Note over FS: Budget card shows deficit (soft red); dashboard card δ badge updates
```
