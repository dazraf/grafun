import { GraphDefinition } from "./GraphDefinition"
import { GraphDataProvider } from "./GraphDefinitionProvider"
import * as data from './sample-graph.json'

export class FileGraphDataProvider implements GraphDataProvider {
    get data(): GraphDefinition {
        return data;
    }
}