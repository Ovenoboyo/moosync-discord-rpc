type FetchMethods = 'POST'

interface RPCMessage {
    cmd: RPCCommands
    evt: RPCEvents
    data: any
    nonce: string
}

interface RPCClientOptions {
    transport: 'ipc';
}

interface RPCLoginOptions {
    clientId: string;
    clientSecret?: string | undefined;
    accessToken?: string | undefined;
    rpcToken?: string | undefined;
    tokenEndpoint?: string | undefined;
    scopes?: string[] | undefined;
}

interface IPCActivity {
    state?: string
    details?: string
    timestamps?: {
        start: number
        end: number
    },
    assets?: {
        large_image: string,
        large_text: string,
        small_image: string,
        small_text: string,
    },
    party?: {
        id: string,
        size: number[]
    },
    secrets?: {
        match: string,
        join: string,
        spectate: string,
    },
    buttons?: any,
    instance?: boolean,
}

interface RichPresence {
    details?: string,
    state?: string,
    startTimestamp?: Date | number,
    endTimestamp?: Date | number,
    largeImageKey?: string,
    largeImageText?: string,
    smallImageKey?: string,
    smallImageText?: string,
    instance?: boolean,
    partyId?: string,
    partySize?: number
    partyMax?: number
    matchSecret?: string
    joinSecret?: string
    spectateSecret?: string
    buttons?: any
}

type RPCCommands =
    'DISPATCH' |
    'AUTHORIZE' |
    'AUTHENTICATE' |
    'GET_GUILD' |
    'GET_GUILDS' |
    'GET_CHANNEL' |
    'GET_CHANNELS' |
    'CREATE_CHANNEL_INVITE' |
    'GET_RELATIONSHIPS' |
    'GET_USER' |
    'SUBSCRIBE' |
    'UNSUBSCRIBE' |
    'SET_USER_VOICE_SETTINGS' |
    'SET_USER_VOICE_SETTINGS_2' |
    'SELECT_VOICE_CHANNEL' |
    'GET_SELECTED_VOICE_CHANNEL' |
    'SELECT_TEXT_CHANNEL' |
    'GET_VOICE_SETTINGS' |
    'SET_VOICE_SETTINGS_2' |
    'SET_VOICE_SETTINGS' |
    'CAPTURE_SHORTCUT' |
    'SET_ACTIVITY' |
    'SEND_ACTIVITY_JOIN_INVITE' |
    'CLOSE_ACTIVITY_JOIN_REQUEST' |
    'ACTIVITY_INVITE_USER' |
    'ACCEPT_ACTIVITY_INVITE' |
    'INVITE_BROWSER' |
    'DEEP_LINK' |
    'CONNECTIONS_CALLBACK' |
    'BRAINTREE_POPUP_BRIDGE_CALLBACK' |
    'GIFT_CODE_BROWSER' |
    'GUILD_TEMPLATE_BROWSER' |
    'OVERLAY' |
    'BROWSER_HANDOFF' |
    'SET_CERTIFIED_DEVICES' |
    'GET_IMAGE' |
    'CREATE_LOBBY' |
    'UPDATE_LOBBY' |
    'DELETE_LOBBY' |
    'UPDATE_LOBBY_MEMBER' |
    'CONNECT_TO_LOBBY' |
    'DISCONNECT_FROM_LOBBY' |
    'SEND_TO_LOBBY' |
    'SEARCH_LOBBIES' |
    'CONNECT_TO_LOBBY_VOICE' |
    'DISCONNECT_FROM_LOBBY_VOICE' |
    'SET_OVERLAY_LOCKED' |
    'OPEN_OVERLAY_ACTIVITY_INVITE' |
    'OPEN_OVERLAY_GUILD_INVITE' |
    'OPEN_OVERLAY_VOICE_SETTINGS' |
    'VALIDATE_APPLICATION' |
    'GET_ENTITLEMENT_TICKET' |
    'GET_APPLICATION_TICKET' |
    'START_PURCHASE' |
    'GET_SKUS' |
    'GET_ENTITLEMENTS' |
    'GET_NETWORKING_CONFIG' |
    'NETWORKING_SYSTEM_METRICS' |
    'NETWORKING_PEER_METRICS' |
    'NETWORKING_CREATE_TOKEN' |
    'SET_USER_ACHIEVEMENT' |
    'GET_USER_ACHIEVEMENTS'

type RPCEvents =
    'CURRENT_USER_UPDATE' |
    'GUILD_STATUS' |
    'GUILD_CREATE' |
    'CHANNEL_CREATE' |
    'RELATIONSHIP_UPDATE' |
    'VOICE_CHANNEL_SELECT' |
    'VOICE_STATE_CREATE' |
    'VOICE_STATE_DELETE' |
    'VOICE_STATE_UPDATE' |
    'VOICE_SETTINGS_UPDATE' |
    'VOICE_SETTINGS_UPDATE_2' |
    'VOICE_CONNECTION_STATUS' |
    'SPEAKING_START' |
    'SPEAKING_STOP' |
    'GAME_JOIN' |
    'GAME_SPECTATE' |
    'ACTIVITY_JOIN' |
    'ACTIVITY_JOIN_REQUEST' |
    'ACTIVITY_SPECTATE' |
    'ACTIVITY_INVITE' |
    'NOTIFICATION_CREATE' |
    'MESSAGE_CREATE' |
    'MESSAGE_UPDATE' |
    'MESSAGE_DELETE' |
    'LOBBY_DELETE' |
    'LOBBY_UPDATE' |
    'LOBBY_MEMBER_CONNECT' |
    'LOBBY_MEMBER_DISCONNECT' |
    'LOBBY_MEMBER_UPDATE' |
    'LOBBY_MESSAGE' |
    'CAPTURE_SHORTCUT_CHANGE' |
    'OVERLAY' |
    'OVERLAY_UPDATE' |
    'ENTITLEMENT_CREATE' |
    'ENTITLEMENT_DELETE' |
    'USER_ACHIEVEMENT_UPDATE' |
    'READY' |
    'ERROR'