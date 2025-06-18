import { useMutation, useQuery } from "@tanstack/react-query";
import { callForAssessment, getQueue } from "../../services";
import clsx from "clsx";
import { TriageTags } from "../../types";
import { useEffect } from "react";
import PusherJS from "pusher-js";

const pusher = new PusherJS(import.meta.env.VITE_PUSHER_KEY, {
  cluster: "ap2",
});

export const colors = {
  [TriageTags.Emergency]: {
    default: "bg-red-100",
    label: "bg-red-500 text-white",
  },
  [TriageTags.Delayed]: {
    default: "bg-yellow-100",
    label: "bg-yellow-500 text-black",
  },
  [TriageTags.Minor]: {
    default: "bg-green-100",
    label: "bg-green-500 text-white",
  },
};

export function LiveQueue() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["queue"],
    queryFn: getQueue,
  });

  const { mutate } = useMutation({
    mutationFn: callForAssessment,
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    const channel = pusher.subscribe("live-queue");
    channel.bind("patient-in", () => refetch());
    // return () => {
    //   channel.unsubscribe();
    // };
  }, []);

  if (isError) {
    return (
      <div className="text-red-600 text-center mt-10">
        ❌ Error fetching queue
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="p-4 mt-20 flex justify-center text-lg text-gray-600">
        {isLoading ? "⏳ Loading..." : "No one in the queue right now."}
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center max-w-2xl mx-auto">
      <h1 className="mt-6 text-4xl font-bold mb-6 animate-bounce text-center">
        🚨 Live Queue 🚨
      </h1>
      <ul className="space-y-6 w-full">
        {data.map((patient) => (
          <li
            key={patient.number}
            className={clsx(
              "w-full rounded-xl shadow-md p-6 transform transition hover:scale-[1.02]",
              colors[patient.assignedLabel].default,
              "border-l-8",
              {
                "border-red-500":
                  patient.assignedLabel === TriageTags.Emergency,
                "border-yellow-400":
                  patient.assignedLabel === TriageTags.Delayed,
                "border-green-500": patient.assignedLabel === TriageTags.Minor,
              },
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-start space-y-2">
                <span className="text-gray-600 text-sm">Patient No.</span>
                <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-xl font-semibold tracking-wide">
                  {patient.number}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className="text-gray-600 text-sm">Priority</span>
                <div
                  className={clsx(
                    "px-4 py-1 rounded-full text-md font-bold capitalize shadow",
                    colors[patient.assignedLabel].label,
                  )}
                >
                  {patient.assignedLabel}
                </div>
              </div>
            </div>

            <button
              onClick={() => mutate(patient.number)}
              className="w-full mt-5 rounded-full border-2 border-gray-400 hover:bg-white transition-all font-bold py-2 text-gray-700 hover:shadow-md"
            >
              📞 Call For Assessment
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
