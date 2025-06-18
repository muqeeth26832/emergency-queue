import { LiveQueue } from "@/components/LiveQueue";
import { getQueue } from "@/services";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, View } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PatientQueueData } from "@/types";
import { PatientInfo } from "@/components/PatientInfo";

import PusherJS from "pusher-js";
import { useEffect } from "react";
import { Alert } from "react-native";
import { Assets } from "@react-navigation/elements";

const pusher = new PusherJS(process.env.EXPO_PUBLIC_PUSHER_KEY!, {
  cluster: "ap2",
});

export default function IndexScreen() {
  const queue = useQuery({
    queryKey: ["queue"],
    queryFn: () => getQueue(),
  });

  const patient = useQuery({
    queryKey: ["patient"],
    queryFn: async () => {
      const data = await AsyncStorage.getItem("patient");
      return data ? (JSON.parse(data) as PatientQueueData) : null;
    },
  });

  const patientMutation = useMutation({
    mutationKey: ["patient"],
    mutationFn: async () => {
      queue.refetch();
      patient.refetch();
    },
  });

  function goToTriage() {
    router.push("/triage");
  }

  useEffect(() => {
    const channel = pusher.subscribe("live-queue");
    channel.bind("patient-in", (number: number) => {
      if (patient.data?.number !== number) queue.refetch();
    });

    channel.bind("patient-out", (number: number) => {
      if (patient.data?.number === number) {
        AsyncStorage.removeItem("patient");
        Alert.alert("Its your turn!", "Please proceed to the doctors office", [
          { text: "OK", onPress: () => patientMutation.mutate() },
        ]);
        AsyncStorage.removeItem("patient");
      } else {
        queue.refetch();
      }
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [patient.data?.number]);

  useFocusEffect(() => {
    patient.refetch();
    queue.refetch();
  });

  return (
    <View
      ai="center"
      f={1}
      pt={20}
      gap={20}
      $theme-light={{ bg: "$red3" }}
      //   $theme-dark={{bg: "$gray2Dark"}}
      height={"100%"}
    >
      {patient.data ? (
        <PatientInfo patient={patient.data} />
      ) : (
        <Button
          onPress={goToTriage}
          size="$5"
          bg="$red10"
          borderRadius={40}
          mx={20}
          my={20}
          width="90%"
          pressStyle={{ borderRightColor: "$red8" }}
          textProps={{ color: "white", fontWeight: "bold", fontSize: 20 }}
        >
          + START TRIAGE +
        </Button>
      )}
      <LiveQueue
        data={queue.data}
        isLoading={queue.isLoading}
        refetch={queue.refetch}
      />
    </View>
  );
}
