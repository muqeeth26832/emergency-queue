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
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    [setEdges],
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

  const resetTriage = useCallback(() => {
    setSavingChanges(true);
    setlastUpdatedAt(performance.now());

    // Find the root node or create a new one
    const rootNode = nodes.find((node) => node.data.isRoot);

    if (rootNode) {
      // Keep only the root node and clear its value
      setNodes([
        {
          ...rootNode,
          data: { ...rootNode.data, value: "" },
          position: { x: 100, y: 100 },
        },
      ]);
    } else {
      // Create a new root node if none exists
      createRootNode();
    }

    // Clear all edges
    setEdges([]);
    setShowResetConfirm(false);
  }, [nodes, createRootNode]);

  const handleResetClick = useCallback(() => {
    if (nodes.length <= 1 && edges.length === 0) {
      // If only root node exists with no edges, just reset it
      resetTriage();
    } else {
      // Show confirmation for complex triage flows
      setShowResetConfirm(true);
    }
  }, [nodes.length, edges.length, resetTriage]);

  const cancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  useDebouncedCallback(
    async () => {
      if (!lastUpdatedAt) return;
      // save data
      await saveTriage(nodes, edges);
      setSavingChanges(false);
    },
    [lastUpdatedAt],
    3000,
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
        {/* Reset Button */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={handleResetClick}
            className="px-4 py-2 my-[70px] bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-md transition-colors duration-200 flex items-center gap-2"
            title="Reset triage to root node only"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>

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

      {/* Save Status Indicator */}
      <div
        className={clsx(
          "absolute left-[29px] top-[100px] px-4 py-2 rounded-md text-sm z-50 font-medium shadow-md transition-colors duration-300 ease-in-out flex items-center gap-2",
          savingChanges
            ? "bg-yellow-500 text-white"
            : "bg-green-500 text-white",
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Reset Triage Flow?
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              This will permanently delete all triage steps and options, leaving
              only a clean root node. This action cannot be undone.
            </p>

            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Current triage contains:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  {nodes.length} node{nodes.length > 1 ? "s" : ""}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  {edges.length} connection{edges.length > 1 ? "s" : ""}
                </li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetTriage}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Triage
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
