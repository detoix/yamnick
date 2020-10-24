using Akka.Actor;
using Contracts;

namespace Application.Actors
{
    class DiagramActor : ReceiveActor, IWithUnboundedStash
    {
        private int PersistenceId { get; }
        private IActorRef PersistenceManager { get; }
        private Diagram State { get; set; }
        public IStash Stash { get; set; }

        public DiagramActor(
            int persistenceId,
            IActorRef persistenceManager)
        {
            this.PersistenceId = persistenceId;
            this.PersistenceManager = persistenceManager;

            this.Receive<Persisted<Diagram>>(args =>
            {
                System.Console.WriteLine($"Updating runtime state of {nameof(DiagramActor)} of id {this.PersistenceId}");

                this.State = args.Content;

                this.Become(Initialized);

                Stash.UnstashAll();
            });

            this.Receive<NotFound<Diagram>>(args => 
            {
                System.Console.WriteLine($"Initializing empty {nameof(DiagramActor)} of id {this.PersistenceId}");

                this.Become(Initialized);
            });

            this.Receive<object>(args =>
            {
                System.Console.WriteLine($"Uninitialized {nameof(DiagramActor)} of id {this.PersistenceId} received {args}, {nameof(Stash)}ing message");

                Stash.Stash();
            });
        }

        private void Initialized()
        {
            this.Receive<Persisted<Diagram>>(args =>
            {
                this.State = args.Content;

                System.Console.WriteLine($"Runtime state of {nameof(DiagramActor)} of id {this.PersistenceId} changed, publishing event");

                Context.System.EventStream.Publish(args);
            });

            this.Receive<QueryFor<Diagram>>(args =>
            {
                System.Console.WriteLine($"Initialized {nameof(DiagramActor)} of id {this.PersistenceId} received {nameof(QueryFor<Diagram>)}");

                this.Sender.Tell(new Persisted<Diagram>()
                {
                    Content = this.State
                });
            });

            this.Receive<Diagram>(args =>
            {
                System.Console.WriteLine($"Updating persistence state of {nameof(DiagramActor)} of id {this.PersistenceId}");

                this.PersistenceManager.Tell(args);
            });
        }

        protected override void PreStart()
        {
            System.Console.WriteLine($"Recovering {nameof(DiagramActor)} of id {this.PersistenceId}");

            this.PersistenceManager.Tell(new QueryFor<Diagram>()
            {
                Id = this.PersistenceId
            });
        }
    }
}