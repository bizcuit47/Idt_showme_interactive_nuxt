import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MapWalker from '~/components/Map/MapWalker.vue'
import MapPage from '~/pages/map.vue'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

mockNuxtImport('navigateTo', () => navigateToMock)

const player = {
  id: 'p1',
  nickname: 'มะลิ',
  avatarType: 'star',
  answers: [0, 1, 2, 3, 0, 1],
  createdAt: '2026-10-21T00:00:00.000Z',
}

async function mountPage() {
  const wrapper = await mountSuspended(MapPage)
  await flushPromises()
  return wrapper
}

describe('map page', () => {
  beforeEach(() => {
    localStorage.clear()
    navigateToMock.mockReset()
  })

  it('asks for a player when none is stored', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('ยังไม่มีข้อมูลผู้เล่น')
    expect(wrapper.findAllComponents(MapWalker)).toHaveLength(0)
  })

  it('drops the player goose in among the demo geese', async () => {
    localStorage.setItem('fw:me', JSON.stringify(player))
    const wrapper = await mountPage()
    const walkers = wrapper.findAllComponents(MapWalker)

    expect(walkers).toHaveLength(5)
    const self = walkers.filter(walker => walker.props('isSelf'))
    expect(self).toHaveLength(1)
    expect(self[0]!.props('nickname')).toBe('มะลิ')
    expect(self[0]!.props('type')).toBe('star')
    expect(self[0]!.props('isDropping')).toBe(true)
  })

  it('shows the nickname of every goose', async () => {
    localStorage.setItem('fw:me', JSON.stringify(player))
    const wrapper = await mountPage()
    const names = wrapper.findAll('.map-walker-name').map(name => name.text())

    expect(names).toContain('มะลิ')
    expect(names).toHaveLength(5)
  })

  it('marks only the player name as highlighted', async () => {
    localStorage.setItem('fw:me', JSON.stringify(player))
    const wrapper = await mountPage()

    expect(wrapper.findAll('.map-walker-name-self')).toHaveLength(1)
  })

  it('goes back to the quiz when the player wants to play again', async () => {
    localStorage.setItem('fw:me', JSON.stringify(player))
    const wrapper = await mountPage()

    await wrapper.find('button.map-back').trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith('/')
  })
})
