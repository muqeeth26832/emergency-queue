import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { getTriage, saveTriage } from "../../services";
import { CustomNodeTypes, StepTypes } from "../../types";
import { EmptyTriage } from "./components/EmptyTriage";
import { TriageOption } from "./components/TriageOption/TriageOption";
import { TriageStep } from "./components/TriageStep/TriageStep";

const nodeTypes = {
  triageStep: TriageStep,
  triageOption: TriageOption,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: "black" },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "black",
  },
  zIndex: 1,
  animated: true,
};

const connectionLineStyle = {
  strokeWidth: 3,
  stroke: "black",
};

export function ManageTriage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [savingChanges, setSavingChanges] = useState(false);
  const [lastUpdatedAt, setlastUpdatedAt] = useState<number | null>(null);

  const onNodesChange: OnNodesChange<Node> = useCallback((changes) => {
    setSavingChanges(true);
    setlastUpdatedAt(performance.now());
    setNodes((nodes) => applyNodeChanges(changes, nodes));
  }, []);

  const onEdgesChange: OnEdgesChange<Edge> = useCallback((changes) => {
    setSavingChanges(true);
    setlastUpdatedAt(performance.now());
    setEdges((edges) => applyEdgeChanges(changes, edges));
  }, []);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setSavingChanges(true);
      setlastUpdatedAt(performance.now());
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const createRootNode = useCallback(() => {
    setNodes([
      {
        id: crypto.randomUUID(),
        type: CustomNodeTypes.TriageStep,
        position: { x: 100, y: 100 },
        data: { value: "", isRoot: true, stepType: StepTypes.Step },
      },
    ]);
  }, []);

  useDebouncedCallback(
    async () => {
      if (!lastUpdatedAt) return;
      // save data
      await saveTriage(nodes, edges);
      setSavingChanges(false);
    },
    [lastUpdatedAt],
    3000
  );

  useEffect(() => {
    (async () => {
      const { nodes, edges } = await getTriage();
      setNodes(nodes);
      setEdges(edges);
    })();
  }, []);

  if (!nodes.length) return <EmptyTriage onClick={createRootNode} />;

  return (
    <>
      <div className="h-[calc(100vh-4rem)] w-full bg-gray-50 p-4">
        {" "}
        {/* Better sizing and spacing */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodeTypes={nodeTypes}
          className="border-2 border-gray-200 rounded-lg shadow-lg"
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineStyle={connectionLineStyle}
        >
          <Controls />
          <MiniMap />
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="#f87171"
          />
        </ReactFlow>
      </div>

      <div
        className={clsx(
          "absolute  left-[29px] top-[100px] px-4 py-2 rounded-md text-sm z-50 font-medium shadow-md transition-colors duration-300 ease-in-out flex items-center gap-2",
          savingChanges ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
        )}
      >
        {savingChanges && (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {savingChanges ? "Saving Changes..." : "Changes Saved!"}
      </div>
    </>
  );
}
