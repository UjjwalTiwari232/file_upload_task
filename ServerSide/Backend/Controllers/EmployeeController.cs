using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Backend.Mapping;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Backend.Dto;
using System.Text;
using Npgsql.Replication.PgOutput.Messages;
using System.Diagnostics;
using Backend.RabbitMQ;
using Microsoft.IdentityModel.Tokens;
using Backend.ServiceStatus.StatusService;
using System.Data;

namespace Backend.Controllers
{
    [Route("api/")]
    [ApiController]

    public class EmployeeController(ApplicationDbContext context) : ControllerBase
    {


        // private StatusService _statusService;
        private readonly ApplicationDbContext _context = context;

        [HttpGet]
        public async Task<IActionResult> AllData()
        {

            // return Ok();
            var connString = "Server=localhost;Database=test1;User=root;Password=root";
            await using var connection = new MySqlConnection(connString);
            await connection.OpenAsync();
            // var cmd = new MySqlCommand()
            // using (var cmd = new MySqlCommand())
            // {
            //     cmd.Connection = connection;
            //     cmd.CommandText = "INSERT INTO data (some_field) VALUES (@p)";
            //     cmd.Parameters.AddWithValue("p", "Hello world");
            //     await cmd.ExecuteNonQueryAsync();
            // }
            using var command = new MySqlCommand("SELECT * FROM employees", connection);
            using var reader = await command.ExecuteReaderAsync();
            Console.WriteLine("hellow");
            while (await reader.ReadAsync())
            {

                var value = reader.GetValue(0);
                Console.WriteLine(value);
            }
            return Ok();
        }

        [HttpGet("GetEmployees")]
        public async Task<IActionResult> GetEmployees(int? x = null, string? sort = null)
        {
            try
            {
                var connString = "Server=localhost;Database=test1;Uid=root;Pwd=root;";
                await using var connection = new MySqlConnection(connString);
                await connection.OpenAsync();

                string sqlQuery = "SELECT * FROM employees";
                if (x.HasValue && x > 0)
                {
                    sqlQuery += $" LIMIT {x}";
                }
                if (!sort.IsNullOrEmpty())
                {
                    sqlQuery += $" WHERE name LIKE CONCAT('%' " + sort + "'%')";
                }

                using var command = new MySqlCommand(sqlQuery, connection);
                Console.WriteLine(sqlQuery);
                await using var reader = await command.ExecuteReaderAsync();

                var employees = new List<Employee>();

                while (await reader.ReadAsync())
                {
                    DateTime dobFromDb = Convert.ToDateTime(reader["dob"]);
                    var employee = new Employee
                    {
                        id = Convert.ToInt32(reader["id"]),
                        name = reader["name"].ToString(),
                        email = reader["email"].ToString(),
                        country = reader["country"].ToString(),
                        state = reader["state"].ToString(),
                        city = reader["city"].ToString(),
                        phoneNumber = reader["phoneNumber"].ToString(),
                        addres1 = reader["addres1"].ToString(),
                        addres2 = reader["addres2"].ToString(),
                        dob = new DateOnly(dobFromDb.Year, dobFromDb.Month, dobFromDb.Day),

                    };

                    employees.Add(employee);
                }

                if (employees.Count == 0)
                {
                    return NotFound(); // If no employees found
                }

                return Ok(employees); // Return the list of employees
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error: {ex.Message}");
            }
        }

        // [HttpPost("fasterUpload_Rabbit")]
        // public async Task<IActionResult> updateTheRow(int? id = null)
        // {
        //     string sqlQuery = "SELECT * FROM employees  WHERE id LIKE CONCAT('%' " + id + "'%')";
        //     // try{
        //     //     await 
        //     // }
        // }

