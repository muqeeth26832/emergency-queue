import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function useDebouncedCallback<T>(
    callback: ()=>void,
    dependencies: T[],
    timeout : number){
        const timer = useRef<number>(0)
    
        useEffect(()=>{
            clearTimeout(timer.current)
            timer.current = setTimeout(callback,timeout)
            return ()=>{
            clearTimeout(timer.current)
            }
        },dependencies)
}
