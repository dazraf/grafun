

export interface Graph {
    nodes: GraphNode[]
    edges: GraphEdge[]
}

export interface GraphNode {
    id: string
    text: string
    inputs: GraphPort[]
    outputs: GraphPort[]
}

export interface GraphPort {
    name: string
    label?: string 
}

export interface GraphPortRef {
    nodeId: string
    portName: string
}

export interface GraphEdge {
    from: GraphPortRef
    to: GraphPortRef
    label: string
}

export function buildGraph(graph: Graph): GraphImpl {
    return new GraphImpl(graph)
}

export class GraphImpl implements Graph {
    nodes: GraphNodeImpl[] = [];
    edges: GraphEdgeImpl[] = [];
    portHeight = 15;
    portWidth = 15;
    nodePadding = 10;
    nodeHeight = 40;
    portGap = 5;
    totalPortWidth = this.portWidth + this.portGap;
    viewBox = DOMRect.fromRect({x: 0, y: 0, width: 0, height: 0})
    private _graphBounds?: DOMRect = undefined

    constructor(graph: Graph | undefined = undefined) {
        if (graph) {
            this.nodes = graph.nodes.map(node => new GraphNodeImpl(node, this))
            this.edges = graph.edges.map(edge => new GraphEdgeImpl(edge, this))
        }
    }

    findNode(id: string): GraphNodeImpl | undefined {
        return this.nodes.find(node => node.id === id)
    }

    get graphBounds(): DOMRect {
        return this._graphBounds ?? (this._graphBounds = this.calculateGraphBounds())
    }
    get viewBoxString(): string {
        return `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`
    }

    private calculateGraphBounds(): DOMRect {
        const minX = Math.min(...this.nodes.map(node => node.x))
        const minY = Math.min(...this.nodes.map(node => node.y))
        const maxX = Math.max(...this.nodes.map(node => node.x + node.width))
        const maxY = Math.max(...this.nodes.map(node => node.y + node.height))
        return DOMRect.fromRect({x: minX, y: minY, width: maxX - minX, height: maxY - minY})
    }
}

export class GraphNodeImpl implements GraphNode {
    id: string
    text: string
    inputs: GraphPortImpl[]
    outputs: GraphPortImpl[]
    x = 0
    y = 0
    #width: number | undefined
    graph: GraphImpl


    constructor(node: GraphNode, graph: GraphImpl) {
        this.id = node.id
        this.text = node.text
        this.inputs = node.inputs.map((input, index) => new GraphPortImpl(input, PortType.Input, index, this))
        this.outputs = node.outputs.map((output, index) => new GraphPortImpl(output, PortType.Output, index, this))
        this.graph = graph
    }

    get padding(): number {
        return this.graph.nodePadding
    }

    get height() {
        return this.graph.nodeHeight
    }

    get width(): number {
        return this.#width ?? (this.#width = this.calculateWidth())
    }

    getPort(portName: string): GraphPortImpl | undefined {
        return this.inputs.find(it => it.name == portName) ??
            this.outputs.find(it => it.name == portName)
    }

    private calculateWidth(): number {
        const textWidth = (this.text.length * 10) + 2 * this.graph.nodePadding
        const inputsWidth = (this.inputs.length * this.graph.portWidth) + (this.inputs.length - 1) * this.graph.portGap
        const outputsWidth = (this.outputs.length * this.graph.portWidth) + (this.inputs.length - 1) * this.graph.portGap
        return Math.max(textWidth, inputsWidth, outputsWidth)
    }

}

export enum PortType {
    Input, Output
}

export class GraphPortImpl implements GraphPort {
    name: string
    label: string
    portType: PortType
    index: number
    node: GraphNodeImpl

    constructor(port: GraphPort, portType: PortType, index: number, node: GraphNodeImpl) {
        this.name = port.name
        this.label = port.label ?? this.name
        this.portType = portType
        this.index = index
        this.node = node
    }

    get id(): string {
        return `${this.node.id}.${this.name}`
    }
    get x(): number {
        return this.node.x + this.index * this.node.graph.totalPortWidth
    }

    get y(): number {
        if (this.portType === PortType.Input) {
            return this.node.y - this.node.graph.portHeight
        } else {
            return this.node.y + this.node.graph.nodeHeight
        }
    }

    get height(): number {
        return this.node.graph.portHeight
    }

    get width(): number {
        return this.node.graph.portWidth
    }
}

export class GraphEdgeImpl implements GraphEdge {
    from: GraphPortRef
    to: GraphPortRef
    label: string
    graph: GraphImpl
    private _fromPort? : GraphPortImpl
    private _toPort? : GraphPortImpl
    pathDefinition = ""

    constructor(edge: GraphEdge, graph: GraphImpl) {
        this.from = edge.from
        this.to = edge.to
        this.label = edge.label
        this.graph = graph
    }

    get fromPort(): GraphPortImpl {
        return this._fromPort ?? (this._fromPort = this.findPort(this.from));
    }

    get toPort(): GraphPortImpl {
        return this._toPort ?? (this._toPort = this.findPort(this.to));
    }

    private findPort(portRef: GraphPortRef): GraphPortImpl {
        const port = this.graph.findNode(portRef.nodeId)?.getPort(portRef.portName)    
        if (port === undefined) {
            throw new Error(`Unable to find 'from' port ${portRef.nodeId}.${portRef.portName}`)
        }
        return port
    }
}