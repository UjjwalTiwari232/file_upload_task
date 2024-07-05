using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Dto
{
    public class StatusDto
    {
        public required string Uid { get; set; }
        public required string status { get; set; }
        public required string totalBatches { get; set; }
        public required string batches { get; set; }
    }
}