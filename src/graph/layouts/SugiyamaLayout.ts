import { GraphLayout } from "./GraphLayout"
import { Graph, GraphEdge, GraphNode } from "../Graph"

export class SugiyamaLayout implements GraphLayout {
    constructor(public nodeSpacing: number, public layerSpacing: number = 100) {
    }
    private reversedEdges: GraphEdge[] = [];

    layout(graph: Graph): void {
        this.breakCycles(graph)
        this.assignLayers(graph)
        this.orderNodesWithinLayers(graph)
        this.calculateNodePositions(graph)
        this.centreLayers(graph)
        this.calculateEdgePaths(graph)
        this.restoreCycles()
    }

    private assignLayers(graph: Graph): void {
        // Assigns layers to nodes based on their dependencies
        for (const node of graph.nodes) {
            node.layer = this.calculateLayer(graph, node)
        }

        this.removeLayerConflicts(graph)
    }

    private removeLayerConflicts(graph: Graph) {
        let hasChanged = true
        for (let i = 0; i < 10 && hasChanged; ++i) {
            console.log(`checking for layer conflicts ${i}}`)
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
        // Calculates a path for each edge
        // Draws a cubic Bezier curve from the center of the output port to the center of the input port
    
        for (const edge of graph.edges) {
            const startPort = edge.fromPort;
            const endPort = edge.toPort;
            const sx = startPort.x + startPort.width / 2;
            const sy = startPort.y + startPort.height;
            const ex = endPort.x + endPort.width / 2;
            const ey = endPort.y;
    
            // calculate the vertical distance between the start and end points
            const dy = ey - sy;
    
            // Adjust vertical offset if it's a back edge or a self-loop
            const verticalOffset = startPort.node.layer >= endPort.node.layer ? 3 * graph.nodeHeight : 0;
    
            if (startPort.node.layer >= endPort.node.layer) {
                // loop back
                const node = startPort.node;
                const my = node.y + node.height / 2;

                const loopHeight = graph.nodeHeight / 4;
                const loopWidth = startPort.node.width / 6;
                edge.pathDefinition = 
                `M ${sx} ${sy} \
                 C ${sx} ${sy + loopHeight}, ${sx - loopWidth} ${sy + loopHeight}, ${sx - loopWidth} ${my} \
                 C ${sx - loopWidth} ${sy - 2 * loopHeight}, ${ex} ${ey - loopHeight}, ${ex} ${ey}`;
            } else {
                // Regular edge or back edge
                // Adjust control points to ensure vertical alignment as they join to the port
                edge.pathDefinition = ` \
                 M ${sx} ${sy} \
                 C ${sx} ${sy + dy / 2 + verticalOffset}, ${ex} ${ey - dy / 2 - verticalOffset}, ${ex} ${ey}`;
            }
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
        const index = 0;
        const stack: GraphNode[] = [];
        const lowLinks: { [id: string]: number } = {};
        const indices: { [id: string]: number } = {};
        const onStack: { [id: string]: boolean } = {};

        for (const node of graph.nodes) {
            if (indices[node.id] === undefined) {
                this.strongconnect(graph, node, index, stack, indices, lowLinks, onStack);
            }
        }

        // Step 2: Reverse one edge in each cycle
        for (const edge of this.reversedEdges) {
            const fromPort = edge.fromPort;
            edge.fromPort = edge.toPort;
            edge.toPort = fromPort;
        }
    }

    private strongconnect(graph: Graph, node: GraphNode, index: number, stack: GraphNode[], indices: { [id: string]: number }, lowLinks: { [id: string]: number }, onStack: { [id: string]: boolean }): void {
        // Set the depth index for this node to the smallest unused index
        indices[node.id] = index;
        lowLinks[node.id] = index;
        index++;
        stack.push(node);
        onStack[node.id] = true;

        // Consider successors of `node`
        for (const edge of graph.edges.filter(edge => edge.fromPort.node === node)) {
            const successor = edge.toPort.node;
            if (indices[successor.id] === undefined) {
                // Successor has not yet been visited; recurse on it
                this.strongconnect(graph, successor, index, stack, indices, lowLinks, onStack);
                lowLinks[node.id] = Math.min(lowLinks[node.id], lowLinks[successor.id]);
            } else if (onStack[successor.id]) {
                // The successor is in the stack and hence in the current strongly connected component
                lowLinks[node.id] = Math.min(lowLinks[node.id], indices[successor.id]);
            }
        }

        // If `node` is a root node, pop the stack and generate a strongly connected component
        if (lowLinks[node.id] === indices[node.id]) {
            let sccNode: GraphNode | undefined;
            const sccNodes: GraphNode[] = [];

            do {
                sccNode = stack.pop();
                if (sccNode) {
                    onStack[sccNode.id] = false;
                    sccNodes.push(sccNode);
                }
            } while (sccNode !== node && sccNode !== undefined);

            // SCCs of more than one node are cycles. Reverse an edge to break them.
            if (sccNodes.length > 1) {
                const edgeToReverse = graph.edges.find(edge => edge.toPort.node === sccNodes[sccNodes.length - 1] && edge.fromPort.node === sccNodes[0]);
                if (edgeToReverse) {
                    const fromPort = edgeToReverse.fromPort;
                    edgeToReverse.fromPort = edgeToReverse.toPort;
                    edgeToReverse.toPort = fromPort;
                    this.reversedEdges.push(edgeToReverse);
                }
            }
        }
    }

    private restoreCycles(): void {
        for (const edge of this.reversedEdges) {
            const fromPort = edge.fromPort;
            edge.fromPort = edge.toPort;
            edge.toPort = fromPort;
        }

        this.reversedEdges = [];
    }
}
