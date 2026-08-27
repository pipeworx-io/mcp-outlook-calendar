# mcp-outlook-calendar

Outlook Calendar MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1481+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_events` | List upcoming events from the user's Outlook / Microsoft 365 calendar within a time window. Returns subject, start/end times, location, organizer, all-day flag, and online meeting URL for each event. Defaults to the next 7 days. Use to see what meetings or appointments are scheduled. |
| `get_event` | Get full details of a single Outlook / Microsoft 365 calendar event by its ID. Returns subject, start/end times, location, organizer, attendees, body, all-day flag, and online meeting URL. Use after list_events to inspect a specific meeting. |
| `list_calendars` | List all calendars accessible in the user's Outlook / Microsoft 365 account. Returns each calendar's ID, name, owner, edit permission, and whether it is the default calendar. Use to discover which calendars exist. |
| `find_meeting_times` | Return the user's busy time windows from their Outlook / Microsoft 365 calendar over the next N days — a lightweight free/busy view. Each window includes start, end, subject, and all-day flag. Use to find when the user is available or to identify scheduling conflicts before proposing a meeting time. |
| `get_profile` | Get the signed-in user's Microsoft 365 / Outlook profile: display name, primary email (mail), and user principal name. Use to confirm whose calendar is connected. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "outlook_calendar": {
      "url": "https://gateway.pipeworx.io/outlook_calendar/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/outlook_calendar/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1481+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Outlook Calendar data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
