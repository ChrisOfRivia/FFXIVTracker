import { DATA_CENTER_REGION, WORLD_DATA_CENTER } from "../shared/ffxivWorlds.js"

const FFXIV_COLLECT_BASE_URL = "https://ffxivcollect.com"
const SEARCH_PATH = "/characters/search"
const LODESTONE_SEARCH_PATH = "/characters/search/lodestone"
const USER_AGENT = "FFXIVMountTracker/1.0"

export async function searchCharacters({ name, server = "", dataCenter = "" }) {
  const trimmedName = name.trim()
  const trimmedServer = server.trim()
  const trimmedDataCenter = dataCenter.trim()

  if (!trimmedName) {
    return []
  }

  const searchAttempts = [
    { path: SEARCH_PATH, params: { name: trimmedName, server: trimmedServer, data_center: trimmedDataCenter }, source: "ffxivcollect" },
    { path: LODESTONE_SEARCH_PATH, params: { name: trimmedName, server: trimmedServer, data_center: trimmedDataCenter }, source: "lodestone" },
    { path: SEARCH_PATH, params: { name: trimmedName, server: trimmedServer }, source: "ffxivcollect" },
    { path: LODESTONE_SEARCH_PATH, params: { name: trimmedName, server: trimmedServer }, source: "lodestone" },
    { path: SEARCH_PATH, params: { name: trimmedName, data_center: trimmedDataCenter }, source: "ffxivcollect" },
    { path: LODESTONE_SEARCH_PATH, params: { name: trimmedName, data_center: trimmedDataCenter }, source: "lodestone" },
    { path: SEARCH_PATH, params: { name: trimmedName }, source: "ffxivcollect" },
    { path: LODESTONE_SEARCH_PATH, params: { name: trimmedName }, source: "lodestone" },
  ]

  const matchedCharacters = []

  for (const attempt of searchAttempts) {
    const html = await fetchHtml(buildCollectUrl(attempt.path, attempt.params))
    const parsedCharacters = parseCharacterSearchResults(html, attempt.source)
    const filteredCharacters = filterCharacters(parsedCharacters, {
      name: trimmedName,
      server: trimmedServer,
      dataCenter: trimmedDataCenter,
    })

    if (filteredCharacters.length > 0) {
      matchedCharacters.push(...filteredCharacters)
    }
  }

  return sortCharactersBySearchMatch(dedupeCharacters(matchedCharacters), {
    name: trimmedName,
    server: trimmedServer,
    dataCenter: trimmedDataCenter,
  })
}

export async function getOwnedMounts(characterId) {
  return getOwnedCollectableEntries(characterId, "mounts")
}

export async function getOwnedMinions(characterId) {
  return getOwnedCollectableEntries(characterId, "minions")
}

export async function getOwnedAchievements(characterId) {
  return getOwnedCollectableEntries(characterId, "achievements")
}

async function getOwnedCollectableEntries(characterId, collectionPath) {
  await refreshCharacter(characterId).catch(() => null)

  const url = new URL(`/api/characters/${characterId}/${collectionPath}/owned`, FFXIV_COLLECT_BASE_URL)
  url.searchParams.set("_", Date.now().toString())

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "User-Agent": USER_AGENT,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const error = new Error(`FFXIV Collect responded with ${response.status}`)
    error.status = response.status
    throw error
  }

  const payload = await response.json()
  const results = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []
  return results
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
    }))
    .filter((entry) => entry.id || entry.name)
}

export async function getOwnedMountIds(characterId) {
  const mounts = await getOwnedMounts(characterId)
  return mounts.map((mount) => mount.id).filter(Boolean)
}

function buildCollectUrl(pathname, queryParams) {
  const url = new URL(pathname, FFXIV_COLLECT_BASE_URL)

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": USER_AGENT,
    },
  })

  if (!response.ok) {
    const error = new Error(`FFXIV Collect responded with ${response.status}`)
    error.status = response.status
    throw error
  }

  return response.text()
}

async function refreshCharacter(characterId) {
  const characterUrl = `${FFXIV_COLLECT_BASE_URL}/characters/${characterId}`
  const pageResponse = await fetch(characterUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": USER_AGENT,
    },
  })

  if (!pageResponse.ok) {
    return
  }

  const html = await pageResponse.text()
  const csrfToken = getCsrfToken(html)

  if (!csrfToken) {
    return
  }

  const cookie = getCookieHeader(pageResponse.headers)
  const body = new URLSearchParams({ authenticity_token: csrfToken })

  const refreshResponse = await fetch(`${FFXIV_COLLECT_BASE_URL}/character/refresh/${characterId}`, {
    method: "POST",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrfToken,
      "User-Agent": USER_AGENT,
      Referer: characterUrl,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body.toString(),
  })

  if (!refreshResponse.ok) {
    const error = new Error(`FFXIV Collect refresh responded with ${refreshResponse.status}`)
    error.status = refreshResponse.status
    throw error
  }
}

