import { Graph } from "../Graph"

export interface GraphLayout {
    layout(graph: Graph): void 
}