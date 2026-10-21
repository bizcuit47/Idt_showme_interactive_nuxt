import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { createError, readBody } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions } from '~/data/questions'
import IndexPage from '~/pages/index.vue'

const { navigateToMock, sentDucks, sendResponse } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  sentDucks: [] as unknown[],
  sendResponse: { status: 200 },
}))

mockNuxtImport('navigateTo', () => navigateToMock)

registerEndpoint('/', () => '')
registerEndpoint('/api/ducks', {
  method: 'POST',
  handler: async (event) => {
    sentDucks.push(await readBody(event))
    if (sendResponse.status !== 200)
      throw createError({ statusCode: sendResponse.status, statusMessage: 'rejected' })
    return { ok: true, isDuplicate: false }
  },
})

async function mountPage() {
  return mountSuspended(IndexPage)
}

async function typeNickname(wrapper: Awaited<ReturnType<typeof mountPage>>, name: string) {
  await wrapper.find('input.nickname-input').setValue(name)
  await wrapper.find('form').trigger('submit')
}

async function answerAll(wrapper: Awaited<ReturnType<typeof mountPage>>, optionIndex = 0) {
  for (let index = 0; index < questions.length; index++) {
    await wrapper.findAll('button.option')[optionIndex]!.trigger('click')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
  }
}

