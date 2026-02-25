import { useEffect, useRef, useState, useMemo, memo } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/lib/color";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { ProposalVotingHistoryRecord } from "@/lib/api/proposal/types";

//Bubble contransts
const CHART_DIMENSIONS = {
  width: 720,
  height: 250,
  padding: 3,
  maxVotes: 50,
} as const;

const BUBBLE_PADDING = 10;

const ZOOM_CONFIG = {
  min: 0.5,
  max: 100,
  step: 3,
} as const;

interface BubbleNode extends d3.SimulationNodeDatum {
  address: string;
  support: "0" | "1" | "2";
  value: number;
  r: number;
}

// Controls visual scaling of bubble sizes relative to voting power ratio
const SCALING_EXPONENT = 0.4;
const transformVotesToBubbleData = (
  votes: ProposalVotingHistoryRecord[],
  limit: number
): BubbleNode[] => {
  const sortedVotes = [...votes]
    .sort(
      (a, b) =>
        Number((b as any)?.votingPower) - Number((a as any)?.votingPower)
    )
    .slice(0, limit);

  // Sanitize weights: coerce to number, ensure finite and non-negative
  const rawWeights = sortedVotes.map((v) => {
    const n = Number((v as any)?.votingPower);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  });

  const maxWeight = Math.max(0, ...rawWeights);
  // If all weights are zero, fallback to uniform weights to avoid degenerate radii
  const effectiveWeights = maxWeight > 0 ? rawWeights : rawWeights.map(() => 1);

  return sortedVotes.map((vote, i) => {
    const value = effectiveWeights[i] ?? 0;
    // Avoid division by zero by falling back to 1 when maxWeight is 0
    const denom = maxWeight > 0 ? maxWeight : 1;
    const ratio = value / denom;
    const radius = Math.pow(ratio, SCALING_EXPONENT) * 40;
    return {
      address: vote.accountId,
      support:
        vote.voteOption === "0" ? "1" : vote.voteOption === "1" ? "0" : "2",
      value,
      // Ensure finite, positive radius to prevent rendering/zoom issues
      r: Number.isFinite(radius) && radius > 0 ? radius : 1,
    };
  });
};

