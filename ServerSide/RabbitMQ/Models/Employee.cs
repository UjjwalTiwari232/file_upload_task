using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RabbitMQ.Models
{
    public class Employee
    {
        [Key]
        public int id { get; set; } = 1;
        public required string name { get; set; }
        public required string email { get; set; }

        public required string country { get; set; }
        public required string state { get; set; }
        public required string city { get; set; }
        public required string phoneNumber { get; set; }

        public required string addres1 { get; set; }
        public string addres2 { get; set; } = "";
        public required DateOnly dob { get; set; }

    }
}