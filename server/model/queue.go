package model

type QueueEntry struct {
	AssignedLabel string `json:"assignedLabel"`
	Number        int    `json:"number"`
}

func QueueEntryToInterfaces[T any](queue []T) []interface{} {
	result := make([]interface{}, len(queue))

	for i, v := range queue {
		result[i] = v
	}
	return result
}
