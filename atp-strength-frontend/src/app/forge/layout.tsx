import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Forja de los Guerreros | ATP Strength",
  description: "Entra al Templo del Hierro. Donde se forjan los guerreros de voluntad inquebrantable.",
};

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
