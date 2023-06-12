import { GraphLayout } from "./GraphLayout"
import { Graph, GraphEdge, GraphNode } from "../Graph"
import { v4 as uuid4 } from "uuid"

export class SugiyamaLayout implements GraphLayout {
    constructor(public nodeSpacing: number, public layerSpacing: number = 100, public enableMinimiseCrossings = true) {
    }
    private reversedEdges: GraphEdge[] = [];
    private removedEdges: GraphEdge[] = [];
    private temporaryNodes: GraphNode[] = [];

    layout(graph: Graph): void {
        this.breakCycles(graph)
        this.assignLayers(graph)
        this.insertTemporaryLayerNodes(graph)
        this.orderNodesWithinLayers(graph)
        this.calculateNodePositions(graph)
        this.centreLayers(graph)
        this.calculateEdgePaths(graph)
        this.restoreCycles()
        // this.removeTemporaryLayerNodes(graph)
    }

    private assignLayers(graph: Graph): void {
        // Assigns layers to nodes based on their dependencies
        for (const node of graph.nodes) {
            node.layer = this.calculateLayer(graph, node)
        }
        this.removeLayerConflicts(graph)
    }

    private insertTemporaryLayerNodes(graph: Graph): void {
        // Inserts temporary nodes into the graph to break cycles
        for (const edge of graph.edges) {
            // iterate over the layers in between the two nodes of the edge and create a new node per layer linking 
            // the two nodes together in a chain
            let lastEdge = edge
            
            for (let i = edge.fromPort.node.layer + 1; i < edge.toPort.node.layer; ++i) {
                const temporaryNode = graph.addNode({
                    id: uuid4(),
                    label: "",
                    inputs: [
                        {
                            name: "in",
                        }
                    ],
                    outputs: [
                        {
                            name: "out"
                        }
                    ],
                })
                temporaryNode.width = graph.totalPortWidth

                temporaryNode.layer = i
                this.temporaryNodes.push(temporaryNode)
                graph.addEdge({
                    from: {
                        nodeId: lastEdge.from.nodeId,
                        portName: lastEdge.from.portName
                    }, 
                    to: {
                        nodeId: temporaryNode.id,
                        portName: "in"
                    },
                    metadata: {
                        isTemporary: true
                    }
                })
                if (!lastEdge.metadata.isTemporary) {
                    this.removedEdges.push(lastEdge)
                }
                graph.removeEdge(lastEdge)
    
                lastEdge = graph.addEdge({
                    from: {
                        nodeId: temporaryNode.id,
                        portName: "out"
                    },
                    to: {
                        nodeId: lastEdge.to.nodeId,
                        portName: lastEdge.to.portName
                    },
                    metadata: {
                        isTemporary: true
                    }
                })
            }                 
        }
    }

    private removeTemporaryLayerNodes(graph: Graph): void {
        // Removes the temporary nodes and edges from the graph
        this.temporaryNodes.forEach(node => graph.removeNode(node))
        this.temporaryNodes.length = 0
        this.removedEdges.forEach(edge => graph.addEdge(edge))
    }

    private removeLayerConflicts(graph: Graph) {
        let hasChanged = true
        for (let i = 0; i < 10 && hasChanged; ++i) {
            hasChanged = false
            for (const edge of graph.edges) {
                if (edge.from.nodeId == edge.to.nodeId)
                    continue
                if (edge.fromPort.node.layer == edge.toPort.node.layer) {
                    edge.toPort.node.layer++
                    hasChanged = true
                }
            }
        }
    }

    private calculateLayer(graph: Graph, node: GraphNode): number {
        // Calculates layer based on the layers of the nodes from which it has incoming edges
        let maxLayer = 0
        for (const edge of node.inputs.map(input => graph.edges.find(edge => edge.to.nodeId === input.node.id && edge.to.portName === input.name))) {
            if (edge) {
                const fromNode = graph.findNode(edge.from.nodeId)
                if (fromNode) {
                    maxLayer = Math.max(maxLayer, fromNode.layer + 1)
                }
            }
        }
        return maxLayer
    }

    private orderNodesWithinLayers(graph: Graph): void {
        // Orders nodes within each layer to minimize edge crossings
        // Using a simple barycenter heuristic here; more complex heuristics may yield better results
        const layerCount = Math.max(...graph.nodes.map(node => node.layer))
        for (let layer = 0; layer <= layerCount; layer++) {
            const layerNodes = graph.nodes.filter(node => node.layer === layer)
            layerNodes.sort((nodeA, nodeB) => this.calculateBarycenter(graph, nodeA) - this.calculateBarycenter(graph, nodeB))
        }
        if (this.enableMinimiseCrossings) {
            this.minimiseCrossings(graph)
        }
    }

