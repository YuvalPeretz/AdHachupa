import { Flex, Tag } from "antd";
import type { WeddingEvent } from "../../types";
import styles from "./EventPillTab.module.scss";

interface EventPillTabProps {
  events: WeddingEvent[];
  activeEventId: string;
  onChange: (eventId: string) => void;
}

export function EventPillTab({ events, activeEventId, onChange }: EventPillTabProps) {
  return (
    <div className={styles.scrollWrapper}>
      <Flex gap={8} style={{ width: "max-content" }}>
        {events.map((event) => {
          const isActive = activeEventId === event.id;
          return (
            <Tag
              key={event.id}
              className={`${styles.pill}${isActive ? ` ${styles.pillActive}` : ""}`}
              onClick={() => onChange(event.id)}
              data-testid={`event-tab-${event.id}`}
              aria-current={isActive ? "true" : undefined}
            >
              {event.label}
            </Tag>
          );
        })}
      </Flex>
    </div>
  );
}
