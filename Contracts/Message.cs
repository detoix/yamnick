using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace Contracts
{
    [Serializable]
    public abstract class Message
    {
        public string ReplyTo { get; set; }
    }

    [Serializable]
    public class TypedMessage : Message
    {
        public CrawlCommand CrawlCommand { get; set; }
    }

    [Serializable]
    public class CrawlCommand : Message
    {
        public string Visit { get; set; }
        public string Selector { get; set; }
        public string Tag { get; set; }
        public CrawlCommand[] Spiders { get; set; }
    }
}
