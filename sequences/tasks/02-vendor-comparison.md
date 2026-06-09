# Vendor Comparison & Selection

User opens a vendor-type task, adds multiple vendor options, compares them, and locks
in one as the selected vendor.

Adding and editing individual vendors is a direct Firestore write.
Selecting a vendor is atomic (updates the chosen vendor to "selected", all others to
"rejected", and the task status to "in_progress") — this goes through the
`selectVendor` Cloud Function.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Frontend
    participant FS as Firestore
    participant CF as Cloud Function (selectVendor)

    U->>UI: Open task "בחירת דיג'יי"
    UI->>FS: getDoc(doc(db, 'tasks', taskId))
    UI->>FS: getDocs(query(collection(db, 'vendors'), where('taskId', '==', taskId)))
    FS-->>UI: { task, vendors: [] }
    UI-->>U: Task Detail screen — vendor type, no vendors yet

    loop Adding vendor options
        U->>UI: Tap "+ הוסף ספק"
        UI-->>U: Inline vendor form

        U->>UI: Fill: name, priceMin, priceMax, email, phone, paymentTerms
        U->>UI: Set star rating (1–5, manual)
        U->>UI: Tap "הוסף"

        UI->>FS: addDoc(collection(db, 'vendors'), { coupleId, taskId, name, priceMin, priceMax, email, phone, paymentTerms, rating, status: 'considering', updatedAt: serverTimestamp() })
        FS-->>UI: DocumentReference { id: vendorId }
        UI->>UI: Append vendor card with badge "בשיקול" (amber)
    end

    Note over U: User has 3 vendor cards — comparing

    U->>UI: Add notes/comments to a vendor card (expandable section)
    UI->>FS: updateDoc(doc(db, 'vendors', vendorId), { notes, updatedAt: serverTimestamp() })
    FS-->>UI: Write acknowledged

    Note over U: Decision made — select DJ Alexander

    U->>UI: Tap "הגדר כנבחר" on chosen vendor card

    UI->>CF: httpsCallable('selectVendor')({ taskId, vendorId: chosenId, coupleId })

    rect rgb(245, 250, 245)
        Note over CF,FS: Atomic batch (Admin SDK)
        CF->>FS: getDocs(query(collection(db, 'vendors'), where('taskId', '==', taskId)))
        CF->>FS: batch.update(doc(db, 'vendors', rejectedId), { status: 'rejected' }) × others
        CF->>FS: batch.update(doc(db, 'vendors', chosenId), { status: 'selected' })
        CF->>FS: batch.update(doc(db, 'tasks', taskId), { status: 'in_progress', selectedVendorId: chosenId })
        CF->>FS: batch.update(doc(db, 'budget', coupleId), { allocate category += vendor.priceMin })
        CF->>FS: batch.commit()
    end

    CF-->>UI: { task, selectedVendor }

    UI->>UI: Task status badge → "בתהליך" (amber)
    UI->>UI: Selected vendor card → sage green badge "נבחר"
    UI->>UI: Other vendor cards → muted badge "נדחה"
    UI->>UI: Invalidate React Query ['dashboard'] — vendor chips update
    UI-->>U: Task detail reflects selection
```
