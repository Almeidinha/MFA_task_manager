import type { ReactElement, ReactNode } from "react";
import Icon from "../Icon/Icon";
import styles from "./Notice.module.css";

type NoticeProps = {
  children: ReactNode;
  onDismiss?: () => void;
  variant: "error" | "success";
};

const Notice = ({
  children,
  onDismiss,
  variant,
}: NoticeProps): ReactElement => (
  <div
    className={`${styles.notice} ${styles[variant]}`}
    role={variant === "error" ? "alert" : "status"}
  >
    {variant === "success" && <Icon name="check" />}
    <span>{children}</span>
    {onDismiss && (
      <button
        aria-label="Dismiss notification"
        className="icon-button"
        onClick={onDismiss}
      >
        <Icon name="close" size={16} />
      </button>
    )}
  </div>
);

export default Notice;
