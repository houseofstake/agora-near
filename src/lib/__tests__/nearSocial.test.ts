import { describe, it, expect } from "vitest";
import {
  extractNearSocialProfile,
  extractNearSocialDisplayNames,
  mergeNearSocialProfile,
  validatePayloadSize,
} from "../nearSocial";

describe("nearSocial", () => {
  describe("extractNearSocialProfile", () => {
    it("should preserve data through write/read cycle", () => {
      const written = {
        name: "Alice",
        statement: "My delegate statement",
        topIssues: '[{"type":"Governance","value":"Decentralization"}]',
        codeOfConductSigned: "Signed",
      };

      const response = { "alice.near": { hos: { profile: written } } };
      const read = extractNearSocialProfile(response, "alice.near");

      expect(read?.name).toBe(written.name);
      expect(read?.statement).toBe(written.statement);
      expect(read?.topIssues).toEqual([
        { type: "Governance", value: "Decentralization" },
      ]);
      expect(read?.codeOfConductSigned).toBe("Signed");
    });

    it("should return undefined for null fields (cleared via SocialDB)", () => {
      const response = {
        "alice.near": {
          hos: {
            profile: { name: null, statement: "Still here", topIssues: null },
          },
        },
      };

      const read = extractNearSocialProfile(response, "alice.near");

      expect(read?.name).toBeUndefined();
      expect(read?.statement).toBe("Still here");
      expect(read?.topIssues).toBeUndefined();
    });

    it("should return null for missing account", () => {
      const response = { "other.near": { hos: { profile: {} } } };
      const read = extractNearSocialProfile(response, "alice.near");
      expect(read).toBeNull();
    });
  });

  describe("extractNearSocialDisplayNames", () => {
    it("should extract display names for multiple accounts", () => {
      const response = {
        "alice.near": { hos: { profile: { name: "Alice" } } },
        "bob.near": { hos: { profile: { name: "Bob" } } },
        "charlie.near": { hos: { profile: {} } },
      };

      const names = extractNearSocialDisplayNames(response, [
        "alice.near",
        "bob.near",
        "charlie.near",
        "missing.near",
      ]);

      expect(names["alice.near"]).toBe("Alice");
      expect(names["bob.near"]).toBe("Bob");
      expect(names["charlie.near"]).toBeUndefined();
      expect(names["missing.near"]).toBeUndefined();
    });
  });

  describe("mergeNearSocialProfile", () => {
    it("should preserve unknown fields from other applications", () => {
      const existing = { name: "Alice", widgetSettings: { theme: "dark" } };
      const update = { statement: "New statement" };

      const merged = mergeNearSocialProfile(existing, update);

      expect(merged.widgetSettings).toEqual({ theme: "dark" });
      expect(merged.statement).toBe("New statement");
    });

    it("should overwrite fields with null for SocialDB clears", () => {
      const existing = {
        name: "Alice",
        statement: "Hello",
        topIssues: "[...]",
      };
      const update = { name: null, statement: null };

      const merged = mergeNearSocialProfile(existing, update);

      expect(merged.name).toBeNull();
      expect(merged.statement).toBeNull();
      expect(merged.topIssues).toBe("[...]");
    });
  });

  describe("validatePayloadSize", () => {
    it("should accept max-size profile within 0.1 NEAR storage deposit", () => {
      // 10KB limit ensures profile fits in default 0.1 NEAR deposit
      const maxProfile = {
        name: "A".repeat(80),
        statement: "B".repeat(4000),
        topIssues: JSON.stringify(
          Array(5).fill({ type: "T".repeat(50), value: "V".repeat(280) })
        ),
        codeOfConductSigned: "Signed",
      };

      const { isValid, size } = validatePayloadSize(maxProfile);

      expect(isValid).toBe(true);
      expect(size).toBeLessThan(10000);
    });
  });
});