        [HttpPost("fasterUpload_Rabbit")]
        public async Task<IActionResult> FasterUploadRabbit(IFormFile file)
        {
            var _statusService = new StatusService();
            var Uid = Guid.NewGuid().ToString();
            var Fid = Guid.NewGuid().ToString();
            var time = new Stopwatch();
            time.Start();

            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            if (!file.ContentType.Equals("text/csv", StringComparison.OrdinalIgnoreCase) &&
                !file.ContentType.Equals("application/vnd.ms-excel", StringComparison.OrdinalIgnoreCase) &&
                !file.ContentType.Equals("application/csv", StringComparison.OrdinalIgnoreCase) &&
                !file.ContentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only CSV files are allowed.");
            }

            try
            {
                Send sender = new Send();
                sender.SendEmployees(file, Uid, Fid);
                string batchStatus = "WAITING";
                await _statusService.CreateAsync(Uid, Fid, batchStatus);
                return Ok("CSV file uploaded and processed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("email/{email}")]
        public async Task<Employee> GetByEmail([FromRoute] string email)
        {
            MySqlConnection connect = new MySqlConnection("Server=localhost;Database=test1;User=root;Password=root");
            MySqlCommand cmd = new MySqlCommand($"SELECT * FROM employees WHERE email=@email");
            cmd.Parameters.AddWithValue("@email", email);

            cmd.CommandType = CommandType.Text;
            cmd.Connection = connect;
            connect.Open();
            try
            {
                MySqlDataReader reader;
                reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    DateTime dobFromDb = Convert.ToDateTime(reader["dob"]);
                    Employee u = new Employee
                    {
                        id = Convert.ToInt32(reader["id"]),
                        name = reader["name"].ToString(),
                        email = reader["email"].ToString(),
                        country = reader["country"].ToString(),
                        state = reader["state"].ToString(),
                        city = reader["city"].ToString(),
                        phoneNumber = reader["phoneNumber"].ToString(),
                        addres1 = reader["addres1"].ToString(),
                        addres2 = reader["addres2"].ToString(),
                        dob = new DateOnly(dobFromDb.Year, dobFromDb.Month, dobFromDb.Day),
                        // id = dr.GetInt32("id"),
                        // Name=dr.GetString("name"),
                        // Email=dr.GetString("email"),
                        // Country=dr.GetString("country"),
                        // State=dr.GetString("state"),
                        // City=dr.GetString("city"),
                        // Telephone=dr.GetString("telephone"),
                        // AddressLine1=dr.GetString("addressline1"),
                        // AddressLine2=dr.GetString("addressline2"),
                        // DateOfBirth=dr.GetDateTime("dateofbirth"),
                        // // Salary = await GetSalary(dr.GetInt32("id"))
                        // FY_2019_20=dr.GetInt64("fy_2019_20"),
                        // FY_2020_21=dr.GetInt64("fy_2020_21"),
                        // FY_2021_22=dr.GetInt64("fy_2021_22")
                    };
                    return u;
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            return null;
        }

        [HttpPost("fasterUpload2")]

        public async Task<IActionResult> FasterUploadCs21(IFormFile file)
        {

            var time = new Stopwatch();
            time.Start();
            List<Employee> userToUpload = new List<Employee>();
            List<Employee> userToUpload1 = new List<Employee>();
            bool isFirstLine = true;

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");
            try
            {
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    while (!reader.EndOfStream)
                    {
                        var line = await reader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line))
                            continue; // if any empty lines

                        // if (isFirstLine)
                        // {
                        //     isFirstLine = false;
                        //     continue;
                        // }

                        var fields = line.Split(",");
                        if (fields.Length < 9)
                        {
                            continue;
                        }

                        if (DateOnly.TryParseExact(fields[8], "yyyy-M-d", null, System.Globalization.DateTimeStyles.None, out DateOnly dateOfBirth))
                        {
                            Employee user = new Employee
                            {
                                name = fields[0],
                                email = fields[1],
                                country = fields[2],
                                state = fields[3],
                                city = fields[4],
                                phoneNumber = fields[5],
                                addres1 = fields[6],
                                addres2 = fields[7],
                                dob = dateOfBirth
                            };
                            userToUpload.Add(user);
                        }
                        else
                        {
                            // agar invalid date format
                            continue;
                        }
                    }
                }

                userToUpload1 = userToUpload.Distinct().ToList();
                var conString = "Server=localhost;Database=test1;User=root;Password=root";
                StringBuilder sCommand = new StringBuilder("INSERT INTO employees (name, email,country,state,city,phoneNumber,addres1,addres2,dob) VALUES ");
                Console.WriteLine(sCommand);
                using (MySqlConnection mConnection = new MySqlConnection(conString))
                {
                    mConnection.Open();
                    List<string> Rows = new List<string>();
                    // Console.WriteLine(userToUpload[100000].id);

                    for (int i = 0; i < 99999; i++)
                    {
                        Rows.Add(string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}')",
                        MySqlHelper.EscapeString(userToUpload1[i].name),
                        MySqlHelper.EscapeString(userToUpload1[i].email),
                        MySqlHelper.EscapeString(userToUpload1[i].country),
                        MySqlHelper.EscapeString(userToUpload1[i].state),
                        MySqlHelper.EscapeString(userToUpload1[i].city),
                        MySqlHelper.EscapeString(userToUpload1[i].phoneNumber),
                        MySqlHelper.EscapeString(userToUpload1[i].addres1),
                        MySqlHelper.EscapeString(userToUpload1[i].addres2),
                        userToUpload[i].dob.ToString("yyyy-MM-dd")));
                    }
                    sCommand.Append(string.Join(",", Rows));
                    sCommand.Append(";");

                    using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
                    {
                        myCmd.CommandType = System.Data.CommandType.Text;
                        await myCmd.ExecuteNonQueryAsync();
                    }
                }
                Console.WriteLine(time.Elapsed);
                return Ok("CSV file uploaded and processed successfully.");
            }

            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
            finally
            {
                // System.IO.File.Exists(userToUpload);
            }
        }



