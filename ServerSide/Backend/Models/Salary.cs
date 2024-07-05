using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Salary
    {
        [Key]
        public int EmployeeId { get; set; }

        public decimal FY2019_20 { get; set; }
        public decimal FY2020_21 { get; set; }
        public decimal FY2021_22 { get; set; }
        public decimal FY2022_23 { get; set; }
        public decimal FY2023_24 { get; set; }
    }
}