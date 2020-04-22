import React, { useState } from "react"
import PropTypes from "prop-types"

import { JitsiOptions, JitsiRoom, withJitsiContext } from "@cs125/react-jitsi"
import { Menu } from "semantic-ui-react"
import url from "url"

export interface JitsiMultiRoomProps {
  domain: string
  roomNames: string[]
  options: Omit<JitsiOptions, "roomName">
}
export const JitsiMultiRoom: React.FC<JitsiMultiRoomProps> = (props) => {
  const { domain, roomNames } = props
  const { url: jitsiUrl } = withJitsiContext()
  const [room, setRoom] = useState<string | undefined>(undefined)

  const wsUrl = url.parse(jitsiUrl)
  if (wsUrl.protocol === "http:") {
    wsUrl.protocol = "ws:"
  } else if (wsUrl.protocol === "https:") {
    wsUrl.protocol = "wss:"
  } else {
    throw `invalid Jitsi URL protocol: ${wsUrl.protocol}`
  }
  wsUrl.path = "xmpp-websocket"
  const bosh = url.format(wsUrl)
  console.log(bosh)

  return (
    <div>
      <Menu>
        {roomNames.map((name, key) => (
          <Menu.Item
            key={key}
            name={name}
            active={room === name}
            content={name}
            onClick={(_, { name }): void => (name === room ? setRoom(undefined) : setRoom(name))}
          />
        ))}
      </Menu>
      {room && (
        <JitsiRoom
          domain={domain}
          options={{
            ...props.options,
            roomName: room,
            noSSL: false,
            configOverwrite: {
              bosh,
              openBridgeChannel: "websocket",
            },
          }}
        />
      )}
    </div>
  )
}
JitsiMultiRoom.propTypes = {
  domain: PropTypes.string.isRequired,
  roomNames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  options: PropTypes.any,
}
