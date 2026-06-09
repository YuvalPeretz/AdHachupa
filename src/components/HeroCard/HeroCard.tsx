import { Flex, Progress } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./HeroCard.module.scss";

interface HeroCardProps {
  eventType: string;
  eventName: string;
  daysLeft: number;
  date: string;
  venue: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export function HeroCard({ eventType, eventName, daysLeft, date, venue, tasksCompleted, tasksTotal }: HeroCardProps) {
  const { t } = useTranslation("common");

  const progressPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  return (
    <div className={styles.card} data-testid="hero-card">
      {/* Event type label */}
      <p className={styles.eventType} data-testid="hero-event-type">
        {eventType}
      </p>

      {/* Event name */}
      <h2 className={styles.eventName} data-testid="hero-event-name">
        {eventName}
      </h2>

      {/* Countdown */}
      <Flex align="baseline" gap={6} className={styles.countdownRow}>
        <span className={styles.daysNumber} data-testid="hero-days-left">
          {daysLeft}
        </span>
        <span className={styles.daysLabel}>{t("heroCard.daysLeft")}</span>
      </Flex>

      {/* Date & Venue */}
      <Flex gap={12} className={styles.metaRow} data-testid="hero-meta">
        <span>{date}</span>
        <span>{venue}</span>
      </Flex>

      {/* Task progress */}
      <div className={styles.progressSection} data-testid="hero-progress">
        <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
          <span className={styles.progressLabel}>
            {tasksCompleted}/{tasksTotal} {t("heroCard.tasksLabel")}
          </span>
          <span className={styles.progressPercent}>{progressPercent}%</span>
        </Flex>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#C9A97A"
          railColor="rgba(255,255,255,0.4)"
          strokeLinecap="round"
        />
      </div>
    </div>
  );
}
