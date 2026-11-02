import type { Metadata } from "next";
import TaskForm from "@/tasks/components/TaskForm/TaskForm";

export const metadata: Metadata = { title: "New task" };
export default function NewTask() {
  return <TaskForm />;
}
