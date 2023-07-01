import { GraphDefinition, GraphNodeDefinition, GraphPortDefinition, GraphEdgeDefinition, GraphPortRef } from "./data/GraphDefinition"

export class Graph implements GraphDefinition {
    nodes: GraphNode[] = [];
    edges: GraphEdge[] = [];
    portHeight = 15;
    portWidth = 15;
    nodePadding = 10;
    nodeHeight = 40;
    portGap = 5;
    edgeWidth = 4;
    get totalPortWidth() { return this.portWidth + this.portGap; }
    
    viewBox = DOMRect.fromRect({x: 0, y: 0, width: 0, height: 0})
    private _graphBounds?: DOMRect = undefined

    static buildGraph(graph: GraphDefinition): Graph {
        return new Graph(graph)
    }

    constructor(graph: GraphDefinition | undefined = undefined) {
        if (graph) {
            this.nodes = graph.nodes.map(node => new GraphNode(node, this))
            this.edges = graph.edges.map(edge => new GraphEdge(edge, this))
        }
    }

    findNode(id: string): GraphNode | undefined {
        return this.nodes.find(node => node.id === id)
    }

    get graphBounds(): DOMRect {
        return this._graphBounds ?? (this._graphBounds = this.calculateGraphBounds())
    }
    get viewBoxString(): string {
        return `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`
    }

    addNode(nodeDefinition: GraphNodeDefinition): GraphNode {
        const node = new GraphNode(nodeDefinition, this)
        this.nodes.push(node)
        return node
    }

    removeNode(node: GraphNode) {
        this.nodes = this.nodes.filter(n => n !== node)
        this.edges = this.edges.filter(edge => edge.fromPort.node !== node && edge.toPort.node !== node)  
    }

    addEdge(edgeDefinition: GraphEdgeDefinition): GraphEdge {
        const edge = new GraphEdge(edgeDefinition, this)
        this.edges.push(edge)
        return edge
    }

    removeEdge(edge: GraphEdge) {
        this.edges = this.edges.filter(e => e !== edge)
    }

    private calculateGraphBounds(): DOMRect {
        const minX = Math.min(...this.nodes.map(node => node.x))
        const minY = Math.min(...this.nodes.map(node => node.y))
        const maxX = Math.max(...this.nodes.map(node => node.x + node.width))
        const maxY = Math.max(...this.nodes.map(node => node.y + node.height))
        return DOMRect.fromRect({x: minX, y: minY, width: maxX - minX, height: maxY - minY})
    }
}

export class GraphNode implements GraphNodeDefinition {
    id: string
    label: string
    inputs: GraphPort[]
    outputs: GraphPort[]
    x = 0
    y = 0
    metadata: { [key: string]: string | boolean | number } = {}
    graph: Graph
    layer = 0
    #width: number | undefined
    visible = true
    height: number

    constructor(node: GraphNodeDefinition, graph: Graph) {
        this.id = node.id
        this.label = node.label ?? node.id
        this.inputs = node.inputs.map((input, index) => new GraphPort(input, PortType.Input, index, this))
        this.outputs = node.outputs.map((output, index) => new GraphPort(output, PortType.Output, index, this))
        this.graph = graph
        this.metadata = node.metadata ?? {}
        this.height = this.graph.nodeHeight
    }

    get padding(): number {
        return this.graph.nodePadding
    }

    get width(): number {
        return this.#width ?? (this.#width = this.calculateWidth())
    }

    set width(width: number) {
        this.#width = width
    }

    getPort(portName: string): GraphPort | undefined {
        return this.inputs.find(it => it.name == portName) ??
            this.outputs.find(it => it.name == portName)
    }

    private calculateWidth(): number {
        const labelWidth = (this.label.length * 10)
        const inputsWidth = (this.inputs.length * this.graph.portWidth) + (this.inputs.length - 1) * this.graph.portGap
        const outputsWidth = (this.outputs.length * this.graph.portWidth) + (this.outputs.length - 1) * this.graph.portGap
        return Math.max(labelWidth, inputsWidth, outputsWidth) + 2 * this.graph.nodePadding
    }
}

export enum PortType {
    Input, Output
}

export class GraphPort implements GraphPortDefinition {
    name: string
    label: string
    portType: PortType
    index: number
    node: GraphNode

    constructor(port: GraphPortDefinition, portType: PortType, index: number, node: GraphNode) {
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
        let ports: GraphPort[]
        if (this.portType === PortType.Input) {
            ports = this.node.inputs
        } else {
            ports = this.node.outputs
        }
        const portsWidth = (ports.length * this.width) + (ports.length - 1) * this.node.graph.portGap
        const middle = this.node.x
        const start = middle - portsWidth / 2
        return start + this.index * this.node.graph.portWidth + this.index * this.node.graph.portGap
    }

    get y(): number {
        if (this.portType === PortType.Input) {
            return this.node.y - this.node.height / 2 - this.node.graph.portHeight / 2
        } else {
            return this.node.y + this.node.height / 2 - this.node.graph.portHeight / 2
        }
    }

    get height(): number {
        return this.node.graph.portHeight
    }

    get width(): number {
        return this.node.graph.portWidth
    }
}

export class GraphEdge implements GraphEdgeDefinition {
    from: GraphPortRef
    to: GraphPortRef
    label: string
    graph: Graph
    pathDefinition = ""
    #id?: string | undefined
    #fromPort? : GraphPort
    #toPort? : GraphPort
    metadata: { [key: string]: string | boolean | number } = {}

    constructor(edge: GraphEdgeDefinition, graph: Graph) {
        this.from = edge.from
        this.to = edge.to
        this.label = edge.label ?? ""
        this.graph = graph
        this.#id = edge.id
        this.metadata = edge.metadata ?? {}
    }

    get fromPort(): GraphPort {
        return this.#fromPort ?? (this.#fromPort = this.findPort(this.from));
    }

    set fromPort(port: GraphPort) {
        this.#fromPort = port
        this.from = {nodeId: port.node.id, portName: port.name}
    }

    get toPort(): GraphPort {
        return this.#toPort ?? (this.#toPort = this.findPort(this.to));
    }

    set toPort(port: GraphPort) {
        this.#toPort = port
        this.to = {nodeId: port.node.id, portName: port.name}
    }
    
    get id(): string {
        return this.#id ?? (this.#id = `${this.from.nodeId}.${this.from.portName}->${this.to.nodeId}.${this.to.portName}`)
    }
    
    private findPort(portRef: GraphPortRef): GraphPort {
        const port = this.graph.findNode(portRef.nodeId)?.getPort(portRef.portName)    
        if (port === undefined) {
            throw new Error(`Unable to find 'from' port ${portRef.nodeId}.${portRef.portName}`)
        }
        return port
    }
}