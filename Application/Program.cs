using System;
using System.Linq;
using System.Text;
using System.Text.Json;
using Akka.Actor;
using Contracts;
using Application.Actors;
using Marten;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using BeetleX.FastHttpApi;
using BeetleX.EventArgs;
using System.Threading;
using System.Threading.Tasks;
using BeetleX.FastHttpApi.WebSockets;
using System.Text.RegularExpressions;

namespace Application
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Console.WriteLine(
                $"Starting up with args of: {string.Join(" ", args)}");

            using (var store = DocumentStore.For(ValidConnectionStringFrom(args[0])))
            using (var connection = new RabbitMQ.Client.ConnectionFactory() { Uri = new Uri(args[1]) }.CreateConnection())
            using (var channel = connection.CreateModel())
            using (var system = ActorSystem.Create("System"))
            using (var webSocketServer = new SocketIOServer())
            {
                webSocketServer.Open();

                Console.Write(webSocketServer.BaseServer);

                webSocketServer.WebSocketConnect += (a, b) =>
                {   
                    webSocketServer.Log(LogType.Info, b.Request.Session, b.Request.Session.Tag, "Client connected");

                    Task.Run(() =>
                    {
                        Thread.Sleep(2000);
                        System.Console.WriteLine("SENDING THIS MESSAGE");
                        webSocketServer.SendToWebSocket(
                            webSocketServer.CreateDataFrame("0{\"sid\":\"JSvFLXDjskv3zmKFAAAB\",\"upgrades\":[],\"pingInterval\":25000,\"pingTimeout\":5000}"));
                        webSocketServer.SendToWebSocket(
                            webSocketServer.CreateDataFrame("40"));
                        webSocketServer.SendToWebSocket(
                            webSocketServer.CreateDataFrame("42[\"server_ready\"]"));
                    });
                };

                Send send = (channelName, message, replyTo) =>
                {
                    var props = channel.CreateBasicProperties();
                    if (!string.IsNullOrEmpty(replyTo))
                        props.ReplyTo = replyTo;
                    channel.BasicPublish(
                        exchange: string.Empty,
                        routingKey: channelName,
                        basicProperties: props,
                        body: Encoding.UTF8.GetBytes(message));
                };

                send = (channelName, message, replyTo) =>
                {
                    webSocketServer.SendToWebSocket(
                            webSocketServer.CreateDataFrame("42[\"diagram_persisted\"," + message + "]"));
                };

                var persistenceManager = system.ActorOf(
                    Props.Create<PersistenceActor>(store));
                var coordinator = system.ActorOf(
                    Props.Create<GatewayActor>(persistenceManager, send));
                var router = new EventingBasicConsumer(channel);
                webSocketServer.WebSocketReceive += (_, eventArgs) =>
                {
                    if (eventArgs.Frame.Type == BeetleX.FastHttpApi.WebSockets.DataPacketType.text)
                    {
                        var message = SocketIOMessage.From(eventArgs.Frame);
                        coordinator.Tell(message.Content);
                    }
                };
                router.Received += (model, ea) => 
                {
                    var serialized = Encoding.UTF8.GetString(ea.Body);
                    System.Console.WriteLine($"System received message of {serialized}");
                    var message = JsonSerializer.Deserialize<TypedMessage>(serialized, new  JsonSerializerOptions()
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    message.ReplyTo = ea.BasicProperties.ReplyTo;
                    coordinator.Tell(message);
                };
                var taskQueueName = "app_mailbox";
                channel.QueueDeclare(taskQueueName, durable: true);
                channel.BasicConsume(
                    queue: taskQueueName, 
                    autoAck: true,
                    consumer: router);

                do
                {
                    
                } while (true);
            }
        }

        static string ValidConnectionStringFrom(string connectionString)
        {
            if (!connectionString.StartsWith("postgres"))
            {
                return connectionString;
            }
            else
            {
                var delimiterChars = new[] { '/', ':', '@', '?' };
                var strConn = connectionString.Replace("//", "").Split(delimiterChars).Where(x => !string.IsNullOrEmpty(x)).ToArray();
                var user = strConn[1];
                var pass = strConn[2];
                var server = strConn[3];
                var database = strConn[5];
                var port = strConn[4];
                
                return $"Server={server};Port={port};Database={database};User Id={user};Password={pass};sslmode=Require;Trust Server Certificate=true";
            }
        }
    }

    class SocketIOServer : BeetleX.FastHttpApi.HttpApiServer
    {
        public SocketIOServer() : base(new HttpOptions()
        {
            LogToConsole = true,
            Port = 8090,
            LogLevel = BeetleX.EventArgs.LogType.Info,
        })
        {
            
        }
    }


    public class SocketIOMessage
    {
        private static SocketIOMessage InvalidMessage { get; } = new SocketIOMessage(string.Empty, new TypedMessage());
        private static JsonSerializerOptions SerializerOptions { get; } = new  JsonSerializerOptions()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        private const string MessagePattern = @"\[.*\]";

        public static SocketIOMessage From(DataFrame frame)
        {
            if (frame.Body is BeetleX.FastHttpApi.DataBuffer<byte> stream)
            {
                var body = Encoding.UTF8.GetString(stream.Data, 0, stream.Data.Length);
                var bodyContent = Regex.Match(body, MessagePattern);
                if (bodyContent.Success)
                {   
                    var message = JsonSerializer.Deserialize<string[]>(bodyContent.Value);
                    
                    if (message.Length == 1)
                    {
                        var messageContent = JsonSerializer.Deserialize<TypedMessage>(message[0], SerializerOptions);

                        return new SocketIOMessage("", messageContent);
                    }
                    else if (message.Length == 2)
                    {
                        var messageContent = JsonSerializer.Deserialize<TypedMessage>(message[1], SerializerOptions);

                        return new SocketIOMessage(message[0], messageContent);
                    }
                    else
                    {
                        return InvalidMessage;
                    }
                }
                else
                {
                    return InvalidMessage;
                }

            }
            else
            {
                return InvalidMessage;
            }
        }

        public string Type { get; }
        public TypedMessage Content { get; }

        private SocketIOMessage(string type, TypedMessage content)
        {
            this.Type = type;
            this.Content = content;
        }

        public string Serialize(int prefix = 42)
        {
            return string.Empty;
        }
    }
}