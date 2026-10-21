import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SharePage from '~/pages/share.vue'

const { navigateToMock, renderCardMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  renderCardMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)

vi.mock('~/utils/card', () => ({
  renderCard: renderCardMock,
}))

const player = {
  id: 'p1',
  nickname: 'มะลิ',
  avatarType: 'star',
  answers: [0, 1, 2, 3, 0, 1],
  createdAt: '2026-10-21T00:00:00.000Z',
}

function setNavigator(values: Record<string, unknown>) {
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true })
}

function findButton(wrapper: Awaited<ReturnType<typeof mountPage>>, text: string) {
  return wrapper.findAll('button').find(button => button.text().includes(text))
}

async function mountPage(route = '/share') {
  const wrapper = await mountSuspended(SharePage, { route })
  await flushPromises()
  return wrapper
}

describe('share page', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('fw:me', JSON.stringify(player))
    navigateToMock.mockReset()
    renderCardMock.mockReset()
    renderCardMock.mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
    URL.createObjectURL = vi.fn(() => 'blob:card')
    URL.revokeObjectURL = vi.fn()
    setNavigator({ canShare: undefined, share: undefined, clipboard: undefined })
    vi.stubGlobal('ClipboardItem', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('tells the visitor to look for their name on the screen after sending', async () => {
    const wrapper = await mountPage('/share?sent=1')

    expect(wrapper.find('.sent-pill').text()).toContain('มะลิ')
    expect(wrapper.find('.sent-pill').text()).toContain('บนจอ')
  })

  it('does not claim the duck was sent when the visitor skipped sending', async () => {
    const wrapper = await mountPage('/share')

    expect(wrapper.find('.sent-pill').exists()).toBe(false)
  })

  it('sends the visitor home when there is no player', async () => {
    localStorage.clear()
    await mountPage()

    expect(navigateToMock).toHaveBeenCalledWith('/')
    expect(renderCardMock).not.toHaveBeenCalled()
  })

  it('renders the card for the stored player and shows it', async () => {
    const wrapper = await mountPage()

    expect(renderCardMock).toHaveBeenCalledTimes(1)
    expect(renderCardMock.mock.calls[0]![0]).toBe('มะลิ')
    expect(renderCardMock.mock.calls[0]![1].id).toBe('star')
    expect(wrapper.find('img.card-image').attributes('src')).toBe('blob:card')
  })

  it('disables the actions until the card is ready', async () => {
    let resolveCard: (blob: Blob) => void = () => {}
    renderCardMock.mockReturnValue(new Promise<Blob>((resolve) => {
      resolveCard = resolve
    }))
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('กำลังสร้างการ์ด')
    expect(findButton(wrapper, 'ดาวน์โหลดรูป')!.attributes('disabled')).toBeDefined()

    resolveCard(new Blob(['png']))
    await flushPromises()

    expect(findButton(wrapper, 'ดาวน์โหลดรูป')!.attributes('disabled')).toBeUndefined()
  })

  it('shows an error and lets the user retry when the card fails', async () => {
    renderCardMock.mockRejectedValueOnce(new Error('canvas failed'))
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('สร้างการ์ดไม่สำเร็จ')

    await findButton(wrapper, 'ลองสร้างการ์ดอีกครั้ง')!.trigger('click')
    await flushPromises()

    expect(wrapper.find('img.card-image').exists()).toBe(true)
  })

  it('downloads the card with a file name based on the avatar', async () => {
    const wrapper = await mountPage()
    const clicks: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this)
    })

    await findButton(wrapper, 'ดาวน์โหลดรูป')!.trigger('click')

    expect(clicks).toHaveLength(1)
    expect(clicks[0]!.download).toBe('future-wall-star.png')
    expect(clicks[0]!.href).toContain('blob:card')
    expect(wrapper.text()).toContain('กดค้างที่รูป')
  })

  it('shares the card as a file through the native share sheet', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    setNavigator({ canShare: vi.fn(() => true), share })
    const wrapper = await mountPage()

    await findButton(wrapper, 'แชร์ไปแอปอื่น')!.trigger('click')
    await flushPromises()

    expect(share).toHaveBeenCalledTimes(1)
    const data = share.mock.calls[0]![0]
    expect(data.files).toHaveLength(1)
    expect(data.files[0].name).toBe('future-wall-star.png')
    expect(data.files[0].type).toBe('image/png')
    expect(data.title).toBe('Future Wall')
    expect(data.text).toContain('Future Wall')
  })

  it('stays quiet when the user cancels the share sheet', async () => {
    const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' })
    setNavigator({ canShare: vi.fn(() => true), share: vi.fn().mockRejectedValue(abort) })
    const wrapper = await mountPage()

    await findButton(wrapper, 'แชร์ไปแอปอื่น')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain('แชร์ไม่สำเร็จ')
  })

  it('tells the user when sharing fails for another reason', async () => {
    setNavigator({
      canShare: vi.fn(() => true),
      share: vi.fn().mockRejectedValue(new Error('boom')),
    })
    const wrapper = await mountPage()

    await findButton(wrapper, 'แชร์ไปแอปอื่น')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('แชร์ไม่สำเร็จ')
  })

  it('falls back to a download when the device cannot share files', async () => {
    const clicks: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this)
    })
    const wrapper = await mountPage()

    await findButton(wrapper, 'แชร์ไปแอปอื่น')!.trigger('click')

    expect(clicks).toHaveLength(1)
    expect(wrapper.text()).toContain('แชร์ตรงไม่ได้')
  })

  it('hides the copy button when the browser cannot copy images', async () => {
    const wrapper = await mountPage()

    expect(findButton(wrapper, 'คัดลอกรูป')).toBeUndefined()
  })

  it('copies the card image to the clipboard when supported', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('ClipboardItem', class {
      constructor(public items: Record<string, Blob>) {}
    })
    setNavigator({ clipboard: { write } })
    const wrapper = await mountPage()

    await findButton(wrapper, 'คัดลอกรูป')!.trigger('click')
    await flushPromises()

    expect(write).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('คัดลอกรูปแล้ว')
  })

  it('reports a failed copy', async () => {
    vi.stubGlobal('ClipboardItem', class {})
    setNavigator({ clipboard: { write: vi.fn().mockRejectedValue(new Error('denied')) } })
    const wrapper = await mountPage()

    await findButton(wrapper, 'คัดลอกรูป')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('คัดลอกไม่สำเร็จ')
  })

  it('links to the map and back to the home page', async () => {
    const wrapper = await mountPage()

    await findButton(wrapper, 'ดูเป็ดของฉันบนเมือง')!.trigger('click')
    expect(navigateToMock).toHaveBeenLastCalledWith('/map')

    await findButton(wrapper, 'กลับสู่หน้าหลัก')!.trigger('click')
    expect(navigateToMock).toHaveBeenLastCalledWith('/')
  })

  it('releases the card url when the page is left', async () => {
    const wrapper = await mountPage()
    wrapper.unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:card')
  })
})
