
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
            cx: 100,
            cy: 100
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
            cx: 150,
            cy: 200
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
            cx: 400,
            cy: 300
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
            cx: 300,
            cy: 400
        }

    ],
    edges: [

    ]
}