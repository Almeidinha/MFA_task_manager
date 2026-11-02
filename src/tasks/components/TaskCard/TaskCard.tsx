import Link from "next/link";
import type { ReactElement } from "react";
import Icon from "@/global-components/Icon/Icon";
import type { Task } from "@/models/task";
import { formatCreatedDate } from "../../util/formatCreatedDate";
import styles from "./TaskCard.module.css";

type TaskCardProps = {
  index: number;
  onDelete: (task: Task) => void;
  task: Task;
};

const TaskCard = ({ index, onDelete, task }: TaskCardProps): ReactElement => (
  <article className={styles.card}>
    <div className={styles.top}>
      <span className={styles.number}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className={styles.actions}>
        <Link
          aria-label={`Edit ${task.titulo}`}
          className="icon-button"
          href={`/tasks/${task.id}/edit`}
        >
          <Icon name="edit" size={17} />
        </Link>
        <button
          aria-label={`Delete ${task.titulo}`}
          className={`icon-button ${styles.delete}`}
          onClick={() => onDelete(task)}
        >
          <Icon name="trash" size={17} />
        </button>
      </div>
    </div>
    <h2>
      <Link href={`/tasks/${task.id}/edit`}>{task.titulo}</Link>
    </h2>
    {task.descricao ? (
      <p className={styles.description}>{task.descricao}</p>
    ) : (
      <p className={`${styles.description} ${styles.noDescription}`}>
        No description added.
      </p>
    )}
    <div className={styles.bottom}>
      <time dateTime={new Date(task.dataCriacao).toISOString()}>
        Created {formatCreatedDate(task.dataCriacao)}
      </time>
      <Link className="text-link" href={`/tasks/${task.id}/edit`}>
        View task <Icon name="arrow" size={15} />
      </Link>
    </div>
  </article>
);

export default TaskCard;
