import { Graph, PortType } from "../Graph"
import { GraphLayout } from "./GraphLayout"

export class CrappyLayout implements GraphLayout {
    layout(graph: Graph): void {
        const orderedNodes = graph.nodes.sort(
            (a, b) =>
                (b.outputs.length - b.inputs.length) - (a.outputs.length - a.inputs.length))

        orderedNodes.forEach((node, index) => {
            node.layer = index
            node.x = 100 + index * 50
            node.y = 100 + index * (graph.nodeHeight + graph.portHeight + 100)
        })

        graph.edges.forEach(edge => {
                if (edge.fromPort.portType != PortType.Output || edge.toPort.portType != PortType.Input) {
                throw new Error(`Invalid edge: ${edge}`)
            }
            if (edge.fromPort.node.layer < edge.toPort.node.layer) {
                const startPort = edge.fromPort
                const endPort = edge.toPort
                const sx = startPort.x + startPort.width / 2
                const sy = startPort.y + startPort.height
                const ex = endPort.x + startPort.width / 2
                const ey = endPort.y
                const my = (sy + ey) / 2
                edge.pathDefinition = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`
            } else {
                const sp = edge.fromPort
                const ep = edge.toPort
                const sx = sp.x + sp.width / 2
                const sy = sp.y + sp.height
                const ex = ep.x + sp.width / 2
                const ey = ep.y
                const leftDelta = Math.max(sp.node.layer, ep.node.layer) * 50

                edge.pathDefinition = `M ${sx} ${sy} L ${sx} ${sy + sp.height} L ${sx - leftDelta} ${sy + sp.height} L ${sx - leftDelta} ${ey - ep.height} L ${ex} ${ey - ep.height} L ${ex} ${ey}`
            }

        });
    }
}