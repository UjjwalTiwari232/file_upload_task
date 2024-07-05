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
using Polly;
using Polly.Retry;
using RabbitMQ2.ServiceStatus.StatusService;

namespace RabbitMQ2
{
    public class Receive
    {
        private readonly StatusService _statusService;
        ResiliencePipeline pipeline = new ResiliencePipelineBuilder()
            .AddRetry(new RetryStrategyOptions
            {
                ShouldHandle = new PredicateBuilder().Handle<Exception>(),
                Delay = TimeSpan.FromSeconds(1),
                MaxRetryAttempts = 10,
                BackoffType = DelayBackoffType.Constant
            })
            .Build();



        ResiliencePipeline<MyCustomResponse> customPipeline = new ResiliencePipelineBuilder<MyCustomResponse>()
        .AddRetry(new RetryStrategyOptions<MyCustomResponse>
        {
            ShouldHandle = new PredicateBuilder<MyCustomResponse>()
                .Handle<Exception>()
                .HandleResult(static result => !result.IsSuccess),
            Delay = TimeSpan.FromSeconds(1),
            MaxRetryAttempts = 3,
            BackoffType = DelayBackoffType.Constant
        })
        .Build();
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

        public void ReceiveEmployees()
        {

            var factory = new ConnectionFactory { HostName = "localhost" };
            Console.WriteLine(" Hello .");
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                channel.ConfirmSelect();
                channel.QueueDeclare(queue: "batch_upload",
                                    durable: true,
                                    exclusive: false,
                                    autoDelete: false,
                                    arguments: null);

                channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

                Console.WriteLine(" [*] Waiting for Employee messages.");

                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += async (model, ea) =>
                {
                    Console.WriteLine("Got some thing");
                    byte[] body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    var data = message.Split('|');
                    var Uid = data[1];
                    var Fid = data[2];
                    var Bid = data[3];
                    List<Employee> userToUpload = new List<Employee>();
                    if (data != null && data.Length > 0)
                    {
                        var list = data[0];
                        try
                        {
                            userToUpload = JsonSerializer.Deserialize<List<Employee>>(list);
                            Console.WriteLine("data:-" + userToUpload[0]);
                        }
                        catch (JsonException ex)
                        {
                            Console.WriteLine($"Error deserializing JSON: {ex.Message}");
                            return;
                        }
                    }
                    else
                    {
                        Console.WriteLine("No data found in the message.");
                        return;
                    }
                    if (userToUpload != null)
                    {
                        var cancellationToken = new CancellationTokenSource();
                        // await InsertEmployeeToDatabaseAsync(userToUpload);
                        await pipeline.ExecuteAsync(async token =>
                            {
                                // Your code goes here

                                await InsertEmployeeToDatabaseAsync(userToUpload, Uid, Fid, Bid);
                                //  await GetCustomResponseAsync(token);
                            }, cancellationToken.Token);
                    }
                    else
                    {
                        Console.WriteLine("userToUpload list is null");
                    }


                    // channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                };
                channel.BasicConsume(queue: "batch_upload",
                                     autoAck: true,
                                     consumer: consumer);

                Console.WriteLine(" Press [enter] to exit.");
                Console.ReadLine();
            }
        }


        // private async Task<MyCustomResponse> InsertEmployeeToDatabaseAsync1(List<Employee> userToUpload)
        // {
        //     var time = new Stopwatch();
        //     time.Start();

        //     // Use your MySQL insertion logic here
        //     var conString = "Server=localhost;Database=test1;User=root;Password=root";
        //     using (MySqlConnection mConnection = new MySqlConnection(conString))
        //     {
        //         await mConnection.OpenAsync();
        //         using var transaction = await mConnection.BeginTransactionAsync();
        //         try
        //         {
        //             // await mConnection.OpenAsync();

        //             StringBuilder sCommand = new StringBuilder("REPLACE INTO employees (name, email, country, state, city, phoneNumber, addres1, addres2, dob) VALUES ");
        //             List<string> Rows = new List<string>();
        //             Console.WriteLine(userToUpload.Count);
        //             foreach (var employee in userToUpload)
        //             {
        //                 Rows.Add(string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}')",
        //                     MySqlHelper.EscapeString(employee.name),
        //                     MySqlHelper.EscapeString(employee.email),
        //                     MySqlHelper.EscapeString(employee.country),
        //                     MySqlHelper.EscapeString(employee.state),
        //                     MySqlHelper.EscapeString(employee.city),
        //                     MySqlHelper.EscapeString(employee.phoneNumber),
        //                     MySqlHelper.EscapeString(employee.addres1),
        //                     MySqlHelper.EscapeString(employee.addres2),
        //                     employee.dob.ToString("yyyy-MM-dd")));
        //             }

        //             sCommand.Append(string.Join(",", Rows));
        //             sCommand.Append(";");
        //             var content = "";
        //             using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
        //             {
        //                 myCmd.Transaction = transaction;
        //                 myCmd.CommandType = System.Data.CommandType.Text;
        //                 try
        //                 {

        //                     var cancellationToken = new CancellationTokenSource();
        //                     // Asynchronous execution is also supported with the same pipeline instance

        //                     await myCmd.ExecuteNonQueryAsync();
        //                     content = "Hogaya";



        //                 }
        //                 catch (Exception e)
        //                 {
        //                     Console.WriteLine($"Error inserting employees: {e.Message}");
        //                     await transaction.RollbackAsync();
        //                     content = e.Message;


        //                 }

        //                 await transaction.CommitAsync();
        //                 Console.WriteLine(time.Elapsed);
        //                 return new MyCustomResponse { IsSuccess = true, Message = content };
        //             }

        //             // Console.WriteLine(time.Elapsed);
        //         }
        //         catch (Exception ex)
        //         {
        //             Console.WriteLine($"Error inserting employees: {ex.Message}");

        //             // Handle the exception as needed (logging, rethrowing, etc.)
        //         }
        //     }
        // }
        private async Task InsertEmployeeToDatabaseAsync(List<Employee> userToUpload, string Uid, string Fid, string Bid)
        {
            var time = new Stopwatch();
            time.Start();
            var _statusService = new StatusService();
            // Use your MySQL insertion logic here
            var conString = "Server=localhost;Database=test1;User=root;Password=root";
            using (MySqlConnection mConnection = new MySqlConnection(conString))
            {
                await mConnection.OpenAsync();
                try
                {
                    // await mConnection.OpenAsync();

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
                    using var transaction = await mConnection.BeginTransactionAsync();

                    using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection, transaction))
                    {
                        myCmd.CommandType = System.Data.CommandType.Text;
                        try
                        {

                            var cancellationToken = new CancellationTokenSource();
                            // Asynchronous execution is also supported with the same pipeline instance

                            await pipeline.ExecuteAsync(async token =>
                            {
                                Console.WriteLine("Maine Try kiya");
                                await myCmd.ExecuteNonQueryAsync();
                                await transaction.CommitAsync();
                                await _statusService.UpdateBatchAsync(Uid, Fid, Bid, "Completed");
                                await _statusService.Check(Uid, Fid);


                                // Your code goes here
                            }, cancellationToken.Token);



                        }
                        catch (Exception e)
                        {
                            Console.WriteLine($"Error inserting employees: {e.Message}");
                            await transaction.RollbackAsync();
                        }


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