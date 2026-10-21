import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MapWalker from '~/components/Map/MapWalker.vue'
import MapPage from '~/pages/map.vue'

const { navigateToMock, feed, requestedSince } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  feed: { ducks: [] as unknown[] },
  requestedSince: [] as Array<string | undefined>,
}))

mockNuxtImport('navigateTo', () => navigateToMock)

registerEndpoint('/api/ducks', (event) => {
  requestedSince.push(new URL(event.node.req.url!, 'http://localhost').searchParams.get('since') ?? undefined)
  return { ducks: feed.ducks }
})

const player = {
  id: '2d0254f8-8e09-43b9-851f-641a23d2bafe',
  nickname: 'มะลิ',
  avatarType: 'star',
  answers: [0, 1, 2, 3, 0, 1],
  createdAt: '2026-10-21T00:00:00.000Z',
}

function duck(index: number, overrides: Record<string, unknown> = {}) {
  return { id: `00000000-0000-4000-8000-00000000000${index}`, nickname: `เป็ด${index}`, type: 'spark', createdAt: 1000 + index, ...overrides }
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
    feed.ducks = []
    requestedSince.length = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows an empty map before anyone has sent a duck', async () => {
    const wrapper = await mountPage()

    expect(wrapper.find('.map-stage').exists()).toBe(true)
    expect(wrapper.findAllComponents(MapWalker)).toHaveLength(0)
  })

  it('shows every duck the server returns with its nickname', async () => {
    feed.ducks = [duck(1), duck(2), duck(3)]
    const wrapper = await mountPage()

    const names = wrapper.findAll('.map-walker-name').map(name => name.text())
    expect(names).toEqual(['เป็ด1', 'เป็ด2', 'เป็ด3'])
  })

  it('fades each new duck in', async () => {
    feed.ducks = [duck(1)]
    const wrapper = await mountPage()
    const walker = wrapper.findComponent(MapWalker)

    expect(walker.props('isEntering')).toBe(true)
    expect(walker.props('type')).toBe('spark')
  })

  it('highlights only the duck that belongs to this device', async () => {
    localStorage.setItem('fw:me', JSON.stringify(player))
    feed.ducks = [duck(1), duck(2, { id: player.id, nickname: 'มะลิ', type: 'star' })]
    const wrapper = await mountPage()

    expect(wrapper.findAll('.map-walker-name-self')).toHaveLength(1)
    expect(wrapper.find('.map-walker-name-self').text()).toBe('มะลิ')
  })

  it('asks for new ducks every three seconds from the last one it saw', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    feed.ducks = [duck(1)]
    await mountPage()
    expect(requestedSince).toEqual([undefined])

    feed.ducks = [duck(2)]
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()

    expect(requestedSince).toEqual([undefined, '1001'])
  })

  it('does not add the same duck twice when the server repeats it', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    feed.ducks = [duck(1)]
    const wrapper = await mountPage()

    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()

    expect(wrapper.findAllComponents(MapWalker)).toHaveLength(1)
  })

  it('goes back to the quiz when the home button is pressed', async () => {
    const wrapper = await mountPage()

    await wrapper.find('button.map-back').trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith('/')
  })
})
