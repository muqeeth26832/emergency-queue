import { Queue, TagColors } from "@/types";
import { FlatList } from "react-native";
import { Text, View } from "tamagui";

interface Props {
  data?: Queue;
  isLoading: boolean;
  refetch: () => void;
}

export function LiveQueue({ data, isLoading, refetch }: Props) {
  return (
    <View width="100%" alignItems="center">
      {/* Header */}
      <View marginVertical={20} width="100%" alignItems="center">
        <View
          backgroundColor="$red10"
          width="90%"
          paddingHorizontal={24}
          paddingVertical={12}
          borderRadius={9999}
          alignItems="center"
          justifyContent="center"
          shadowColor="black"
          shadowOpacity={0.2}
          shadowRadius={6}
        >
          <Text
            color="white"
            textAlign="center"
            fontWeight="bold"
            fontSize={28}
          >
            🚨 Live Queue 🚨
          </Text>
        </View>
      </View>

      {/* Queue List */}
      <FlatList
        onRefresh={refetch}
        refreshing={isLoading}
        data={data}
        keyExtractor={({ number }) => number.toString()}
        ListEmptyComponent={() => (
          <Text margin={20} textAlign="center" fontWeight="400" fontSize={20}>
            {isLoading ? "Loading..." : "There's currently no one in the queue"}
          </Text>
        )}
        ItemSeparatorComponent={() => <View height={15} />}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 200 }}
        style={{ width: "100%" }}
        renderItem={({ item }) => (
          <View
            flexDirection="row"
            padding={16}
            alignItems="center"
            justifyContent="space-between"
            width="90%"
            backgroundColor={`$${TagColors[item.assignedLabel]}8`}
            borderRadius={50}
            shadowColor="black"
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={0.25}
            shadowRadius={3.84}
          >
            <View
              backgroundColor={`$${TagColors[item.assignedLabel]}4`}
              borderRadius={50}
              paddingHorizontal={16}
              paddingVertical={2}
            >
              <Text fontWeight="bold" fontSize={24} color="black">
                #{item.number}
              </Text>
            </View>
            <Text fontWeight="bold" fontSize={24} width={200}>
              {item.assignedLabel}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
