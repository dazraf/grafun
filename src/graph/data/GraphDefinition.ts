export interface GraphDefinition {
    nodes: GraphNodeDefinition[]
    edges: GraphEdgeDefinition[]
}

export interface GraphNodeDefinition {
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

export interface GraphEdgeDefinition {
    from: GraphPortRef
    to: GraphPortRef
    label?: string
    id?: string
}
