using System;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Models;
using Backend.Models.SendToFirstQueue;
using RabbitMQ.Client;


namespace Backend.RabbitMQ
{
    public class Send
    {
        public void SendEmployees(IFormFile employees, string UId, string FId)
        {
            try
            {
                var factory = new ConnectionFactory { HostName = "localhost" };

                using (var connection = factory.CreateConnection())
                using (var channel = connection.CreateModel())
                {
                    channel.QueueDeclare(queue: "EMP1",
                                        durable: true,
                                        exclusive: false,
                                        autoDelete: false,
                                        arguments: null);


                    using var memoryStream = new MemoryStream();
                    employees.CopyTo(memoryStream);
                    var fileBytes = memoryStream.ToArray();
                    var data = new SendToFirstQueue
                    {
                        file = fileBytes,
                        Uid = UId,
                        Fid = FId
                    };
                    // var message = Encoding.UTF8.GetBytes($"{fileBytes}|{Uid}|{Fid}");

                    var message = JsonSerializer.Serialize(data);
                    var mes = Encoding.UTF8.GetBytes(message);
                    var properties = channel.CreateBasicProperties();
                    properties.Persistent = true;

                    channel.BasicPublish(exchange: string.Empty,
                                        routingKey: "EMP1",
                                        basicProperties: properties,
                                        body: mes);



                }
            }
            catch (Exception e)
            {

                Console.WriteLine(e.Message);
            }

            Console.WriteLine("Hello");
        }



    }
}






// public void SendMessage2()
// {
//     var factory = new ConnectionFactory { HostName = "localhost" };
//     using var connection = factory.CreateConnection();
//     using var channel = connection.CreateModel();

//     channel.QueueDeclare(queue: "task_queue",
//                         durable: true,
//                         exclusive: false,
//                         autoDelete: false,
//                         arguments: null);

//     var message = GetMessage(args);
//     var body = Encoding.UTF8.GetBytes(message);

//     var properties = channel.CreateBasicProperties();
//     properties.Persistent = true;

//     channel.BasicPublish(exchange: string.Empty,
//                         routingKey: "task_queue",
//                         basicProperties: properties,
//                         body: body);
//     Console.WriteLine($" [x] Sent {message}");

//     Console.WriteLine(" Press [enter] to exit.");
//     Console.ReadLine();
//     static string GetMessage(string[] args)
//     {
//         return ((args.Length > 0) ? string.Join(" ", args) : "Hello World!");
//     }
// }

// foreach (var employee in employees)
// {
//     var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(employee));

//     var properties = channel.CreateBasicProperties();
//     properties.Persistent = true;

//     channel.BasicPublish(exchange: string.Empty,
//                         routingKey: "employee_queue",
//                         basicProperties: properties,
//                         body: body);

//     // Console.WriteLine($" [x] Sent Employee {employee.name}");
// }
// public void SendMessage()
// {
//     var factory = new ConnectionFactory { HostName = "localhost" };

//     using (var connection = factory.CreateConnection())
//     using (var channel = connection.CreateModel())
//     {
//         channel.QueueDeclare(queue: "hello",
//                              durable: false,
//                              exclusive: false,
//                              autoDelete: false,
//                              arguments: null);

//         const string message = "Hello World!";
//         var body = Encoding.UTF8.GetBytes(message);

//         channel.BasicPublish(exchange: "",
//                              routingKey: "hello",
//                              basicProperties: null,
//                              body: body);

//         Console.WriteLine($" [x] Sent {message}");
//     }

//     Console.WriteLine(" Press [enter] to exit.");
//     Console.ReadLine();
// }
