using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Dto;
using CsvHelper.Configuration;

namespace Backend.Mapping
{
    public static class EmployeeMapping
    {
        public static EmployeeDto ToEmployeeDto(this Employee record)
        {

            return new EmployeeDto()
            {
                name = record.name,
                email = record.email,
                country = record.country,
                state = record.state,
                city = record.city,
                phoneNumber = record.phoneNumber,
                addres1 = record.addres1,
                addres2 = record.addres2,
                dob = record.dob
            };
        }
    }
}