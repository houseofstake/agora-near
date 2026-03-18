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

      <div className="mb-8 p-6 bg-wash border border-line rounded-lg">
        <h4 className="text-lg font-semibold text-primary mb-3">
          Current Implementation
        </h4>
        <p className="text-secondary mb-3">
          The current House of Stake implementation has delivered core
          requirements from the{" "}
          <a
            href="https://www.gauntlet.xyz/resources/near-house-of-stake-governance-proposal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-secondary"
          >
            Gauntlet and NEAR Foundation specification
          </a>
          :
        </p>
        <ul className="list-disc list-inside text-secondary space-y-1 ml-4">
          <li>veToken contract</li>
          <li>Delegation and Undelegation</li>
          <li>Basic Proposal flow creation and voting</li>
          <li>veNEAR lockup contract + staking dynamics</li>
        </ul>
        <p className="text-sm mt-4">
          Several improvements are needed to fully reflect the original
          specifications, including support for both Fixed and Rolling Lock
          mechanisms, and enhanced proposal approval processes similar to
          Gauntlet&apos;s Council process with temperature check periods.
        </p>
      </div>

      {/* <div className="space-y-8">
        {roadmapData.map((version) => (
          <div
            key={version.version}
            className="border border-line rounded-lg overflow-hidden"
          >
            <div className="bg-wash px-6 py-4 border-b border-line">
              <h4 className="text-xl font-bold text-primary">
                {version.version}
              </h4>
            </div>
            <div className="p-6 space-y-4">
              {version.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-line rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-lg font-semibold text-primary flex-1">
                      {item.title}
                    </h5>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        difficultyColors[item.difficulty]
                      }`}
                    >
                      Effort: {item.difficulty}
                    </span>
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">
                    {item.description}
                  </p>
                  {item.priority && (
                    <p className="text-primary text-sm font-medium mt-2 italic">
                      {item.priority}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div> */}

      <div className="mt-8 p-6 bg-wash border border-line rounded-lg">
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
