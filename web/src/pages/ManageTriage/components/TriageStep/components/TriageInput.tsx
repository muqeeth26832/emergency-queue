import { useReactFlow, type NodeProps } from "@xyflow/react";
import type { TriageNode } from "../../../../../types";
import { useCallback, type ChangeEvent } from "react";

export function TriageInput(props: NodeProps<TriageNode>){
    const {updateNodeData} = useReactFlow();

    const onChange = useCallback( (e: ChangeEvent<HTMLTextAreaElement>)=>{
        updateNodeData(props.id,{value: e.target.value});
    },[props.id])


    if(props.data.stepType === "label"){
        return null;
    }


    return (
        <>
        <h1 className="text-md font-bold">Question</h1>
        <textarea
        id="text"
        name="text"
        maxLength={100}
        value={props.data.value}
        onChange={onChange}
        placeholder="Ex: Is this Triage for you?"
        className="nodrag w-full rounded-[10px] border-[1px] border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        </>
    )
}
