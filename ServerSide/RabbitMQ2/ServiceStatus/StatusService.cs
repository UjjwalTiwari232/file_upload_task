

// using System.Data;
// using System.Text.Json;
// using LargeDatasetProject.Models;
// using MySql.Data.MySqlClient;

// public class StatusService
// {
//     private readonly MySqlConnectionHelper _connectionHelper;

//     public StatusService(MySqlConnectionHelper connectionHelper)
//     {
//         _connectionHelper = connectionHelper;
//     }

//     public async Task InitializeStatusAsync(StatusModel status)
//     {
//         status.Id = Guid.NewGuid().ToString();  // Generate a new GUID for Id

//         using var connection = _connectionHelper.GetConnection();
//         await connection.OpenAsync();

//         var command = new MySqlCommand(
//             "INSERT INTO ProcessStatus (Id, UId, Status, TotalBatches, Batches) " +
//             "VALUES (@Id, @UId, @Status, @TotalBatches, @Batches)", connection);
//         command.Parameters.AddWithValue("@Id", status.Id);
//         command.Parameters.AddWithValue("@UId", status.UId);
//         command.Parameters.AddWithValue("@Status", status.Status);
//         command.Parameters.AddWithValue("@TotalBatches", status.TotalBatches);
//         command.Parameters.AddWithValue("@Batches", JsonSerializer.Serialize(status.Batches));

//         await command.ExecuteNonQueryAsync();
//     }

//     public async Task UpdateStatusAsync(string id, string status)
//     {
//         using var connection = _connectionHelper.GetConnection();
//         await connection.OpenAsync();

//         var command = new MySqlCommand(
//             "UPDATE ProcessStatus SET Status = @Status WHERE Id = @Id", connection);
//         command.Parameters.AddWithValue("@Id", id);
//         command.Parameters.AddWithValue("@Status", status);

//         await command.ExecuteNonQueryAsync();
//     }

//     public async Task AddBatchAsync(string id, StatusModel.Batch batch)
//     {
//         using var connection = _connectionHelper.GetConnection();
//         await connection.OpenAsync();

//         var selectCommand = new MySqlCommand(
//             "SELECT Batches FROM ProcessStatus WHERE Id = @Id", connection);
//         selectCommand.Parameters.AddWithValue("@Id", id);

//         var batchesJson = (string)await selectCommand.ExecuteScalarAsync();
//         var batches = JsonSerializer.Deserialize<List<StatusModel.Batch>>(batchesJson) ?? new List<StatusModel.Batch>();
//         batches.Add(batch);

//         var updateCommand = new MySqlCommand(
//             "UPDATE ProcessStatus SET Batches = @Batches, TotalBatches = @TotalBatches WHERE Id = @Id", connection);
//         updateCommand.Parameters.AddWithValue("@Id", id);
//         updateCommand.Parameters.AddWithValue("@Batches", JsonSerializer.Serialize(batches));
//         updateCommand.Parameters.AddWithValue("@TotalBatches", batches.Count);

//         await updateCommand.ExecuteNonQueryAsync();
//     }

//     public async Task UpdateBatchStatusAsync(string id, StatusModel.Batch batch)
//     {
//         using var connection = _connectionHelper.GetConnection();
//         await connection.OpenAsync();

//         var selectCommand = new MySqlCommand(
//             "SELECT Batches FROM ProcessStatus WHERE Id = @Id", connection);
//         selectCommand.Parameters.AddWithValue("@Id", id);

//         var batchesJson = (string)await selectCommand.ExecuteScalarAsync();
//         var batches = JsonSerializer.Deserialize<List<StatusModel.Batch>>(batchesJson) ?? new List<StatusModel.Batch>();

//         var existingBatch = batches.FirstOrDefault(b => b.BId == batch.BId);
//         if (existingBatch != null)
//         {
//             existingBatch.BatchStatus = batch.BatchStatus;
//             existingBatch.BatchStart = batch.BatchStart;
//             existingBatch.BatchEnd = batch.BatchEnd;
//         }

//         var updateCommand = new MySqlCommand(
//             "UPDATE ProcessStatus SET Batches = @Batches WHERE Id = @Id", connection);
//         updateCommand.Parameters.AddWithValue("@Id", id);
//         updateCommand.Parameters.AddWithValue("@Batches", JsonSerializer.Serialize(batches));

//         using var transactions = await connection.BeginTransactionAsync();
//         updateCommand.Transaction = transactions;