        bool checkDuplicateUser(MySqlConnection mConnection, string name)
        {
            var time = new Stopwatch();
            time.Start();
            string query = "SELECT COUNT(*) FROM employees WHERE name = @name";
            using (var cmd = new MySqlCommand(query, mConnection))
            {
                cmd.Parameters.AddWithValue("@name", name);

                // Execute the query
                int count = Convert.ToInt32(cmd.ExecuteScalar());

                if (count > 0)
                {
                    Console.WriteLine("Username already exists.");
                    Console.WriteLine(time.Elapsed);
                    return true;

                }
                else
                {
                    // Console.WriteLine("Username is available.");
                    // Console.WriteLine(time.Elapsed);
                    return false;
                }
            }
        }

        bool checkDuplicateEmail(MySqlConnection mConnection, string email)
        {
            var time = new Stopwatch();
            time.Start();
            string query = "SELECT COUNT(*) FROM employees WHERE email = @email";
            using (var cmd = new MySqlCommand(query, mConnection))
            {
                cmd.Parameters.AddWithValue("@email", email);

                // Execute the query
                int count = Convert.ToInt32(cmd.ExecuteScalar());

                if (count > 0)
                {
                    Console.WriteLine("Email already exists.");
                    Console.WriteLine(time.Elapsed);
                    return true;

                }
                else
                {
                    // Console.WriteLine("Email is available.");
                    // Console.WriteLine(time.Elapsed);
                    return false;
                }
            }
        }


    }
}























// [HttpGet]
// public async Task<IActionResult> AllData()
// {

//     // return Ok();
//     var connString = "Server=localhost;Database=test1;User=root;Password=root";
//     await using var connection = new MySqlConnection(connString);
//     await connection.OpenAsync();
//     // var cmd = new MySqlCommand()
//     // using (var cmd = new MySqlCommand())
//     // {
//     //     cmd.Connection = connection;
//     //     cmd.CommandText = "INSERT INTO data (some_field) VALUES (@p)";
//     //     cmd.Parameters.AddWithValue("p", "Hello world");
//     //     await cmd.ExecuteNonQueryAsync();
//     // }
//     using var command = new MySqlCommand("SELECT * FROM employees", connection);
//     using var reader = await command.ExecuteReaderAsync();
//     Console.WriteLine("hellow");
//     while (await reader.ReadAsync())
//     {
//         var value = reader.GetValue(0);
//         // do something with 'value'
//         Console.WriteLine(value);
//     }
//     return Ok();
// }



