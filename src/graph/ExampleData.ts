import { GraphDefinition } from "./Graph"

export const exampleData: GraphDefinition = {
    nodes: [
        {
            id: "1",
            label: "1",
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
            label: "2",
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
            label: "3",
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
            label: "4",
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
            label: "5",
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
            label: "foo"
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
            label: "bar"
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
            label: "bar"
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
            label: "bar"
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
            label: "bar"
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
            label: "feedback"
        }
    ]
}