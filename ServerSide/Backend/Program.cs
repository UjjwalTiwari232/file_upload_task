using Backend;
using Backend.Data;
using Backend.RabbitMQ;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// var conString = builder.Configuration.GetConnectionString("Default");

//"Default": "host=localhost;port:5432;Database=sixthtask;user=postgres;password=PASSWORD#"
// "Default": "Server=localhost;Database=test1;User=root;Password=root"


builder.Services.Configure<MongoDBSetting>(
    builder.Configuration.GetSection("BookStoreDatabase"));
// -------------------
var connectionString = builder.Configuration.GetConnectionString("Default");
var serverVersion = ServerVersion.AutoDetect(connectionString);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion);
});
// -----------------------









var app = builder.Build();

builder.Services.AddCors();
app.UseCors(builder => builder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

// Call SendMessage method to send message to RabbitMQ
// receiver.ReceiveMessage();
// sender.SendMessage()
app.MapControllers();
app.Run();






















// builder.Services.AddMySqlDataSource(builder.Configuration.GetConnectionString("Default")!);


// builder.Services.AddDbContext<ApplicationDbContext>(options =>
//     options.UseMySql(builder.Configuration.GetConnectionString("Default"),
//     new MySqlServerVersion(new Version(8, 0, 37)))
// );

// var conString = builder.Configuration.GetConnectionString("Default");
// builder.Services.AddDbContext<ApplicationDbContext>(options =>
// {
//     options.UseNpgsql(conString);
// });


// builder.Services.AddMySqlDataSource(conString!);
// using var connection = new MySqlConnection(conString);
// await connection.OpenAsync();
// using var command = new MySqlCommand("SELECT * FROM employees;", connection);
// using var reader = await command.ExecuteReaderAsync();
// Console.WriteLine(reader);
// Console.WriteLine("Done");
// while (await reader.ReadAsync())
// {
//     var value = reader.GetValue(0);
//     // Console.WriteLine(value);
//     // do something with 'value'


// }
// Console.WriteLine("Done");

// var serverVersion = new MySqlServerVersion(ServerVersion.AutoDetect(conString));

// builder.Services.AddDbContext<ApplicationDbContext>(options =>
// {
//     options.UseMySql(conString, serverVersion);
// });