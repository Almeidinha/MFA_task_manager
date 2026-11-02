"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactElement } from "react";
import useSaveTask from "@/apis/tasksServices/useSaveTask";
import Icon from "@/global-components/Icon/Icon";
import Notice from "@/global-components/Notice/Notice";
import { taskInput, type Task } from "@/models/task";
import { taskFormCopy } from "./copy";
import styles from "./TaskForm.module.css";

type TaskFormProps = { task?: Task };
type FieldErrors = { descricao?: string; titulo?: string };

const TaskForm = ({ task }: TaskFormProps): ReactElement => {
  const router = useRouter();
  const [titulo, setTitle] = useState(task?.titulo ?? "");
  const [descricao, setDescription] = useState(task?.descricao ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const { error, isLoading, saveTask } = useSaveTask(task?.id);
  const isSaving = isLoading || isNavigating;
  const copy = task ? taskFormCopy.edit : taskFormCopy.create;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (isSaving) return;
    const result = taskInput.safeParse({ titulo, descricao });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        titulo: errors.titulo?.[0],
        descricao: errors.descricao?.[0],
      });
      document
        .getElementById(errors.titulo ? "task-title" : "task-description")
        ?.focus();
      return;
    }
    setFieldErrors({});
    const isSaved = await saveTask(result.data);
    if (!isSaved) return;
    setIsNavigating(true);
    router.push(`/?notice=${task ? "updated" : "created"}`);
    router.refresh();
  };

  return (
    <div className={styles.page}>
      <Link className={styles.back} href="/">
        <Icon name="back" size={17} /> All tasks
      </Link>
      <div className={styles.heading}>
        <h1>{copy.heading}</h1>
        <p>{copy.subtitle}</p>
      </div>
      <form
        aria-busy={isSaving}
        className={styles.form}
        noValidate
        onSubmit={handleSubmit}
      >
        {error && <Notice variant="error">{error}</Notice>}
        <div className={styles.field}>
          <label htmlFor="task-title">
            Task title <span className={styles.required}>*</span>
          </label>
          <input
            aria-describedby={fieldErrors.titulo ? "title-error" : "title-hint"}
            aria-invalid={!!fieldErrors.titulo}
            autoFocus
            disabled={isSaving}
            id="task-title"
            maxLength={120}
            name="titulo"
            onChange={(event) => {
              setTitle(event.target.value);
              setFieldErrors((current) => ({ ...current, titulo: undefined }));
            }}
            placeholder={taskFormCopy.titlePlaceholder}
            required
            value={titulo}
          />
          {fieldErrors.titulo ? (
            <p className={styles.error} id="title-error" role="alert">
              {fieldErrors.titulo}
            </p>
          ) : (
            <p className={styles.hint} id="title-hint">
              {taskFormCopy.titleHint}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="task-description">
              Description <span className={styles.optional}>optional</span>
            </label>
            <span className={styles.counter}>
              {descricao.length.toLocaleString("en-US")} / 2,000
            </span>
          </div>
          <textarea
            aria-describedby={
              fieldErrors.descricao ? "description-error" : undefined
            }
            aria-invalid={!!fieldErrors.descricao}
            disabled={isSaving}
            id="task-description"
            maxLength={2000}
            name="descricao"
            onChange={(event) => {
              setDescription(event.target.value);
              setFieldErrors((current) => ({
                ...current,
                descricao: undefined,
              }));
            }}
            placeholder={taskFormCopy.descriptionHint}
            rows={7}
            value={descricao}
          />
          {fieldErrors.descricao && (
            <p className={styles.error} id="description-error" role="alert">
              {fieldErrors.descricao}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <span className={styles.note}>
            <span className={styles.required}>*</span> Required field
          </span>
          <div>
            <button
              className="button secondary"
              disabled={isSaving}
              onClick={() => router.push("/")}
              type="button"
            >
              Cancel
            </button>
            <button
              className="button primary"
              disabled={isSaving || titulo.trim().length === 0}
              type="submit"
            >
              {isSaving ? (
                <>
                  <span className="spinner" /> Saving…
                </>
              ) : (
                <>
                  {copy.submit}
                  <Icon name={task ? "check" : "arrow"} size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