// [HttpPost("fasterUpload")]
// public async Task<IActionResult> FasterUploadCsv(IFormFile file)
// {
//     List<Employee> userToUpload = new List<Employee>();
//     bool isFirstLine = true;

//     if (file == null || file.Length == 0)
//         return BadRequest("No file uploaded.");
//     try
//     {
//         using (var reader = new StreamReader(file.OpenReadStream()))
//         {
//             while (!reader.EndOfStream)
//             {
//                 var line = await reader.ReadLineAsync();
//                 if (string.IsNullOrEmpty(line))
//                     continue; // if any empty lines

//                 if (isFirstLine)
//                 {
//                     isFirstLine = false;
//                     continue;
//                 }

//                 var fields = line.Split(",");
//                 if (fields.Length < 9)
//                 {
//                     continue;
//                 }

//                 if (DateOnly.TryParseExact(fields[8], "yyyy-M-d", null, System.Globalization.DateTimeStyles.None, out DateOnly dateOfBirth))
//                 {
//                     Employee user = new Employee
//                     {
//                         name = fields[0],
//                         email = fields[1],
//                         country = fields[2],
//                         state = fields[3],
//                         city = fields[4],
//                         phoneNumber = fields[5],
//                         addres1 = fields[6],
//                         addres2 = fields[7],
//                         dob = dateOfBirth
//                     };
//                     userToUpload.Add(user);
//                 }
//                 else
//                 {
//                     // agar invalid date format
//                     continue;
//                 }
//             }
//         }

//         // await _context.Database.ExecuteSqlAsync("Insert Into Employees Values"{userToUpload});
//         await _context.BulkInsertAsync(userToUpload);
//         await _context.SaveChangesAsync();

//         return Ok("CSV file uploaded and processed successfully.");
//     }
//     catch (Exception ex)
//     {
//         return StatusCode(500, $"Internal server error: {ex.Message}");
//     }
// }


// [HttpPost("fasterUpload1")]

// public async Task<IActionResult> FasterUploadCsv1(IFormFile file)
// {

//     var time = new Stopwatch();
//     time.Start();
//     List<Employee> userToUpload = new List<Employee>();
//     bool isFirstLine = true;

//     if (file == null || file.Length == 0)
//         return BadRequest("No file uploaded.");
//     try
//     {
//         using (var reader = new StreamReader(file.OpenReadStream()))
//         {
//             while (!reader.EndOfStream)
//             {
//                 var line = await reader.ReadLineAsync();
//                 if (string.IsNullOrEmpty(line))
//                     continue; // if any empty lines

//                 // if (isFirstLine)
//                 // {
//                 //     isFirstLine = false;
//                 //     continue;
//                 // }

//                 var fields = line.Split(",");
//                 if (fields.Length < 9)
//                 {
//                     continue;
//                 }

//                 if (DateOnly.TryParseExact(fields[8], "yyyy-M-d", null, System.Globalization.DateTimeStyles.None, out DateOnly dateOfBirth))
//                 {
//                     Employee user = new Employee
//                     {
//                         name = fields[0],
//                         email = fields[1],
//                         country = fields[2],
//                         state = fields[3],
//                         city = fields[4],
//                         phoneNumber = fields[5],
//                         addres1 = fields[6],
//                         addres2 = fields[7],
//                         dob = dateOfBirth
//                     };
//                     userToUpload.Add(user);
//                 }
//                 else
//                 {
//                     // agar invalid date format
//                     continue;
//                 }
//             }
//         }


