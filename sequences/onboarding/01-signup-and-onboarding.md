# Signup & Onboarding Flow

Full flow from first app open through completing the 6-step onboarding wizard.

Google Sign-In is the **only** authentication method — there is no email/password form.
Onboarding state accumulates in Redux client state and is persisted in a single atomic
Cloud Function call at the end of step 6.

```mermaid
sequenceDiagram
    actor U as User (Couple)
    participant UI as React Frontend
    participant Auth as Firebase Auth
    participant CF as Cloud Function (onboarding)
    participant FS as Firestore

    U->>UI: Opens app for first time
    UI-->>U: Splash Screen → Welcome screen

    U->>UI: Tap "בואו נתחיל" or "כבר יש לי חשבון? התחברות"
    UI->>Auth: signInWithPopup(auth, googleProvider)
    Auth-->>UI: UserCredential { uid, displayName, email, photoURL }

    UI->>FS: getDoc(doc(db, 'couples', uid))
    FS-->>UI: snapshot.exists() == false → new user

    UI-->>U: Step 1 of 6 — Event Selection

    Note over UI: Onboarding state accumulated in Redux (not persisted until final submit)

    U->>UI: Select events (e.g. חתונה + חינה)
    U->>UI: Tap "הבא" → Step 2 — Guest Count & Date

    U->>UI: Enter guest count + approximate date per event
    U->>UI: Tap "הבא" → Step 3 — Priorities & Vibe

    U->>UI: Rate 8 priority categories (1–5 stars)
    U->>UI: Tap "הבא" → Step 4 — Budget Range

    U->>UI: Select budget tier (e.g. ₪100K–200K)
    U->>UI: Tap "הבא" → Step 5 — Couple Info

    U->>UI: Enter names, genders, region, kosher toggle
    U->>UI: Tap "סיום ✓"

    UI->>CF: httpsCallable('onboarding')({ couple, events[], priorities, budgetRange })

    rect rgb(245, 248, 245)
        Note over CF,FS: Atomic batched write — all or nothing
        CF->>FS: setDoc(doc(db, 'couples', uid), { name1, name2, gender1, gender2, region, isKosher, budgetRange })
        CF->>FS: addDoc(collection(db, 'events'), ...) × N events
        CF->>FS: setDoc(doc(db, 'budget', uid), { totalBudget, giftIncome: 0, breakeven: totalBudget, categories[] })
        CF->>CF: generateTaskList(events, priorities, isKosher)
        CF->>FS: batch.set(doc(db, 'tasks', taskId), ...) × M tasks
        CF->>FS: batch.set(doc(db, 'taskPayments' | 'taskVendorConfigs' | 'taskDecisions' | 'taskReminders', taskId), ...)
        CF->>FS: batch.commit()
    end

    CF-->>UI: { coupleId: uid, firstEventId, taskCount: 48 }
    UI-->>U: Success Screen "הכל מוכן! 🎉"

    U->>UI: Tap "קדימה לדשבורד"
    UI->>FS: Parallel React Query reads — see sequences/dashboard/01-load-dashboard.md
    UI-->>U: Dashboard (Home tab)
```
