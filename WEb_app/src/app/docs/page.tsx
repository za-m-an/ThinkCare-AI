import type { Metadata } from "next";
import DocsGatePage from "./DocsGatePage";

export const metadata: Metadata = {
  title: "ThinkCare AI — Documentation & Pitch Deck",
  description:
    "Full technical documentation, YC-style pitch deck, and live system overview for ThinkCare AI — the bilingual clinical AI companion for Bangladesh.",
};

export default function DocsPage() {
  return <DocsGatePage />;
}
