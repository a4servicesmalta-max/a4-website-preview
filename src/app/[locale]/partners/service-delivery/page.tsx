import { Metadata } from "next";
import ServiceDeliveryPageContent from "@/components/partners/ServiceDeliveryPageContent";

export const metadata: Metadata = {
  title: "Service Delivery Partnerships | A4",
  description: "Collaborate with A4 to deliver accounting and audit services using our structured workflows and platform.",
};

export default function ServiceDeliveryPage() {
  return <ServiceDeliveryPageContent />;
}
