import {
  ExtensionData,
  ExtensionFactory,
  ExtensionPreferenceGroup,
  MoosyncExtensionTemplate
} from '@moosync/moosync-types'
import { MyExtension } from './extension'

export default class MyExtensionData implements ExtensionData {
  extensionDescriptors: ExtensionFactory[] = [new MyExtensionFactory()]
}

class MyExtensionFactory implements ExtensionFactory {
  async registerPreferences(): Promise<ExtensionPreferenceGroup[]> {
    return [
      {
        type: 'EditText',
        key: 'imgbb_api_key',
        title: 'img.bb API key',
        description: 'API key for img.bb. Get here https://api.imgbb.com',
        inputType: 'text',
        default: ''
      },
      {
        type: 'ButtonGroup',
        key: 'buttons',
        title: 'Clear cache',
        description: 'Clear cached urls for uploaded images',
        items: [
          {
            key: 'clear_cache',
            title: 'Clear upload cache',
            lastClicked: 0
          }
        ]
      }
    ]
  }
  async create(): Promise<MoosyncExtensionTemplate> {
    return new MyExtension()
  }
}
