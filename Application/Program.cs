using System;
using System.Linq;
using System.Text;
using System.Text.Json;
using Akka.Actor;
using Contracts;
using Application.Actors;
using Marten;
using BeetleX.FastHttpApi;
using BeetleX.FastHttpApi.WebSockets;
using System.Text.RegularExpressions;
using System.IO;

namespace Application
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Console.WriteLine(
                $"Starting up with args of: {string.Join(" ", args)}");

            using (var store = DocumentStore.For(ValidConnectionStringFrom(args[0])))
            using (var system = ActorSystem.Create("System"))
            using (var webSocketServer = new SocketIOServer(args[1]))
            {
                webSocketServer.Open();

                Console.Write(webSocketServer.BaseServer);

                webSocketServer.HttpConnecting += (_, eventArgs) =>
                {
                    System.Console.WriteLine(1);
                    // webSocketServer.Log(BeetleX.EventArgs.LogType.Info, eventArgs.Socket., "1");
                };

                webSocketServer.Started += (_, eventArgs) =>
                {
                };

                webSocketServer.HttpRequesting += (_, eventArgs) =>
                {
                    System.Console.WriteLine(2);
                    webSocketServer.Log(BeetleX.EventArgs.LogType.Info, eventArgs.Request.Session, "2");
                };

                webSocketServer.WebSocketConnect += (_, eventArgs) =>
                {
                    System.Console.WriteLine(3);
                    webSocketServer.Log(BeetleX.EventArgs.LogType.Info, eventArgs.Request.Session, "3");
                };

                
                System.Console.WriteLine(0);

                webSocketServer.HttpResponsed += (_, eventArgs) =>
                {
                    webSocketServer.Log(BeetleX.EventArgs.LogType.Info, eventArgs.Request.Session, "5");
                    if (eventArgs.Status == 101)
                    {
                        eventArgs.Request.Session.Send(
                            webSocketServer.CreateDataFrame(SocketIOMessage.AcknowledgeMessage1));
                        eventArgs.Request.Session.Send(
                            webSocketServer.CreateDataFrame(SocketIOMessage.AcknowledgeMessage2));
                        eventArgs.Request.Session.Send(
                            webSocketServer.CreateDataFrame(SocketIOMessage.AcknowledgeMessage3));
                    }
                };

                Send send = (channelName, message, replyTo) =>
                {
                    var socketIOMessage = new SocketIOMessage("diagram_persisted", message);
                    var serializedMessage = socketIOMessage.Serialize();

                    webSocketServer.SendToWebSocket(
                            webSocketServer.CreateDataFrame(serializedMessage));
                };

                var persistenceManager = system.ActorOf(
                    Props.Create<PersistenceActor>(store));
                var coordinator = system.ActorOf(
                    Props.Create<GatewayActor>(persistenceManager, send));
                webSocketServer.WebSocketReceive += (_, eventArgs) =>
                {
                    if (eventArgs.Frame.Type == BeetleX.FastHttpApi.WebSockets.DataPacketType.text)
                    {
                        var message = SocketIOMessage.From(eventArgs.Frame);
                        coordinator.Tell(message.Content);
                    }
                };
                
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
        public SocketIOServer(string port) : base(new HttpOptions()
        {
            LogToConsole = true,
            Port = 8090,
            LogLevel = BeetleX.EventArgs.LogType.All,
            CrossDomain = new OptionsAttribute()
            {
                AllowHeaders = "*",
                AllowMethods = "*",
                AllowOrigin = "*"
            },
            SSL = true,
            SSLPort = int.Parse(port),
            CertificateFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "keyBag.pfx"),
            CertificatePassword = "1234"
        })
        {
            if (File.Exists("keyBag.pfx"))
            {
                System.Console.WriteLine("jest");
            }
            else
            {
                System.Console.WriteLine("nie ma");
            }

            foreach (var f in Directory.GetFiles(AppDomain.CurrentDomain.BaseDirectory))
            {
                System.Console.WriteLine(f);
            }

            System.Console.WriteLine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "keyBag.pfx"));
        }
    }

    class SocketIOMessage
    {
        private static SocketIOMessage InvalidMessage { get; } = new SocketIOMessage(string.Empty, new TypedMessage());
        private static JsonSerializerOptions SerializerOptions { get; } = new  JsonSerializerOptions()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        private const string MessagePattern = @"\[.*\]";
        public const string AcknowledgeMessage1 = "0{\"sid\":\"0\",\"upgrades\":[],\"pingInterval\":25000,\"pingTimeout\":5000}";
        public const string AcknowledgeMessage2 = "40";
        public const string AcknowledgeMessage3 = "42[\"server_ready\"]";

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

        public SocketIOMessage(string type, TypedMessage content)
        {
            this.Type = type;
            this.Content = content;
        }

        public string Serialize(int prefix = 42)
        {
            var message = JsonSerializer.Serialize(this.Content, SerializerOptions);
            return $"{prefix}[\"{this.Type}\",{message}]";
        }
    }
}