describe('quiz page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    navigateToMock.mockReset()
    sentDucks.length = 0
    sendResponse.status = 200
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts on the intro with a nickname field', async () => {
    const wrapper = await mountPage()

    expect(wrapper.find('input.nickname-input').exists()).toBe(true)
    expect(wrapper.text()).toContain('เริ่มเลย')
    expect(wrapper.findAll('button.option')).toHaveLength(0)
  })

  it('asks for a nickname when it is empty', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, '   ')

    expect(wrapper.text()).toContain('ใส่ชื่อเล่นก่อนนะ')
    expect(wrapper.findAll('button.option')).toHaveLength(0)
  })

  it('rejects a banned nickname and stays on the intro', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, 'f.u.c.k')

    expect(wrapper.text()).toContain('ชื่อนี้ใช้ไม่ได้')
    expect(wrapper.findAll('button.option')).toHaveLength(0)
  })

  it('clears the error as soon as the user types again', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, 'fuck')
    expect(wrapper.text()).toContain('ชื่อนี้ใช้ไม่ได้')

    await wrapper.find('input.nickname-input').setValue('มะลิ')

    expect(wrapper.text()).not.toContain('ชื่อนี้ใช้ไม่ได้')
  })

  it('limits the nickname field length', async () => {
    const wrapper = await mountPage()

    expect(wrapper.find('input.nickname-input').attributes('maxlength')).toBe('16')
  })

  it('shows the first question after a valid nickname', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, 'มะลิ')

    expect(wrapper.text()).toContain(questions[0]!.text)
    expect(wrapper.findAll('button.option')).toHaveLength(questions[0]!.options.length)
    expect(wrapper.text()).toContain(`ข้อ 1 / ${questions.length}`)
  })

  it('moves to the next question after an answer', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, 'มะลิ')
    await wrapper.findAll('button.option')[0]!.trigger('click')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()

    expect(wrapper.text()).toContain(questions[1]!.text)
    expect(wrapper.text()).toContain(`ข้อ 2 / ${questions.length}`)
  })

  it('ignores a second tap while an answer is being registered', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, 'มะลิ')
    const options = wrapper.findAll('button.option')
    await options[0]!.trigger('click')
    await options[1]!.trigger('click')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()

    expect(wrapper.text()).toContain(`ข้อ 2 / ${questions.length}`)
  })

  it('shows the result when the phone cannot create a randomUUID', async () => {
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new Error('insecure context')
    })
    try {
      const wrapper = await mountPage()
      await typeNickname(wrapper, 'มะลิ')
      await answerAll(wrapper)
      await vi.advanceTimersByTimeAsync(2000)
      await flushPromises()

      expect(JSON.parse(localStorage.getItem('fw:me')!).id).toBeTruthy()
      expect(wrapper.text()).toContain('ส่งเป็ดของฉันไปที่เมือง')
    }
    finally {
      vi.restoreAllMocks()
    }
  })

  it('shows the result and saves the player after the last question', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, '  มะลิ  ')
    await answerAll(wrapper)
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()

    const saved = JSON.parse(localStorage.getItem('fw:me')!)
    expect(saved.nickname).toBe('มะลิ')
    expect(saved.answers).toHaveLength(questions.length)
    expect(saved.id).toBeTruthy()
    expect(wrapper.text()).toContain('มะลิ')
    expect(wrapper.text()).toContain('ส่งเป็ดของฉันไปที่เมือง')
  })

  it('gives the same avatar for the same nickname and answers', async () => {
    const results: string[] = []
    for (let run = 0; run < 2; run++) {
      localStorage.clear()
      const wrapper = await mountPage()
      await typeNickname(wrapper, 'มะลิ')
      await answerAll(wrapper, 2)
      await vi.advanceTimersByTimeAsync(2000)
      await flushPromises()
      results.push(JSON.parse(localStorage.getItem('fw:me')!).avatarType)
      wrapper.unmount()
    }

    expect(results[0]).toBe(results[1])
  })

  it('goes back to the intro on play again and forgets the player', async () => {
    const wrapper = await mountPage()
    await typeNickname(wrapper, 'มะลิ')
    await answerAll(wrapper)
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()

    const playAgain = wrapper.findAll('button').find(button => button.text() === 'เล่นใหม่')!
    await playAgain.trigger('click')
    await flushPromises()

    expect(wrapper.find('input.nickname-input').exists()).toBe(true)
    expect(localStorage.getItem('fw:me')).toBeNull()
  })

  describe('sending the duck to the map', () => {
    async function reachResult() {
      const wrapper = await mountPage()
      await typeNickname(wrapper, 'มะลิ')
      await answerAll(wrapper)
      await vi.advanceTimersByTimeAsync(2000)
      await flushPromises()
      return wrapper
    }

    function sendButton(wrapper: Awaited<ReturnType<typeof mountPage>>) {
      return wrapper.findAll('button').find(button => button.text().includes('ส่งเป็ดของฉันไปที่เมือง'))!
    }

    it('posts the player id, nickname and character, then opens the card', async () => {
      const wrapper = await reachResult()
      const saved = JSON.parse(localStorage.getItem('fw:me')!)

      await sendButton(wrapper).trigger('click')
      await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledWith('/share'))

      expect(sentDucks).toEqual([{ id: saved.id, nickname: 'มะลิ', type: saved.avatarType }])
    })

    it('stays on the result and explains when the server blocks the name', async () => {
      sendResponse.status = 422
      const wrapper = await reachResult()

      await sendButton(wrapper).trigger('click')
      await vi.waitFor(() => expect(wrapper.text()).toContain('ชื่อนี้ใช้ไม่ได้'))

      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('asks the player to wait when they send too often', async () => {
      sendResponse.status = 429
      const wrapper = await reachResult()

      await sendButton(wrapper).trigger('click')
      await vi.waitFor(() => expect(wrapper.text()).toContain('ส่งถี่เกินไป'))

      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('lets the player skip to the card when sending keeps failing', async () => {
      sendResponse.status = 500
      const wrapper = await reachResult()

      await sendButton(wrapper).trigger('click')
      await vi.waitFor(() => expect(wrapper.text()).toContain('ส่งเป็ดไม่สำเร็จ'))
      const skip = wrapper.findAll('button').find(button => button.text().includes('ข้ามไปดูการ์ดก่อน'))!
      await skip.trigger('click')

      expect(navigateToMock).toHaveBeenCalledWith('/share')
    })

    it('sends the duck only once when the button is pressed twice', async () => {
      const wrapper = await reachResult()
      const button = sendButton(wrapper)

      await button.trigger('click')
      await button.trigger('click')
      await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledWith('/share'))

      expect(sentDucks).toHaveLength(1)
    })
  })
})
