using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RabbitMQ.Models
{
    public class ProcessStatusModel
    {
        // Id, UId, Status, TotalBatches, Batches
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("Uid")]
        public required string Uid { get; set; }
        [BsonElement("Fid")]
        public required string Fid { get; set; }
        [BsonElement("status")]
        public required string status { get; set; }
        [BsonElement("totalBatches")]
        public int totalBatches { get; set; }
        [BsonElement("batches")]
        public List<Batch> batches { get; set; } = [];

        public class Batch
        {
            [BsonElement("BId")]
            public string? BId { get; set; }
            [BsonElement("batchStatus")]

            public string? batchStatus { get; set; }
            [BsonElement("batchStart")]

            public int batchStart { get; set; }
            [BsonElement("batchEnd")]

            public int batchEnd { get; set; }
        }


    }
}