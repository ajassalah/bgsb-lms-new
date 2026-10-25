import { PublicLayoutShell } from "@/components/public-layout-shell";
import { publicSiteClass } from "@/lib/public-fonts";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={publicSiteClass}>
      <PublicLayoutShell>{children}</PublicLayoutShell>
    </div>
  );
}
