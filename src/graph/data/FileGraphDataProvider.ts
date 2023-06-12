import { GraphDefinition } from "./GraphDefinition"
import { GraphDataProvider } from "./GraphDefinitionProvider"
import * as data from './sample-graph.json'

export class SampleFileGraphDataProvider implements GraphDataProvider {
    get data(): GraphDefinition {
        return data;
    }
}