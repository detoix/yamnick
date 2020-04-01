using Akka.Actor;
using Contracts;
using System.Text.Json;

namespace CrawlersManager
{
    delegate void SendUntyped(string channel, string message, string replyTo);
    delegate void SendTyped(string channel, object message, string replyTo);

    class CrawlersManager : ReceiveActor
    {
        private IActorRef PersistenceManager { get; }
        private SendUntyped SendUntyped { get; }
        private SendTyped SendTyped { get; }

        public CrawlersManager(
            IActorRef persistenceManager,
            SendUntyped sendUntyped,
            SendTyped sendTyped)
        {
            this.PersistenceManager = persistenceManager;
            this.SendUntyped = sendUntyped;
            this.SendTyped = sendTyped;

            this.PersistenceManager.Tell(true);

            this.Receive<TypedMessage>(args =>
            {
                if (args.CrawlCommand != null)
                {
                    System.Console.WriteLine($"Received {nameof(args.CrawlCommand)} with reply to {args.ReplyTo}, forwarding to self...");
                    args.CrawlCommand.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.CrawlCommand);
                }
            });

            this.Receive<CrawlCommand>(args => 
            {
                System.Console.WriteLine($"Processing {args}");

                var message = JsonSerializer.Serialize(args, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.SendUntyped("crawl_queue", message, args.ReplyTo);
            });
        }
    }
}