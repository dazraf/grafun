
interface Graph {
    nodes: GraphNode[]
    edges: GraphEdge[]
}

interface GraphNode {
    id: string
    text: string
    cx: number,
    cy: number,
    inputs: GraphPort[]
    outputs: GraphPort[]
}

interface GraphPort {
    name: string
    type?: string
}

interface GraphPortRef {
    nodeId: string
    portName: string
}

interface GraphEdge {
    from: GraphPortRef
    to: GraphPortRef
    text: string
}