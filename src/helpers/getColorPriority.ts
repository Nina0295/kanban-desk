function getColorPriority(priority: string): string {
  return priority === 'High' ? "high-priority" : priority === 'Medium' ? "medium-priority" : "low-priority"
}

export { getColorPriority }
