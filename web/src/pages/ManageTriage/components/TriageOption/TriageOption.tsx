import {
  Handle,
  Position,
  useEdges,
  useNodes,
  useReactFlow,
} from "@xyflow/react";
import type { NodeProps } from "@xyflow/system";
import clsx from "clsx";
import { useCallback, useMemo, type ChangeEvent } from "react";
import {
  CustomNodeTypes,
  StepTypes,
  type TriageNode,
  type TriageOptionNode,
} from "../../../../types";

export function TriageOption(props: NodeProps<TriageOptionNode>) {
  const nodes = useNodes();
  const edges = useEdges();
  const { deleteElements, updateNodeData, updateNode, addNodes, addEdges } =
    useReactFlow();

  const parentNode = useMemo(() => {
    return nodes.find((node) => node.id === props.parentId);
  }, [nodes, props]) as TriageNode;

  const siblings = useMemo(() => {
    return nodes.filter((node) => node.parentId === props.parentId);
  }, [nodes, props.parentId, props.id]) as TriageOptionNode[];

  const onChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(props.id, { value: e.target.value });
    },
    [props.id]
  );

  const isConnectable = useMemo(() => {
    return !edges.find(({ source }) => source === props.id);
  }, [edges, props.id]);

  const onDelete = useCallback(async () => {
    await deleteElements({ nodes: [{ id: props.id }] });
    // need to update y position of siblings

    siblings.forEach(({ data, id, position }) => {
      if (id != props.id && data.index > props.data.index) {
        updateNode(id, {
          position: { x: position.x, y: position.y - 90 },
          data: { index: data.index - 1 },
        });
      }
    });
  }, [props.id, siblings]);

  const onAddNestedChild = useCallback(async () => {
    const newTriageNode: TriageNode = {
      id: crypto.randomUUID(),
      type: CustomNodeTypes.TriageStep,
      position: { x: props.positionAbsoluteX + 500, y: props.positionAbsoluteY + props.data.index *220 },
      data: {
        value: "",
        isRoot: false,
        stepType: StepTypes.Step,
      },
    };

    addNodes([newTriageNode]);
    addEdges([
      {
        id: crypto.randomUUID(),
        source: props.id,
        target: newTriageNode.id,
      },
    ]);
  }, []);

  if (parentNode.data.stepType === "label") {
    return null;
  }

  return (
    <div className="nodrag relative flex items-center justify-around w-full max-w-[300px] h-[70px] px-2 py-2 gap-3 bg-transparent">
      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-red-500 font-bold text-lg shadow"
        title="Delete Option"
      >
        ❌
      </button>

      {/* Input */}
      <textarea
        className="flex-1 text-sm resize-none leading-snug h-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner mr-2 ml-[-4px]
        w-fit"
        placeholder="Enter triage option"
        value={props.data.value}
        onChange={onChange}
        maxLength={100}
      />

      {/* Right Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={props.id}
        isConnectable={isConnectable}
        onClick={onAddNestedChild}
        className={clsx(
          "flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200 cursor-pointer shadow-transition=colors duration-200 bg-amber-300",
          isConnectable
            ? "bg-white text-black border-[2px] border-dotted border-gray-400 hover:bg-black hover:text-white"
            : "bg-black text-white border-none"
        )}
      >
        🔗
      </Handle>
    </div>
  );
}
