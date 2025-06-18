import { Platform } from "react-native";
import { PatientQueueData, Queue, TriageStep } from "./types";

const HOST = Platform.OS == "android" ? "192.168.1.9" : "127.0.0.1";
const URL = `http://${HOST}:3000`;

export async function getTriageDecisionTree(
  nextStepId: string = "",
): Promise<TriageStep["step"]> {
  return fetch(`${URL}/triage/decision-tree?nextStepId=${nextStepId}`).then(
    (res) => res.json(),
  );
}

export async function getQueue(): Promise<Queue> {
  return fetch(`${URL}/queue`).then((res) => res.json());
}

export async function pushToQueue(
  assignedLabel: string,
): Promise<PatientQueueData> {
  return fetch(`${URL}/queue/new-patient`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignedLabel }),
  }).then((res) => res.json());
}
