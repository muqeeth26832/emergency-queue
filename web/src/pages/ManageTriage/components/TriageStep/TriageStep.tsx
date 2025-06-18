import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import type { TriageNode } from "../../../../types";
import { useMemo } from "react";
import clsx from "clsx";
import { TriageInput,TriageAddOptions,TriageType ,TriageLabel} from "./components";

export function TriageStep(props: NodeProps<TriageNode>) {
  const edges = useEdges();

  const isConnectable = useMemo(() => {
    // Check if there are no edges pointing to this node
    // This means it can be connected
    return !edges.find((e) => e.target == props.id);
  }, [edges, props.id]);

  return (
    <>
      <div className="w-[300px] flex flex-col items-center rounded-[20px] border-[3px] border-black p-5 gap-2 shadow-lg bg-white">
        {/* Custom input */}
        <TriageInput {...props} />
        {/*  Option */}
        <TriageAddOptions {...props} />
        {/* Type */}
        <TriageType {...props} />
        {/* Label */}
        <TriageLabel {...props} />

      </div>
      {!props.data.isRoot && (
        <Handle 
        type="target" 
        position={Position.Left}
        id={props.id}
        isConnectable={isConnectable}
        className={clsx({
            'flex items-center justify-center w-[40px] h-[40px] bg-gray-200 rounded-full mr-[-25px] shadow-md': true,
            'bg-black border-none': !isConnectable,    
            'border-dotted border-[2px] border-gray-400 bg-white': isConnectable
        })}
        >
           🔗
        </Handle>
      )}
    </>
  );
}
