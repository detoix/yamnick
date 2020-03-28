using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace Contracts
{
    [Serializable]
    public class TypedMessage
    {
        public string Data { get; set; }
    }

    [Serializable]
    public class CrawlCommand
    {
        public string Visit { get; set; }
        public string Selector { get; set; }
        public string Tag { get; set; }
        public CrawlCommand[] Spiders { get; set; }
    }
}
