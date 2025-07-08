import {
  Handle,
  Position,
  useEdges,
  useNodes,
  useReactFlow,
} from "@xyflow/react";
import type { NodeProps } from "@xyflow/system";
import clsx from "clsx";
import { useCallback, useMemo, useState, type ChangeEvent } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const parentNode = useMemo(() => {
    return nodes.find((node) => node.id === props.parentId);
  }, [nodes, props]) as TriageNode;

  const siblings = useMemo(() => {
    return nodes.filter((node) => node.parentId === props.parentId);
  }, [nodes, props.parentId, props.id]) as TriageOptionNode[];

  const connectedNodes = useMemo(() => {
    return edges
      .filter((edge) => edge.source === props.id)
      .map((edge) => nodes.find((node) => node.id === edge.target))
      .filter(Boolean);
  }, [edges, nodes, props.id]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(props.id, { value: e.target.value });
    },
    [props.id, updateNodeData],
  );

  const isConnectable = useMemo(() => {
    return !edges.find(({ source }) => source === props.id);
  }, [edges, props.id]);

  const onDelete = useCallback(async () => {
    // Get all connected edges and nodes for deletion
    const connectedEdges = edges.filter(
      (edge) => edge.source === props.id || edge.target === props.id,
    );

    const nodesToDelete = [{ id: props.id }];

    // If this option has connected nodes, include them in deletion
    connectedNodes.forEach((node) => {
      if (node) {
        nodesToDelete.push({ id: node.id });
      }
    });

    // Delete the node and its connected elements
    await deleteElements({
      nodes: nodesToDelete,
      edges: connectedEdges.map((edge) => ({ id: edge.id })),
    });

    // Update sibling positions and indices
    siblings.forEach(({ data, id, position }) => {
      if (id !== props.id && data.index > props.data.index) {
        updateNode(id, {
          position: { x: position.x, y: position.y - 90 },
          data: { ...data, index: data.index - 1 },
        });
      }
    });

    setShowDeleteConfirm(false);
  }, [
    props.id,
    props.data.index,
    siblings,
    edges,
    connectedNodes,
    deleteElements,
    updateNode,
  ]);

  const onDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (connectedNodes.length > 0) {
        setShowDeleteConfirm(true);
      } else {
        onDelete();
      }
    },
    [connectedNodes.length, onDelete],
  );

  const onCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const onAddNestedChild = useCallback(async () => {
    const newTriageNode: TriageNode = {
      id: crypto.randomUUID(),
      type: CustomNodeTypes.TriageStep,
      position: {
        x: props.positionAbsoluteX + 500,
        y: props.positionAbsoluteY + props.data.index * 220,
      },
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
  }, [
    props.id,
    props.positionAbsoluteX,
    props.positionAbsoluteY,
    props.data.index,
    addNodes,
    addEdges,
  ]);

  if (parentNode?.data.stepType === "label") {
    return null;
  }

  return (
    <>
      <div
        className="nodrag relative flex items-center justify-around w-full max-w-[300px] h-[70px] px-2 py-2 gap-3 bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Delete Button - Updated styling and behavior */}
        <button
          onClick={onDeleteClick}
          className={clsx(
            "flex-shrink-0 w-9 h-9 rounded-full font-bold text-lg shadow transition-all duration-200",
            isHovered
              ? "bg-red-500 hover:bg-red-600 text-white transform scale-110"
              : "bg-red-100 hover:bg-red-200 text-red-500",
          )}
          title={
            connectedNodes.length > 0
              ? "Delete Option and Connected Steps"
              : "Delete Option"
          }
        >
          {isHovered ? "✕" : "❌"}
        </button>

        {/* Input */}
        <textarea
          className="flex-1 text-sm resize-none leading-snug h-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner mr-2 ml-[-4px] w-fit"
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
            "flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200 cursor-pointer shadow transition-colors duration-200 bg-amber-300",
            isConnectable
              ? "bg-white text-black border-[2px] border-dotted border-gray-400 hover:bg-black hover:text-white"
              : "bg-black text-white border-none",
          )}
        >
          🔗
        </Handle>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Option with Connected Steps?
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              This option has {connectedNodes.length} connected step
              {connectedNodes.length > 1 ? "s" : ""}. Deleting this option will
              also remove all connected steps and their sub-branches.
            </p>

            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Connected steps:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {connectedNodes.map((node, index) => (
                  <li key={node?.id || index} className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    {node?.data?.value || "Untitled Step"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
