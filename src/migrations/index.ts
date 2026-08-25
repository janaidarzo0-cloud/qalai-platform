import * as migration_20260825_100844_initial_schema from './20260825_100844_initial_schema'
import * as migration_20260825_111514_resolved_tasks from './20260825_111514_resolved_tasks'

export const migrations = [
  {
    up: migration_20260825_100844_initial_schema.up,
    down: migration_20260825_100844_initial_schema.down,
    name: '20260825_100844_initial_schema',
  },
  {
    up: migration_20260825_111514_resolved_tasks.up,
    down: migration_20260825_111514_resolved_tasks.down,
    name: '20260825_111514_resolved_tasks',
  },
]
