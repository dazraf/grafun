/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { LitElement, svg, css, html, PropertyValueMap } from "lit"
import { customElement } from "lit/decorators.js"
import { exampleData } from "./example-data"
import { Graph, GraphEdgeImpl, GraphImpl, GraphNodeImpl, GraphPortImpl, buildGraph } from "./graph"


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
    .edge {
        stroke: rgb(61, 116, 102)

    }
    `;

    private data: Graph = exampleData
    private panningState: PanState | undefined
    private graph: GraphImpl = new GraphImpl()

    connectedCallback(): void {
        super.connectedCallback()
        this.layoutGraph()
    }

    protected render() {
        return html`
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                id="main-canvas">
                ${this.graph.nodes.map(node => this.renderNode(node))}
                ${this.graph.edges.map(edge => this.renderEdge(edge))}
            </svg>
        `
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const host = this.shadowRoot?.host
        if (!host) {
            throw new Error("host element not found")
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this

        const svg = this.getSvgElement()
        const viewBox = svg.viewBox.baseVal
        viewBox.x = 0
        viewBox.y = 0
        viewBox.width = host.clientWidth
        viewBox.height = host.clientHeight

        svg.setAttribute('height', `${viewBox.height}`)
        svg.setAttribute('width', `${viewBox.width}`)
        svg.addEventListener('wheel', e => { _this.onWheel(e) })
        svg.addEventListener('mousedown', e => { _this.onMouseDown(e) })
        svg.addEventListener('mouseup', e => { _this.onMouseUp(e) })
        svg.addEventListener('mousemove', e => { _this.onMouseMove(e) })
        svg.addEventListener('click', e => { _this.onInputClick(e) })

    }

    private layoutGraph() {
        this.graph = buildGraph(this.data)
        const orderedNodes = this.graph.nodes.sort(
            (a, b) =>
                (b.outputs.length - b.inputs.length) - (a.outputs.length - a.inputs.length))
        orderedNodes.forEach((node, index) => {
            node.x = 100 + index * 50
            node.y = 100 + index * (this.graph.nodeHeight + this.graph.portHeight + 100)
        })
    }

    private getSvgElement(): SVGSVGElement {
        const renderDocument = this.renderRoot as unknown as Document
        const svgElement = renderDocument.getElementById('main-canvas') as unknown as SVGSVGElement
        return svgElement
    }

    private onWheel(e: WheelEvent) {
        const scalingFactor = (100 + (-e.deltaY / 20)) / 100

        const svg = this.getSvgElement()
        const point = this.svgPoint(e.clientX, e.clientY)

        const newStartPoint = point.matrixTransform(svg.getScreenCTM()!.inverse())
        const viewBox = svg.viewBox.baseVal
        viewBox.x -= (newStartPoint.x - viewBox.x) * (scalingFactor - 1)
        viewBox.y -= (newStartPoint.y - viewBox.y) * (scalingFactor - 1)
        viewBox.width *= scalingFactor
        viewBox.height *= scalingFactor
    }

    private onMouseDown(e: MouseEvent) {
        e.stopPropagation()
        e.preventDefault()
        const baseVal = this.getSvgElement().viewBox.baseVal
        this.panningState = {
            cx: e.clientX,
            cy: e.clientY,
            viewBoxOrigin: this.svgPoint(baseVal.x, baseVal.y)
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
        const svg = this.getSvgElement()
        const delta = this.svgPoint(e.clientX - this.panningState.cx, e.clientY - this.panningState.cy)
        const screenv = this.panningState.viewBoxOrigin.matrixTransform(svg.getScreenCTM()!)
        screenv.x -= delta.x
        screenv.y -= delta.y
        const newV = screenv.matrixTransform(svg.getScreenCTM()!.inverse())
        svg.viewBox.baseVal.x = newV.x
        svg.viewBox.baseVal.y = newV.y
    }

    private svgPoint(x: number, y: number): SVGPoint {
        const pt = this.getSvgElement().createSVGPoint()
        pt.x = x
        pt.y = y
        return pt
    }

    private renderNode(node: GraphNodeImpl) {
        return svg`
            <rect class="node" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}"/>
            <text class="node-label" x="${node.x + node.padding}" y="${node.y + node.height / 2}" text-anchor="start" dominant-baseline="middle">${node.text}</text>
            ${this.renderPorts(node)}
        `
    }

    private renderPorts(node: GraphNodeImpl) {
        return svg`
            ${node.inputs.map((input) => this.renderPort(input))}
            ${node.outputs.map((output) => this.renderPort(output))}
        `
    }

    private renderPort(port: GraphPortImpl) {
        return svg`
            <rect   id="${port.id}" 
                    class="node-port" 
                    x=${port.x} 
                    y=${port.y} 
                    width=${port.width} 
                    height=${port.height}
                    pointer-events="visiblePainted"
                    <title>${port.name}</title>
            </rect> 
        `
    }

    private renderEdge(edge: GraphEdgeImpl) {
        const startPort = edge.fromPort
        const endPort = edge.toPort

        const sx = startPort.x + startPort.width / 2
        const sy = startPort.y + startPort.height
        const d1x = sx
        const d1y = sy + 3 * startPort.height
        const ex = endPort.x + startPort.width / 2
        const ey = endPort.y
        const d2x = ex
        const d2y = ey - 3 * endPort.height

        return svg`
            <path class="edge" d="M ${sx} ${sy} C ${d1x} ${d1y} ${d2x} ${d2y} ${ex} ${ey}" stroke-width="${startPort.width}" stroke-linecap="butt"/>
        `
    }

    private onInputClick(event: MouseEvent) {
        if (!event.target) return
        const color = Math.round(Math.random() * 0xffffff)
        const fill = `#${color.toString(16).padStart(6, "0")}`
        const svgGeometryElement = event.target as SVGGeometryElement
        console.log(svgGeometryElement)
        svgGeometryElement.style.fill = fill
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'my-graph': GraphElement
    }
}