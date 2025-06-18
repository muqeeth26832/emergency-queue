package model

type Edge struct {
	Id     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

type Node struct {
	Id       string `json:"id"`
	Type     string `json:"type"`
	Position struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"position"`
}

type TirageNode struct {
	Node // embed Node
	Data struct {
		Value         string `json:"value"`
		IsRoot        bool   `json:"isRoot"`
		StepType      string `json:"stepType"`
		AssignedLabel string `json:"assignedLabel"`
	} `json:"data"`
}

type TirageOptionNode struct {
	Node            // embed Node
	ParentId string `json:"parentId"`
	Data     struct {
		Value string `json:"value"`
		Index int    `json:"index"`
	} `json:"data"`
}

// Map []T to []interface{} for MongoDB compatibility
func NodesToInterfaces[T any](nodes []T) []interface{} {
	result := make([]interface{}, len(nodes))
	for i, val := range nodes {
		result[i] = val
	}
	return result
}

func MergeNodes(tnodes []*TirageNode, onodes []*TirageOptionNode) []interface{} {
	return append(NodesToInterfaces(tnodes), NodesToInterfaces(onodes)...)
}
