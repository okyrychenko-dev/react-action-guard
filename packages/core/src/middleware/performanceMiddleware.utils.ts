export function handleAddAction(
  blockerId: string,
  timestamp: number,
  blockStartTimes: Map<string, number>
): void {
  blockStartTimes.set(blockerId, timestamp);
}
