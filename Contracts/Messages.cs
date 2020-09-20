using System;
using System.Collections.Generic;

namespace Contracts
{
    [Serializable]
    public abstract class Message
    {
        public int Id { get; set; }
        public string ReplyTo { get; set; }
    }

    [Serializable]
    public class QueryRemoved : Message
    {
        
    }

    [Serializable]
    public class TypedMessage : Message
    {
        public QueryFor<Diagram> QueryForDiagram { get; set; }
        public Diagram Diagram { get; set; }
    }

    [Serializable]
    public class Persisted<T> : Message
    {
        public T Content { get; set; }
    }

    [Serializable]
    public class QueryFor<T> : Message
    {
        
    }

    [Serializable]
    public class Diagram : Message
    {
        public List<Point> Positions { get; set; }
        public List<ClassDefinition> ClassDefinitions { get; set; }
    }

    [Serializable]
    public class ClassDefinition : Message
    {
        public string Name { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }

    [Serializable]
    public class Point
    {
        public double X { get; set; }
        public double Y { get; set; }
        public string Src { get; set; }
    }

    [Serializable]
    public class QueryForUser : Message
    {
        
    }
}
