# Duplicate Guest Detection & Resolution

Triggered automatically after each guest add (see sequences/guests/01-add-guest.md).
User can merge duplicates or dismiss them as intentional distinct guests.

Merge is an atomic operation handled by the `mergeGuests` Cloud Function —
it unions the two guests' eventIds and deletes the secondary document in a single batch.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore
    participant CF as Cloud Function (mergeGuests)

    Note over UI: Banner shown after guest add returns duplicates[]

    U->>UI: Tap "⚠️ זוהו כפילויות אפשריות — בדוק" banner

    UI->>CF: httpsCallable('detectDuplicates')({ coupleId })

    rect rgb(248, 248, 248)
        Note over CF,FS: Full duplicate scan (server-side)
        CF->>FS: getDocs(query(collection(db, 'guests'), where('coupleId', '==', coupleId)))
        FS-->>CF: All guest docs for this couple
        CF->>CF: Normalize all names (strip nikud, lowercase, trim)
        CF->>CF: Exact match on phone number → similarity = 1.0
        CF->>CF: Fuzzy name match (Levenshtein distance ≤ 2) → similarity proportional
        CF->>CF: Group overlapping pairs, deduplicate groups
        CF->>CF: Filter: similarity ≥ 0.75 AND pair not in dismissedDuplicates
    end

    CF-->>UI: { groups: [{ guests: [A, B], similarity: 0.92, reason: "phone_match" }, ...] }
    UI-->>U: Duplicate Review list — each group shows pair with reason label

    loop For each duplicate group
        U->>UI: Reviews pair: "יעל לוי" vs "יעל לוי-כהן" (same phone)

        alt User chooses Merge
            U->>UI: Tap "מזג" — picks primary record
            UI->>CF: httpsCallable('mergeGuests')({ primaryId: A, secondaryId: B })

            rect rgb(245, 250, 245)
                Note over CF,FS: Atomic batch (Admin SDK)
                CF->>FS: getDoc(doc(db, 'guests', A))
                CF->>FS: getDoc(doc(db, 'guests', B))
                CF->>CF: mergedEventIds = union(A.eventIds, B.eventIds)
                CF->>FS: batch.update(doc(db, 'guests', A), { eventIds: mergedEventIds })
                CF->>FS: batch.delete(doc(db, 'guests', B))
                CF->>FS: batch.commit()
            end

            CF-->>UI: { mergedGuest }
            UI->>UI: Remove group from duplicate list
            UI->>UI: Invalidate React Query ['guests'] cache — secondary guest disappears
            UI-->>U: "אוחד בהצלחה ✓"

        else User chooses Keep Both
            U->>UI: Tap "שמור בנפרד"
            UI->>FS: addDoc(collection(db, 'dismissedDuplicates'), { coupleId, guestId1: A, guestId2: B })
            FS-->>UI: Write acknowledged
            UI->>UI: Remove group from duplicate review list
        end
    end

    UI->>UI: All groups resolved → hide duplicate banner
    UI-->>U: "כל הכפילויות טופלו ✓"
```
