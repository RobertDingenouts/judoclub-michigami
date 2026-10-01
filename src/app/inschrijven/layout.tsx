import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inschrijven Judo | Judoclub Michigami Steenbergen",
  description:
    "Schrijf je in voor judo bij Judoclub Michigami Steenbergen. Lid worden kan direct online; eerst kennismaken? 3 gratis proeflessen. Actie: gratis inschrijven vóór 31 december 2026.",
};

export default function InschrijvenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
