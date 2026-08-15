[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useScheduledBlocker

# Function: useScheduledBlocker()

> **useScheduledBlocker**(`blockerId`, `config`): `void`

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.ts:137](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.ts#L137)

Schedules UI blocking for a specific time period (e.g., maintenance windows).

Automatically blocks UI between specified start and end times. Useful for
scheduled maintenance, planned downtime, or time-based feature restrictions.
Supports callbacks when the blocking period starts and ends.

Time specifications support:
- Date objects
- ISO 8601 strings (e.g., "2024-01-15T10:00:00Z")
- Unix timestamps (milliseconds since epoch)

You can specify the end time either as an absolute time or as a duration
from the start time. If both are provided, duration takes precedence.

Works with both the global store and isolated provider instances (via UIBlockingProvider).

## Parameters

### blockerId

`string`

Unique identifier for this scheduled blocker

### config

[`ScheduledBlockerConfig`](../interfaces/ScheduledBlockerConfig.md)

Schedule configuration

## Returns

`void`

## Examples

Maintenance window with absolute times
```tsx
function MaintenanceWarning() {
  useScheduledBlocker('maintenance', {
    schedule: {
      start: new Date('2024-01-15T02:00:00Z'),
      end: new Date('2024-01-15T04:00:00Z'),
    },
    scope: 'global',
    reason: 'System maintenance in progress',
    priority: 95,
    onScheduleStart: () => {
      console.log('Maintenance started');
      showNotification('System is now in maintenance mode');
    },
    onScheduleEnd: () => {
      console.log('Maintenance completed');
      showNotification('System is back online');
    }
  });
  
  return <div>...</div>;
}
```

Short maintenance with duration
```tsx
useScheduledBlocker('quick-maintenance', {
  schedule: {
    start: new Date('2024-01-15T03:00:00'),
    duration: 15 * 60 * 1000, // 15 minutes
  },
  scope: ['api', 'forms'],
  reason: 'Brief system update',
  priority: 90
});
```

Business hours enforcement
```tsx
function BusinessHoursBlocker() {
  const now = new Date();
  const tomorrow9AM = new Date(now);
  tomorrow9AM.setDate(now.getDate() + 1);
  tomorrow9AM.setHours(9, 0, 0, 0);
  
  useScheduledBlocker('after-hours', {
    schedule: {
      start: new Date(now.getTime() + 1000), // Start immediately
      end: tomorrow9AM,
    },
    scope: 'trading',
    reason: 'Trading is only available during business hours (9 AM - 5 PM)',
    priority: 85
  });
  
  return <TradingDashboard />;
}
```

Using ISO strings for scheduling
```tsx
useScheduledBlocker('deployment', {
  schedule: {
    start: '2024-01-20T00:00:00Z',
    duration: 2 * 60 * 60 * 1000, // 2 hours
  },
  scope: 'global',
  reason: 'Deploying new version',
  priority: 100,
  onScheduleStart: () => {
    analytics.track('deployment_started');
  },
  onScheduleEnd: () => {
    analytics.track('deployment_completed');
    window.location.reload(); // Reload to get new version
  }
});
```

## See

 - [useBlocker](useBlocker.md) for immediate blocking without scheduling
 - [useConditionalBlocker](useConditionalBlocker.md) for condition-based blocking
 - [ScheduledBlockerConfig](../interfaces/ScheduledBlockerConfig.md) for configuration options
 - [BlockingSchedule](../interfaces/BlockingSchedule.md) for schedule specification details

## Since

0.6.0
