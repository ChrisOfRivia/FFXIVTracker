import { getOwnedAchievements, getOwnedMinions, getOwnedMounts, searchCharacters } from "./characterSync.js"

export function createCharacterSyncMiddleware() {
  return async function characterSyncMiddleware(req, res, next) {
    if (!req.url?.startsWith("/api/")) {
      next()
      return
    }

    const requestUrl = new URL(req.url, "http://localhost")

    try {
      if (requestUrl.pathname === "/api/character-search") {
        const characters = await searchCharacters({
          name: requestUrl.searchParams.get("name") || "",
          server: requestUrl.searchParams.get("server") || "",
          dataCenter: requestUrl.searchParams.get("dataCenter") || "",
        })

        sendJson(res, 200, { characters })
        return
      }

      if (requestUrl.pathname === "/api/character-mounts") {
        const id = requestUrl.searchParams.get("id")

        if (!id) {
          sendJson(res, 400, { error: "Character id is required." })
          return
        }

        const ownedMounts = await getOwnedMounts(id)
        sendJson(res, 200, {
          ownedMountIds: ownedMounts.map((mount) => mount.id).filter(Boolean),
          ownedMountNames: ownedMounts.map((mount) => mount.name).filter(Boolean),
        })
        return
      }

      if (requestUrl.pathname === "/api/character-minions") {
        const id = requestUrl.searchParams.get("id")

        if (!id) {
          sendJson(res, 400, { error: "Character id is required." })
          return
        }

        const ownedMinions = await getOwnedMinions(id)
        sendJson(res, 200, {
          ownedMountIds: ownedMinions.map((minion) => minion.id).filter(Boolean),
          ownedMountNames: ownedMinions.map((minion) => minion.name).filter(Boolean),
        })
        return
      }

      if (requestUrl.pathname === "/api/character-achievements") {
        const id = requestUrl.searchParams.get("id")

        if (!id) {
          sendJson(res, 400, { error: "Character id is required." })
          return
        }

        const ownedAchievements = await getOwnedAchievements(id)
        sendJson(res, 200, {
          ownedMountIds: ownedAchievements.map((achievement) => achievement.id).filter(Boolean),
          ownedMountNames: ownedAchievements.map((achievement) => achievement.name).filter(Boolean),
        })
        return
      }
    } catch (error) {
      sendJson(res, error.status || 500, { error: getErrorMessage(error) })
      return
    }

    next()
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

function getErrorMessage(error) {
  if (error?.status === 404) {
    return "That character could not be found in FFXIV Collect."
  }

  return "Character sync is unavailable right now."
}
