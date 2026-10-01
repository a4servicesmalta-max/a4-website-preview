import React from "react";
import { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import WhiteLabelPortalPage from "@/components/partners/WhiteLabelPortalPage";

export const metadata: Metadata = {
  title: "White Label Client Portal | A4",
  description: "A secure, branded interface for client interaction under your firm's identity.",
};

const ClientPortalPage = () => {
  const sections = [
    {
      title: "Purpose of the Client Portal",
      content: [
        "The Client Portal is designed to centralise and structure client communication while improving visibility and control for both the firm and its clients.",
        "It replaces fragmented communication methods with a single, secure environment that supports transparency, accountability, and timely delivery."
      ]
    },
    {
      title: "What Clients Can Do",
      content: [
        "Through the Client Portal, clients can:",
        "All interactions are logged to ensure traceability and clarity."
      ],
      list: [
        "Upload and access documents securely",
        "View tasks and requests assigned by the firm",
        "Track deadlines and compliance status",
        "Respond to queries and provide confirmations",
        "Receive updates and notifications related to their engagements"
      ]
    },
    {
      title: "Dashboard and Visibility",
      content: [
        "The client dashboard provides a clear overview of active engagements.",
        "Clients can see outstanding requests, upcoming deadlines, recently completed items, and current status indicators. This reduces uncertainty and minimises unnecessary follow-ups.",
        "The dashboard structure can be configured to align with the firm’s service model and client expectations."
      ]
    },
    {
      title: "Branding and Customisation",
      content: [
        "The Client Portal is fully white-labelled.",
        "Branding elements such as logos, colour schemes, domain configuration, and communication tone reflect the partner firm’s identity. The portal appears as a natural extension of the firm’s existing digital presence."
      ]
    },
    {
      title: "Security and Access Control",
      content: [
        "Access to the Client Portal is role-based.",
        "Clients only see information relevant to their own engagements. Permissions are controlled by the firm to ensure confidentiality and compliance with applicable data protection requirements."
      ]
    },
    {
      title: "Role of A4",
      content: [
        "A4 provides the underlying infrastructure and workflow logic that powers the Client Portal.",
        "A4 does not interact with clients directly and does not assume responsibility for client communication or service delivery."
      ]
    },
    {
      title: "Use Within a White Label Arrangement",
      content: [
        "The Client Portal is intended to support professional firms that want a structured, secure, and branded way to manage client interaction.",
        "It integrates with the internal Audit and Delivery Portal to ensure continuity between client-facing activity and internal execution."
      ]
    }
  ];

  return (
    <WhiteLabelPortalPage
      crumb="Client Portal"
      pageTitle="White Label Client Portal"
      heroSub="A secure, branded interface for client interaction under your firm's identity."
      title="A Branded Interface for Client Interaction"
      description="The White Label Client Portal provides firms with a secure, branded interface through which clients interact with their accounting, audit, or advisory engagements. The portal operates fully under the partner firm’s brand and identity."
      sections={sections}
    />
  );
};

export default ClientPortalPage;
