interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Outlook Calendar MCP Pack
 *
 * Reads Microsoft 365 / Outlook calendar via Microsoft Graph v1.0.
 * Requires OAuth connection — gateway injects credentials via _context.microsoft.
 * Tools: list events, get event, list calendars, find meeting times, get profile.
 */


interface OutlookCalendarContext {
  microsoft?: { accessToken: string };
}

const API = 'https://graph.microsoft.com/v1.0';

async function gFetch(ctx: OutlookCalendarContext, url: string): Promise<unknown> {
  if (!ctx.microsoft) {
    return { error: 'connection_required', message: 'Connect your Microsoft 365 account at https://pipeworx.io/account' };
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ctx.microsoft.accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'list_events',
    description: 'List upcoming events from the user\'s Outlook / Microsoft 365 calendar within a time window. Returns subject, start/end times, location, organizer, all-day flag, and online meeting URL for each event. Defaults to the next 7 days. Use to see what meetings or appointments are scheduled.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        start: { type: 'string', description: 'Start of the window as an ISO 8601 datetime (e.g., "2026-06-02T00:00:00Z"). Defaults to the current time.' },
        end: { type: 'string', description: 'End of the window as an ISO 8601 datetime. Defaults to 7 days from now.' },
        top: { type: 'number', description: 'Maximum number of events to return (default 50, max 100).' },
      },
      required: [],
    },
  },
  {
    name: 'get_event',
    description: 'Get full details of a single Outlook / Microsoft 365 calendar event by its ID. Returns subject, start/end times, location, organizer, attendees, body, all-day flag, and online meeting URL. Use after list_events to inspect a specific meeting.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'The Microsoft Graph event ID to retrieve.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_calendars',
    description: 'List all calendars accessible in the user\'s Outlook / Microsoft 365 account. Returns each calendar\'s ID, name, owner, edit permission, and whether it is the default calendar. Use to discover which calendars exist.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'find_meeting_times',
    description: 'Return the user\'s busy time windows from their Outlook / Microsoft 365 calendar over the next N days — a lightweight free/busy view. Each window includes start, end, subject, and all-day flag. Use to find when the user is available or to identify scheduling conflicts before proposing a meeting time.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        days_ahead: { type: 'number', description: 'How many days ahead to scan for busy windows (default 7).' },
      },
      required: [],
    },
  },
  {
    name: 'get_profile',
    description: 'Get the signed-in user\'s Microsoft 365 / Outlook profile: display name, primary email (mail), and user principal name. Use to confirm whose calendar is connected.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as OutlookCalendarContext;
  delete args._context;

  switch (name) {
    case 'list_events': {
      const start = (args.start as string) ?? new Date().toISOString();
      const end = (args.end as string) ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const top = Math.min(100, Math.max(1, (args.top as number) ?? 50));
      const url =
        `${API}/me/calendarView` +
        `?startDateTime=${encodeURIComponent(start)}` +
        `&endDateTime=${encodeURIComponent(end)}` +
        `&$top=${top}` +
        `&$orderby=${encodeURIComponent('start/dateTime')}` +
        `&$select=${encodeURIComponent('id,subject,start,end,location,organizer,isAllDay,onlineMeetingUrl')}`;
      const data = await gFetch(context, url) as Record<string, unknown>;
      if (data && (data as { error?: unknown }).error !== undefined) return data;
      return (data as { value?: unknown }).value ?? data;
    }
    case 'get_event': {
      const id = args.id as string;
      const url =
        `${API}/me/events/${encodeURIComponent(id)}` +
        `?$select=${encodeURIComponent('id,subject,start,end,location,organizer,attendees,body,onlineMeetingUrl,isAllDay')}`;
      return gFetch(context, url);
    }
    case 'list_calendars': {
      const url = `${API}/me/calendars?$select=${encodeURIComponent('id,name,owner,canEdit,isDefaultCalendar')}`;
      const data = await gFetch(context, url) as Record<string, unknown>;
      if (data && (data as { error?: unknown }).error !== undefined) return data;
      return (data as { value?: unknown }).value ?? data;
    }
    case 'find_meeting_times': {
      const daysAhead = (args.days_ahead as number) ?? 7;
      const start = new Date().toISOString();
      const end = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
      const url =
        `${API}/me/calendarView` +
        `?startDateTime=${encodeURIComponent(start)}` +
        `&endDateTime=${encodeURIComponent(end)}` +
        `&$top=100` +
        `&$orderby=${encodeURIComponent('start/dateTime')}` +
        `&$select=${encodeURIComponent('id,subject,start,end,isAllDay')}`;
      const data = await gFetch(context, url) as Record<string, unknown>;
      if (data && (data as { error?: unknown }).error !== undefined) return data;
      const events = ((data as { value?: unknown[] }).value ?? []) as Array<Record<string, unknown>>;
      return events.map((e) => ({
        id: e.id,
        subject: e.subject,
        start: e.start,
        end: e.end,
        isAllDay: e.isAllDay,
      }));
    }
    case 'get_profile': {
      const url = `${API}/me?$select=${encodeURIComponent('displayName,mail,userPrincipalName')}`;
      return gFetch(context, url);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 }, provider: 'microsoft' } satisfies McpToolExport;
