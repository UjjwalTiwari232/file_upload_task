using System.ComponentModel.DataAnnotations;

namespace Backend.Dto;

public class EmployeeDto
{
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