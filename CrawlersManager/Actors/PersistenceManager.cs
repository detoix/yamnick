using System.Collections.Generic;
using System.Linq;
using Akka.Actor;
using Contracts;
using CrawlersManager.Events;
using Marten;

namespace CrawlersManager.Actors
{
    class PersistenceManager : ReceiveActor
    {
        private IDocumentStore Store { get; }

        public PersistenceManager(
            IDocumentStore store)
        {
            this.Store = store;

            this.Receive<QueryForUser>(args =>
            {
                System.Console.WriteLine($"{nameof(PersistenceManager)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingUser = session
                        .Query<User>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();

                    if (existingUser is null)
                    {
                        System.Console.WriteLine($"User of {args.ReplyTo} not found");
                    }
                    else
                    {
                        System.Console.WriteLine($"User of {args.ReplyTo} found, forwarding...");

                        this.Sender.Tell(existingUser);
                    }
                }
            });

            this.Receive<QueryFor<Diagram>>(args =>
            {
                System.Console.WriteLine($"{nameof(PersistenceManager)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingDiagram = session
                        .Query<Diagram>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();

                    if (existingDiagram is null)
                    {
                        System.Console.WriteLine($"Diagram of {args.ReplyTo} not found");
                    }
                    else
                    {
                        System.Console.WriteLine($"Diagram of {args.ReplyTo} found, forwarding...");

                        this.Sender.Tell(new Persisted<Diagram>()
                        {
                            Content = existingDiagram
                        });
                    }
                }
            });

            this.Receive<CrawlCommand>(args => 
            {
                System.Console.WriteLine($"{nameof(PersistenceManager)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingUser = session
                        .Query<User>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();
                    
                    if (existingUser is null)
                    {
                        System.Console.WriteLine($"Creating new user of {args.ReplyTo}");

                        args.Id = 1;
                        args.CrawlResults = new List<CrawlResults>();
                        var user = new User()
                        {
                            ReplyTo = args.ReplyTo,
                            QueriesWithResults = new[] { args }.ToList()
                        };
                        session.Store(user);
                        session.SaveChanges();

                        this.Sender.Tell(new CrawlCommandPersisted(args));
                    }
                    else
                    {
                        var existingQuery = existingUser
                            .QueriesWithResults
                            .SingleOrDefault(e => e.Id == args.Id);

                        if (existingQuery is null)
                        {
                            System.Console.WriteLine($"Creating query of {args.Id} by user of {args.ReplyTo}");

                            args.Id = existingUser.QueriesWithResults
                                .Select(e => e.Id)
                                .DefaultIfEmpty()
                                .Max() + 1;
                            args.CrawlResults = new List<CrawlResults>();
                            existingUser.QueriesWithResults.Add(args);

                            session.Store(existingUser);
                            session.SaveChanges();

                            this.Sender.Tell(new CrawlCommandPersisted(args));
                        }
                        else
                        {
                            System.Console.WriteLine($"Query of {args.Id} by user of {args.ReplyTo} already exists");

                            this.Sender.Tell(new CrawlCommandPersisted(existingQuery));
                        }
                    }
                }
            });

            this.Receive<CrawlResults>(args => 
            {
                System.Console.WriteLine($"{nameof(PersistenceManager)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingUser = session
                        .Query<User>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();
                    
                    if (existingUser is null)
                    {
                        System.Console.WriteLine($"User of {args.ReplyTo} not found");
                    }
                    else
                    {
                        System.Console.WriteLine($"Updating user of {args.ReplyTo}");

                        var existingQuery = existingUser
                            .QueriesWithResults
                            .SingleOrDefault(e => e.Id == args.Id);

                        if (existingQuery is null)
                        {
                            System.Console.WriteLine($"Query of {args.Id} by user of {args.ReplyTo} not found");
                        }
                        else
                        {
                            System.Console.WriteLine($"Updating query of {args.Id} by user of {args.ReplyTo}");

                            args.Id = existingQuery.CrawlResults
                                .Select(e => e.Id)
                                .DefaultIfEmpty()
                                .Max() + 1;
                            existingQuery.CrawlResults.Add(args);

                            session.Store(existingUser);
                            session.SaveChanges();

                            this.Sender.Tell(existingUser);
                        }
                    }
                }
            });
        
            this.Receive<RemoveQuery>(args =>
            {
                System.Console.WriteLine($"{nameof(PersistenceManager)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingUser = session
                        .Query<User>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();

                    if (existingUser is null)
                    {
                        System.Console.WriteLine($"User of {args.ReplyTo} not found");
                    }
                    else
                    {
                        System.Console.WriteLine($"Updating user of {args.ReplyTo}");

                        if (args.CrawlResults is null 
                            || args.CrawlResults.Results is null 
                            || !args.CrawlResults.Results.Any())
                        {
                            var numberOfRemoved = existingUser
                                .QueriesWithResults
                                .RemoveAll(e => e.Id == args.Id);

                            if (numberOfRemoved > 0)
                            {
                                System.Console.WriteLine($"Removed query of {args.Id} by user of {args.ReplyTo}");

                                session.Store(existingUser);
                                session.SaveChanges();

                                Context.System.EventStream.Publish(new QueryRemoved() { Id = args.Id, ReplyTo = args.ReplyTo });
                            }
                            else
                            {
                                System.Console.WriteLine($"Query of {args.Id} by user of {args.ReplyTo} not found");
                            }
                        }
                        else
                        {
                            var queryToUpdate = existingUser
                                .QueriesWithResults
                                .FirstOrDefault(e => e.Id == args.Id);

                            if (queryToUpdate is null)
                            {
                                System.Console.WriteLine($"Query of {args.Id} by user of {args.ReplyTo} not found");
                            }
                            else
                            {
                                var idsOfCrawlsToRemove = args.CrawlResults.Results
                                    .Select(e => e.Id).ToHashSet();
                                var numberOfRemoved = queryToUpdate
                                    .CrawlResults
                                    .RemoveAll(e => idsOfCrawlsToRemove.Contains(e.Id));

                                if (numberOfRemoved > 0)
                                {
                                    System.Console.WriteLine($"Removed some crawls from query of {args.Id} by user of {args.ReplyTo}");

                                    session.Store(existingUser);
                                    session.SaveChanges();

                                    Context.System.EventStream.Publish(new QueryRemoved() { Id = args.Id, ReplyTo = args.ReplyTo });
                                }
                                else
                                {
                                    System.Console.WriteLine($"Crawls of {string.Join(',', idsOfCrawlsToRemove)} within query of {args.Id} by user of {args.ReplyTo} not found");
                                }
                            }
                        }
                    }
                }
            });
        
            this.Receive<Diagram>(args =>
            {
                System.Console.WriteLine($"{nameof(PersistenceManager)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingDiagram = session
                        .Query<Diagram>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();
                    
                    if (existingDiagram is null)
                    {
                        System.Console.WriteLine($"Creating new user of {args.ReplyTo}");

                        var diagram = args;
                        session.Store(args);
                        session.SaveChanges();

                        this.Sender.Tell(new Persisted<Diagram>()
                        {
                            Content = diagram
                        });
                    }
                    else
                    {
                        existingDiagram.Positions = args.Positions;

                        session.Store(existingDiagram);
                        session.SaveChanges();

                        this.Sender.Tell(new Persisted<Diagram>()
                        {
                            Content = existingDiagram
                        });
                    }
                }
            });
        }

        protected override void PreStart()
        {
            using (var session = this.Store.OpenSession())
            {
                session.Store<User>();
                session.Store<Diagram>();
                session.SaveChanges();
            }
        }
    }
}