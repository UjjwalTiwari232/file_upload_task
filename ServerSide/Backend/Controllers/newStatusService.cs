// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using Backend.Models;
// using Microsoft.Extensions.Options;
// using MongoDB.Driver;
// using Backend;

// namespace Backend.Controllers
// {
//     public class StatusService
//     {
//         private readonly IMongoCollection<ProcessStatusModel> _statusCollection;

//         public StatusService(
//             IOptions<MongoDBSetting> statusStoreDatabaseSettings)
//         {
//             var mongoClient = new MongoClient(
//                 statusStoreDatabaseSettings.Value.ConnectionString);

//             var mongoDatabase = mongoClient.GetDatabase(
//                 statusStoreDatabaseSettings.Value.DatabaseName);

//             _statusCollection = mongoDatabase.GetCollection<ProcessStatusModel>(
//                 statusStoreDatabaseSettings.Value.DbCollectionName);
//         }

//         public async Task<List<ProcessStatusModel>> GetAsync() =>
//             await _statusCollection.Find(_ => true).ToListAsync();

//         public async Task<ProcessStatusModel?> GetAsync(int id) =>
//             await _statusCollection.Find(x => x.id == id).FirstOrDefaultAsync();

//         public async Task CreateAsync(ProcessStatusModel newStatus) =>
//             await _statusCollection.InsertOneAsync(newStatus);

//         public async Task UpdateAsync(int id, ProcessStatusModel updatedStatus) =>
//             await _statusCollection.ReplaceOneAsync(x => x.id == id, updatedStatus);

//         public async Task RemoveAsync(int id) =>
//             await _statusCollection.DeleteOneAsync(x => x.id == id);
//     }
// }
