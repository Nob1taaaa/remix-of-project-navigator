import { ReactNode } from "react";

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

const PageHeader = ({ icon, title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-primary/15 bg-card/70 backdrop-blur-xl p-5 sm:p-6 md:mb-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{icon}</span>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">{subtitle}</p>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
