using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


public class MongoDBSetting
{
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public string DbCollectionName { get; set; } = null!;
}
