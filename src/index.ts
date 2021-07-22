import { ExtensionData, ExtensionFactory, MoosyncExtensionTemplate } from "@moosync/moosync-types"
import { MyExtension } from "./extension"
import { logger } from '@moosync/moosync-types/index'

export default class MyExtensionData implements ExtensionData {
    extensionDescriptors: ExtensionFactory[] = [
        new MyExtensionFactory()
    ]
}

class MyExtensionFactory implements ExtensionFactory {
    async create(logger: logger): Promise<MoosyncExtensionTemplate> {
        return new MyExtension(logger)
    }
}
