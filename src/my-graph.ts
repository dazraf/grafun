import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import * as joint from 'jointjs';

@customElement('my-graph')
class GraphElement extends LitElement {

    static styles = css`

    #graph {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
    }
    `;

    connectedCallback(): void {
       super.connectedCallback();
    }

    firstUpdated() {
        console.log("first updated")
        this.diagram();
    }

    render() {
        return html`
            <div id="graph"></div>
        `;
    }

    private diagram() {
        const namespace = joint.shapes;
    
        const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
        const graphElement = (this.renderRoot as unknown as Document).getElementById('graph')
        if (graphElement == null) {
            throw new Error("the container element 'graph' was not found")
        }
        const paper = new joint.dia.Paper({
            el: graphElement,
            model: graph,
            width: graphElement.offsetWidth,
            height: graphElement.offsetHeight,
            gridSize: 1,
            cellViewNamespace: namespace
        });
    
        const rect = new joint.shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: 'Hello',
                fill: 'white'
            }
        });
        rect.addTo(graph);
    
        var rect2 = rect.clone();
        rect2.translate(300, 0);
        rect2.attr('label/text', 'World!');
        rect2.addTo(graph);
    
        var link = new joint.shapes.standard.Link();
        link.source(rect);
        link.target(rect2);
        link.addTo(graph);
    }
    
}

declare global {
    interface HTMLElementTagNameMap {
      'my-graph': GraphElement
    }
  }