//         var conString = "Server=localhost;Database=test1;User=root;Password=root";
//         StringBuilder sCommand = new StringBuilder("INSERT INTO employees (name, email,country,state,city,phoneNumber,addres1,addres2,dob) VALUES ");
//         using (MySqlConnection mConnection = new MySqlConnection(conString))
//         {
//             List<string> Rows = new List<string>();
//             // Console.WriteLine(userToUpload[100000].id);

//             for (int i = 0; i < 99999; i++)
//             {
//                 Rows.Add(string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}')",
//                 MySqlHelper.EscapeString(userToUpload[i].name),
//                 MySqlHelper.EscapeString(userToUpload[i].email),
//                 MySqlHelper.EscapeString(userToUpload[i].country),
//                 MySqlHelper.EscapeString(userToUpload[i].state),
//                 MySqlHelper.EscapeString(userToUpload[i].city),
//                 MySqlHelper.EscapeString(userToUpload[i].phoneNumber),
//                 MySqlHelper.EscapeString(userToUpload[i].addres1),
//                 MySqlHelper.EscapeString(userToUpload[i].addres2),
//                 userToUpload[i].dob.ToString("yyyy-MM-dd")));
//             }
//             sCommand.Append(string.Join(",", Rows));
//             sCommand.Append(";");
//             mConnection.Open();
//             using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
//             {
//                 myCmd.CommandType = System.Data.CommandType.Text;
//                 await myCmd.ExecuteNonQueryAsync();
//             }
//         }
//         // using var connection = new MySqlConnection(conString);
//         // await connection.OpenAsync();
//         // using (var cmd = new MySqlCommand())
//         // {
//         //     cmd.Connection = connection;
//         //     List<string> Rows = new List<string>();
//         //     for (int i = 0; i < 100000; i++)
//         //     {
//         //         Rows.Add(string.Format("('{0}','{1}')", MySqlHelper.EscapeString("test"), MySqlHelper.EscapeString("test")));
//         //     }
//         //     sCommand.Append(string.Join(",", Rows));
//         //     sCommand.Append(";");
//         //     mConnection.Open();
//         //     using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
//         //     {
//         //         myCmd.CommandType = CommandType.Text;
//         //         myCmd.ExecuteNonQuery();
//         //     }
//         //     cmd.CommandText = "INSERT INTO employees VALUES (%L)) {userToUpload}";
//         //     // cmd.Parameters.AddWithValue("p", "Hello world");
//         //     await cmd.ExecuteNonQueryAsync();
//         // }
//         // await _context.Database.ExecuteSqlAsync("Insert Into Employees Values"{userToUpload});
//         // await _context.BulkInsertAsync(userToUpload);
//         // await _context.SaveChangesAsync();
//         Console.WriteLine(time.Elapsed);
//         return Ok("CSV file uploaded and processed successfully.");
//     }

//     catch (Exception ex)
//     {
//         return StatusCode(500, $"Internal server error: {ex.Message}");
//     }
//     finally
//     {
//         // System.IO.File.Exists(userToUpload);
//     }
// }

// [HttpPost("fasterUpload")]
// public async Task<IActionResult> FasterUploadCsv(IFormFile file)
// {
//     List<Employee> userToUpload = new List<Employee>();
//     bool isFirstLine = true;
//     if (file == null || file.Length == 0)
//         return BadRequest("No file uploaded.");

//     // Read the file content line by line
//     using (var reader = new StreamReader(file.OpenReadStream()))
//     {
//         var count = 0;
//         while (!reader.EndOfStream)
//         {
//             count++;
//             if (isFirstLine)
//             {
//                 isFirstLine = false;
//                 continue;
//             }

//             var line = await reader.ReadLineAsync();
//             var fields = line.Split(",");
//             Console.WriteLine("[{0}]", string.Join(", ", fields));
//             if (DateOnly.TryParseExact(fields[8], "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out DateOnly dateOfBirth))
//             {
//                 try
//                 {
//                     Employee user = new Employee
//                     {
//                         email = fields[1],
//                         name = fields[0],
//                         country = fields[2],
//                         state = fields[3],
//                         city = fields[4],
//                         phoneNumber = fields[5],
//                         addres1 = fields[6],
//                         addres2 = fields[7],
//                         dob = dateOfBirth

