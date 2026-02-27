"use client";

import { memo, useCallback, useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import TokenAmount from "../TokenAmount";
import { parseNearAmount } from "@near-js/utils";

interface ProjectionSliderProps {
  apy: number; // Annual percentage yield as decimal (e.g., 0.0599 for 5.99%)
  startingAmount: number;
  className?: string;
  onProjectionChange?: (projection: { amount: number; years: number }) => void;
}

const timeLabels = [
  "Today",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
];

const MAX_YEARS = timeLabels.length - 1;

export const ProjectionSlider = memo(
  ({
    apy,
    startingAmount,
    className,
    onProjectionChange,
  }: ProjectionSliderProps) => {
    const [selectedValue, setSelectedValue] = useState(0); // Now supports decimal values
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLInputElement>(null);

    const calculateProjection = useCallback(
      (years: number) => {
        if (years === 0) return startingAmount;
        return startingAmount * (1 + apy * years);
      },
      [apy, startingAmount]
    );

    const updateValue = useCallback(
      (value: number) => {
        setSelectedValue(value);
        if (sliderRef.current) {
          sliderRef.current.value = String(value);
        }
        const projection = {
          amount: calculateProjection(value),
          years: value,
        };
        onProjectionChange?.(projection);
      },
      [calculateProjection, onProjectionChange]
    );

    const handleSliderChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(event.target.value);

        // Snap to exact year values when within 0.05 of them
        const nearestYear = Math.round(value);
        if (Math.abs(value - nearestYear) < 0.05) {
          value = nearestYear;
        }

        updateValue(value);
      },
      [updateValue]
    );

    const handleMouseDown = useCallback(() => {
      setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    const currentProjection = calculateProjection(selectedValue);
    const progressPercentage = (selectedValue / MAX_YEARS) * 100;
    const shouldShowDecimals = startingAmount < 100;

    const targetDate = useMemo(() => {
      const now = new Date();
      const yearsToAdd = selectedValue;
      const targetDate = new Date(now);
      targetDate.setFullYear(now.getFullYear() + Math.floor(yearsToAdd));
      const remainingDays = Math.round((yearsToAdd % 1) * 365);
      targetDate.setDate(targetDate.getDate() + remainingDays);
      return targetDate;
    }, [selectedValue]);

    const formattedDate = useMemo(() => {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }, [targetDate]);

    return (
      <div className={cn("w-full max-w-4xl mx-auto", className)}>
        <div className="mb-8 text-center">
          <h3 className="text-lg font-medium text-primary mb-2">
            With {(apy * 100).toFixed(2)}% voting power growth, how much veNEAR
            would you get by locking?
          </h3>
          <div className="text-6xl font-bold text-primary mb-8 tabular-nums">
            <TokenAmount
              amount={parseNearAmount(currentProjection.toString()) ?? "0"}
              compact={false}
              hideCurrency={true}
              minimumFractionDigits={shouldShowDecimals ? 4 : 0}
              maximumSignificantDigits={shouldShowDecimals ? 4 : 0}
            />
          </div>
        </div>

        <div className="relative">
          <div className="relative h-2 bg-gray-200 rounded-full mb-6">
            <div
              className={cn(
                "absolute h-2 rounded-full",
                isDragging ? "transition-none" : "transition-all duration-150"
              )}
              style={{
                background: "#00E391",
                width: `${progressPercentage}%`,
              }}
            />

            {/* Slider Handle */}
            <div
              className={cn(
                "absolute w-6 h-6 bg-gray-800 rounded-full border-4 border-white shadow-lg transform -translate-y-2",
                isDragging
                  ? "transition-none scale-110"
                  : "transition-all duration-150"
              )}
              style={{
                left: `calc(${progressPercentage}% - 12px)`,
              }}
            />
          </div>

          {/* Hidden Range Input */}
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max={MAX_YEARS}
            step="0.01" // Allow fine-grained control
            value={selectedValue}
            onChange={handleSliderChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Time Labels */}
          <div className="flex justify-between text-sm text-primary font-medium relative z-20">
            {timeLabels.map((label, index) => {
              const isActive =
                selectedValue >= index - 0.1 && selectedValue <= index + 0.1;

              return (
                <div
                  key={label}
                  className={cn(
                    "flex flex-col items-center transition-colors duration-200 cursor-pointer hover:text-primary",
                    isActive ? "text-primary font-bold" : "text-gray-400",
                    isActive && isDragging ? "scale-110" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateValue(index);
                  }}
                >
                  <span className="pointer-events-auto">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Always-visible Date Display */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 mb-1">
              Target Date:{" "}
              <span className="font-semibold text-primary">
                {formattedDate}
              </span>
              {selectedValue > 0 && (
                <span className="text-gray-500 ml-2">
                  (
                  {selectedValue % 1 === 0
                    ? `${selectedValue} years`
                    : `${selectedValue.toFixed(2)} years`}
                  )
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProjectionSlider.displayName = "ProjectionSlider";
