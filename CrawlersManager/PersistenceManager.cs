using System.Collections.Generic;
using System.Linq;
using Akka.Actor;
using Contracts;
using CrawlersManager.Events;
using Marten;

namespace CrawlersManager
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

                            args.Id = existingUser.QueriesWithResults.Max(e => e.Id) + 1;
                            args.CrawlResults = new List<CrawlResults>();
                            existingUser.QueriesWithResults.Add(args);

                            session.Store(existingUser);
                            session.SaveChanges();

                            this.Sender.Tell(new CrawlCommandPersisted(args));
                        }
                        else
                        {
                            System.Console.WriteLine($"Invalid query of {args.Id} by user of {args.ReplyTo}, query already exists");
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

                            existingQuery.CrawlResults.Add(args);

                            session.Store(existingUser);
                            session.SaveChanges();

                            this.Sender.Tell(existingUser);
                        }
                    }
                }
            });
        }
        
        public static string ValidConnectionStringFrom(string connectionString)
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
}