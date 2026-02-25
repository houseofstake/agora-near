"use client";

import Link from "next/link";
import { useState, useEffect, memo } from "react";

// Constants
const BANNER_CONFIG = {
  storageKey: "full-launch-banner-dismissed",
  targetUrl: "/info#roadmap",
  message: "Welcome to the Full Launch",
} as const;

// Icon components
const SparkleIcon = memo(({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
));
SparkleIcon.displayName = "SparkleIcon";

const ChevronRightIcon = memo(({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
));
ChevronRightIcon.displayName = "ChevronRightIcon";

const CloseIcon = memo(({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
));
CloseIcon.displayName = "CloseIcon";

// Custom hook for banner visibility
export function useBannerVisibility() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDismissed = localStorage.getItem(BANNER_CONFIG.storageKey);
    setIsVisible(!isDismissed);
  }, []);

  const dismiss = () => {
    setIsAnimating(true);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
      localStorage.setItem(BANNER_CONFIG.storageKey, "true");
    }, 300); // Match animation duration
  };

  return {
    isVisible: mounted && (isVisible || isAnimating),
    isAnimating,
    dismiss,
  };
}

export default function InfoBanner() {
  const { isVisible, isAnimating, dismiss } = useBannerVisibility();

  if (!isVisible) return null;

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss();
  };

  return (
    <div
      className="relative z-50 overflow-hidden"
      role="banner"
      style={{
        maxHeight: isAnimating ? "0px" : "80px",
        opacity: isAnimating ? 0 : 1,
        transition: "max-height 300ms ease-in-out, opacity 300ms ease-in-out",
      }}
    >
      <div className="bg-black">
        <div className="relative">
          <Link
            href={BANNER_CONFIG.targetUrl}
            className="block w-full py-3 px-4 hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:bg-gray-900"
          >
            <div className="max-w-desktop mx-auto flex items-center justify-center gap-3">
              {/* Icon with glow effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md" />
                <SparkleIcon className="relative h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              </div>

              <span className="text-sm font-medium text-white tracking-wide">
                {BANNER_CONFIG.message}
              </span>

              <ChevronRightIcon className="h-4 w-4 text-tertiary" />
            </div>
          </Link>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-800 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-gray-600"
            aria-label="Dismiss banner"
          >
            <CloseIcon className="h-4 w-4 text-tertiary group-hover:text-tertiary" />
          </button>
        </div>
      </div>
    </div>
  );
}
