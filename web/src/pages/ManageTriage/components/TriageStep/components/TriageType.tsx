import { useReactFlow, type NodeProps } from "@xyflow/react";
import { StepTypes, type TriageNode } from "../../../../../types";
import clsx from "clsx";
import { useCallback } from "react";

export function TriageType(props: NodeProps<TriageNode>) {
  const { updateNodeData } = useReactFlow();

  const updateStepType = useCallback(
    (stepType: StepTypes) => {
      updateNodeData(props.id, { stepType, assignedLabel: undefined });
    },
    [props.id]
  );

  if (props.data.isRoot) {
    return null;
  }

  return (
    <div className="absolute bg-white w-[270px] flex flex-row justify-between items-center left-[16px] top-[-56px] px-4 py-2 rounded-tl-[20px] rounded-tr-[12px] shadow-md border border-gray-200 z-10">
      {[StepTypes.Step, StepTypes.Label].map((option) => {
        const isActive = props.data.stepType === option;

        return (
          <button
            key={option}
            onClick={() => updateStepType(option)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200",
              isActive
                ? "bg-black text-white border border-gray-800 shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
            )}
          >
            {option === StepTypes.Step ? "Triage Step" : "Assign Label"}
          </button>
        );
      })}
    </div>
  );
}
