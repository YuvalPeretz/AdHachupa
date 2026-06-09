# Task Template Generation

How the `onboarding` Cloud Function auto-generates a personalised task list from
the couple's onboarding answers. Runs inside the atomic batched write of the CF —
see sequences/onboarding/01-signup-and-onboarding.md.

```mermaid
sequenceDiagram
    participant CF as Cloud Function (onboarding)
    participant TG as TaskGenerator (internal)
    participant FS as Firestore

    CF->>TG: generateTaskList({ events[], priorities, isKosher, guestCounts })

    Note over TG: Task templates are bundled with the Cloud Function source
    Note over TG: (no Firestore read needed — templates ship as static data)

    loop For each selected event
        TG->>TG: Include all הכרחי (mandatory) tasks for this event
        TG->>TG: Include לוגיסטי tasks ranked by couple's priority rating
        TG->>TG: Include אסתטי tasks only if priority rating ≥ 3
        alt isKosher = true
            TG->>TG: Add kashrut-specific tasks (kosher certification, mashgiach)
        end
    end

    TG->>TG: Sort by: event date ASC, then priority DESC
    TG->>TG: Assign suggested deadlines (eventDate − N months per category)

    Note over TG: Deadline rules:<br/>venue → event − 12 months<br/>photographer → event − 8 months<br/>clothing → event − 4 months<br/>logistics → event − 2 months

    TG->>TG: Flag per-guest billing tasks (meal, invitation, seating)
    TG->>TG: Set estimatedCost from template price ranges × guestCount for per-guest tasks

    TG-->>CF: tasks[] { name, category, type, priority, billingUnit, estimatedCost, suggestedDeadline, eventId }

    loop For each task in batch
        CF->>FS: batch.set(doc(db, 'tasks', taskId), { coupleId, eventId, name, type, category, priority, status: 'not_started', closingDate: suggestedDeadline })

        alt type == 'payment'
            CF->>FS: batch.set(doc(db, 'taskPayments', taskId), { coupleId, estimatedCost, billingUnit, advancePaid: false, balancePaid: false, paymentStatus: 'unpaid' })
        else type == 'vendor'
            CF->>FS: batch.set(doc(db, 'taskVendorConfigs', taskId), { coupleId, vendorOptions: [] })
        else type == 'reminder'
            CF->>FS: batch.set(doc(db, 'taskReminders', taskId), { coupleId, reminderDate: suggestedDeadline, notifyEnabled: true, linkedTaskId: null })
        else type == 'decision'
            CF->>FS: batch.set(doc(db, 'taskDecisions', taskId), { coupleId, options: [], finalDecision: null })
        end
    end

    Note over CF,FS: budget.categories[] array is also written in the same batch
    Note over CF,FS: Per-guest tasks: estimatedCost = unitPrice × guestCount

    CF->>FS: batch.commit()
    CF-->>CF: Return taskCount to onboarding response
```
