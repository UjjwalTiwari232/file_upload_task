using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RabbitMQ.Models
{
    public class SendToFirstQueue
    {
        public required byte[] file { get; set; }

        public required string Uid { get; set; }

        public required string Fid { get; set; }
    }
}