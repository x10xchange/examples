import { beforeAll } from 'vitest'

import { initWasm } from './src/utils/wasm.ts'

beforeAll(async () => {
  await initWasm()
})
