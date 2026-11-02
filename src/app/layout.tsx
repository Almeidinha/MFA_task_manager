import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/global-components/Icon/Icon";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MFA Task Manager",
    template: "%s · MFA Task Manager",
  },
  description: "Create, edit, and delete tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <div className="header-inner">
            <Link className="brand" href="/" aria-label="MFA Task Manager home">
              <span className="brand-mark">
                <Icon name="check" size={23} />
              </span>
              MFA Task Manager
            </Link>
            <div className="workspace-label">
              <span className="status-dot" /> Personal workspace
            </div>
          </div>
        </header>
        <main id="main" className="main">
          {children}
        </main>
        <footer className="site-footer">
          <span>MFA Task Manager</span>
          <span>
            Temporary workspace <span className="footer-dot">·</span> Tasks
            reset when the server restarts
          </span>
        </footer>
      </body>
    </html>
  );
}
