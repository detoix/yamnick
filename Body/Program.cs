using System;
using System.Text;
using Contracts;
using RabbitMQ.Client;

namespace Body
{
    class Program
    {
        static void Main(string[] args)
        {
            var message = new TypedMessage();
            var factory = new ConnectionFactory() 
            { 
                Uri = new Uri(args[0])
            };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel())
            {
                channel.BasicPublish(exchange: "",
                                    routingKey: "TypedMessage",
                                    basicProperties: null,
                                    body: message.ToByteArray());
                Console.WriteLine(" [x] Sent {0}", message);
            }
        }
    }
}
