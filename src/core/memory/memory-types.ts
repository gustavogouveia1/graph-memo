export type MemoryNodeType = "file" | "symbol" | "concept" | "task" | "note" | "agent" | "other";

export type MemoryRelationType =
  | "references"
  | "contains"
  | "derived_from"
  | "related_to"
  | "depends_on"
  | "duplicates"
  | "causes"
  | "resolves"
  | "evolves";

export interface MemorySource {
  kind: "code" | "chat" | "note" | "runtime" | "manual" | "other";
  location?: string;
  correlationId?: string;
  provider?: string;
}

interface BaseMemoryItem {
  createdAt: string;
  observedAt?: string;
  lastConfirmedAt?: string;
  source?: MemorySource;
  confidence?: number;
}

export interface MemoryNode extends BaseMemoryItem {
  id: string;
  type: MemoryNodeType;
  label: string;
  description?: string;
  tags?: string[];
  data?: Record<string, unknown>;
}

export interface MemoryEdge extends BaseMemoryItem {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: MemoryRelationType;
  data?: Record<string, unknown>;
}

export interface MemoryFact extends BaseMemoryItem {
  id: string;
  subjectNodeId: string;
  predicate: string;
  object: string | number | boolean | null;
  data?: Record<string, unknown>;
}

export interface MemoryEvent extends BaseMemoryItem {
  id: string;
  nodeId?: string;
  title: string;
  description?: string;
  data?: Record<string, unknown>;
}

export type MemoryTaskStatus = "pending" | "in_progress" | "blocked" | "completed" | "cancelled";

export interface MemoryTask extends BaseMemoryItem {
  id: string;
  title: string;
  status: MemoryTaskStatus;
  relatedNodeIds?: string[];
  data?: Record<string, unknown>;
}

export interface MemoryMeta {
  schemaVersion: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export const MEMORY_SCHEMA_VERSION = "1";
