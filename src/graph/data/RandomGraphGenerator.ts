import { arrayRange } from "../../utilities/arrays/Arrays"
import { generateRandomName } from "../../utilities/names/NameGenerator"
import { GraphDefinition, GraphEdgeDefinition, GraphNodeDefinition, GraphPortDefinition, GraphPortRef } from "./GraphDefinition"
import { GraphDataProvider } from "./GraphDefinitionProvider"

export class RandomGraphGenerator implements GraphDataProvider {
    #nodeCount: number
    #data: GraphDefinition

    constructor(public nodeCount: number) {
        // generate nodeCount nodes
        this.#nodeCount = nodeCount
        this.generate()
    }

    generate() {
        const nodes = arrayRange(this.#nodeCount).map(i => {
            const inputs: GraphPortDefinition[] = arrayRange(2).map(i => {
                return {
                    name: `input-${i}`,
                    label: generateRandomName()
                }
            })
            const outputs: GraphPortDefinition[] = arrayRange(1).map(i => {
                return {
                    name: `output-${i}`,
                    label: generateRandomName()
                }
            })
            return {
                id: i.toString(),
                label: generateRandomName(),
                inputs: inputs,
                outputs: outputs
            } as GraphNodeDefinition
        })
        const inputs = nodes.flatMap(node => node.inputs.map(port => {
            const portRef: GraphPortRef = { nodeId: node.id, portName: port.name }
            return portRef
        }))

        const outputs = nodes.flatMap(node => node.outputs.map(port => {
            const portRef: GraphPortRef = { nodeId: node.id, portName: port.name }
            return portRef
        }))
        const edges: GraphEdgeDefinition[] = []

        while (inputs.length > 0 && outputs.length > 0) {
            const outputIndex = Math.floor(Math.random() * outputs.length)
            const inputIndex = Math.floor(Math.random() * inputs.length)
            const outputPortRef = outputs[outputIndex]
            const inputPortRef = inputs[inputIndex]
            outputs.splice(outputIndex, 1)
            inputs.splice(inputIndex, 1)
            edges.push({
                label: generateRandomName(),
                from: outputPortRef,
                to: inputPortRef
            })
        }

        this.#data = {
            nodes: nodes,
            edges: edges
        }
    }

    get data(): GraphDefinition {
        return this.#data
    }
}