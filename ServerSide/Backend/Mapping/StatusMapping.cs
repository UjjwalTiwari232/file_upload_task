using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dto;
using Backend.Models;

namespace Backend.Mapping
{
    public static class StatusMapping
    {
        public static StatusDto ToStatusDto(this ProcessStatusModel record)
        {
            // Id, UId, Status, TotalBatches, Batches
            return new StatusDto()
            {
                Uid = record.Uid,
                status = record.status,
                totalBatches = record.status,
                batches = record.status

            };
        }
    }
}