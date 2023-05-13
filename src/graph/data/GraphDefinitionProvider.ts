import { GraphDefinition } from "./GraphDefinition"

export interface GraphDataProvider {
    get data(): GraphDefinition
}