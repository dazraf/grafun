export interface GraphDefinition {
    nodes: GraphNodeDefinition[]
    edges: GraphEdgeDefinition[]
}

export interface HasMetadata {
    metadata?: { [key: string]: string | boolean | number }
}

export interface GraphNodeDefinition extends HasMetadata {
    id: string
    label?: string
    inputs: GraphPortDefinition[]
    outputs: GraphPortDefinition[]
}

export interface GraphPortDefinition {
    name: string
    label?: string
}

export interface GraphPortRef {
    nodeId: string
    portName: string
}

export interface GraphEdgeDefinition extends HasMetadata {
    from: GraphPortRef
    to: GraphPortRef
    label?: string
    id?: string,
}
