const PREFIX = 'DebugID=';
export function getDebugChannel(debugId: string | undefined, channel?: string) {
  if (channel && channel.startsWith(PREFIX)) {
    return channel;
  }
  return channel ? `${PREFIX}${debugId}:${channel}` : `${PREFIX}${debugId}`;
}
