# RSVP Status Update

User opens a guest's detail page and updates their RSVP status.
Uses optimistic UI — the chip updates immediately, reverts on failure.
All reads and writes are direct Firestore operations via React Query.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore

    U->>UI: Tap guest row in Guest List
    UI->>FS: getDoc(doc(db, 'guests', guestId))
    FS-->>UI: guest record
    UI-->>U: Guest Detail screen (current status: ממתין)

    U->>UI: Tap chip "אישר"

    UI->>UI: Optimistic update — chip colour: ממתין (amber) → אישר (sage green)
    Note over UI: UI feels instant; Firestore write runs in background

    UI->>FS: updateDoc(doc(db, 'guests', guestId), { rsvpStatus: 'confirmed', updatedAt: serverTimestamp() })

    alt Write succeeds
        FS-->>UI: Write acknowledged
        UI->>UI: Invalidate React Query ['guests'] cache
        UI->>UI: Stats grid re-fetches and updates confirmed/pending counts
        UI-->>U: Changes saved
    else Write fails (network error / rules rejection)
        FS-->>UI: FirestoreError
        UI->>UI: Revert chip to previous status (ממתין)
        UI-->>U: Toast: "שמירה נכשלה — נסה שוב"
    end

    U->>UI: Edit additional fields (notes, tableNo, eventIds[])
    U->>UI: Tap "שמור שינויים"
    UI->>FS: updateDoc(doc(db, 'guests', guestId), { notes, tableNo, eventIds[], updatedAt: serverTimestamp() })
    FS-->>UI: Write acknowledged
    UI-->>U: Navigate back to Guest List
```
