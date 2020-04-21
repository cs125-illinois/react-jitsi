import React, { useState } from "react"
import PropTypes from "prop-types"

import { JitsiOptions, JitsiRoom } from "@cs125/react-jitsi"
import { Menu } from "semantic-ui-react"

export interface JitsiMultiRoomProps {
  domain: string
  roomNames: string[]
  options: Omit<JitsiOptions, "roomName">
}
export const JitsiMultiRoom: React.FC<JitsiMultiRoomProps> = (props) => {
  const { domain, roomNames } = props
  const [room, setRoom] = useState<string | undefined>(undefined)

  return (
    <div>
      <Menu>
        {roomNames.map((name, key) => (
          <Menu.Item
            key={key}
            name={name}
            active={room === name}
            content={name}
            onClick={(_, { name }): void => setRoom(name)}
          />
        ))}
      </Menu>
      {room && <JitsiRoom domain={domain} options={{ roomName: room, ...props.options }} />}
    </div>
  )
}
JitsiMultiRoom.propTypes = {
  domain: PropTypes.string.isRequired,
  roomNames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  options: PropTypes.any,
}
