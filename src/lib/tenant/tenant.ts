import { TenantUI } from "@/lib/tenant/tenantUI";
import { type TenantNamespace, type TenantToken } from "../types";
import { nearTenantUIConfig } from "./configs/ui/near";
import { NEAR_NOMINATION_EXP } from "@near-js/utils";

export const BRAND_NAME_MAPPINGS: Record<string, string> = {
  near: "NEAR",
};

export default class Tenant {
  private static instance: Tenant;

  private readonly _isProd: boolean;

  private constructor() {
    this._isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
  }

  public get isProd(): boolean {
    return this._isProd;
  }

  public get contractEnvironment(): string {
    const env = process.env.NEXT_PUBLIC_AGORA_ENV || "unknown";
    // Local uses dev contracts
    return env === "local" ? "dev(?)" : env;
  }

  public get namespace(): TenantNamespace {
    return "near";
  }

  public get slug(): string {
    return "NEAR";
  }

  public get token(): TenantToken {
    return {
      name: "NEAR Protocol",
      symbol: "NEAR",
      decimals: NEAR_NOMINATION_EXP,
    };
  }

  public get ui(): TenantUI {
    return nearTenantUIConfig;
  }

  public get brandName(): string {
    return "NEAR";
  }

  public get isMaintenanceMode(): boolean {
    return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  }

  public static current(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }
}
