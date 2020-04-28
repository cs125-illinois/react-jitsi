import React, { useEffect, useState, useContext, CSSProperties } from "react"
import PropTypes from "prop-types"
import { EventEmitter } from "events"

export interface JitsiOptions {
  roomName: string
  width?: number | string | null
  height?: number | string | null
  configOverwrite?: object | null
  interfaceConfigOverwrite?: object | null
  noSSL?: boolean | null
  jwt?: string | null
  onLoad?: () => void
  invitees?: unknown[]
  devices?: {
    audioInput?: string
    audioOutput?: string
    videoInput?: string
  }
  userInfo?: {
    email?: string
    displayName?: string
  }
}
export declare class JitsiMeetExternalAPI extends EventEmitter {
  constructor(domain: string, options?: JitsiOptions & { parentNode: Element })
  dispose: () => void
  executeCommand: (command: string, ...args: string[]) => void
  getNumberOfParticipants: () => number
  avatarURL: () => string
  displayName: () => string
  email: () => string
  iframe: () => HTMLIFrameElement
  isAudioMuted: () => Promise<boolean>
  isVideoMuted: () => Promise<boolean>
  isAudioAvailable: () => Promise<boolean>
  isVideoAvailable: () => Promise<boolean>
  invite: (invitees: unknown[]) => Promise<void>
}

export interface JitsiWrapperContext {
  loaded: boolean
  url: string
}
const JitsiWrapperContext = React.createContext<JitsiWrapperContext>({
  loaded: false,
  url: "",
})
export interface JitsiWrapperProps {
  url: string
  children: React.ReactNode
}
export const JitsiWrapper: React.FC<JitsiWrapperProps> = ({ url, children }) => {
  const [loaded, setLoaded] = useState<boolean>(false)

  useEffect(() => {
    const script = Object.assign(document.createElement("script"), {
      src: `${url}/external_api.js`,
      async: true,
      defer: true,
    })
    script.onload = (): void => {
      setLoaded(true)
    }
    document.head.appendChild(script)
    return (): void => {
      document.head.removeChild(script)
    }
  }, [])

  return <JitsiWrapperContext.Provider value={{ loaded, url }}>{children}</JitsiWrapperContext.Provider>
}
JitsiWrapper.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export const withJitsiContext = (): JitsiWrapperContext => {
  return useContext(JitsiWrapperContext)
}
interface WithJitsiContextProps {
  children: (jitsiContext: JitsiWrapperContext) => JSX.Element | null
}
export const WithJitsiContext: React.FC<WithJitsiContextProps> = ({ children }) => {
  return children(withJitsiContext())
}
WithJitsiContext.propTypes = {
  children: PropTypes.func.isRequired,
}

export interface JitsiRoomProps {
  domain: string
  options: JitsiOptions
  id?: string
  style?: CSSProperties
  apiChanged?: (api: JitsiMeetExternalAPI) => void
}
export const jitsiOptionDefaults = {
  width: "100%",
  height: "100%",
  noSSL: true,
}
export const JitsiRoom: React.FC<JitsiRoomProps> = (props) => {
  const { loaded } = useContext(JitsiWrapperContext)

  const { domain } = props
  const options = Object.assign({}, jitsiOptionDefaults, props.options)

  const id = props.id || "jitsi"
  let api: JitsiMeetExternalAPI | undefined

  useEffect(() => {
    if (!loaded) {
      return
    }
    api = new JitsiMeetExternalAPI(domain, {
      parentNode: document.querySelector(`#${id}`) as Element,
      ...options,
    })
    props.apiChanged && props.apiChanged(api)
    return (): void => {
      api?.dispose()
    }
  }, [loaded, JSON.stringify({ domain, options })])

  return <div id={id || "jitsi"} style={props.style || {}} />
}

JitsiRoom.propTypes = {
  domain: PropTypes.string.isRequired,
  options: PropTypes.shape({
    roomName: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    configOverwrite: PropTypes.object,
    interfaceConfigOverwrite: PropTypes.object,
    noSSL: PropTypes.bool,
    jwt: PropTypes.string,
  }).isRequired,
  id: PropTypes.string,
  style: PropTypes.object,
  apiChanged: PropTypes.func,
}
