import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Create a component that contains the actual Markdown execution logic
const MarkdownClient = dynamic(
  () => import("./MarkdownClient").then((mod) => mod.default),
  { ssr: false, loading: () => <Skeleton className="w-full h-32" /> }
);

export default function Markdown({ content }: { content: string }) {
  return <MarkdownClient content={content} />;
}
