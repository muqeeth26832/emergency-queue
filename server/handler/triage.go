package handler

import (
	"context"
	"time"

	"github.com/emergency-queue-v1/model"
	"github.com/emergency-queue-v1/storage"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type TriageHandler struct {
	storage *storage.TriageStorage
}

func (h *TriageHandler) Get(ctx *fiber.Ctx) error {
	context, cancel := context.WithTimeout(context.Background(), time.Duration(5*time.Second))
	defer cancel()

	TNodes, ONodes, Edges, err := h.storage.Get(context)
	if err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	nodes := model.MergeNodes(TNodes, ONodes)

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"nodes": nodes,
		"edges": Edges,
	})

}

func (h *TriageHandler) Post(ctx *fiber.Ctx) error {
	context, cancel := context.WithTimeout(context.Background(), time.Duration(5*time.Second))
	defer cancel()

	var body struct {
		TNodes []*model.TirageNode       `json:"nodes" validate:"required"`
		ONodes []*model.TirageOptionNode `json:"optionNodes" validate:"required"`
		Edges  []*model.Edge             `json:"edges" validate:"required"`
	}

	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := validator.New().Struct(&body); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	if err := h.storage.Post(context, body.TNodes, body.ONodes, body.Edges); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	return ctx.SendStatus(fiber.StatusOK)

}

func (h *TriageHandler) GetTriageDecisionTree(ctx *fiber.Ctx) error {
	context, cancel := context.WithTimeout(context.Background(), time.Duration(5*time.Second))
	defer cancel()

	TNodes, ONodes, Edges, err := h.storage.Get(context)
	if err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	// what is the value of this stepId
	nextStepId := ctx.Query("nextStepId", "")
	// to store that ans node
	currentNodeStep := &model.TirageNode{}

	// to store value of that node
	var step string
	options := []map[string]string{}

	// find node in TNodes and store node and its value
	for _, node := range TNodes {
		if (nextStepId == "" && node.Data.IsRoot) || node.Id == nextStepId {
			currentNodeStep = node
			step = node.Data.Value
			break
		}
	}

	for _, ONode := range ONodes {
		// find all child nodes
		if ONode.ParentId == currentNodeStep.Id {
			option := make(map[string]string)
			// store question in option
			option["value"] = ONode.Data.Value

			for _, edge := range Edges {
				// find child of that option
				if edge.Source == ONode.Id {
					// see all child nodes it has
					for _, node := range TNodes {
						if edge.Target == node.Id {
							if node.Data.StepType == "label" {
								option["assignedLabel"] = node.Data.AssignedLabel
							} else {
								// next one is a step
								option["nextStep"] = node.Id
							}
							break
						}
					}
					break
				}
			}

			options = append(options, option)
		}
	}

	// return its value and options of its childs
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"step":    step,
		"options": options,
	})

}

func InitTriageHandler(router fiber.Router, storage *storage.TriageStorage) {
	handler := &TriageHandler{
		storage: storage,
	}

	router.Get("/", handler.Get)
	router.Post("/", handler.Post)
	router.Get("/decision-tree", handler.GetTriageDecisionTree)
}
