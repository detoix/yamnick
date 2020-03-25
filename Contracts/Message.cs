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
}
