"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react") as any, {
  ssr: false,
}) as any;

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-8">
      <SwaggerUI url="/openapi.json" />
    </div>
  );
}
