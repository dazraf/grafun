import { LitElement, svg, css, html, PropertyValueMap } from "lit";
import { customElement } from "lit/decorators.js";
import { exampleData } from "./example-data";

const xPadding = 10;
const nodeHeight = 40;
const portWidth = 15;
const portHeight = 10;
const portGap = 5;
const totalPortWidth = portWidth + portGap;

interface PanState {
    viewBoxOrigin: DOMPoint,
    cx: number, 
    cy: number
}

@customElement('my-graph')
class GraphElement extends LitElement {

    static styles = css`  
    ::root {
        background: white;
    }  
    #main-canvas {
        background-color: rgb(66, 66, 66);
        height: 100%;
        width: 100%;
        viewBox: 0 0 100% 100%;
    }
    .node {
        fill: rgb(52, 52, 52);
    }
    .node-label {
        fill: rgb(192, 224, 77);
        font-family: monospace;
        font-size: 12pt;
    }
    .node-port {
        fill: rgb(73, 137, 121)
    }
    `;

    private data: Graph = exampleData
    private panningState: PanState | undefined

    protected render() {
        return html`
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                id="main-canvas">
                ${this.data.nodes.map(node => this.renderNode(node))}
                <path d="M100,100 C100,100 100,8 8,5" fill=none stroke="white" stroke-linecap = "round" stroke-linejoin ="round" stroke-width="${portWidth}"/>
            </svg>
        `
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const host = this.shadowRoot?.host!

        const _this = this;

        const svg = this.getSvgElement()
        const viewBox = svg.viewBox.baseVal;
        viewBox.x = 0;
        viewBox.y = 0;
        viewBox.width = host.clientWidth;
        viewBox.height = host.clientHeight;

        svg.setAttribute('height', `${viewBox.height}`);
        svg.setAttribute('width', `${viewBox.width}`);
        svg.addEventListener('wheel', e => { _this.onWheel(e) })
        svg.addEventListener('mousedown', e => { _this.onMouseDown(e) })
        svg.addEventListener('mouseup', e => { _this.onMouseUp(e) })
        svg.addEventListener('mousemove', e => { _this.onMouseMove(e) })
    }

    private getSvgElement() {
        return (this.renderRoot as unknown as Document).getElementById('main-canvas')! as unknown as SVGSVGElement;
    }

    private onWheel(e: WheelEvent) {
        const scalingFactor = (100 + (-e.deltaY / 20)) / 100;
        
        const svg = this.getSvgElement()
        const point = this.svgPoint(e.clientX, e.clientY)
        
        const newStartPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());
        const viewBox = svg.viewBox.baseVal;
        viewBox.x -= (newStartPoint.x - viewBox.x) * (scalingFactor - 1);
        viewBox.y -= (newStartPoint.y - viewBox.y) * (scalingFactor -1);
        viewBox.width *= scalingFactor;
        viewBox.height *= scalingFactor;
    }    

    private onMouseDown(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        const baseVal = this.getSvgElement().viewBox.baseVal;
        this.panningState = {
         cx: e.clientX,
         cy: e.clientY,
         viewBoxOrigin: this.svgPoint(baseVal.x, baseVal.y)   
        }
    }

    private onMouseUp(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        this.panningState = undefined
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.panningState) return;
        e.stopPropagation();
        e.preventDefault();
        const svg = this.getSvgElement();
        const delta = this.svgPoint(e.clientX - this.panningState.cx, e.clientY - this.panningState.cy )
        const screenv = this.panningState.viewBoxOrigin.matrixTransform(svg.getScreenCTM()!);
        screenv.x -= delta.x
        screenv.y -= delta.y
        const newV = screenv.matrixTransform(svg.getScreenCTM()!.inverse())
        svg.viewBox.baseVal.x = newV.x
        svg.viewBox.baseVal.y = newV.y
    }

    private svgPoint(x: number, y: number): SVGPoint {
        const pt = this.getSvgElement().createSVGPoint();
        pt.x = x;
        pt.y = y;
        return pt;
    }
    private renderNode(node: GraphNode) {
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
                    height="${portHeight}">
                    <title>${input.name}</title>
            </rect> 
            `;
        })
    }

    renderOutputPorts(node: GraphNode, nodeWidth: number) {
        return node.outputs.map((output, index) => {
            return svg`
            <rect   id="${node.id}-${output.name}"
                    class="node-port" 
                    x=${index * totalPortWidth - nodeWidth / 2} 
                    y=${nodeHeight / 2} 
                    width="${portWidth}" 
                    height="${portHeight}">
                    <title>${output.name}</title>
            </rect>
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