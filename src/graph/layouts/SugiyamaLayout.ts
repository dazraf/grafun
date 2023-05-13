import { GraphLayout } from "./GraphLayout"
import { Graph, GraphNode } from "../Graph"

export class SugiyamaLayout implements GraphLayout {
    layout(graph: Graph): void {
        this.assignLayers(graph)
        this.orderNodesWithinLayers(graph)
        this.calculateNodePositions(graph)
        this.calculateEdgePaths(graph)
    }

    private assignLayers(graph: Graph): void {
        // Assigns layers to nodes based on their dependencies
        for (const node of graph.nodes) {
            node.layer = this.calculateLayer(graph, node)
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
        for (let layer = 0; layer <= Math.max(...graph.nodes.map(node => node.layer)); layer++) {
            const layerNodes = graph.nodes.filter(node => node.layer === layer)
            layerNodes.sort((nodeA, nodeB) => this.calculateBarycenter(graph, nodeA) - this.calculateBarycenter(graph, nodeB))
        }
    }

    private calculateBarycenter(graph: Graph, node: GraphNode): number {
        // Calculates the barycenter (average position) of the nodes from which the given node has incoming edges
        let sum = 0
        let count = 0
        for (const edge of node.inputs.map(input => graph.edges.find(edge => edge.to.nodeId === input.node.id && edge.to.portName === input.name))) {
            if (edge) {
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
        const layerSpacing = 100
        const nodeSpacing = 20
        for (let layer = 0; layer <= Math.max(...graph.nodes.map(node => node.layer)); layer++) {
            const layerNodes = graph.nodes.filter(node => node.layer === layer)
            for (let i = 0; i < layerNodes.length; i++) {
                const previousNodeX = i > 0 ? layerNodes[i - 1].x : 0
                const previewNodeWidth = i > 0 ? layerNodes[i - 1].width : 0
                layerNodes[i].x = previousNodeX + previewNodeWidth + nodeSpacing
                layerNodes[i].y = layer * (layerNodes[i].height + layerSpacing)
            }
        }
    }

    private calculateEdgePaths(graph: Graph): void {
        // Calculates a path for each edge
        // Simply draws a straight line from the center of the output port to the center of the input port
        for (const edge of graph.edges) {
            if (edge.fromPort.node.layer < edge.toPort.node.layer) {
                const startPort = edge.fromPort
                const endPort = edge.toPort
                const sx = startPort.x + startPort.width / 2
                const sy = startPort.y + startPort.height
                const ex = endPort.x + startPort.width / 2
                const ey = endPort.y
                const my = graph.portHeight * 4
                edge.pathDefinition = `M ${sx} ${sy} L ${sx} ${sy + my} L ${ex} ${ey - my} L ${ex} ${ey}`
            } else {
                const startPort = edge.fromPort
                const endPort = edge.toPort
                const sx = startPort.x + startPort.width / 2
                const sy = startPort.y + startPort.height
                const ex = endPort.x + startPort.width / 2
                const ey = endPort.y
                const my = graph.portHeight * 4

                edge.pathDefinition = `M ${sx} ${sy} L ${sx} ${sy + my} L ${ex} ${ey - my} L ${ex} ${ey}`
            }
        }
    }
}
