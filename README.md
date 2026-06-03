# mcp-outlook-calendar

Outlook Calendar MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 711+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_events` | List upcoming events from the user\'s Outlook / Microsoft 365 calendar within a time window. Returns subject, start/end times, location, organizer, all-day flag, and online meeting URL for each event. Defaults to the next 7 days. Use to see what meetings or appointments are scheduled. |
| `get_event` | Get full details of a single Outlook / Microsoft 365 calendar event by its ID. Returns subject, start/end times, location, organizer, attendees, body, all-day flag, and online meeting URL. Use after list_events to inspect a specific meeting. |
| `list_calendars` | List all calendars accessible in the user\'s Outlook / Microsoft 365 account. Returns each calendar\'s ID, name, owner, edit permission, and whether it is the default calendar. Use to discover which calendars exist. |
| `find_meeting_times` | Return the user\'s busy time windows from their Outlook / Microsoft 365 calendar over the next N days — a lightweight free/busy view. Each window includes start, end, subject, and all-day flag. Use to find when the user is available or to identify scheduling conflicts before proposing a meeting time. |
| `get_profile` | Get the signed-in user\'s Microsoft 365 / Outlook profile: display name, primary email (mail), and user principal name. Use to confirm whose calendar is connected. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "outlook-calendar": {
      "url": "https://gateway.pipeworx.io/outlook-calendar/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 711+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Outlook Calendar data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
