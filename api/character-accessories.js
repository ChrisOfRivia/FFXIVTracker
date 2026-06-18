import { getOwnedAccessories } from "../server/characterSync.js"

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." })
    return
  }

  const id = req.query.id

  if (!id) {
    res.status(400).json({ error: "Character id is required." })
    return
  }

  try {
    const ownedAccessories = await getOwnedAccessories(id)
    res.status(200).json({
      ownedMountIds: ownedAccessories.map((accessory) => accessory.id).filter(Boolean),
      ownedMountNames: ownedAccessories.map((accessory) => accessory.name).filter(Boolean),
    })
  } catch (error) {
    res.status(error.status || 500).json({
      error:
        error.status === 404
          ? "That character could not be found in FFXIV Collect."
          : "Character sync is unavailable right now.",
    })
  }
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}