    private calculateBarycenter(graph: Graph, node: GraphNode): number {
        // Calculates the barycenter (average position) of the nodes from which the given node has incoming edges
        let sum = 0
        let count = 0
        for (const edge of node.inputs.map(input => graph.edges.find(edge => edge.to.nodeId === input.node.id && edge.to.portName === input.name))) {
            if (edge) {
                // sum += edge.fromPort.x
                // count++
                const fromNode = graph.findNode(edge.from.nodeId)
                if (fromNode) {
                    sum += fromNode.x + fromNode.width / 2
                    count++
                }
            }
        }
        return count > 0 ? sum / count : 0
    }

    private calculateNodePositions(graph: Graph): void {
        // Assigns x and y coordinates to each node
        // Ensures that nodes in each layer are evenly spaced and that each layer is a fixed distance from the next
        for (let layer = 0; layer <= Math.max(...graph.nodes.map(node => node.layer)); layer++) {
            const layerNodes = graph.nodes.filter(node => node.layer === layer)
            for (let i = 0; i < layerNodes.length; i++) {
                const previousNodeX = i > 0 ? layerNodes[i - 1].x : 0
                const previewNodeWidth = i > 0 ? layerNodes[i - 1].width : 0
                layerNodes[i].x = previousNodeX + previewNodeWidth + this.nodeSpacing
                layerNodes[i].y = layer * (layerNodes[i].height + this.layerSpacing)
            }
        }
    }

    private calculateEdgePaths(graph: Graph): void {
        for (const edge of graph.edges) {
            const startPort = edge.fromPort
            const endPort = edge.toPort
            const sx = startPort.x + startPort.width / 2
            const sy = startPort.y + startPort.height / 2
            const ex = endPort.x + endPort.width / 2
            const ey = endPort.y + endPort.height / 2
            // calculate the vertical distance between the start and end points
            const dy = ey - sy

            edge.pathDefinition = `
            M ${sx} ${sy}
            C ${sx} ${sy + dy / 2 }, ${ex} ${ey - dy / 2 }, ${ex} ${ey}
            `
        }
    }

    private centreLayers(graph: Graph): void {
        // Centres each layer horizontally
        for (let layer = 0; layer <= Math.max(...graph.nodes.map(node => node.layer)); layer++) {
            const layerNodes = graph.nodes.filter(node => node.layer === layer)
            const minX = Math.min(...layerNodes.map(node => node.x))
            const maxX = Math.max(...layerNodes.map(node => node.x + node.width))
            const layerWidth = maxX - minX
            const xOffset = (graph.viewBox.width - layerWidth) / 2 - minX
            for (const node of layerNodes) {
                node.x += xOffset
            }
        }
    }

    private breakCycles(graph: Graph): void {
        // Step 1: Use Tarjan's algorithm to find strongly connected components
        const index = 0
        const stack: GraphNode[] = []
        const lowLinks: { [id: string]: number } = {}
        const indices: { [id: string]: number } = {}
        const onStack: { [id: string]: boolean } = {}

        for (const node of graph.nodes) {
            if (indices[node.id] === undefined) {
                this.strongconnect(graph, node, index, stack, indices, lowLinks, onStack)
            }
        }

        // Step 2: Reverse one edge in each cycle
        for (const edge of this.reversedEdges) {
            const fromPort = edge.fromPort
            edge.fromPort = edge.toPort
            edge.toPort = fromPort
        }
    }

    private strongconnect(graph: Graph, node: GraphNode, index: number, stack: GraphNode[], indices: { [id: string]: number }, lowLinks: { [id: string]: number }, onStack: { [id: string]: boolean }): void {
        // Set the depth index for this node to the smallest unused index
        indices[node.id] = index
        lowLinks[node.id] = index
        index++
        stack.push(node)
        onStack[node.id] = true

        // Consider successors of `node`
        for (const edge of graph.edges.filter(edge => edge.fromPort.node === node)) {
            const successor = edge.toPort.node
            if (indices[successor.id] === undefined) {
                // Successor has not yet been visited; recurse on it
                this.strongconnect(graph, successor, index, stack, indices, lowLinks, onStack)
                lowLinks[node.id] = Math.min(lowLinks[node.id], lowLinks[successor.id])
            } else if (onStack[successor.id]) {
                // The successor is in the stack and hence in the current strongly connected component
                lowLinks[node.id] = Math.min(lowLinks[node.id], indices[successor.id])
            }
        }

        // If `node` is a root node, pop the stack and generate a strongly connected component
        if (lowLinks[node.id] === indices[node.id]) {
            let sccNode: GraphNode | undefined
            const sccNodes: GraphNode[] = []

            do {
                sccNode = stack.pop()
                if (sccNode) {
                    onStack[sccNode.id] = false
                    sccNodes.push(sccNode)
                }
            } while (sccNode !== node && sccNode !== undefined)

            // SCCs of more than one node are cycles. Reverse an edge to break them.
            if (sccNodes.length > 1) {
                const edgeToReverse = graph.edges.find(edge => edge.toPort.node === sccNodes[sccNodes.length - 1] && edge.fromPort.node === sccNodes[0])
                if (edgeToReverse) {
                    const fromPort = edgeToReverse.fromPort
                    edgeToReverse.fromPort = edgeToReverse.toPort
                    edgeToReverse.toPort = fromPort
                    this.reversedEdges.push(edgeToReverse)
                }
            }
        }
    }

