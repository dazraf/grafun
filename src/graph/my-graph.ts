import { LitElement, svg, css, html } from "lit";
import { customElement } from "lit/decorators.js";

const xPadding = 10;
const nodeHeight = 40;
const portWidth = 10;
const portHeight = 5;
const portGap = 5;
const totalPortWidth = portWidth + portGap;


@customElement('my-graph')
class GraphElement extends LitElement {

    static styles = css`  
    ::root {
        background: white;
    }  
    .main-canvas {
        background-color: rgb(66, 66, 66);
    }
    .node {
        fill: rgb(52, 52, 52);
    }
    .node-label {
        fill: white;
        font-family: monospace;
        font-size: 12pt;
    }
    .node-port {
        fill: rgb(73, 137, 121)
    }
    `;

    data: Graph = {
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
                        name: "output-1"
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
                cx: 100,
                cy: 200
            },
            {
                id: "3",
                text: "this is a really long label",
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
                cx: 200,
                cy: 300
            },
                        {
                id: "4",
                text: "short",
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
                    }
                ],
                outputs: [
                    {
                        name: "output"
                    }
                ],
                cx: 200,
                cy: 400
            }

        ],
        edges: [

        ]
    }
    protected render() {
        return html`
            <svg version="1.1"
                class="main-canvas",
                width="100%" height="100%"
                xmlns="http://www.w3.org/2000/svg">
                ${this.data.nodes.map(node => this.renderNode(node))}
            </svg>
        `
    }

    renderNode(node: GraphNode) {
        const nodeWidth = this.getNodeWidth(node);
        return svg`
                <g transform="translate(${node.cx} ${node.cy})">
                <rect class="node" x="${-nodeWidth / 2}" y="${-nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}"/>
                <text class="node-label" x="0" y="0" text-anchor="middle" dominant-baseline="middle">${node.text}</text>
                ${this.renderPorts(node, nodeWidth)}
                </g>
        `;
    }

    renderPorts(node: GraphNode, nodeWidth: number) {
        return svg`
            ${this.renderInputPorts(node, nodeWidth)}
            ${this.renderOutputPorts(node, nodeWidth)}
        `;
    }

    renderInputPorts(node: GraphNode, nodeWidth: number) {
        return node.inputs.map((input, index) => {
            return svg`
            <rect   id="${node.id}-${input.name}" 
                    class="node-port" 
                    x=${index * totalPortWidth - nodeWidth / 2} 
                    y=${-nodeHeight / 2 - portHeight} 
                    width="${portWidth}" 
                    height="${portHeight}"/> 
            `;
        })
    }

    renderOutputPorts(node: GraphNode, nodeWidth: number) {
        return node.outputs.map((input, index) => {
            return svg`
            <rect   id="${node.id}-${input.name}"
                    class="node-port" 
                    x=${index * totalPortWidth - nodeWidth / 2} 
                    y=${nodeHeight / 2} 
                    width="${portWidth}" 
                    height="${portHeight}"/> 
            `;
        })
    }

    getNodeWidth(node: GraphNode): number {
        const textWidth = (node.text.length * 10) + 2 * xPadding;
        const inputsWidth = (node.inputs.length * portWidth) + (node.inputs.length - 1) * portGap;
        const outputsWidth = (node.outputs.length * portWidth) + (node.inputs.length - 1) * portGap;
        return Math.max(textWidth, inputsWidth, outputsWidth);
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'my-graph': GraphElement
    }
}