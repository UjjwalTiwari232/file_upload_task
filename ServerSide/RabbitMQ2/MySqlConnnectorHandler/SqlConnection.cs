using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MySqlConnector;

namespace RabbitMQ2.MySqlConnnectorHandler
{
    public class SqlConnection
    {
        private readonly string _connectionString;

        public SqlConnection(string connectionString)
        {
            _connectionString = connectionString;
        }

        public MySqlConnection GetConnection()
        {
            return new MySqlConnection(_connectionString);
        }
    }


}