const ZoomButton = memo(
  ({
    onClick,
    icon: Icon,
    label,
  }: {
    onClick: () => void;
    icon: typeof Plus | typeof Minus | typeof RotateCcw;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className="p-1 bg-neutral hover:bg-wash rounded-md border border-line"
      aria-label={label}
    >
      <Icon size={16} />
    </button>
  )
);

ZoomButton.displayName = "ZoomButton";

const BubbleNode = memo(({ node }: { node: BubbleNode }) => {
  const router = useRouter();
  const { ui } = Tenant.current();

  const fillColor = useMemo(() => {
    const colorMap = {
      "1": ui.customization?.positive,
      "0": ui.customization?.negative,
      "2": ui.customization?.tertiary,
    };
    return rgbStringToHex(colorMap[node.support]);
  }, [node.support, ui.customization]);

  const fontSize = useMemo(() => {
    const scaled = node.r / 4;
    return Math.max(8, Math.min(scaled, 14));
  }, [node.r]);

  const showText = node.r >= 14;

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/delegates/${node.address}`);
      }}
      style={{ cursor: "pointer" }}
    >
      <circle
        r={node.r}
        style={{ fill: fillColor, transition: "fill 0.15s ease-out" }}
      />

      {showText && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            userSelect: "none",
            pointerEvents: "none",
            paintOrder: "stroke",
            stroke: "rgba(0,0,0,0.5)",
            strokeWidth: 1,
          }}
        >
          {node.address}
        </text>
      )}
    </g>
  );
});

BubbleNode.displayName = "BubbleNode";

export default function BubbleChart({
  votes,
  disableZoom,
  maxVotes,
}: {
  votes: ProposalVotingHistoryRecord[];
  disableZoom?: boolean;
  maxVotes?: number;
}) {
  const [nodes, setNodes] = useState<BubbleNode[]>([]);
  const [transform, setTransform] = useState(() =>
    d3.zoomIdentity.translate(0, 0).scale(1)
  );

  const [hasMoreVotes, setHasMoreVotes] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultTransformRef = useRef<d3.ZoomTransform | null>(null);
  const zoomRafIdRef = useRef<number | null>(null);
  const pendingTransformRef = useRef<d3.ZoomTransform | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const effectiveMaxVotes =
    maxVotes && maxVotes > 0 ? maxVotes : CHART_DIMENSIONS.maxVotes;

  const handleZoom = (delta: number) => {
    if (disableZoom || !svgRef.current || !zoomRef.current) return;
    const nextScale = Math.max(
      ZOOM_CONFIG.min,
      Math.min(ZOOM_CONFIG.max, transform.k + delta)
    );
    const selection = d3.select<SVGSVGElement, unknown>(svgRef.current);
    selection.interrupt().call(zoomRef.current.scaleTo as any, nextScale);
  };

  const handleReset = () => {
    if (
      disableZoom ||
      !svgRef.current ||
      !defaultTransformRef.current ||
      !zoomRef.current
    )
      return;
    d3.select<SVGSVGElement, unknown>(svgRef.current)
      .interrupt()
      .call(zoomRef.current.transform as any, defaultTransformRef.current);
  };

  const votesKey = useMemo(() => {
    if (!votes || votes.length === 0) return "";
    const head = [...votes]
      .sort(
        (a, b) =>
          Number((b as any)?.votingPower) - Number((a as any)?.votingPower)
      )
      .slice(0, effectiveMaxVotes);
    return head
      .map((v) => `${v.accountId}:${v.votingPower}:${v.voteOption}`)
      .join("|");
  }, [votes, effectiveMaxVotes]);
  const prevVotesKeyRef = useRef<string>("");

  // Effect 1: Process votes into nodes
  useEffect(() => {
    if (prevVotesKeyRef.current === votesKey) return;
    prevVotesKeyRef.current = votesKey;

    try {
      const length = votes?.length ?? 0;
      setHasMoreVotes(length > effectiveMaxVotes);

      if (length === 0) {
        setNodes((prev) => (prev.length !== 0 ? [] : prev));
        setTransform(d3.zoomIdentity.translate(0, 0).scale(1));
        return;
      }

      const bubbleData = transformVotesToBubbleData(votes, effectiveMaxVotes);
      if (!bubbleData || bubbleData.length === 0) {
        setNodes((prev) => (prev.length !== 0 ? [] : prev));
        setTransform(d3.zoomIdentity.translate(0, 0).scale(1));
        return;
      }

      const pack = d3
        .pack<BubbleNode>()
        .size([CHART_DIMENSIONS.width - 20, CHART_DIMENSIONS.height - 20])
        .padding(BUBBLE_PADDING);

      const root = d3
        .hierarchy<BubbleNode>({ children: bubbleData } as any)
        .sum((d) => d.value ?? 0);

      const packedData = pack(root)
        .leaves()
        .map((d) => ({ ...d.data, x: d.x, y: d.y, r: d.r })) as BubbleNode[];

      if (packedData.length === 0) {
        setNodes((prev) => (prev.length !== 0 ? [] : prev));
        setTransform(d3.zoomIdentity.translate(0, 0).scale(1));
        return;
      }

      const minX = d3.min(packedData, (d) => (d.x ?? 0) - (d.r ?? 0)) || 0;
      const maxX =
        d3.max(packedData, (d) => (d.x ?? 0) + (d.r ?? 0)) ||
        CHART_DIMENSIONS.width;
      const minY = d3.min(packedData, (d) => (d.y ?? 0) - (d.r ?? 0)) || 0;
      const maxY =
        d3.max(packedData, (d) => (d.y ?? 0) + (d.r ?? 0)) ||
        CHART_DIMENSIONS.height;

      const dx = maxX - minX;
      const dy = maxY - minY;
      const denom =
        Math.max(dx / CHART_DIMENSIONS.width, dy / CHART_DIMENSIONS.height) ||
        1;
      let scale = 1.5 / denom;
      if (!Number.isFinite(scale) || scale <= 0) scale = 1;
      const translateX = (CHART_DIMENSIONS.width - scale * (minX + maxX)) / 2;
      const translateY = (CHART_DIMENSIONS.height - scale * (minY + maxY)) / 2;

      const nextDefault = d3.zoomIdentity
        .translate(
          Number.isFinite(translateX) ? translateX : 0,
          Number.isFinite(translateY) ? translateY : 0
        )
        .scale(scale);

      defaultTransformRef.current = nextDefault;

      setNodes((prev) => {
        if (prev.length === packedData.length) {
          let same = true;
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];
            const b = packedData[i];
            if (
              a.address !== b.address ||
              a.x !== b.x ||
              a.y !== b.y ||
              a.r !== b.r
            ) {
              same = false;
              break;
            }
          }
          if (same) return prev;
        }
        return packedData;
      });

      setTransform((prev) => {
        if (
          Math.abs(prev.x - nextDefault.x) < 0.1 &&
          Math.abs(prev.y - nextDefault.y) < 0.1 &&
          Math.abs(prev.k - nextDefault.k) < 0.001
        ) {
          return prev;
        }
        return nextDefault;
      });
    } catch {
      setNodes((prev) => (prev.length !== 0 ? [] : prev));
      setTransform(d3.zoomIdentity.translate(0, 0).scale(1));
    }
  }, [votesKey, votes, effectiveMaxVotes]);

  // Effect 2: Setup zoom behavior
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || nodes.length === 0 || disableZoom) return;

    const zoom = d3
      .zoom<SVGSVGElement, undefined>()
      .scaleExtent([ZOOM_CONFIG.min, ZOOM_CONFIG.max])
      .on("zoom", (event) => {
        pendingTransformRef.current = event.transform;
        if (zoomRafIdRef.current != null) return;
        zoomRafIdRef.current = requestAnimationFrame(() => {
          zoomRafIdRef.current = null;
          const next = pendingTransformRef.current;
          if (!next) return;
          setTransform(next);
        });
      });

    const selection = d3.select<SVGSVGElement, undefined>(svg);
    (selection as any).interrupt();
    selection.on(".zoom", null);
    zoomRef.current = zoom as any;
    selection.call(zoom as any);
    (zoom as any).transform(
      selection,
      defaultTransformRef.current || d3.zoomIdentity
    );

    return () => {
      zoom.on("zoom", null);
      selection.on(".zoom", null);
      if (zoomRafIdRef.current != null) {
        cancelAnimationFrame(zoomRafIdRef.current);
        zoomRafIdRef.current = null;
      }
      zoomRef.current = null;
      pendingTransformRef.current = null;
    };
  }, [nodes.length, disableZoom]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative h-[230px]">
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <ZoomButton
            onClick={() => handleZoom(ZOOM_CONFIG.step)}
            icon={Plus}
            label="Zoom in"
          />
          <ZoomButton
            onClick={() => handleZoom(-ZOOM_CONFIG.step)}
            icon={Minus}
            label="Zoom out"
          />
          <ZoomButton
            onClick={handleReset}
            icon={RotateCcw}
            label="Reset zoom"
          />
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_DIMENSIONS.width} ${CHART_DIMENSIONS.height}`}
          style={{ width: "100%", height: "100%" }}
        >
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
          >
            {nodes.map((node) => (
              <BubbleNode key={node.address} node={node} />
            ))}
          </g>
        </svg>
      </div>
      {hasMoreVotes && (
        <div className="mt-2 text-center text-xs text-tertiary">
          Highlighting the most impactful votes
        </div>
      )}
    </div>
  );
}
