import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./Splash.module.scss";

const { Title, Text } = Typography;

const SPLASH_DURATION_MS = 2000;

export function Splash() {
  const navigate = useNavigate();
  const { t } = useTranslation("onboarding");

  useEffect(() => {
    const timer = setTimeout(() => {
      void navigate("/onboarding/welcome");
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Flex vertical align="center" justify="center" className={styles.container} data-testid="splash-screen">
      <Flex vertical align="center" className={styles.innerPanel}>
        {/* Watercolor-style placeholder illustration */}
        <div className={styles.illustration} data-testid="splash-illustration" aria-hidden="true">
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Background soft blob */}
            <ellipse cx="110" cy="115" rx="90" ry="80" fill="#F2C4CE" fillOpacity="0.35" />
            <ellipse cx="90" cy="105" rx="70" ry="60" fill="#C9A97A" fillOpacity="0.12" />
            {/* Floral petals */}
            <ellipse cx="110" cy="60" rx="18" ry="30" fill="#F2C4CE" fillOpacity="0.7" />
            <ellipse cx="145" cy="75" rx="18" ry="30" fill="#F2C4CE" fillOpacity="0.55" transform="rotate(45 145 75)" />
            <ellipse
              cx="155"
              cy="110"
              rx="18"
              ry="30"
              fill="#F2C4CE"
              fillOpacity="0.55"
              transform="rotate(90 155 110)"
            />
            <ellipse
              cx="145"
              cy="145"
              rx="18"
              ry="30"
              fill="#C9A97A"
              fillOpacity="0.35"
              transform="rotate(135 145 145)"
            />
            <ellipse
              cx="110"
              cy="160"
              rx="18"
              ry="30"
              fill="#F2C4CE"
              fillOpacity="0.55"
              transform="rotate(180 110 160)"
            />
            <ellipse
              cx="75"
              cy="145"
              rx="18"
              ry="30"
              fill="#F2C4CE"
              fillOpacity="0.55"
              transform="rotate(225 75 145)"
            />
            <ellipse
              cx="65"
              cy="110"
              rx="18"
              ry="30"
              fill="#F2C4CE"
              fillOpacity="0.55"
              transform="rotate(270 65 110)"
            />
            <ellipse cx="75" cy="75" rx="18" ry="30" fill="#C9A97A" fillOpacity="0.35" transform="rotate(315 75 75)" />
            {/* Center */}
            <circle cx="110" cy="110" r="22" fill="#C9A97A" fillOpacity="0.5" />
            <circle cx="110" cy="110" r="14" fill="#FDF6EC" />
            {/* Heart */}
            <path
              d="M110 120 C108 116 100 112 100 106 C100 101 105 98 110 103 C115 98 120 101 120 106 C120 112 112 116 110 120Z"
              fill="#F2C4CE"
              fillOpacity="0.9"
            />
          </svg>
        </div>

        {/* Logo / brand */}
        <Title level={1} className={styles.logo} data-testid="splash-logo">
          עד החופה
        </Title>
        <Text className={styles.tagline} data-testid="splash-tagline">
          {t("splash.tagline")}
        </Text>

        {/* 3-dot pulsing loader */}
        <Flex gap={8} className={styles.loaderRow} data-testid="splash-loader">
          <span className={styles.dot} />
          <span className={`${styles.dot} ${styles.dotDelay1}`} />
          <span className={`${styles.dot} ${styles.dotDelay2}`} />
        </Flex>
      </Flex>
    </Flex>
  );
}
