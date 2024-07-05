using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Microsoft.AspNetCore.Http.HttpResults;
using RabbitMQ.Models;
using MySqlConnector;
using System.Text.Json;
using System.Diagnostics;

namespace RabbitMQ.RabbitMQ
{
    public class Receive
    {
        // private readonly StatusService _statusService;
        // public void ReceieveMessage2()
        // {
        //     var factory = new ConnectionFactory { HostName = "localhost" };
        //     using var connection = factory.CreateConnection();
        //     using var channel = connection.CreateModel();

        //     channel.QueueDeclare(queue: "task_queue",
        //                         durable: true,
        //                         exclusive: false,
        //                         autoDelete: false,
        //                         arguments: null);

        //     channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

        //     Console.WriteLine(" [*] Waiting for messages.");

        //     var consumer = new EventingBasicConsumer(channel);
        //     consumer.Received += (model, ea) =>
        //     {
        //         byte[] body = ea.Body.ToArray();
        //         var message = Encoding.UTF8.GetString(body);
        //         Console.WriteLine($" [x] Received {message}");

        //         int dots = message.Split('.').Length - 1;
        //         Thread.Sleep(dots * 1000);

        //         Console.WriteLine(" [x] Done");

        //         // here channel could also be accessed as ((EventingBasicConsumer)sender).Model
        //         channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
        //     };
        //     channel.BasicConsume(queue: "task_queue",
        //                         autoAck: false,
        //                         consumer: consumer);

        //     Console.WriteLine(" Press [enter] to exit.");
        //     Console.ReadLine();
        // }
        // public void ReceiveMessage()
        // {
        //     var factory = new ConnectionFactory { HostName = "localhost" };
        //     using var connection = factory.CreateConnection();
        //     using var channel = connection.CreateModel();

        //     channel.QueueDeclare(queue: "hello",
        //                         durable: false,
        //                         exclusive: false,
        //                         autoDelete: false,
        //                         arguments: null);

        //     Console.WriteLine(" [*] Waiting for messages.");

        //     var consumer = new EventingBasicConsumer(channel);
        //     consumer.Received += (model, ea) =>
        //     {
        //         var body = ea.Body.ToArray();
        //         var message = Encoding.UTF8.GetString(body);
        //         Console.WriteLine($" [x] Received {message}");
        //     };
        //     channel.BasicConsume(queue: "hello",
        //                         autoAck: true,
        //                         consumer: consumer);

        //     Console.WriteLine(" Press [enter] to exit.");
        //     Console.ReadLine();

        // }
        List<Employee> userToUpload = new List<Employee>();
        public void ReceiveEmployees()
        {

            var factory = new ConnectionFactory { HostName = "localhost" };
            Console.WriteLine(" Hello .");
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: "EMP1",
                                     durable: true,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);

                channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

                Console.WriteLine(" [*] Waiting for Employee messages.");

                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += async (model, ea) =>
                {

                    // var fileBytes = ea.Body.ToArray();
                    // using MemoryStream memoryStream = new MemoryStream(fileBytes);
                    // using StreamReader reader = new StreamReader(memoryStream, Encoding.UTF8);

                    Console.WriteLine("Chal bne");
                    byte[] body = ea.Body.ToArray();
                    // var message = Encoding.UTF8.GetString(body);
                    // var data = message.Split('|');
                    var message = JsonSerializer.Deserialize<SendToFirstQueue>(body);
                    var list = message.file;
                    var Uid = message.Uid;
                    var Fid = message.Fid;
                    using MemoryStream memoryStream = new MemoryStream(list);
                    using StreamReader reader = new StreamReader(memoryStream, Encoding.UTF8);
                    // await InsertEmployeeToDatabaseAsync(reader);
                    Console.Write(reader);


                    await ParseEmployee(reader, Uid, Fid);





                    Console.Write("YWFGE");


                    channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                };
                channel.BasicConsume(queue: "EMP1",
                                     autoAck: true,
                                     consumer: consumer);

