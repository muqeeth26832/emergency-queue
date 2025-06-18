import { type Node } from "@xyflow/react";

// Custom node types used in the triage flow
export enum CustomNodeTypes {
  TriageStep = "triageStep",
  TriageOption = "triageOption",
}

// Patient classification labels
export enum TriageTags {
  Emergency = "Emergency", // Requires immediate attention
  Delayed = "Delayed", // Can wait without risk
  Minor = "Minor", // Minimal or no treatment needed
}

// Types of steps within the triage flow
export enum StepTypes {
  Step = "step", // Decision point
  Label = "label", // Final categorization
}

// Node representing a triage step (either decision or label)
export type TriageNode = Node<{
  value: string;
  isRoot: boolean;
  stepType: StepTypes;
  assignedLabel?: TriageTags;
}>;

// Node representing an option leading out of a TriageStep
export type TriageOptionNode = Node<{
  value: string;
  index: number; // Order among sibling options
}>;

// Represents a patient in the triage queue
export type PatientQueueData = {
  number: number;
  assignedLabel: TriageTags;
};

// The full queue of triaged patients
export type Queue = PatientQueueData[];
