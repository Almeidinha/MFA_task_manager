"use client";

import { useEffect, useRef, type ReactElement } from "react";
import Icon from "@/global-components/Icon/Icon";
import type { Task } from "@/models/task";
import styles from "./DeleteTaskDialog.module.css";

type DeleteTaskDialogProps = {
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  task: Task;
};

const DeleteTaskDialog = ({
  isLoading,
  onCancel,
  onConfirm,
  task,
}: DeleteTaskDialogProps): ReactElement => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);

  return (
    <dialog
      aria-describedby="delete-description"
      aria-labelledby="delete-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoading) onCancel();
      }}
      ref={dialog}
    >
      <span className={styles.icon}>
        <Icon name="trash" size={22} />
      </span>
      <h2 id="delete-title">Delete this task?</h2>
      <p id="delete-description">
        <strong>{task.titulo}</strong> will be removed. This action can’t be
        undone.
      </p>
      <div className={styles.actions}>
        <button
          autoFocus
          className="button secondary"
          disabled={isLoading}
          onClick={onCancel}
        >
          Keep task
        </button>
        <button
          className="button danger"
          disabled={isLoading}
          onClick={onConfirm}
        >
          {isLoading ? (
            <>
              <span className="spinner" /> Deleting…
            </>
          ) : (
            "Delete task"
          )}
        </button>
      </div>
    </dialog>
  );
};

export default DeleteTaskDialog;