                Console.WriteLine(" Press [enter] to exit.");
                Console.ReadLine();
            }
        }

        private async Task SendBatchToQueue(List<Employee> batch, string Uid, string Fid, string batchId)
        {
            var factory = new ConnectionFactory { HostName = "localhost" };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.QueueDeclare(queue: "batch_upload",
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

            var batchData = JsonSerializer.Serialize(batch);
            var message = Encoding.UTF8.GetBytes($"{batchData}|{Uid}|{Fid}|{batchId}");
            var basicProperties = channel.CreateBasicProperties();
            channel.BasicPublish(exchange: string.Empty,
                                routingKey: "batch_upload",
                                basicProperties: basicProperties,
                                body: message);
            Console.WriteLine($" [x] Sent batch of size {batch.Count} to batch_uploads");
        }

        private async Task CreateBatch(string Uid, string Fid)
        {
            Console.WriteLine("batching");
            var _statusService = new StatusService();
            var batchSize = 10000;
            var totalBatches = (int)Math.Ceiling((double)userToUpload.Count / batchSize);
            Console.WriteLine(totalBatches);
            for (int i = 0; i < totalBatches; i++)
            {
                var batch = userToUpload.Skip(i * batchSize).Take(batchSize).ToList();
                var batchId = Guid.NewGuid().ToString();

                var batchStatus = new ProcessStatusModel.Batch
                {
                    BId = batchId,
                    batchStatus = "Queued",
                    batchStart = i * batchSize,
                    batchEnd = i * batchSize + batch.Count - 1
                };

                await _statusService.AddBatchAsync(Uid, Fid, batchStatus);
                Console.WriteLine(batch);
                await SendBatchToQueue(batch, Uid, Fid, batchId);
            }
        }
        private async Task ParseEmployee(StreamReader reader, string Uid, string Fid)
        {
            var time = new Stopwatch();
            time.Start();
            Console.WriteLine("parse");
            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(line))

                    continue; // Skip empty lines

                var fields = line.Split(",");
                if (fields.Length < 9)
                {
                    continue; // Skip incomplete records
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
                    continue; // Skip records with invalid date format
                }
            }

            await CreateBatch(Uid, Fid);

        }



        private async Task InsertEmployeeToDatabaseAsync(StreamReader reader)
        {
            var time = new Stopwatch();
            time.Start();
            List<Employee> userToUpload = new List<Employee>();
            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(line))
                    continue; // Skip empty lines

                var fields = line.Split(",");
                if (fields.Length < 9)
                {
                    continue; // Skip incomplete records
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
                    continue; // Skip records with invalid date format
                }
            }

            // Use your MySQL insertion logic here
            var conString = "Server=localhost;Database=test1;User=root;Password=root";
            using (MySqlConnection mConnection = new MySqlConnection(conString))
            {
                try
                {
                    await mConnection.OpenAsync();
                    StringBuilder sCommand = new StringBuilder("REPLACE INTO employees (name, email, country, state, city, phoneNumber, addres1, addres2, dob) VALUES ");
                    List<string> Rows = new List<string>();
                    Console.WriteLine(userToUpload.Count);
                    foreach (var employee in userToUpload)
                    {
                        Rows.Add(string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}')",
                            MySqlHelper.EscapeString(employee.name),
                            MySqlHelper.EscapeString(employee.email),
                            MySqlHelper.EscapeString(employee.country),
                            MySqlHelper.EscapeString(employee.state),
                            MySqlHelper.EscapeString(employee.city),
                            MySqlHelper.EscapeString(employee.phoneNumber),
                            MySqlHelper.EscapeString(employee.addres1),
                            MySqlHelper.EscapeString(employee.addres2),
                            employee.dob.ToString("yyyy-MM-dd")));
                    }

                    sCommand.Append(string.Join(",", Rows));
                    sCommand.Append(";");

                    using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
                    {
                        myCmd.CommandType = System.Data.CommandType.Text;
                        await myCmd.ExecuteNonQueryAsync();
                        Console.WriteLine(time.Elapsed);
                    }

                    // Console.WriteLine(time.Elapsed);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error inserting employees: {ex.Message}");
                    // Handle the exception as needed (logging, rethrowing, etc.)
                }
            }
        }
        // private async Task InsertEmployeeToDatabaseAsync(StreamReader reader)
        // {
        //     List<Employee> userToUpload = new List<Employee>();
        //     while (!reader.EndOfStream)
        //     {
        //         var line = await reader.ReadLineAsync();
        //         if (string.IsNullOrEmpty(line))
        //             continue; // if any empty lines

        //         var fields = line.Split(",");
        //         if (fields.Length < 9)
        //         {
        //             continue;
        //         }

        //         if (DateOnly.TryParseExact(fields[8], "yyyy-M-d", null, System.Globalization.DateTimeStyles.None, out DateOnly dateOfBirth))
        //         {
        //             Employee user = new Employee
        //             {
        //                 name = fields[0],
        //                 email = fields[1],
        //                 country = fields[2],
        //                 state = fields[3],
        //                 city = fields[4],
        //                 phoneNumber = fields[5],
        //                 addres1 = fields[6],
        //                 addres2 = fields[7],
        //                 dob = dateOfBirth
        //             };
        //             userToUpload.Add(user);
        //         }
        //         else
        //         {

        //             continue;
        //         }
        //     }
        //     // Use your MySQL insertion logic here
        //     var conString = "Server=localhost;Database=test1;User=root;Password=root";
        //     using (MySqlConnection mConnection = new MySqlConnection(conString))
        //     {
        //         await mConnection.OpenAsync();

        //         StringBuilder sCommand = new StringBuilder("INSERT INTO employees (name, email,country,state,city,phoneNumber,addres1,addres2,dob) VALUES ");
        //         List<string> Rows = new List<string>();
        //         Console.WriteLine(userToUpload.Count);

        //         for (int i = 0; i < userToUpload.Count; i++)
        //         {
        //             Rows.Add(string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}')",
        //             MySqlHelper.EscapeString(userToUpload[i].name),
        //             MySqlHelper.EscapeString(userToUpload[i].email),
        //             MySqlHelper.EscapeString(userToUpload[i].country),
        //             MySqlHelper.EscapeString(userToUpload[i].state),
        //             MySqlHelper.EscapeString(userToUpload[i].city),
        //             MySqlHelper.EscapeString(userToUpload[i].phoneNumber),
        //             MySqlHelper.EscapeString(userToUpload[i].addres1),
        //             MySqlHelper.EscapeString(userToUpload[i].addres2),
        //             userToUpload[i].dob.ToString("yyyy-MM-dd")));
        //         }
        //         sCommand.Append(string.Join(",", Rows));
        //         sCommand.Append(";");
        //         // mConnection.Open();
        //         using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
        //         {
        //             myCmd.CommandType = System.Data.CommandType.Text;
        //             await myCmd.ExecuteNonQueryAsync();
        //         }

        //         // using (MySqlCommand myCmd = new MySqlCommand(query, mConnection))
        //         // {
        //         //     myCmd.Parameters.AddWithValue("@name", employee.name);
        //         //     myCmd.Parameters.AddWithValue("@email", employee.email);
        //         //     myCmd.Parameters.AddWithValue("@country", employee.country);
        //         //     myCmd.Parameters.AddWithValue("@state", employee.state);
        //         //     myCmd.Parameters.AddWithValue("@city", employee.city);
        //         //     myCmd.Parameters.AddWithValue("@phoneNumber", employee.phoneNumber);
        //         //     myCmd.Parameters.AddWithValue("@addres1", employee.addres1);
        //         //     myCmd.Parameters.AddWithValue("@addres2", employee.addres2);
        //         //     myCmd.Parameters.AddWithValue("@dob", employee.dob.ToString("yyyy-MM-dd"));



        //         //     await myCmd.ExecuteNonQueryAsync();


        //         // }
        //     }
        // }

    }
}