import { getTriageDecisionTree, pushToQueue } from "@/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TriageOption, TriageStep } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import { Button, Text, View } from "tamagui";
import { Easing } from "react-native";

const animationConfig = {
  duration: 100,
  easing: Easing.ease,
  useNativeDriver: true,
};

export default function TriageScreen() {
  const [nextStep, setNextStep] = useState<TriageStep["step"]>();
  const ref = useRef(new Animated.Value(0));

  const mutation = useMutation({
    mutationKey: ["triage", "confirm"],
    // add patient to the queue
    mutationFn: pushToQueue,
    onSuccess: async (data) => {
      await AsyncStorage.setItem("patient", JSON.stringify(data));
      router.back();
    },
    onError: ({ message }) => Alert.alert("Error", message),
  });

  const query = useQuery({
    queryKey: ["triage", { nextStep }],
    queryFn: () => getTriageDecisionTree(nextStep),
  });

  async function onNextStep(option: TriageOption) {
    //Animated
    Animated.timing(ref.current, {
      toValue: -Dimensions.get("window").width,
      ...animationConfig,
    }).start(() => {
      if (option.assignedLabel) {
        // assign label to patient
        mutation.mutate(option.assignedLabel);
      }

      if (option.nextStep) setNextStep(option.nextStep);

      ref.current.setValue(Dimensions.get("window").width);
      Animated.timing(ref.current, {
        toValue: 0,
        ...animationConfig,
      }).start();
    });
    //Get new triage
  }

  if (query.isError) {
    return (
      <View f={1} ai="center" jc="center">
        <Text>Error Loading Triage</Text>
      </View>
    );
  }

  return (
    <View bg="$red9" f={1} ai="center" jc="center" height="100%">
      <View
        position="absolute"
        top="30%"
        left="40%"
        transform={[{ translateX: -150 }, { translateY: -150 }]}
      >
        <Text fontSize={300} color="white" opacity={0.7}>
          🚑
        </Text>
      </View>

      <Animated.View
        style={{
          transform: [{ translateX: ref.current }],
          flex: 1,
          width: "100%",
        }}
      >
        {query.isLoading ? (
          <View f={1} jc="center" ai="center">
            <ActivityIndicator animating size="large" />
          </View>
        ) : (
          <>
            <View ai="center" jc="center" h="20%">
              <Text
                px="$3"
                fontSize={30}
                fontWeight={400}
                color="white"
                fontStyle="italic"
              >
                {query.data?.step}
              </Text>
            </View>
            <FlatList
              data={query.data?.options}
              keyExtractor={({ value }) => value}
              style={{ width: "100%" }}
              renderItem={({ item }) => (
                <Button
                  onPress={() => onNextStep(item)}
                  bg="white"
                  m={20}
                  w="90%"
                  size="$6"
                  textProps={{ fos: 20, fow: 700 }}
                  pressStyle={{ bg: "$red5" }}
                >
                  {item.value}
                </Button>
              )}
            ></FlatList>
          </>
        )}
      </Animated.View>
    </View>
  );
}