    private restoreCycles(): void {
        for (const edge of this.reversedEdges) {
            const fromPort = edge.fromPort
            edge.fromPort = edge.toPort
            edge.toPort = fromPort
        }

        this.reversedEdges = []
    }
    minimiseCrossings(graph: Graph) {
        // group all nodes by layers
        const layersAndNodes: GraphNode[][] = []
        for (const node of graph.nodes) {
            if (layersAndNodes[node.layer] === undefined) {
                layersAndNodes[node.layer] = []
            }
            layersAndNodes[node.layer].push(node)
        }
        // iterate over layers
        const MAX_ITERATIONS = 20
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            let totalFlips = 0
            for (let layer = 0; layer <= Math.max(...graph.nodes.map(node => node.layer)); layer++) {
                totalFlips += this.minimiseLayerCrossings(graph, layersAndNodes, layer)
            }
            if (totalFlips === 0) {
                break
            }
        }
        graph.nodes = layersAndNodes.flatMap(layer => layer)
    }

    minimiseLayerCrossings(graph: Graph, layersAndNodes: GraphNode[][], layer: number): number {
        const flipNodes: GraphNode[][] = []
        const uniqueFlips = new Set<string>()

        const edges = graph.edges.filter(edge => edge.fromPort.node.layer === layer || edge.toPort.node.layer === layer)
        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const e1 = edges[i]
                const e2 = edges[j]
                let minE1Node: GraphNode 
                let maxE1Node: GraphNode
                let minE2Node: GraphNode
                let maxE2Node: GraphNode

                if (e1.fromPort.node.layer < e1.toPort.node.layer) {
                    minE1Node = e1.fromPort.node
                    maxE1Node = e1.toPort.node
                } else {
                    minE1Node = e1.toPort.node
                    maxE1Node = e1.fromPort.node
                }
                if (e2.fromPort.node.layer < e2.toPort.node.layer) {
                    minE2Node = e2.fromPort.node
                    maxE2Node = e2.toPort.node
                } else {
                    minE2Node = e2.toPort.node
                    maxE2Node = e2.fromPort.node
                }
                // we only consider edges that are joining across the same two layers
                if (minE1Node.layer != minE2Node.layer || maxE1Node.layer != maxE2Node.layer) {
                    continue
                }
                const minLayerNodes = layersAndNodes[minE1Node.layer]
                const maxLayerNodes = layersAndNodes[maxE1Node.layer]

                const minE1NodeIndex = minLayerNodes.indexOf(minE1Node)
                const maxE1NodeIndex = maxLayerNodes.indexOf(maxE1Node)
                const minE2NodeIndex = minLayerNodes.indexOf(minE2Node)
                const maxE2NodeIndex = maxLayerNodes.indexOf(maxE2Node)

                let flipPair: GraphNode[]
                if ((minE1NodeIndex > maxE1NodeIndex && minE2NodeIndex < maxE2NodeIndex) ||
                    (minE1NodeIndex < maxE1NodeIndex && minE2NodeIndex > maxE2NodeIndex) ) {
                    if (minE1Node.layer === layer) {
                        flipPair = [minE1Node, minE2Node]
                    } else {
                        flipPair = [maxE1Node, maxE2Node]
                    }
                    const key = flipPair.map(it => it.id).sort().join('-')
                    if (!uniqueFlips.has(key)) {
                        uniqueFlips.add(key)
                        flipNodes.push(flipPair)
                    }
                }
            }
        }

        flipNodes.forEach(flipIt => {
            const [left, right] = flipIt
            const leftIndex = layersAndNodes[layer].findIndex(node => node.id === left.id)
            const rightIndex = layersAndNodes[layer].findIndex(node => node.id === right.id)
            const temp = layersAndNodes[layer][leftIndex]
            layersAndNodes[layer][leftIndex] = layersAndNodes[layer][rightIndex]
            layersAndNodes[layer][rightIndex] = temp
        })    
        return flipNodes.length            
    }
}

