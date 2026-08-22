import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/nunito-sans/wght.css";
import type { Metadata } from "next";

import { publicEnv } from "@/config/public-env";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${publicEnv.NEXT_PUBLIC_APP_NAME} | Familiar moments, gently guided`,
    template: `%s | ${publicEnv.NEXT_PUBLIC_APP_NAME}`,
  },
  description:
    "Caregiver-verified engagement activities grounded in a familiar room.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
