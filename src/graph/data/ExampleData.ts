import { generateRandomName } from "../../utilities/names/NameGenerator"
import { GraphDefinition } from "./GraphDefinition"
import { GraphDataProvider } from "./GraphDefinitionProvider"

export class ExampleDataProvider implements GraphDataProvider {
    get data(): GraphDefinition {
        return exampleData;
    }

}
const exampleData: GraphDefinition = {
    nodes: [
        {
            id: "1",
            label: generateRandomName(),
            inputs: [],
            outputs: [
                {
                    name: "output-1",
                    label: "lhs"
                }
            ],
        },
        {
            id: "2",
            label: generateRandomName(),
            inputs: [],
            outputs: [
                {
                    name: "output-1",
                    label: "rhs"
                }
            ],
        },       
        {
            id: "3",
            label: generateRandomName(),
            inputs: [
                {
                    name: "input-1",
                    label: "lhs"
                },
                {
                    name: "input-2",
                    label: "rhs"
                }
            ],
            outputs: [
                {
                    name: "output-1",
                    label: "output"
                },
            ],
        },       
        {
            id: "4",
            label: generateRandomName(),
            inputs: [
                {
                    name: "input-1",
                    label: "lhs"
                },
                {
                    name: "input-2",
                    label: "rhs"
                },
            ],
            outputs: [
                {
                    name: "output-1",
                    label: "rhs"
                }
            ],
        },       
        {
            id: "5",
            label: generateRandomName(),
            inputs: [
                {
                    name: "input-1",
                    label: "lhs"
                },
                {
                    name: "input-2",
                    label: "rhs"
                },
            ],
            outputs: [
                {
                    name: "output-1",
                    label: "output"
                }
            ],
        },       

    ],
    edges: [
        {
            from: {
                nodeId: "1",
                portName: "output-1"
            },
            to: {
                nodeId: "3",
                portName: "input-1" 
            },
            label: "data"
        },
        {
            from: {
                nodeId: "2",
                portName: "output-1"
            },
            to: {
                nodeId: "3",
                portName: "input-2" 
            },
            label: generateRandomName()
        },
        {
            from: {
                nodeId: "1",
                portName: "output-1"
            },
            to: {
                nodeId: "4",
                portName: "input-1" 
            },
            label: generateRandomName()
        },
        {
            from: {
                nodeId: "3",
                portName: "output-1"
            },
            to: {
                nodeId: "5",
                portName: "input-1" 
            },
            label: generateRandomName()
        },
        {
            from: {
                nodeId: "4",
                portName: "output-1"
            },
            to: {
                nodeId: "5",
                portName: "input-2" 
            },
            label: generateRandomName()
        },
        {
            from: {
                nodeId: "5",
                portName: "output-1"
            },
            to: {
                nodeId: "4",
                portName: "input-2"
            },
            label: generateRandomName()
        }
    ]
}