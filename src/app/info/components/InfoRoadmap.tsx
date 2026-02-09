"use client";

import React, { useEffect } from "react";

const InfoRoadmap = () => {
  useEffect(() => {
    // Check if the URL hash is #roadmap and scroll to it
    if (window.location.hash === "#roadmap") {
      setTimeout(() => {
        const element = document.getElementById("roadmap");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, []);

  return (
    <div className="mt-12">
      <h3
        id="roadmap"
        className="text-2xl font-black text-primary mb-6 scroll-mt-32"
      >
        House of Stake Development Roadmap
      </h3>
      <div className="mb-8 p-6 bg-wash border border-line rounded-lg">
        <h4 className="text-lg font-semibold text-primary mb-3">
          Alpha Launch: August 7, 2025
        </h4>
        <p className="text-secondary mb-3">
          House of Stake is now live on the NEAR blockchain! During this Alpha
          release, we will be focusing on getting feedback from the community on
          core workflows and feature requests that we can prioritize for the
          next release.
        </p>
      </div>

      <div className="mb-8 p-6 bg-wash border border-line rounded-lg">
        <h4 className="text-lg font-semibold text-primary mb-3">
          Full Launch: October 13, 2025
        </h4>
        <p className="text-secondary mb-3">
          House of Stake is ready for the full community to participate in the
          full House of Stake Governance. New production contracts have been
          deployed, the first proposal will launch soon, and there are wallet
          upgrades, bug fixes, and support for rNEAR launching soon!
        </p>
        <p className="text-secondary mb-3">
          Please submit bug reports and feature requests on our{" "}
          <a
            href="https://agora.ducalis.io/nearhos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-secondary"
          >
            feedback board
          </a>
          .
        </p>
      </div>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-lg font-semibold text-primary mb-3">
          Future Considerations
        </h4>
        <p className="text-secondary text-sm leading-relaxed mb-3">
          Beyond the roadmap items above, several processes require further
          discussion and development:
        </p>
        <ul className="list-disc list-inside text-secondary text-sm space-y-2 ml-4">
          <li>Delegation incentive structures</li>
          <li>Security council nomination processes</li>
          <li>Formal complaint system for underperforming delegates</li>
          <li>
            Explicit ecosystem reward structures (transparent and trackable)
          </li>
        </ul>
        <p className="text-tertiary text-sm mt-3">
          Priorities for v2.0 will be crystallized through the development of
          v1.5, potentially expanding beyond the items outlined here.
        </p>
      </div>

      <div className="mt-6 text-sm text-tertiary">
        <p>
          View the implementation on{" "}
          <a
            href="https://github.com/fastnear/house-of-stake-contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-secondary"
          >
            GitHub
          </a>{" "}
          or join the discussion on our{" "}
          <a
            href="https://gov.near.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-secondary"
          >
            Governance Forum
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default InfoRoadmap;
