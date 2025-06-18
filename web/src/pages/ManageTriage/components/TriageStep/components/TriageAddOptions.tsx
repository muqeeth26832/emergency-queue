import { useNodes, useReactFlow, type NodeProps } from "@xyflow/react";
import {
  CustomNodeTypes,
  type TriageNode,
  type TriageOptionNode,
} from "../../../../../types";
import { useCallback, useMemo } from "react";

export function TriageAddOptions(props: NodeProps<TriageNode>) {
  const nodes = useNodes();
  const { addNodes } = useReactFlow();

  // every child of props.id
  const optionSiblings = useMemo(() => {
    return nodes.filter(({ parentId }) => parentId === props.id);
  }, [props.parentId, nodes]) as TriageOptionNode[];

  const onAddOption = useCallback(() => {
    const newSibling: TriageOptionNode = {
      id: crypto.randomUUID(),
      parentId: props.id,
      type: CustomNodeTypes.TriageOption,
      position: { x: 5, y: 0 }, // You can dynamically calculate position if needed
      data: {
        value: "",
        index: optionSiblings.length,
      },
    };

    let y = 0;
    if (optionSiblings.length) {
      const lastSibling = optionSiblings[optionSiblings.length - 1];
      y = lastSibling.position.y + 90;
    } else {
      y = props.height ? props.height : 0; // Default position if no siblings exist
    }

    newSibling.position.y = y;
    addNodes([newSibling]);
  }, [optionSiblings, props.id]);

  // Only show options if stepType is not "label"
  if (props.data.stepType === "label") return null;

  return (
    <>
      <h1 className="text-md font-bold mt-5">Options</h1>

      <div
        onClick={onAddOption}
        className="nodrag flex items-center justify-center w-full h-10 bg-gray-100 rounded-[10px] border-[1px] border-gray-300 p-2 cursor-pointer hover:bg-gray-200 transition-colors duration-200 border-dotted hover:border-gray-400"
        style={{marginBottom: 90 *optionSiblings.length +"px"}}
      >
        <h1 className="text-xl font-bold text-gray-500">➕ Add Option</h1>
      </div>
    </>
  );
}
