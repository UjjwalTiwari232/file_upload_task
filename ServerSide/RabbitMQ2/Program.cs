using RabbitMQ2;


var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();



app.MapGet("/", () => "Hello World!");
Receive obj = new Receive();
obj.ReceiveEmployees();
app.Run();
