import Link from "next/link";
import Icon from "@/global-components/Icon/Icon";

export default function NotFound() {
  return (
    <section className="empty-state error-page">
      <h1>Page not found</h1>
      <p>The task may have been deleted, or this link may be incorrect.</p>
      <Link className="button primary" href="/">
        <Icon name="back" size={17} /> Back to your tasks
      </Link>
    </section>
  );
}
