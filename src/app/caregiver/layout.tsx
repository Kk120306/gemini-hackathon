import { CaregiverNavigation } from "@/components/caregiver-navigation";
import { SiteHeader } from "@/components/site-header";

export default function CaregiverLayout({
  children,
}: LayoutProps<"/caregiver">) {
  return (
    <>
      <SiteHeader mode="caregiver" />
      <div className="caregiver-layout">
        <CaregiverNavigation />
        {children}
      </div>
    </>
  );
}
