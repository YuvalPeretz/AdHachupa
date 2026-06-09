# Parent Share Flow

Couple generates a shareable web link; parent opens it in a plain browser and submits
their guest list without needing the app or a Firebase account.

The parent-facing page (/share/:token) has no Firebase Auth — it calls Cloud Functions
for all data operations. The token UUID acts as a capability: anyone who has the URL
can read the share metadata and submit guests.

```mermaid
sequenceDiagram
    actor C as Couple (App)
    actor P as Parent (Mobile Browser)
    participant UI as App Frontend
    participant FS as Firestore
    participant CF as Cloud Function (submitShareGuests)
    participant FCM as Firebase Cloud Messaging

    C->>UI: Tap "שתף קישור" in Guest List
    UI->>FS: addDoc(collection(db, 'shareTokens'), { coupleId, label: "הורי עדי", eventIds[], expiresAt: now + 30 days, submitted: false })
    FS-->>UI: DocumentReference { id: token (uuid) }
    UI-->>C: Native share sheet with "https://app.domain/share/{token}"

    C->>P: Sends link via WhatsApp

    P->>FS: getDoc(doc(db, 'shareTokens', token))
    FS-->>P: { coupleId, coupleNames, label, eventIds[], expiresAt, submitted }

    Note over P: Validates: expiresAt > now && submitted == false (client-side check)
    Note over P: Page shows "הזמנה להוספת אורחים — עדי ורועי"

    loop Parent adds each guest
        P->>P: Fill: name, phone, plusOnes
        P->>CF: httpsCallable('submitShareGuests')({ token, guest: { name, phone, plusOnes } })

        rect rgb(248, 250, 248)
            Note over CF,FS: Cloud Function validates + writes (Admin SDK — bypasses rules)
            CF->>FS: getDoc(doc(db, 'shareTokens', token))
            CF->>CF: Validate: expiresAt > now, submitted == false
            CF->>FS: addDoc(collection(db, 'guests'), { coupleId, name, phone, plusOnes, invitedBy: label, rsvpStatus: 'pending', sourceToken: token })
        end

        CF-->>P: { guestId } — guest appears in session list below form
    end

    P->>P: Tap "שלח רשימה"
    P->>CF: httpsCallable('finalizeShareSubmission')({ token })

    CF->>FS: updateDoc(doc(db, 'shareTokens', token), { submitted: true, submittedAt: now })
    CF->>FS: getDocs(query(collection(db, 'guests'), where('sourceToken', '==', token)))
    CF->>FCM: sendToDevice(couple.fcmToken, { title: "הורי עדי הוסיפו N אורחים" })

    CF-->>P: { count: 14 }
    P-->>P: "תודה! הרשימה נשלחה לזוג ✓"

    C->>UI: Opens Guest List
    UI->>FS: React Query refetch — getDocs(query(collection(db, 'guests'), where('coupleId', '==', coupleId)))
    FS-->>UI: Full guest list including parent's guests
    UI-->>C: New section "הורי עדי — 14 אורחים" visible in list
```
