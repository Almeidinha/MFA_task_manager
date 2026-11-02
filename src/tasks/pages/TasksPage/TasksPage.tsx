"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";
import useDeleteTask from "@/apis/tasksServices/useDeleteTask";
import useGetTasks from "@/apis/tasksServices/useGetTasks";
import Icon from "@/global-components/Icon/Icon";
import Notice from "@/global-components/Notice/Notice";
import type { Task } from "@/models/task";
import type { TaskPage } from "@/server/router";
import DeleteTaskDialog from "../../components/DeleteTaskDialog/DeleteTaskDialog";
import TaskCard from "../../components/TaskCard/TaskCard";
import styles from "./TasksPage.module.css";

type TasksPageProps = { initialNotice?: string; initialPage: TaskPage };

const TasksPage = ({
  initialNotice,
  initialPage,
}: TasksPageProps): ReactElement => {
  const [notice, setNotice] = useState(initialNotice);
  const [target, setTarget] = useState<Task | null>(null);
  const {
    error: loadError,
    isLoading,
    loadMore,
    page,
    removeTask,
  } = useGetTasks(initialPage);
  const { deleteTask, error, isLoading: isDeleting } = useDeleteTask();

  const handleDelete = async (): Promise<void> => {
    if (!target) return;
    const isDeleted = await deleteTask(target.id);
    if (isDeleted) {
      removeTask(target.id);
      setNotice("Task deleted.");
    }
    setTarget(null);
  };

  return (
    <>
      <div className={styles.eyebrow}>
        <Icon name="list" size={16} /> WORKSPACE
      </div>
      <div className={styles.heading}>
        <div>
          <h1>Your tasks</h1>
          <p>Create, edit, or delete a task.</p>
        </div>
        <Link className="button primary" href="/tasks/new">
          <Icon name="plus" /> New task
        </Link>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.tab}>
          All tasks <span className={styles.count}>{page.total}</span>
        </div>
        <span className={styles.sort}>
          <Icon name="clock" size={15} /> Newest first
        </span>
      </div>
      {notice && (
        <Notice onDismiss={() => setNotice(undefined)} variant="success">
          {notice}
        </Notice>
      )}
      {error && <Notice variant="error">{error}</Notice>}
      {page.total === 0 ? (
        <section aria-labelledby="empty-title" className={styles.empty}>
          <div className={styles.illustration}>
            <div className={styles.paper}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.plus}>
              <Icon name="plus" size={22} />
            </span>
          </div>
          <h2 id="empty-title">No tasks yet</h2>
          <p>Create a task to get started.</p>
          <Link className="button primary" href="/tasks/new">
            New task <Icon name="arrow" size={17} />
          </Link>
        </section>
      ) : (
        <section aria-label="Tasks" className={styles.grid}>
          {page.items.map((task, index) => (
            <TaskCard
              index={index}
              key={task.id}
              onDelete={setTarget}
              task={task}
            />
          ))}
        </section>
      )}
      {page.total > 0 && (
        <div className={styles.end}>
          {loadError && (
            <p className="inline-error" role="alert">
              {loadError}
            </p>
          )}
          {page.nextCursor !== null ? (
            <button
              className="button secondary"
              disabled={isLoading}
              onClick={() => void loadMore()}
            >
              {isLoading ? (
                <>
                  <span className="spinner" /> Loading tasks…
                </>
              ) : loadError ? (
                "Try loading again"
              ) : (
                "Load more tasks"
              )}
            </button>
          ) : (
            <p>
              Showing all {page.total} {page.total === 1 ? "task" : "tasks"}.
            </p>
          )}
        </div>
      )}
      {target && (
        <DeleteTaskDialog
          isLoading={isDeleting}
          onCancel={() => setTarget(null)}
          onConfirm={() => void handleDelete()}
          task={target}
        />
      )}
    </>
  );
};

export default TasksPage;
