import type { Player } from '~/types'
import { StorageSerializers } from '@vueuse/core'

export function useMe() {
  return useLocalStorage<Player | null>('fw:me', null, { serializer: StorageSerializers.object })
}
