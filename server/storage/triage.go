package storage

import (
	"context"

	"github.com/emergency-queue-v1/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type TriageStorage struct {
	db *mongo.Database
}

// save the tirage nodes, option nodes and edges to the database
func (s *TriageStorage) Post(
	ctx context.Context,
	TNodes []*model.TirageNode,
	ONodes []*model.TirageOptionNode,
	Edges []*model.Edge,
) error {

	// clean db before saving new changes
	s.db.Collection("tnodes").Drop(ctx)
	s.db.Collection("onodes").Drop(ctx)
	s.db.Collection("edges").Drop(ctx)

	// insert new data
	if len(TNodes) > 0 {
		if _, err := s.db.Collection("tnodes").InsertMany(ctx, model.NodesToInterfaces(TNodes)); err != nil {
			return err
		}
	}

	if len(ONodes) > 0 {
		if _, err := s.db.Collection("onodes").InsertMany(ctx, model.NodesToInterfaces(ONodes)); err != nil {
			return err
		}
	}

	if len(Edges) > 0 {
		if _, err := s.db.Collection("edges").InsertMany(ctx, model.NodesToInterfaces(Edges)); err != nil {
			return err
		}
	}

	return nil
}

func find[T any](s *TriageStorage, ctx context.Context, collection string) ([]*T, error) {
	documents := []*T{}

	cursor, err := s.db.Collection(collection).Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var doc T
		if err := cursor.Decode(&doc); err != nil {
			return nil, err
		}
		documents = append(documents, &doc)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return documents, nil
}
func (s *TriageStorage) Get(ctx context.Context) (
	TNodes []*model.TirageNode,
	ONodes []*model.TirageOptionNode,
	Edges []*model.Edge,
	err error,
) {
	TNodes, err = find[model.TirageNode](s, ctx, "tnodes")

	if err != nil {
		return nil, nil, nil, err
	}

	ONodes, err = find[model.TirageOptionNode](s, ctx, "onodes")
	if err != nil {
		return nil, nil, nil, err
	}

	Edges, err = find[model.Edge](s, ctx, "edges")
	if err != nil {
		return nil, nil, nil, err
	}

	return TNodes, ONodes, Edges, nil
}

func InitTriageStorage(db *mongo.Database) *TriageStorage {
	return &TriageStorage{
		db: db,
	}
}
