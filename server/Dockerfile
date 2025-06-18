FROM golang:alpine

WORKDIR /src/app

# for hot reloading install air
RUN go install github.com/air-verse/air@latest

COPY . .

RUN go mod tidy

