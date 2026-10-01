[**React Action Guard DevTools API v0.3.0**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsEventStats

# Interface: DevtoolsEventStats

Defined in: [types/devtools.types.ts:56](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L56)

Aggregate statistics derived from the recorded event history.

## Properties

### total

> **total**: `number`

Defined in: [types/devtools.types.ts:58](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L58)

Total number of recorded events

***

### byAction

> **byAction**: `Record`\<`BlockingAction`, `number`\>

Defined in: [types/devtools.types.ts:60](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L60)

Number of events per action type

***

### durationSampleCount

> **durationSampleCount**: `number`

Defined in: [types/devtools.types.ts:62](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L62)

Number of events that carry a `duration` (remove/timeout)

***

### averageDurationMs

> **averageDurationMs**: `number`

Defined in: [types/devtools.types.ts:64](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L64)

Average duration (ms) across events that carry a duration

***

### maxDurationMs

> **maxDurationMs**: `number`

Defined in: [types/devtools.types.ts:66](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L66)

Longest recorded duration (ms)

***

### topScopes

> **topScopes**: `object`[]

Defined in: [types/devtools.types.ts:68](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L68)

Most frequent scopes, sorted by event count (descending)

#### scope

> **scope**: `string`

#### count

> **count**: `number`
