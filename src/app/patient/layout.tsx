import { SiteHeader } from "@/components/site-header";

export default function PatientLayout({ children }: LayoutProps<"/patient">) {
  return (
    <div className="patient-layout">
      <SiteHeader mode="patient" />
      {children}
    </div>
  );
}
