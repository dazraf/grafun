import { Graph } from "./graph"

export const exampleData: Graph = {
    nodes: [
        {
            id: "1",
            text: "node-1",
            inputs: [],
            outputs: [
                {
                    name: "output-1",
                    label: "output 1"
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
                    name: "output-1"
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
                    name: "output-1"
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
                    name: "output-1"
                }
            ],
        }

    ],
    edges: [
        {
            label: "edge-1",
            from: {
                nodeId: "1",
                portName: "output-2"
            },
            to: {
                nodeId: "2",
                portName: "input-2"
            }
        },
        {
            label: "edge-2",
            from: {
                nodeId: "2",
                portName: "output-1"
            },
            to: {
                nodeId: "3",
                portName: "input-1"
            }
        },
        {
            label: "edge-3",
            from: {
                nodeId: "3",
                portName: "output-1"
            },
            to: {
                nodeId: "4",
                portName: "input-1"
            }
        },
        {
            label: "edge-4",
            from: {
                nodeId: "4",
                portName: "output-1"
            },
            to: {
                nodeId: "2",
                portName: "input-1"
            }
        }


    ]
}