function getCookieHeader(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers
      .getSetCookie()
      .map((cookie) => cookie.split(";")[0])
      .filter(Boolean)
      .join("; ")
  }

  const setCookieHeader = headers.get("set-cookie")

  if (!setCookieHeader) {
    return ""
  }

  return setCookieHeader
    .split(/,(?=\s*[^;,=\s]+=[^;,]+)/)
    .map((cookie) => cookie.split(";")[0].trim())
    .filter(Boolean)
    .join("; ")
}

function parseCharacterSearchResults(html, source) {
  const characterMatches = html.matchAll(
    /<div class="d-flex flex-wrap align-items-center">\s*<img class="avatar[^"]*" src="([^"]+)" \/>[\s\S]*?<b>([^<]+)<\/b>[\s\S]*?<span><i class="fas fa-globe"><\/i><span class="fa5-text">([^<]+)<\/span><\/span>[\s\S]*?<a class="btn btn-sm btn-secondary" href="\/characters\/(\d+)"/g,
  )

  const results = []

  for (const match of characterMatches) {
    const [, avatar, rawName, rawWorld, id] = match
    const world = decodeHtml(rawWorld.trim())
    const dataCenter = WORLD_DATA_CENTER[world] || ""

    results.push({
      id: Number(id),
      avatar,
      name: decodeHtml(rawName.trim()),
      world,
      dataCenter,
      region: DATA_CENTER_REGION[dataCenter] || "",
      source,
    })
  }

  return dedupeCharacters(results)
}

function dedupeCharacters(characters) {
  const seenIds = new Set()

  return characters.filter((character) => {
    if (seenIds.has(character.id)) {
      return false
    }

    seenIds.add(character.id)
    return true
  })
}

function filterCharacters(characters, filters) {
  const normalizedName = normalizeCharacterValue(filters.name)
  const normalizedServer = normalizeCharacterValue(filters.server)
  const normalizedDataCenter = normalizeCharacterValue(filters.dataCenter)

  return characters.filter((character) => {
    const matchesName = getCharacterNameMatchScore(character.name, normalizedName) >= 0
    const matchesServer = !normalizedServer || normalizeCharacterValue(character.world) === normalizedServer
    const matchesDataCenter = !normalizedDataCenter || normalizeCharacterValue(character.dataCenter) === normalizedDataCenter

    return matchesName && matchesServer && matchesDataCenter
  })
}

function sortCharactersBySearchMatch(characters, filters) {
  const normalizedName = normalizeCharacterValue(filters.name)

  return [...characters].sort((leftCharacter, rightCharacter) => {
    const scoreDifference =
      getCharacterNameMatchScore(rightCharacter.name, normalizedName) -
      getCharacterNameMatchScore(leftCharacter.name, normalizedName)

    if (scoreDifference !== 0) {
      return scoreDifference
    }

    return leftCharacter.name.localeCompare(rightCharacter.name)
  })
}

function getCharacterNameMatchScore(characterName, normalizedQuery) {
  if (!normalizedQuery) {
    return 0
  }

  const normalizedCharacterName = normalizeCharacterValue(characterName)
  const characterNameParts = normalizedCharacterName.split(/\s+/).filter(Boolean)
  const queryParts = normalizedQuery.split(/\s+/).filter(Boolean)

  if (normalizedCharacterName === normalizedQuery) {
    return 600
  }

  if (characterNameParts.some((part) => part === normalizedQuery)) {
    return 500
  }

  if (
    queryParts.length > 1 &&
    queryParts.length <= characterNameParts.length &&
    queryParts.every((part, index) => characterNameParts[index]?.startsWith(part))
  ) {
    return 450
  }

  if (queryParts.length > 1 && queryParts.every((part) => characterNameParts.some((namePart) => namePart === part))) {
    return 400
  }

  if (queryParts.length > 1 && queryParts.every((part) => characterNameParts.some((namePart) => namePart.startsWith(part)))) {
    return 350
  }

  if (characterNameParts.some((part) => part.startsWith(normalizedQuery))) {
    return 300
  }

  if (normalizedCharacterName.startsWith(normalizedQuery)) {
    return 250
  }

  if (normalizedCharacterName.includes(normalizedQuery)) {
    return 200
  }

  return -1
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", "\"")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
}

function getCsrfToken(html) {
  return html.match(/<meta name="csrf-token" content="([^"]+)"/)?.[1] || null
}

function normalizeCharacterValue(value) {
  return value.trim().toLowerCase()
}
