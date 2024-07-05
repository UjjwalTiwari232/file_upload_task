namespace RabbitMQ.RabbitMQ
{
    public class Program
    {
        public static void Main()
        {
            Receive obj = new Receive();
            obj.ReceiveEmployees();
            Console.WriteLine("Helo ");
        }
    }
}
