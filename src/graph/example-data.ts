import { Graph } from "./graph"

export const exampleData: Graph = {
    nodes: [
        {
            id: "1",
            text: "node-1",
            inputs: [],
            outputs: [
                {
                    name: "output-1"
                },
                {
                    name: "output-2"
                }
            ],
        },
        {
            id: "2",
            text: "node-2",
            inputs: [
                {
                    name: "input-1"
                },
                {
                    name: "input-2"
                }
            ],
            outputs: [
                {
                    name: "output"
                }
            ],
        },
        {
            id: "3",
            text: "this is a longer label to test the width calc",
            inputs: [
                {
                    name: "input-1"
                },
                {
                    name: "input-2"
                }
            ],
            outputs: [
                {
                    name: "output"
                }
            ],
        },
                    {
            id: "4",
            text: "many inputs",
            inputs: [
                {
                    name: "input-1"
                },
                {
                    name: "input-2"
                },
                {
                    name: "input-3"
                },
                {
                    name: "input-4"
                },
                {
                    name: "input-5"
                },
                {
                    name: "input-6"
                },
                {
                    name: "input-7"
                },
                {
                    name: "input-8"
                },
                {
                    name: "input-9"
                },
            ],
            outputs: [
                {
                    name: "output"
                }
            ],
        }

    ],
    edges: [
        {
            text: "edge-1",
            from: {
                nodeId: "1",
                portName: "output-1"
            },
            to: {
                nodeId: "2",
                portName: "input-1"
            }
        }
    ]
}