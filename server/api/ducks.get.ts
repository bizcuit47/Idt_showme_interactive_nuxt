export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const since = Number(getQuery(event).since)
  const ducks = await getDuckStore().list(Number.isFinite(since) && since > 0 ? since : 0)
  return { ducks }
})
