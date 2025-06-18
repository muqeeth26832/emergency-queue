import { PatientQueueData, TagColors } from "@/types";
import { Text, View } from "tamagui";

export function PatientInfo({ patient }: { patient: PatientQueueData }) {
  return (
    <View
      width="90%"
      padding={20}
      gap={20}
      backgroundColor="white"
      borderRadius={20}
      shadowColor="black"
      shadowOffset={{ width: 0, height: 0 }}
      shadowOpacity={0.25}
      shadowRadius={3.84}
      alignSelf="center"
    >
      <Text textAlign="center" fontWeight="bold" fontSize={20}>
        📌 Your Triage Information 📌
      </Text>

      <View
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={10}
      >
        {/* Number Pill */}
        <View
          width="20%"
          alignItems="center"
          justifyContent="center"
          padding={10}
          backgroundColor="black"
          borderRadius={9999}
        >
          <Text fontSize={26} color="white" fontWeight="bold">
            #{patient.number}
          </Text>
        </View>

        {/* Assigned Label Pill */}
        <View
          width="70%"
          alignItems="center"
          justifyContent="center"
          backgroundColor={`$${TagColors[patient.assignedLabel]}8`}
          borderRadius={9999}
          paddingVertical={10}
        >
          <Text fontSize={26} fontWeight="bold">
            {patient.assignedLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
