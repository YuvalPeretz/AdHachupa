# Add Guest Manually

User adds a single guest from the Guest List screen via the FAB (+) button.
The guest is written directly to Firestore; a Cloud Function (or Firestore trigger)
then runs fuzzy duplicate detection and returns any matches.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore
    participant CF as Cloud Function (detectDuplicates)

    U->>UI: Tap FAB (+) on Guest List
    UI-->>U: Bottom sheet — Add Guest form

    U->>UI: Fill: name, phone, email, plusOnes count
    U->>UI: Select invited by (הזוג / הורי כלה / הורי חתן)
    U->>UI: Select events guest is invited to (multi-select chips)
    U->>UI: Tap "שמור"

    UI->>UI: Client-side validate: name is required

    UI->>FS: addDoc(collection(db, 'guests'), { coupleId, name, phone, email, plusOnes, invitedBy, rsvpStatus: 'pending', eventIds[] })
    FS-->>UI: DocumentReference { id: guestId }

    UI->>CF: httpsCallable('detectDuplicates')({ coupleId, guestId, name, phone })

    rect rgb(248, 248, 248)
        Note over CF,FS: Duplicate detection (server-side)
        CF->>FS: getDocs(query(collection(db, 'guests'), where('coupleId', '==', coupleId)))
        FS-->>CF: All existing guest docs for this couple
        CF->>CF: Normalize name (trim, titlecase, strip extra spaces)
        CF->>CF: Exact match on phone number → similarity = 1.0
        CF->>CF: Fuzzy name match (Levenshtein distance ≤ 2) → similarity proportional
        CF->>CF: Filter: similarity ≥ 0.75 AND id != guestId
    end

    CF-->>UI: { duplicates: [{ id, name, phone, similarity }] }

    alt No duplicates
        UI->>UI: Append guest to correct invitedBy section
        UI->>UI: stats.pending += 1 + plusOnes; stats.total += 1 + plusOnes
        UI-->>U: Sheet dismisses, guest visible in list
    else Duplicates found
        UI-->>U: Guest added + duplicate warning banner appears
        UI->>UI: Banner: "⚠️ זוהו כפילויות אפשריות — בדוק"
        Note over UI: Guest is saved regardless — user reviews separately
    end
```
