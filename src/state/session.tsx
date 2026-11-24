/**
 * Shared learning and worksheet session: state shape, reducer, context,
 * hook, and record factories.
 *
 * One in-memory session with reducer-based updates preserves lesson and
 * worksheet data across the established routes. Nothing is persisted unless
 * the visitor explicitly enables saving on this device. The provider that
 * owns the session, and the browser storage adapter it uses, live in
 * SessionProvider.tsx so that this module exports no components.
 */
import { createContext, useContext } from "react";
import {
  SCENARIO_BOUNDS,
  known,
  unknown,
  type ScenarioInputs,
} from "@/domain/model";
import type {
  PkiComponent,
  PkiReview,
  RequirementMapping,
  WorksheetAction,
  WorksheetAsset,
} from "@/lib/contracts";

export const DEFAULT_SCENARIO: ScenarioInputs = {
  migrationStartMonth: 0,
  migrationDurationMonths: 24,
  confidentialityLifetimeMonths: known(120),
  attackAssumption: { kind: "assumed", month: 60 },
  assumeCapture: true,
  includeHistoricalCohorts: false,
  horizonMonths: SCENARIO_BOUNDS.defaultHorizonMonths,
};

export interface SessionState {
  scenario: ScenarioInputs;
  /** Optional comprehension check answers by check id. */
  comprehension: Record<string, string | null>;
  flows: WorksheetAsset[];
  signingAssets: WorksheetAsset[];
  pkiReviews: PkiReview[];
  actions: WorksheetAction[];
  /** Opt-in, unencrypted local saving. Off by default. */
  saveOnThisDevice: boolean;
}

export type SessionAction =
  | { type: "set-scenario"; scenario: Partial<ScenarioInputs> }
  | { type: "reset-scenario" }
  | { type: "answer-check"; checkId: string; answer: string | null }
  | { type: "add-flow"; asset: WorksheetAsset }
  | { type: "update-flow"; localId: string; patch: Partial<WorksheetAsset> }
  | { type: "remove-flow"; localId: string }
  | { type: "add-signing-asset"; asset: WorksheetAsset }
  | { type: "update-signing-asset"; localId: string; patch: Partial<WorksheetAsset> }
  | { type: "remove-signing-asset"; localId: string }
  | { type: "add-pki-review"; review: PkiReview }
  | { type: "update-pki-review"; localId: string; patch: Partial<PkiReview> }
  | { type: "remove-pki-review"; localId: string }
  | { type: "add-action"; action: WorksheetAction }
  | { type: "update-action"; localId: string; patch: Partial<WorksheetAction> }
  | { type: "remove-action"; localId: string }
  | { type: "set-save-consent"; enabled: boolean }
  | { type: "hydrate"; state: SessionState }
  | { type: "clear-all-local-work" };

export const initialState: SessionState = {
  scenario: DEFAULT_SCENARIO,
  comprehension: {},
  flows: [],
  signingAssets: [],
  pkiReviews: [],
  actions: [],
  saveOnThisDevice: false,
};

const updateItem = <T extends { localId: string }>(items: T[], localId: string, patch: Partial<T>): T[] =>
  items.map((item) => (item.localId === localId ? { ...item, ...patch } : item));

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "set-scenario":
      return { ...state, scenario: { ...state.scenario, ...action.scenario } };
    case "reset-scenario":
      return { ...state, scenario: DEFAULT_SCENARIO };
    case "answer-check":
      return { ...state, comprehension: { ...state.comprehension, [action.checkId]: action.answer } };
    case "add-flow":
      return { ...state, flows: [...state.flows, action.asset] };
    case "update-flow":
      return { ...state, flows: updateItem(state.flows, action.localId, action.patch) };
    case "remove-flow":
      return { ...state, flows: state.flows.filter((f) => f.localId !== action.localId) };
    case "add-signing-asset":
      return { ...state, signingAssets: [...state.signingAssets, action.asset] };
    case "update-signing-asset":
      return { ...state, signingAssets: updateItem(state.signingAssets, action.localId, action.patch) };
    case "remove-signing-asset":
      return { ...state, signingAssets: state.signingAssets.filter((a) => a.localId !== action.localId) };
    case "add-pki-review":
      return { ...state, pkiReviews: [...state.pkiReviews, action.review] };
    case "update-pki-review":
      return { ...state, pkiReviews: updateItem(state.pkiReviews, action.localId, action.patch) };
    case "remove-pki-review":
      return { ...state, pkiReviews: state.pkiReviews.filter((r) => r.localId !== action.localId) };
    case "add-action":
      return { ...state, actions: [...state.actions, action.action] };
    case "update-action":
      return { ...state, actions: updateItem(state.actions, action.localId, action.patch) };
    case "remove-action":
      return { ...state, actions: state.actions.filter((a) => a.localId !== action.localId) };
    case "set-save-consent":
      return { ...state, saveOnThisDevice: action.enabled };
    case "hydrate":
      return action.state;
    case "clear-all-local-work":
      return { ...initialState, saveOnThisDevice: false };
    default:
      return state;
  }
}

export interface SessionContextValue {
  state: SessionState;
  dispatch: (action: SessionAction) => void;
}

/** Shared by the provider in SessionProvider.tsx and the hook below. */
export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

/** Deterministic local ids for visitor-created records. Not security-sensitive. */
let idCounter = 0;
export function nextLocalId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** An empty flow row a visitor can fill in. Everything starts unknown or blank. */
export function emptyFlow(): WorksheetAsset {
  return {
    localId: nextLocalId("flow"),
    kind: "confidentiality-flow",
    label: "",
    owner: "",
    purpose: "key-establishment",
    scope: "",
    lifetimeBasis: "",
    knownAlgorithms: "",
    dependencies: "",
    evidence: [],
    nextAction: "",
  };
}

export function emptySigningAsset(): WorksheetAsset {
  return {
    ...emptyFlow(),
    localId: nextLocalId("sign"),
    kind: "signing-asset",
    purpose: "signature",
  };
}

export function emptyPkiComponent(reviewId: string): PkiComponent {
  return {
    localId: nextLocalId("comp"),
    role: "issuing-ca",
    name: "",
    purpose: "",
    algorithms: "",
    evidenceLevel: "unknown",
    evidenceNote: "",
    updateOwner: "",
  };
}

export function emptyRequirement(reviewId: string): RequirementMapping {
  return {
    localId: nextLocalId("req"),
    authority: "",
    versionSection: "",
    status: "unknown",
    applicability: "unresolved",
    applicabilityBasis: "",
    boundary: "",
    evidenceNote: "",
    gap: "unknown",
    reviewerNote: "",
    reviewerRole: "",
    reviewedOn: "",
    nextAction: "",
  };
}

export function emptyPkiReview(): PkiReview {
  return {
    localId: nextLocalId("pki"),
    label: "",
    trustContext: "unknown",
    owner: "",
    purpose: "",
    relyingPartyGroup: "",
    exclusions: "",
    components: [],
    requirements: [],
    nextTest: "",
  };
}
