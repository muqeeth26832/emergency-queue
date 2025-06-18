package main

import (
	"fmt"

	"github.com/emergency-queue-v1/handler"
	"github.com/emergency-queue-v1/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// evn config
	env := EnvConfig()
	// db connection
	db := DBConnection(env)
	//pusher
	pusher := Pusher(env)

	// Init fiber server
	server := fiber.New(fiber.Config{
		AppName:      "Emergency-Queue",
		ServerHeader: "Fiber v2",
	})

	server.Use(cors.New(cors.Config{
		AllowOrigins: "*",
	}))

	// Triage Storage Interactions
	triageStorage := storage.InitTriageStorage(db)

	// queue storage
	queueStorage := storage.InitQueueStorage(db)

	// Triage handlers
	handler.InitTriageHandler(server.Group("/triage"), triageStorage)
	handler.InitQueueHandler(server.Group("/queue"), queueStorage, pusher)

	server.Get("/", func(c *fiber.Ctx) error { return c.SendString("Welcome to the Emergency Queue API!") })

	// Start the server
	server.Listen(fmt.Sprintf("0.0.0.0:%s", env.PORT))
}
