# Load Dashboard

How the dashboard is assembled from multiple data sources when the user opens the
app or taps the Home tab. Five parallel Firestore reads are issued via React Query
and merged into the dashboard payload on the client.

No Cloud Function or server aggregation is needed — the client issues the queries
in parallel and the React Query cache handles deduplication and stale-time.

```mermaid
sequenceDiagram
    actor U as User
    participant UI as React Frontend
    participant FS as Firestore

    U->>UI: Opens app / taps Home (בית) tab
    UI->>UI: Show skeleton loading state (placeholder cards)

    rect rgb(245, 245, 255)
        Note over UI,FS: Five parallel React Query reads (useQuery)

        UI->>FS: Q1 — Next event: getDocs(query(events, where('coupleId','==',uid), orderBy('date'), limit(1)))
        UI->>FS: Q2 — Task progress: getDocs(query(tasks, where('coupleId','==',uid), where('eventId','==',nextEventId)))
        UI->>FS: Q3 — Budget summary: getDoc(doc(db, 'budget', uid))
        UI->>FS: Q4 — Selected vendors: getDocs(query(vendors, where('coupleId','==',uid), where('status','==','selected'), orderBy('updatedAt','desc'), limit(6)))
        UI->>FS: Q5 — Other events: getDocs(query(events, where('coupleId','==',uid), orderBy('date')))
    end

    FS-->>UI: Q1: { type: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום', id: nextEventId }
    FS-->>UI: Q2: tasks[] — client groups by status to derive { completed: 12, inProgress: 8, notStarted: 28 }
    FS-->>UI: Q3: { totalBudget: 100000, totalSpent: 48500, giftIncome: 22000, breakeven: 26500, rsvpBreakeven: -30300 }
    FS-->>UI: Q4: vendors[{ category: 'דיג"יי', name: 'DJ Alexander', priceMin: 4500, status: 'selected' }, ...]
    FS-->>UI: Q5: events[] — client filters out nextEventId to get otherEvents

    UI->>UI: Render hero card (event name, "נותרו N ימים", task progress bar)
    UI->>UI: Render budget card (spent/total, gold bar, gift delta, breakeven chip)
    UI->>UI: Render vendor chips (horizontal scroll, up to 6 selected vendors)
    UI->>UI: Render other events list (compact cards with countdowns)
    UI-->>U: Dashboard fully rendered — skeletons replaced

    Note over U,UI: Background delta refresh on focus after idle

    U->>UI: Returns to tab after 5+ minutes idle
    Note over UI: React Query staleTime expired — triggers background refetch
    UI->>FS: Re-run Q1–Q5 in parallel (React Query handles deduplication)
    FS-->>UI: Updated docs (only changed fields transferred via Firestore protocol)
    UI->>UI: React Query merges new data — React reconciler updates only changed UI nodes
    UI-->>U: Updated counts / stats visible without full re-render
```
