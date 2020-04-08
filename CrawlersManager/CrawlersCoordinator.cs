using Akka.Actor;
using Contracts;
using CrawlersManager.Events;
using System.Text.Json;

namespace CrawlersManager
{
    delegate void SendUntyped(string channel, string message, string replyTo);
    delegate void SendTyped(string channel, object message, string replyTo);

    class CrawlersCoordinator : ReceiveActor
    {
        private IActorRef PersistenceManager { get; }
        private SendUntyped SendUntyped { get; }
        private SendTyped SendTyped { get; }

        public CrawlersCoordinator(
            IActorRef persistenceManager,
            SendUntyped sendUntyped,
            SendTyped sendTyped)
        {
            this.PersistenceManager = persistenceManager;
            this.SendUntyped = sendUntyped;
            this.SendTyped = sendTyped;

            this.Receive<TypedMessage>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                if (args.CrawlCommand != null)
                {
                    args.CrawlCommand.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.CrawlCommand);
                }
                else if (args.CrawlResults != null)
                {
                    args.CrawlResults.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.CrawlResults);
                }
                else if (args.QueryForUser != null)
                {
                    args.QueryForUser.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.QueryForUser);
                }
                else if (args.RemoveQuery != null)
                {
                    args.RemoveQuery.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.RemoveQuery);
                }
            });

            this.Receive<QueryForUser>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");
                
                this.PersistenceManager.Tell(args);
            });

            this.Receive<CrawlCommand>(args => 
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.PersistenceManager.Tell(args);
            });

            this.Receive<CrawlCommandPersisted>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.CrawlCommand.Id} by {args.CrawlCommand.ReplyTo}");

                var message = JsonSerializer.Serialize(args.CrawlCommand, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.SendUntyped("crawl_queue", message, args.CrawlCommand.ReplyTo);
            });

            this.Receive<CrawlResults>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");
                
                this.PersistenceManager.Tell(args);
            });

            this.Receive<User>(args => 
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                var message = JsonSerializer.Serialize(args, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.SendUntyped(args.ReplyTo, message, string.Empty);
            });
        
            this.Receive<RemoveQuery>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.PersistenceManager.Tell(args);
            });

            Context.System.EventStream.Subscribe(this.Self, typeof(QueryRemoved));
            this.Receive<QueryRemoved>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.Self.Tell(new QueryForUser() { ReplyTo = args.ReplyTo });
            });
        }
    }
}