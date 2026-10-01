import React from "react";
import { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import WhiteLabelPortalPage from "@/components/partners/WhiteLabelPortalPage";

export const metadata: Metadata = {
  title: "White Label Audit Portal | A4",
  description: "Internal delivery environment for teams to plan, execute, review, and complete engagements.",
};

const AuditPortalPage = () => {
  const sections = [
    {
      title: "Purpose of the Audit Portal",
      content: [
        "The Audit Portal is designed to bring structure, consistency, and oversight to service delivery.",
        "It provides a single environment for managing engagement planning, documentation, reviews, and sign-off, reducing operational risk and improving accountability across teams."
      ]
    },
    {
      title: "Core Functional Areas",
      content: [
        "The Audit Portal supports the following delivery stages. Each stage follows defined workflows to ensure consistency."
      ],
      list: [
        "Engagement planning and task allocation",
        "Working papers and documentation management",
        "Client queries and responses",
        "Review processes and internal approvals",
        "Final sign-off and engagement completion"
      ]
    },
    {
      title: "Working Papers and Documentation",
      content: [
        "All working papers and supporting documents are maintained within the portal.",
        "Version control, access rights, and activity logs ensure that documentation remains organised, traceable, and suitable for review or inspection where required."
      ]
    },
    {
      title: "Review and Sign-Off",
      content: [
        "The portal supports structured review processes.",
        "Senior team members can review work, raise queries, and approve or request changes before final sign-off. This helps maintain quality standards and ensures accountability at each level of delivery."
      ]
    },
    {
      title: "Technology-Assisted Support",
      content: [
        "The Audit Portal may include technology-assisted features that support delivery teams.",
        "These tools assist with consistency checks, completeness reviews, and risk indicators. They are designed to support professional judgment, not replace it."
      ]
    },
    {
      title: "Internal Access and Control",
      content: [
        "Access to the Audit Portal is restricted to authorised personnel within the firm.",
        "Roles and permissions are defined to reflect responsibilities and seniority. This ensures that sensitive information is accessible only to appropriate team members."
      ]
    },
    {
      title: "Role of A4",
      content: [
        "A4 provides the platform infrastructure and workflow framework that supports the Audit Portal.",
        "Professional responsibility, service delivery decisions, and client outcomes remain entirely with the partner firm unless otherwise agreed."
      ]
    },
    {
      title: "Integration With the Client Portal",
      content: [
        "The Audit Portal connects directly with the Client Portal.",
        "Client submissions, responses, and confirmations flow into internal workflows, allowing teams to work efficiently without duplication or manual handover.",
        "This integration ensures a seamless connection between client interaction and internal delivery."
      ]
    }
  ];

  return (
    <WhiteLabelPortalPage
      crumb="Audit Portal"
      pageTitle="White Label Audit Portal"
      heroSub="Internal delivery environment for teams to plan, execute, review, and complete engagements."
      title="Structured Delivery for Internal Teams"
      description="The White Label Audit Portal is an internal delivery environment used by the firm’s teams to plan, execute, review, and complete accounting, audit, or related professional engagements."
      sections={sections}
    />
  );
};

export default AuditPortalPage;
