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

async function mountPage(route = '/map') {
  const wrapper = await mountSuspended(MapPage, { route })
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

  describe('kiosk mode', () => {
    it('shows the home button on a normal visit', async () => {
      const wrapper = await mountPage('/map')

      expect(wrapper.find('button.map-back').exists()).toBe(true)
    })

    it('hides the home button with ?kiosk=1', async () => {
      const wrapper = await mountPage('/map?kiosk=1')

      expect(wrapper.find('button.map-back').exists()).toBe(false)
    })

    it('still shows the ducks with ?kiosk=1', async () => {
      feed.ducks = [duck(1), duck(2)]
      const wrapper = await mountPage('/map?kiosk=1')

      expect(wrapper.findAllComponents(MapWalker)).toHaveLength(2)
    })

    it('does not highlight a duck on the kiosk even when this browser played', async () => {
      localStorage.setItem('fw:me', JSON.stringify(player))
      feed.ducks = [duck(1), duck(2, { id: player.id, nickname: 'มะลิ', type: 'star' })]
      const wrapper = await mountPage('/map?kiosk=1')

      expect(wrapper.findAll('.map-walker-name')).toHaveLength(2)
      expect(wrapper.findAll('.map-walker-name-self')).toHaveLength(0)
    })

    it('treats any other kiosk value as a normal visit', async () => {
      const wrapper = await mountPage('/map?kiosk=0')

      expect(wrapper.find('button.map-back').exists()).toBe(true)
    })
  })

  describe('sounds', () => {
    const instances: FakeAudio[] = []
    const behavior = { blockedPlays: 0 }

    class FakeAudio {
      source: string
      loop = false
      volume = 1
      playCount = 0
      isPaused = false

      constructor(source: string) {
        this.source = source
        instances.push(this)
      }

      play() {
        this.playCount++
        this.isPaused = false
        if (behavior.blockedPlays > 0) {
          behavior.blockedPlays--
          return Promise.reject(new Error('blocked'))
        }
        return Promise.resolve()
      }

      pause() {
        this.isPaused = true
      }
    }

    function music() {
      return instances.filter(audio => audio.source === '/sounds/catch-the-star.mp3')
    }

    function quack() {
      return instances.filter(audio => audio.source === '/sounds/duck-quack.mp3')
    }

    beforeEach(() => {
      instances.length = 0
      behavior.blockedPlays = 0
      vi.stubGlobal('Audio', FakeAudio)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('starts a looping, softened track when the map opens', async () => {
      await mountPage('/map')

      expect(music()).toHaveLength(1)
      expect(music()[0]!.source).toBe('/sounds/catch-the-star.mp3')
      expect(music()[0]!.loop).toBe(true)
      expect(music()[0]!.volume).toBeLessThanOrEqual(0.5)
      expect(music()[0]!.playCount).toBe(1)
    })

    it('plays the same track on the kiosk map', async () => {
      await mountPage('/map?kiosk=1')

      expect(music()).toHaveLength(1)
      expect(music()[0]!.source).toBe('/sounds/catch-the-star.mp3')
      expect(music()[0]!.playCount).toBe(1)
    })

    it('waits for the first touch when the browser blocks autoplay', async () => {
      behavior.blockedPlays = 1
      await mountPage('/map?kiosk=1')
      expect(music()[0]!.playCount).toBe(1)

      window.dispatchEvent(new Event('pointerdown'))
      await flushPromises()

      expect(music()).toHaveLength(1)
      expect(music()[0]!.playCount).toBe(2)
    })

    it('also starts after a finger lift, which is what a touch screen counts as a tap', async () => {
      behavior.blockedPlays = 1
      await mountPage('/map?kiosk=1')

      window.dispatchEvent(new Event('pointerup'))
      await flushPromises()

      expect(music()[0]!.playCount).toBe(2)
    })

    it('starts after a key press when autoplay is blocked', async () => {
      behavior.blockedPlays = 1
      await mountPage('/map?kiosk=1')

      window.dispatchEvent(new Event('keydown'))
      await flushPromises()

      expect(music()[0]!.playCount).toBe(2)
    })

    it('starts only once when several taps arrive together', async () => {
      behavior.blockedPlays = 1
      await mountPage('/map?kiosk=1')

      window.dispatchEvent(new Event('pointerdown'))
      window.dispatchEvent(new Event('pointerup'))
      await flushPromises()

      expect(music()[0]!.playCount).toBe(2)
    })

    it('stops the music when the map is closed', async () => {
      const wrapper = await mountPage('/map')

      wrapper.unmount()

      expect(music()[0]!.isPaused).toBe(true)
    })

    it('does not start the music from a late touch after the map is closed', async () => {
      behavior.blockedPlays = 1
      const wrapper = await mountPage('/map')
      wrapper.unmount()

      window.dispatchEvent(new Event('pointerdown'))
      await flushPromises()

      expect(music()[0]!.playCount).toBe(1)
    })

    describe('when a duck arrives', () => {
      it('stays quiet for the ducks already on the map when it opens', async () => {
        feed.ducks = [duck(1), duck(2), duck(3)]
        await mountPage('/map')

        expect(quack()).toHaveLength(1)
        expect(quack()[0]!.playCount).toBe(0)
      })

      it('quacks when a new duck arrives after the map opened', async () => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
        feed.ducks = [duck(1)]
        await mountPage('/map')

        feed.ducks = [duck(2)]
        await vi.advanceTimersByTimeAsync(3000)
        await flushPromises()

        expect(quack()[0]!.playCount).toBe(1)
      })

      it('quacks for the first duck even when the map was empty at the start', async () => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
        await mountPage('/map')

        feed.ducks = [duck(1)]
        await vi.advanceTimersByTimeAsync(3000)
        await flushPromises()

        expect(quack()[0]!.playCount).toBe(1)
      })

      it('does not quack again when the server repeats a duck', async () => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
        await mountPage('/map')
        feed.ducks = [duck(1)]
        await vi.advanceTimersByTimeAsync(3000)
        await flushPromises()

        await vi.advanceTimersByTimeAsync(3000)
        await flushPromises()

        expect(quack()[0]!.playCount).toBe(1)
      })

      it('quacks on the kiosk map too', async () => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
        await mountPage('/map?kiosk=1')

        feed.ducks = [duck(1)]
        await vi.advanceTimersByTimeAsync(3000)
        await flushPromises()

        expect(quack()[0]!.playCount).toBe(1)
      })
    })
  })
})