//         try {
//             await updateCommand.ExecuteNonQueryAsync();
//         }
//         catch(Exception e) {
//             Console.WriteLine(e);
//             await transactions.RollbackAsync();
//         }
//         await transactions.CommitAsync();

//         await CheckAndUpdateProcessStatusAsync(id); // Check if all batches are processed
//     }

//     private async Task CheckAndUpdateProcessStatusAsync(string id)
//     {
//         const int maxRetries = 3;
//         int retries = 0;
//         bool allBatchesProcessed = false;

//         while (retries < maxRetries && !allBatchesProcessed)
//         {
//             retries++;

//             using var connection = _connectionHelper.GetConnection();
//             await connection.OpenAsync();

//             var selectCommand = new MySqlCommand(
//                 "SELECT Batches, TotalBatches FROM ProcessStatus WHERE Id = @Id", connection);
//             selectCommand.Parameters.AddWithValue("@Id", id);

//             using var reader = await selectCommand.ExecuteReaderAsync();
//             if (await reader.ReadAsync())
//             {
//                 var batchesJson = reader.GetString("Batches");
//                 var totalBatches = reader.GetInt32("TotalBatches");
//                 var batches = JsonSerializer.Deserialize<List<StatusModel.Batch>>(batchesJson) ?? new List<StatusModel.Batch>();

//                 allBatchesProcessed = batches.Count == totalBatches && batches.All(b => b.BatchStatus == "Processed");

//                 if (allBatchesProcessed)
//                 {
//                     await UpdateStatusAsync(id, "Completed");
//                     return;
//                 }
//             }

//             await Task.Delay(1000); // Wait 1 second before retrying
//         }
//     }
// }

using System.Data;
using System.Text.Json;
using System.Transactions;
using RabbitMQ2.Models;
using RabbitMQ2.MySqlConnnectorHandler;
using MySqlConnector;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using RabbitMQ2;
namespace RabbitMQ2.ServiceStatus.StatusService;
public class StatusService
{
    private readonly SqlConnection _connectionHelper;
    private readonly IMongoCollection<ProcessStatusModel> _statusCollection;
    public StatusService()
    {
        // _connectionHelper = connectionHelper;

        var mongoClient = new MongoClient(
                 "mongodb://ujjwal-tiwari:zeus%40123@localhost:27017");

        var mongoDatabase = mongoClient.GetDatabase("testing");

        _statusCollection = mongoDatabase.GetCollection<ProcessStatusModel>("Status");
    }

    public async Task CreateAsync(string uid, string fid, string status)
    {

        var newStatusModel = new ProcessStatusModel
        {
            Uid = uid,
            Fid = fid,
            status = status
        };

        await _statusCollection.InsertOneAsync(newStatusModel);
    }
    public async Task AddBatchAsync(string uid, string fid, ProcessStatusModel.Batch batch)
    {
        try
        {
            var filter = Builders<ProcessStatusModel>.Filter.Eq(s => s.Uid, uid) &
                         Builders<ProcessStatusModel>.Filter.Eq(s => s.Fid, fid);
            var update = Builders<ProcessStatusModel>.Update.Push(s => s.batches, batch);

            var result = await _statusCollection.UpdateOneAsync(filter, update);


        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }

    public async Task UpdateAsync(string Uid, string Fid, ProcessStatusModel updatedStatusModel)
    {
        var filter = Builders<ProcessStatusModel>.Filter.Eq(s => s.Uid, Uid) &
                             Builders<ProcessStatusModel>.Filter.Eq(s => s.Fid, Fid);
        var update = Builders<ProcessStatusModel>.Update.Set(s => s.status, updatedStatusModel.status);
        var update1 = Builders<ProcessStatusModel>.Update.Set(s => s.totalBatches, updatedStatusModel.totalBatches);

        var result = await _statusCollection.UpdateOneAsync(filter, update);
        var result1 = await _statusCollection.UpdateOneAsync(filter, update1);


    }

    public async Task UpdateBatchAsync(string Uid, string Fid, string Bid, string updatedStatus)
    {

        try
        {
            var filter =
                Builders<ProcessStatusModel>.Filter.Eq(s => s.Uid, Uid) &
                Builders<ProcessStatusModel>.Filter.Eq(s => s.Fid, Fid) &
                Builders<ProcessStatusModel>.Filter.ElemMatch(s => s.batches, b => b.BId == Bid);

            var update = Builders<ProcessStatusModel>.Update.Set("batches.$.batchStatus", updatedStatus);

            var result = await _statusCollection.UpdateOneAsync(filter, update);
        }

        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return;
        }

    }


