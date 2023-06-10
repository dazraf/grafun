/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { LitElement, svg, css, html, PropertyValueMap } from "lit"
import { customElement, state } from "lit/decorators.js"
import { GraphEdge, Graph, GraphNode, GraphPort } from "./Graph"
import { SugiyamaLayout } from "./layouts/SugiyamaLayout"
import { GraphDataProvider } from "./data/GraphDefinitionProvider"
import { RandomGraphGenerator } from "./data/RandomGraphGenerator"
import { FileGraphDataProvider } from "./data/FileGraphDataProvider"
import { ExampleDataProvider } from "./data/ExampleData"


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
        fill: rgb(52, 52, 52, 0.5);
    }
    .node-label {
        fill: rgb(192, 224, 77);
        font-family: monospace;
        font-size: 12pt;
    }
    .node-port {
        fill: rgb(73, 137, 121)
    }
    .edge {
        stroke: rgba(73, 137, 121, 0.5);
        fill: none;
        stroke-linecap: butt;
        stroke-linejoin: round;
    }
    @keyframes lineMove {
        0% {
            stroke-dashoffset: 100%;
        }
        
        100% {
            stroke-dashoffset: 0%;
        }
        }
    .edge:hover {
        stroke: rgba(73, 137, 121, 1.0);
        stroke-dasharray: 10, 2;
        animation: lineMove 100s linear infinite;
    }
    `;

    @state()
    dataProvider = new RandomGraphGenerator(20)
    // dataProvider = new FileGraphDataProvider();
    // dataProvider = new ExampleDataProvider()
    private panningState: PanState | undefined
    private graph: Graph = new Graph()

    connectedCallback(): void {
        super.connectedCallback()
        this.layoutGraph()
        console.log(this.dataProvider.data)
        console.log(this.graph)
    }

    protected render() {
        return html`
            <svg 
                version="1.1" xmlns="http://www.w3.org/2000/svg" 
                viewBox="${this.graph.viewBoxString}"
                id="main-canvas">
                ${this.renderGraph()}
            </svg>
        `
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const svg = this.svg
        svg.addEventListener('wheel', e => { this.onWheel(e) })
        svg.addEventListener('mousedown', e => { this.onMouseDown(e) })
        svg.addEventListener('mouseup', e => { this.onMouseUp(e) })
        svg.addEventListener('mousemove', e => { this.onMouseMove(e) })
        svg.addEventListener('click', e => { this.onSvgClick(e) })
    }

    private onWheel(e: WheelEvent) {
        const scalingFactor = (100 + (-e.deltaY / 20)) / 100

        const svg = this.svg
        const point = this.svgPoint(e.clientX, e.clientY)

        const newStartPoint = point.matrixTransform(svg.getScreenCTM()!.inverse())
        this.graph.viewBox.x -= (newStartPoint.x - this.graph.viewBox.x) * (scalingFactor - 1)
        this.graph.viewBox.y -= (newStartPoint.y - this.graph.viewBox.y) * (scalingFactor - 1)
        this.graph.viewBox.width *= scalingFactor
        this.graph.viewBox.height *= scalingFactor
        this.requestUpdate()
    }

    private onMouseDown(e: MouseEvent) {
        e.stopPropagation()
        e.preventDefault()
        this.panningState = {
            cx: e.clientX,
            cy: e.clientY,
            viewBoxOrigin: this.svgPoint(this.graph.viewBox.x, this.graph.viewBox.y)
        }
    }

    private onMouseUp(e: MouseEvent) {
        e.stopPropagation()
        e.preventDefault()
        this.panningState = undefined
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.panningState) return
        e.stopPropagation()
        e.preventDefault()
        const svg = this.svg
        const delta = this.svgPoint(e.clientX - this.panningState.cx, e.clientY - this.panningState.cy)
        const screenv = this.panningState.viewBoxOrigin.matrixTransform(svg.getScreenCTM()!)
        screenv.x -= delta.x
        screenv.y -= delta.y
        const newV = screenv.matrixTransform(svg.getScreenCTM()!.inverse())
        this.graph.viewBox.x = newV.x
        this.graph.viewBox.y = newV.y
        this.requestUpdate()
    }

    private onSvgClick(event: MouseEvent) {
        const target = event.target
        if (!target || !(target instanceof SVGPathElement)) return
        const edge = this.graph.edges.find(edge => edge.id == target.id)
        if (!edge) return
        console.log(edge.pathDefinition)
    }


    private layoutGraph() {
        this.graph = Graph.buildGraph(this.dataProvider.data)
        this.graph.viewBox.x = 0
        this.graph.viewBox.y = 0
        this.graph.viewBox.width = this.host.clientWidth
        this.graph.viewBox.height = this.host.clientHeight
        this.graph.portHeight = 8
        this.graph.portWidth = 8
        this.graph.portGap = 20
        // new CrappyLayout().layout(this.graph)
        new SugiyamaLayout(50).layout(this.graph)
        this.graph.viewBox.x = this.graph.graphBounds.x - 50
        this.graph.viewBox.y = this.graph.graphBounds.y - 50
        this.graph.viewBox.width = this.graph.graphBounds.width + 100
        this.graph.viewBox.height = this.graph.graphBounds.height + 100
    }

    private renderGraph() {
        return svg`
            ${this.graph.edges.map(edge => this.renderEdge(edge))}
            ${this.graph.nodes.map(node => this.renderNode(node))}
        `
    }

    private renderNode(node: GraphNode) {
        return svg`
            <rect class="node" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}"/>
            <text class="node-label" x="${node.x + node.padding}" y="${node.y + node.height / 2}" text-anchor="start" dominant-baseline="middle">${node.label}</text>
            ${this.renderPorts(node)}
        `
    }

    private renderPorts(node: GraphNode) {
        return svg`
            ${node.inputs.map((input) => this.renderPort(input))}
            ${node.outputs.map((output) => this.renderPort(output))}
        `
    }

    private renderPort(port: GraphPort) {
        return svg`
            <rect   id="${port.id}" 
                    class="node-port" 
                    x=${port.x} 
                    y=${port.y} 
                    width=${port.width} 
                    height=${port.height}
                    pointer-events="visiblePainted">
                    <title>${port.label}</title>
            </rect> 
        `
    }

    private renderEdge(edge: GraphEdge) {
        const startPort = edge.fromPort
        return svg`
            <path id=${edge.id} class="edge" d="${edge.pathDefinition}" stroke-width="${startPort.node.graph.edgeWidth}">
                <title>${edge.label}</title>
            </path>
        `
    }

    private get host(): Element {
        const host = this.shadowRoot?.host
        if (!host) {
            throw new Error("host element not found")
        }
        return host
    }

    private get svg(): SVGSVGElement {
        const renderDocument = this.renderRoot as unknown as Document
        const svgElement = renderDocument.getElementById('main-canvas') as unknown as SVGSVGElement
        return svgElement
    }

    private svgPoint(x: number, y: number): SVGPoint {
        const pt = this.svg.createSVGPoint()
        pt.x = x
        pt.y = y
        return pt
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'my-graph': GraphElement
    }
}