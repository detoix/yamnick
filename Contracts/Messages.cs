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
    public class NotFound<T> : Message
    {
        
    }

    [Serializable]
    public class QueryFor<T> : Message
    {
        
    }

    [Serializable]
    public class Diagram : Message
    {
        public List<ClassDefinition> ClassDefinitions { get; set; }
        public List<Relation> Relations { get; set; }
    }

    [Serializable]
    public class ClassDefinition : Message
    {
        public string Name { get; set; }
        public Member[] Members { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }

    [Serializable]
    public class Member : Message
    {
        public string Name { get; set; }
    }

    [Serializable]
    public class Relation : Message
    {
        public Node Start { get; set; }
        public Node End { get; set; }
    }

    [Serializable]
    public class Node
    {
        public Point Point { get; set; }
        public EntityHandle EntityHandle { get; set; }
    }

    [Serializable]
    public class Point
    {
        public double X { get; set; }
        public double Y { get; set; }
    }

    [Serializable]
    public class EntityHandle
    {
        public int EntityId { get; set; }
        public int SnapNodeId { get; set; }
    }

    [Serializable]
    public class QueryForUser : Message
    {
        
    }
}
