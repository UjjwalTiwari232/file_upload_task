using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RabbitMQ2
{
    public class MyCustomResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        // Add other properties as needed
    }
}