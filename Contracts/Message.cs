using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace Contracts
{
    [Serializable]
    public class MessageToDeliver
    {
        public string Data { get; set; }
    }
}
