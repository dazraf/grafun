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
            id: "a",
            inputs: [],
            outputs: [
                {
                    name: "o1"
                },
                {
                    name: "o2"
                }
            ],
        },   
        {
            id: "b",
            inputs: [
                {
                    name: "i1"
                },
                {
                    name: "i2"
                }
            ],
            outputs: [
                {
                    name: "o1"
                }
            ]
        },   
        {
            id: "c",
            inputs: [
                {
                    name: "i1"
                }
            ],
            outputs: [
                {
                    name: "o1"
                },
                {
                    name: "o2"
                }
            ]
        },   
        {
            id: "d",
            inputs: [
                {
                    name: "i1"
                },
                {
                    name: "i2"
                }
            ],
            outputs: [
            ]
        }
    ],
    edges: [
        {
            from: {
                nodeId: "a",
                portName: "o1"
            },
            to: {
                nodeId: "b",
                portName: "i1" 
            }
        },
        {
            from: {
                nodeId: "a",
                portName: "o2"
            },
            to: {
                nodeId: "c",
                portName: "i1" 
            }
        },
        {
            from: {
                nodeId: "b",
                portName: "o1"
            },
            to: {
                nodeId: "d",
                portName: "i1"
            }
        },
        {
            from: {
                nodeId: "c",
                portName: "o1"
            }, 
            to: {
                nodeId: "b",
                portName: "i2"
            }
        },
        {
            from: {
                nodeId: "c",
                portName: "o2"
            }, 
            to: {
                nodeId: "d",
                portName: "i2"
            }
        }
   ]
}