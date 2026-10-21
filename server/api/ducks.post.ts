export default defineEventHandler(async (event) => {
  const parsed = parseDuck(await readBody(event))
  if ('rejection' in parsed) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Duck rejected',
      data: { reason: parsed.rejection },
    })
  }

  const clientKey = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const outcome = await getDuckStore().add({ ...parsed.duck, createdAt: Date.now() }, clientKey)
  if (outcome === 'limited')
    throw createError({ statusCode: 429, statusMessage: 'Too many ducks sent' })

  return { ok: true, isDuplicate: outcome === 'duplicate' }
})