//                     };
//                     userToUpload.Add(user);
//                 }
//                 catch
//                 {
//                     // Console.WriteLine(fields[9].ToString());
//                 }


//             }

//         }
//     }
//     await _context.BulkInsertAsync(userToUpload);
//     await _context.SaveChangesAsync();
//     return Ok("csv file uploaded and processed successfully.");
// }

// [HttpPost("upload-file")]
// public async Task<IActionResult> OnPostUploadAsync(List<IFormFile> files)
// {
//     var watch = System.Diagnostics.Stopwatch.StartNew();
//     var ObjectArray = new List<Employee>();
//     if (files == null || files[0] == null)
//     {
//         return BadRequest("No file uploaded.");
//     }
//     foreach (var file in files)
//     {
//         // var result = new StringBuilder();
//         var result = "";
//         using (var reader = new StreamReader(file.OpenReadStream()))
//         {
//             while (reader.Peek() >= 0)
//             {
//                 result = await reader.ReadLineAsync();
//                 var a = result?.Split(",");
//                 // for(int i=0;i<a?.Length;i++){
//                 DateOnly enteredDate = DateOnly.Parse(a[8]);
//                 Employee u = new Employee
//                 {
//                     name = a[0],
//                     email = a[1],
//                     country = a[2],
//                     state = a[3],
//                     city = a[4],
//                     phoneNumber = a[5],
//                     addres1 = a[6],
//                     addres2 = a[7],
//                     dob = enteredDate
//                 };
//                 ObjectArray.Add(u);
//                 // }

//             }
//             await _context.Employees.AddRangeAsync(ObjectArray);
//             await _context.SaveChangesAsync();
//         }

//     }
//     watch.Stop();
//     var elapsedMs = watch.ElapsedMilliseconds;
//     Console.WriteLine($"Total time taken: {elapsedMs / 1000}s");
//     return Ok("Uploaded");
// }

// [HttpPost("upload")]
// public async Task<IActionResult> OnPostUploadAsync(List<IFormFile> files)
// {
//     Console.WriteLine("Heloow");
//     long size = files.Sum(f => f.Length);

//     foreach (var formFile in files)
//     {
//         if (formFile.Length > 0)
//         {
//             var filePath = Path.GetTempFileName();

//             using (var stream = System.IO.File.Create(filePath))
//             {
//                 await formFile.CopyToAsync(stream);
//             }
//         }
//     }

//     return new OkObjectResult(new { count = files.Count, size });

// }

// private List<Employee> ReadCsvData(string filePath)
// {
//     var csvData = new List<Employee\>();

//     using (var reader = new StreamReader(filePath))
//     {
//         // Skip header line if needed: reader.ReadLine();
//         while (!reader.EndOfStream)
//         {
//             var line = reader.ReadLine();
//             var values = line.Split(',');

//             var data = new CsvDataModel
//             {
//                 Field1 = values[0],
//                 Field2 = values[1],
//                 // Map other fields as per your CSV structure
//             };

//             csvData.Add(data);
//         }
//     }

//     return csvData;
// }

// private async Task InsertCsvDataIntoDatabase(List<Employee> csvData)
// {
//     string connectionString = "Server=localhost;Database=test1;User=root;Password=root";

//     using (var connection = new MySqlConnection(connectionString))
//     {
//         await connection.OpenAsync();

//         foreach (var data in csvData)
//         {
//             string query = $"INSERT INTO YourTableName (Field1, Field2) VALUES (@Field1, @Field2)";

//             using (var command = new MySqlCommand(query, connection))
//             {
//                 command.Parameters.AddWithValue("@Field1", data.Field1);
//                 command.Parameters.AddWithValue("@Field2", data.Field2);
//                 // Add parameters for other fields as needed

//                 await command.ExecuteNonQueryAsync();
//             }
//         }
//     }
// }