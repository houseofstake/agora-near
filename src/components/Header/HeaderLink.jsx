import React from "react";
import Link from "next/link";

export const HeaderLink = ({ className, children, href, target, isActive }) => {
  const activeClass = isActive
    ? "bg-neutral border border-line shadow-newDefault text-primary"
    : "text-tertiary";

  return (
    <Link
      href={href}
      target={target}
      className={`px-4 rounded-full text-sm sm:text-base h-[38px] content-center ${activeClass} ${className || ""}`}
    >
      {children}
    </Link>
  );
};
