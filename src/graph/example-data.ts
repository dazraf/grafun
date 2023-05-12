import { Graph } from "./graph"

export const exampleData: Graph = {
    nodes: [
        {
            id: "1",
            text: "random pairs",
            inputs: [],
            outputs: [
                {
                    name: "output-1",
                    label: "lhs"
                },
                {
                    name: "output-2",
                    label: "rhs"
                }
            ],
        },
        {
            id: "2",
            text: "amplifier",
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
                    name: "output-1",
                    label: "value"
                }
            ],
        },
        {
            id: "3",
            text: "noise",
            inputs: [
                {
                    name: "input-1",
                    label: "source 1"
                },
                {
                    name: "input-2",
                    label: "source 2"
                }
            ],
            outputs: [
                {
                    name: "output-1",
                    label: "value"
                }
            ],
        },
                    {
            id: "4",
            text: "sequencer",
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
            label: "random data",
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
            label: "amplified",
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
            label: "noisified",
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
            label: "sequenced for feedback",
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