    public async Task Check(string uid, string fid)
    {
        try
        {
            Console.WriteLine("inside check method");
            var filter = Builders<ProcessStatusModel>.Filter.And(
                Builders<ProcessStatusModel>.Filter.Eq(s => s.Uid, uid),
                Builders<ProcessStatusModel>.Filter.Eq(s => s.Fid, fid)
            );

            var document = await _statusCollection.Find(filter).FirstOrDefaultAsync();

            if (document == null)
            {
                Console.WriteLine($"No document found with UId: {uid} and FId: {fid}");
                return;
            }

            if (document.batches.Count != document.totalBatches)
            {
                return;
            }

            bool allCompleted = true;
            List<string> errorBatchIds = new List<string>();

            foreach (var batch in document.batches)
            {
                if (batch.batchStatus != "Uploaded")
                {
                    allCompleted = false;
                    if (batch.batchStatus == "Error")
                    {
                        errorBatchIds.Add(batch.BId);
                    }
                }
            }

            var updateDefinition = new List<UpdateDefinition<ProcessStatusModel>>();

            if (allCompleted)
            {
                updateDefinition.Add(Builders<ProcessStatusModel>.Update.Set(s => s.status, "Completed"));
                await _statusCollection.UpdateOneAsync(document.status, "Completed");
            }
            else if (errorBatchIds.Count > 0)
            {
                var errorMessage = $"Error occurred in batches: {string.Join(", ", errorBatchIds)}";
                updateDefinition.Add(Builders<ProcessStatusModel>.Update.Set(s => s.status, errorMessage));
            }

            if (updateDefinition.Count > 0)
            {
                var combinedUpdate = Builders<ProcessStatusModel>.Update.Combine(updateDefinition);
                var updateResult = await _statusCollection.UpdateOneAsync(filter, combinedUpdate);

                if (updateResult.MatchedCount > 0)
                {
                    Console.WriteLine($"Successfully updated status for UId: {uid} and FId: {fid}");
                }
                else
                {
                    Console.WriteLine($"Failed to update status for UId: {uid} and FId: {fid}");
                }
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error occurred while updating status: {e.Message}");
        }
    }

    // public async Task InitializeStatusAsync(ProcessStatusModel status)
    // {

    //     // status.Id = Guid.NewGuid().ToString();  // Generate a new GUID for Id

    //     // using var connection = _connectionHelper.GetConnection();
    //     // await connection.OpenAsync();
    //     // using var transaction = await connection.BeginTransactionAsync();
    //     // var command = new MySqlCommand(
    //     //     "INSERT INTO ProcessStatus (UId, Status, TotalBatches, Batches) " +
    //     //     "VALUES (@UId, @Status, @TotalBatches, @Batches)", connection);
    //     // // command.Parameters.AddWithValue("@Id", status.Id);
    //     // command.Parameters.AddWithValue("@UId", status.Uid);
    //     // command.Parameters.AddWithValue("@Status", status.status);
    //     // command.Parameters.AddWithValue("@TotalBatches", status.totalBatches);
    //     // command.Parameters.AddWithValue("@Batches", JsonSerializer.Serialize(status.batches));

    //     // command.Transaction = transaction;

    //     // try
    //     // {
    //     //     await command.ExecuteNonQueryAsync();
    //     //     await transaction.CommitAsync();
    //     // }
    //     // catch (Exception e)
    //     // {
    //     //     Console.WriteLine(e);
    //     //     await transaction.RollbackAsync();
    //     // }
    //     try
    //     {
    //         await _statusCollection.InsertOneAsync(status);
    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine("Q2 insertion Problem");
    //     }



    // }

    // public async Task UpdateStatusAsync(int id, string status)
    // {
    //     using var connection = _connectionHelper.GetConnection();
    //     await connection.OpenAsync();

    //     using var transaction = await connection.BeginTransactionAsync();

    //     var command = new MySqlCommand(
    //         "UPDATE ProcessStatus SET Status = @Status WHERE Id = @Id", connection);
    //     command.Parameters.AddWithValue("@Id", id);
    //     command.Parameters.AddWithValue("@Status", status);

    //     command.Transaction = transaction;

    //     try
    //     {
    //         await command.ExecuteNonQueryAsync();
    //         await transaction.CommitAsync();
    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine(e);
    //         await transaction.RollbackAsync();
    //     }

    // }

    // public async Task AddBatchAsync(int id, ProcessStatusModel.Batch batch)
    // {
    //     using var connection = _connectionHelper.GetConnection();
    //     await connection.OpenAsync();

    //     using var transaction = await connection.BeginTransactionAsync();

    //     var selectCommand = new MySqlCommand(
    //         "SELECT Batches FROM ProcessStatus WHERE Id = @Id", connection);
    //     selectCommand.Parameters.AddWithValue("@Id", id);

    //     var batchesJson = (string)await selectCommand.ExecuteScalarAsync();
    //     var batches = JsonSerializer.Deserialize<List<ProcessStatusModel.Batch>>(batchesJson!) ?? new List<ProcessStatusModel.Batch>();
    //     batches.Add(batch);

    //     var updateCommand = new MySqlCommand(
    //         "UPDATE ProcessStatus SET Batches = @Batches, TotalBatches = @TotalBatches WHERE Id = @Id", connection);
    //     updateCommand.Parameters.AddWithValue("@Id", id);
    //     updateCommand.Parameters.AddWithValue("@Batches", JsonSerializer.Serialize(batches));
    //     updateCommand.Parameters.AddWithValue("@TotalBatches", batches.Count);

    //     updateCommand.Transaction = transaction;

    //     try
    //     {
    //         await updateCommand.ExecuteNonQueryAsync();

    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine(e);
    //         await transaction.RollbackAsync();
    //     }
    //     await transaction.CommitAsync();
    //     await connection.CloseAsync();
    // }

    // public async Task UpdateBatchStatusAsync(int id, ProcessStatusModel.Batch batch)
    // {
    //     using var connection = _connectionHelper.GetConnection();
    //     await connection.OpenAsync();

    //     using var transaction = await connection.BeginTransactionAsync();

    //     var selectCommand = new MySqlCommand(
    //         "SELECT Batches FROM ProcessStatus WHERE Id = @Id", connection);
    //     selectCommand.Parameters.AddWithValue("@Id", id);

    //     var batchesJson = (string)await selectCommand.ExecuteScalarAsync();
    //     var batches = JsonSerializer.Deserialize<List<ProcessStatusModel.Batch>>(batchesJson) ?? new List<ProcessStatusModel.Batch>();

    //     var existingBatch = batches.FirstOrDefault(b => b.BId == batch.BId);
    //     if (existingBatch != null)
    //     {
    //         existingBatch.batchStatus = batch.batchStatus;
    //         existingBatch.batchStart = batch.batchStart;
    //         existingBatch.batchEnd = batch.batchEnd;
    //     }

    //     var updateCommand = new MySqlCommand(
    //         "UPDATE ProcessStatus SET Batches = @Batches WHERE Id = @Id", connection);
    //     updateCommand.Parameters.AddWithValue("@Id", id);
    //     updateCommand.Parameters.AddWithValue("@Batches", JsonSerializer.Serialize(batches));

    //     updateCommand.Transaction = transaction;

    //     try
    //     {
    //         await updateCommand.ExecuteNonQueryAsync();
    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine(e);
    //         await transaction.RollbackAsync();
    //     }
    //     await transaction.CommitAsync();
    //     await connection.CloseAsync();
    //     await CheckAndUpdateProcessStatusAsync(id); // Check if all batches are processed
    // }

    // private async Task CheckAndUpdateProcessStatusAsync(int id)
    // {
    //     const int maxRetries = 3;
    //     int retries = 0;
    //     bool allBatchesProcessed = false;

    //     while (retries < maxRetries && !allBatchesProcessed)
    //     {
    //         retries++;

    //         using var connection = _connectionHelper.GetConnection();
    //         await connection.OpenAsync();


    //         var selectCommand = new MySqlCommand(
    //             "SELECT Batches, TotalBatches FROM ProcessStatus WHERE Id = @Id", connection);
    //         selectCommand.Parameters.AddWithValue("@Id", id);



    //         using var reader = await selectCommand.ExecuteReaderAsync();
    //         if (await reader.ReadAsync())
    //         {
    //             var batchesJson = reader.GetString("Batches");
    //             var totalBatches = reader.GetInt32("TotalBatches");
    //             var batches = JsonSerializer.Deserialize<List<ProcessStatusModel.Batch>>(batchesJson) ?? new List<ProcessStatusModel.Batch>();

    //             allBatchesProcessed = batches.Count == totalBatches && batches.All(b => b.batchStatus == "Processed");

    //             if (allBatchesProcessed)
    //             {
    //                 await UpdateStatusAsync(id, "Completed");
    //                 return;
    //             }
    //         }

    //         await Task.Delay(1000); // Wait 1 second before retrying
    //     }
    // }
}
