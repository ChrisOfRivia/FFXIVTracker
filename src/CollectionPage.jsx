import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DATA_CENTER_REGION,
  REGIONS,
  WORLD_DATA_CENTER,
  getDataCentersByRegion,
  getWorldsByDataCenter,
} from "../shared/ffxivWorlds.js";

const SOURCE_ICONS = {
  Unknown: "/icons/unknown.png",
  Trial: "/icons/trial.png",
  Achievement: "/icons/achievement.png",
  Battle: "/icons/trial.png",
  Character: "/icons/character.png",
  Event: "/icons/seasonal.png",
  Exploration: "/icons/voyages.png",
  "Grand Company": "/icons/gc.png",
  Items: "/icons/treasure.png",
  Legacy: "/icons/achievement.png",
  Quest: "/icons/msq.png",
  Quests: "/icons/msq.png",
  "Wondrous Tails": "/icons/trails.png",
  Premium: "/icons/store.png",
  "V&C Dungeon": "/icons/trissant.png",
  "Cosmic Exploration": "/icons/cosmocredit.png",
  Raid: "/icons/raid.png",
  PvP: "/icons/pvp.png",
  "Deep Dungeon": "/icons/deepdungeon.png",
  Tribal: "/icons/tribal.png",
  "Treasure Hunt": "/icons/treasure.png",
  "Occult Crescent": "/icons/crescent.png",
  "Chaotic Raid": "/icons/chaotic.png",
  Hunts: "/icons/hunt.png",
  Gathering: "/icons/gather.png",
  FATE: "/icons/fate.png",
  Purchase: "/icons/purchase.png",
  "Island Sanctuary": "/icons/sanctuary.png",
  "Gold Saucer": "/icons/saucer.png",
  Skybuilders: "/icons/deliveries.png",
  Bozja: "/icons/bozja.png",
  Crafting: "/icons/crafting.png",
  Eureka: "/icons/lockbox.png",
  Dungeon: "/icons/dungeon.png",
  Venture: "/icons/retainer.png",
  Voyages: "/icons/voyages.png",
  "Crafting & Gathering": "/icons/crafting.png",
  Other: "/icons/special.png",
};

const MOUNT_TYPE_GROUPS = [
  {
    label: "Instances",
    types: [
      "Dungeon",
      "Raid",
      "Trial",
      "Chaotic Raid",
      "Deep Dungeon",
      "V&C Dungeon",
      "PvP",
    ],
  },
  {
    label: "Exploration",
    types: ["Eureka", "Occult Crescent", "Treasure Hunt", "Voyages", "Bozja"],
  },
  {
    label: "Progression",
    types: ["Quest", "Achievement", "FATE", "Hunts"],
  },
  {
    label: "Side Content",
    types: [
      "Tribal",
      "Island Sanctuary",
      "Gold Saucer",
      "Cosmic Exploration",
      "Wondrous Tails",
      "Skybuilders",
      "Gathering",
      "Crafting",
    ],
  },
  {
    label: "Special",
    types: ["Event", "Premium", "Purchase", "Other"],
  },
];

const MINION_TYPE_GROUPS = [
  {
    label: "Instances",
    types: [
      "Dungeon",
      "Raid",
      "Trial",
      "Chaotic Raid",
      "Deep Dungeon",
      "V&C Dungeon",
      "PvP",
    ],
  },
  {
    label: "Exploration",
    types: [
      "Eureka",
      "Occult Crescent",
      "Treasure Hunt",
      "Voyages",
      "Bozja",
      "Venture",
    ],
  },
  {
    label: "Progression",
    types: ["Quest", "Achievement", "FATE", "Hunts"],
  },
  {
    label: "Side Content",
    types: [
      "Tribal",
      "Island Sanctuary",
      "Gold Saucer",
      "Cosmic Exploration",
      "Wondrous Tails",
      "Skybuilders",
      "Gathering",
      "Crafting",
    ],
  },
  {
    label: "Special",
    types: ["Event", "Premium", "Purchase", "Other"],
  },
];

const ACHIEVEMENT_TYPE_GROUPS = [
  {
    label: "Disciplines",
    types: ["Battle", "PvP", "Character", "Items"],
  },
  {
    label: "Adventuring",
    types: ["Crafting & Gathering", "Quests", "Exploration", "Grand Company"],
  },
  {
    label: "Archive",
    types: ["Legacy"],
  },
];

const EXPANSION_NAMES = {
  ARR: "A Realm Reborn",
  HW: "Heavensward",
  SB: "Stormblood",
  SHB: "Shadowbringers",
  EW: "Endwalker",
  DT: "Dawntrail",
};

const EXPANSION_OPTIONS = Object.entries(EXPANSION_NAMES).map(
  ([code, fullName]) => ({
    code,
    label: code,
    fullName,
    icon: getExpansionIcon(code),
  }),
);

const GARLAND_TYPE_MAP = {
  Achievement: "achievement",
  Fate: "fate",
  FATE: "fate",
  Item: "item",
  Leve: "leve",
  Mob: "mob",
  NPC: "npc",
  Quest: "quest",
};

const INSTANCE_TYPES = new Set([
  "Trial",
  "Raid",
  "Dungeon",
  "Deep Dungeon",
  "Chaotic Raid",
  "V&C Dungeon",
]);

const MOGSTATION_SOURCE_TEXT = "Online Store";

const WIKI_TITLE_OVERRIDES = {
  "Sinus Ardonum": "Sinus Ardorum",
  "The Palace of the Dead": "Palace of the Dead",
};

const GARLAND_CURRENCY_NAME_OVERRIDES = {
  "Achievement Certificates": "Achievement Certificate",
  "Ananta Dreamstaves": "Ananta Dreamstave",
  "Bicolor Gemstone Vouchers": "Bicolor Gemstone Voucher",
  "Bozjan Clusters": "Bozjan Cluster",
  "Bottles Of Exciting Tonic": "Bottle Of Exciting Tonic",
  "Burning Horns": "Burning Horn",
  "Chi Bolts": "Chi Bolt",
  "Chunks of Sanguinite": "Sanguinite",
  "Clan Mark Logs": "Clan Mark Log",
  "Corvosi Manuscripts": "Corvosi Manuscript",
  Cosmocredits: "Cosmocredit",
  "Enlightenment Silver Pieces": "Enlightenment Silver Piece",
  "Fae Fancies": "Fae Fancy",
  "First Light Relics": "First Light Relic",
  "Formidable Cog": "Formidable Cog",
  "Faux Leaves": "Faux Leaf",
  "Fete Tokens": "Fete Token",
  "Gelmorran Potsherds": "Gelmorran Potsherd",
  Gil: "Gil",
  "Gold Chocobo Feathers": "Gold Chocobo Feather",
  "Guardian Arkveld Certificates": "Guardian Arkveld Certificate",
  "Hammered Frogments": "Hammered Frogment",
  "Ixion Horns": "Ixion Horn",
  "Mount Tokens": "Mount Token",
  "Oizys Token Booklets": "Oizys Token Booklet",
  "Orange Gatherer's Scrips": "Orange Gatherer's Scrip",
  "Omicron Omnitokens": "Omicron Omnitoken",
  "Phaenna Token Booklets": "Phaenna Token Booklet",
  "Pieces of Corvosi Brass": "Corvosi Brass",
  "Resplendent Feathers": "Resplendent Feather",
  "Sacks of Nuts": "Sack of Nuts",
  "Sacks Of Nuts": "Sack Of Nuts",
  "Seafarer's Cowries": "Seafarer's Cowrie",
  "Shishu Coins": "Shishu Coin",
  "Sil'dihn Silvers": "Sil'dihn Silver",
  "Skybuilders' Scrips": "Skybuilders' Scrip",
  "Trophy Crystals": "Trophy Crystal",
  "Turali Bicolor Gemstone Vouchers": "Turali Bicolor Gemstone Voucher",
  "Ttokrrone Scales": "Ttokrrone Scale",
  "Twilight Gemstones": "Twilight Gemstone",
  "Vegetal Vouchers": "Vegetal Voucher",
  "Wolf Marks": "Wolf Mark",
};

const INITIAL_CHARACTER_RESULTS_COUNT = 12;
const DEFAULT_INITIAL_RENDER_COUNT = 180;
const DEFAULT_RENDER_BATCH_SIZE = 120;
const ACHIEVEMENT_INITIAL_RENDER_COUNT = 120;
const ACHIEVEMENT_RENDER_BATCH_SIZE = 120;
const DEFAULT_CHARACTER_FORM = {
  region: "",
  dataCenter: "",
  world: "",
  name: "",
};

const EMPTY_CHARACTER_SYNC_STATE = {
  character: null,
  ownedMountIds: [],
  ownedMountNames: [],
};

function CollectionPage({ config }) {
  const typeGroups = getTypeGroups(config.typeGroupVariant);
  const isAccessoryPage = config.typeGroupVariant === "accessories";
  const [mounts, setMounts] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedExpansions, setSelectedExpansions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownedFilter, setOwnedFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedMount, setSelectedMount] = useState(null);
  const [showCharacterSync, setShowCharacterSync] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [renderWindow, setRenderWindow] = useState(() => ({
    key: "",
    count: getInitialRenderCount(config.typeGroupVariant),
  }));
  const loadMoreRef = useRef(null);
  const [characterForm, setCharacterForm] = useState(DEFAULT_CHARACTER_FORM);
  const [characterResults, setCharacterResults] = useState([]);
  const [characterStatus, setCharacterStatus] = useState({
    tone: "idle",
    message: "",
  });
  const [characterPanelStatus, setCharacterPanelStatus] = useState({
    tone: "idle",
    message: "",
  });
  const [isSearchingCharacters, setIsSearchingCharacters] = useState(false);
  const [isSyncingCharacter, setIsSyncingCharacter] = useState(false);
  const [characterSyncState, setCharacterSyncState] = useState(() =>
    isAccessoryPage
      ? EMPTY_CHARACTER_SYNC_STATE
      : getStoredCharacterSyncState(config.characterStorageKey),
  );
  const [manualOwnedMountIds, setManualOwnedMountIds] = useState(() =>
    isAccessoryPage
      ? getStoredOwnedCollectableIds(config.ownershipStorageKey)
      : [],
  );
  const [favoriteMountIds, setFavoriteMountIds] = useState(() =>
    getStoredFavoriteMountIds(config.favoritesStorageKey),
  );

  useEffect(() => {
    fetch(config.dataEndpoint)
      .then((response) => response.json())
      .then((data) => {
        setMounts(Array.isArray(data.results) ? data.results : []);
      });
  }, [config.dataEndpoint]);

  useEffect(() => {
    if (!config.detailHashEnabled || mounts.length === 0) {
      return undefined;
    }

    function syncSelectedCollectableFromHash() {
      const detailId = getDetailIdFromHash(window.location.hash, config.key);

      if (!detailId) {
        setSelectedMount(null);
        return;
      }

      setSelectedMount(mounts.find((mount) => mount.id === detailId) || null);
    }

    syncSelectedCollectableFromHash();
    window.addEventListener("hashchange", syncSelectedCollectableFromHash);

    return () => {
      window.removeEventListener("hashchange", syncSelectedCollectableFromHash);
    };
  }, [config.detailHashEnabled, config.key, mounts]);

  useEffect(() => {
    document.body.style.overflow =
      selectedMount || showCharacterSync ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMount, showCharacterSync]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedMount(null);
        if (
          config.detailHashEnabled &&
          getDetailIdFromHash(window.location.hash, config.key)
        ) {
          setRouteHash(`/${config.key}`);
        }
        setShowCharacterSync(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [config.detailHashEnabled, config.key]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTopButton(window.scrollY > 360);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isAccessoryPage) {
      return undefined;
    }

    if (characterSyncState.character) {
      window.localStorage.setItem(
        config.characterStorageKey,
        JSON.stringify(characterSyncState),
      );
      return;
    }

    window.localStorage.removeItem(config.characterStorageKey);
  }, [characterSyncState, config.characterStorageKey, isAccessoryPage]);

  useEffect(() => {
    if (!isAccessoryPage || !config.ownershipStorageKey) {
      return undefined;
    }

    if (manualOwnedMountIds.length > 0) {
      window.localStorage.setItem(
        config.ownershipStorageKey,
        JSON.stringify(manualOwnedMountIds),
      );
      return undefined;
    }

    window.localStorage.removeItem(config.ownershipStorageKey);
    return undefined;
  }, [
    config.ownershipStorageKey,
    isAccessoryPage,
    manualOwnedMountIds,
  ]);

  useEffect(() => {
    if (favoriteMountIds.length > 0) {
      window.localStorage.setItem(
        config.favoritesStorageKey,
        JSON.stringify(favoriteMountIds),
      );
      return;
    }

    window.localStorage.removeItem(config.favoritesStorageKey);
  }, [favoriteMountIds, config.favoritesStorageKey]);

  const syncedCharacter = isAccessoryPage ? null : characterSyncState.character;
  const ownedSourceMountIds = isAccessoryPage
    ? manualOwnedMountIds
    : characterSyncState.ownedMountIds;
  const ownedSourceMountNames = useMemo(
    () => (isAccessoryPage ? [] : characterSyncState.ownedMountNames),
    [characterSyncState.ownedMountNames, isAccessoryPage],
  );
  const ownedMountIdSet = useMemo(
    () => new Set(ownedSourceMountIds),
    [ownedSourceMountIds],
  );
  const ownedMountNameSet = useMemo(
    () => new Set(ownedSourceMountNames.map(normalizeMountOwnershipName)),
    [ownedSourceMountNames],
  );
  const favoriteMountIdSet = useMemo(
    () => new Set(favoriteMountIds),
    [favoriteMountIds],
  );
  const ownedMountCount = ownedSourceMountIds.length;
  const totalMountCount = mounts.length;
  const trimmedSearchQuery = searchQuery.trim();
  const normalizedSearchQuery = trimmedSearchQuery.toLowerCase();
  const initialRenderCount = getInitialRenderCount(config.typeGroupVariant);
  const renderBatchSize = getRenderBatchSize(config.typeGroupVariant);
  const visibleTypeGroups = useMemo(() => {
    if (!isAccessoryPage) {
      return typeGroups;
    }

    return getVisibleTypeGroups(typeGroups, mounts, config);
  }, [config, isAccessoryPage, mounts, typeGroups]);
  const ownershipStateKey = isAccessoryPage
    ? manualOwnedMountIds.join("|")
    : [
        characterSyncState.ownedMountIds.join("|"),
        characterSyncState.ownedMountNames.join("|"),
      ].join("|");
  const renderWindowKey = [
    config.typeGroupVariant,
    mounts.length,
    selectedTypes.join("|"),
    selectedExpansions.join("|"),
    normalizedSearchQuery,
    ownedFilter,
    showFavoritesOnly ? "favorites" : "all",
    favoriteMountIds.join("|"),
    ownershipStateKey,
  ].join("::");

  const filteredMounts = useMemo(() => {
    return mounts.filter((mount) => {
      const mountType = getCollectableType(mount, config);
      const expansion = getExpansion(mount.patch);
      const matchesSearch =
        normalizedSearchQuery === "" ||
        mount.name.toLowerCase().includes(normalizedSearchQuery) ||
        getCollectableSourceText(mount, config)
          .toLowerCase()
          .includes(normalizedSearchQuery) ||
        (mount.description || "").toLowerCase().includes(normalizedSearchQuery);

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(mountType);
      const matchesExpansion =
        selectedExpansions.length === 0 ||
        selectedExpansions.includes(expansion);
      const mountIsOwned = isMountOwned(
        mount,
        syncedCharacter,
        ownedMountIdSet,
        ownedMountNameSet,
      );
      const matchesOwned =
        ownedFilter === "all" ||
        (ownedFilter === "owned" && mountIsOwned) ||
        (ownedFilter === "unowned" && !mountIsOwned);
      const matchesFavorites =
        !showFavoritesOnly || favoriteMountIdSet.has(mount.id);

      return (
        matchesType &&
        matchesExpansion &&
        matchesSearch &&
        matchesOwned &&
        matchesFavorites
      );
    });
  }, [
    config,
    favoriteMountIdSet,
    mounts,
    normalizedSearchQuery,
    ownedFilter,
    ownedMountIdSet,
    ownedMountNameSet,
    selectedExpansions,
    selectedTypes,
    showFavoritesOnly,
    syncedCharacter,
  ]);
  const visibleMountCount =
    renderWindow.key === renderWindowKey
      ? renderWindow.count
      : initialRenderCount;
  const hasMoreMounts = visibleMountCount < filteredMounts.length;

  const visibleMounts = filteredMounts.slice(0, visibleMountCount);

  const showMoreMounts = useCallback(() => {
    setRenderWindow((currentWindow) => {
      const currentCount =
        currentWindow.key === renderWindowKey
          ? currentWindow.count
          : initialRenderCount;

      return {
        key: renderWindowKey,
        count: Math.min(currentCount + renderBatchSize, filteredMounts.length),
      };
    });
  }, [
    filteredMounts.length,
    initialRenderCount,
    renderBatchSize,
    renderWindowKey,
  ]);

  useEffect(() => {
    if (!hasMoreMounts) {
      return undefined;
    }

    const loadMoreElement = loadMoreRef.current;

    if (
      !loadMoreElement ||
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        showMoreMounts();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [filteredMounts.length, hasMoreMounts, renderBatchSize, showMoreMounts]);
  const showFavoritesEmptyState =
    showFavoritesOnly && favoriteMountIds.length === 0;
  const showFavoritesFilteredEmptyState =
    showFavoritesOnly &&
    favoriteMountIds.length > 0 &&
    filteredMounts.length === 0;
  const showOwnershipControls = isAccessoryPage || Boolean(syncedCharacter);
  const showOwnedEmptyState =
    showOwnershipControls &&
    ownedFilter === "owned" &&
    ownedMountCount === 0 &&
    filteredMounts.length === 0 &&
    !showFavoritesOnly;

  function toggleSelection(value, selectedValues, setSelectedValues) {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
      return;
    }

    setSelectedValues([...selectedValues, value]);
  }

  function openMountDetails(mount) {
    setSelectedMount(mount);

    if (config.detailHashEnabled) {
      setRouteHash(`/${config.key}/${mount.id}`);
    }
  }

  function closeMountDetails() {
    setSelectedMount(null);

    if (
      config.detailHashEnabled &&
      getDetailIdFromHash(window.location.hash, config.key)
    ) {
      setRouteHash(`/${config.key}`);
    }
  }

  function toggleFavoriteMount(mountId) {
    setFavoriteMountIds((currentIds) => {
      if (currentIds.includes(mountId)) {
        return currentIds.filter((id) => id !== mountId);
      }

      return [...currentIds, mountId];
    });
  }

  function openCharacterSyncModal() {
    if (isAccessoryPage) {
      return;
    }

    setCharacterForm(DEFAULT_CHARACTER_FORM);
    setCharacterResults([]);
    setCharacterStatus({ tone: "idle", message: "" });
    setCharacterPanelStatus({ tone: "idle", message: "" });
    setShowCharacterSync(true);
  }

  function toggleManualMountOwnership(mountId) {
    if (!isAccessoryPage) {
      return;
    }

    setManualOwnedMountIds((currentIds) => {
      if (currentIds.includes(mountId)) {
        return currentIds.filter((id) => id !== mountId);
      }

      return [...currentIds, mountId];
    });
  }

  function clearManualOwnership() {
    if (!isAccessoryPage) {
      return;
    }

    setManualOwnedMountIds([]);
  }

  function handleCharacterFieldChange(field, value) {
    setCharacterForm((currentForm) => {
      if (field === "region") {
        const nextDataCenters = getDataCentersByRegion(value);
        const nextDataCenter = nextDataCenters.includes(currentForm.dataCenter)
          ? currentForm.dataCenter
          : "";
        const nextWorlds = getWorldsByDataCenter(nextDataCenter);

        return {
          ...currentForm,
          region: value,
          dataCenter: nextDataCenter,
          world: nextWorlds.includes(currentForm.world)
            ? currentForm.world
            : "",
        };
      }

      if (field === "dataCenter") {
        const nextWorlds = getWorldsByDataCenter(value);

        return {
          ...currentForm,
          region: DATA_CENTER_REGION[value] || currentForm.region,
          dataCenter: value,
          world: nextWorlds.includes(currentForm.world)
            ? currentForm.world
            : "",
        };
      }

      if (field === "world") {
        const nextDataCenter =
          WORLD_DATA_CENTER[value] || currentForm.dataCenter;

        return {
          ...currentForm,
          region: DATA_CENTER_REGION[nextDataCenter] || currentForm.region,
          dataCenter: nextDataCenter,
          world: value,
        };
      }

      return {
        ...currentForm,
        [field]: value,
      };
    });
  }

  async function handleCharacterSearch(event) {
    event.preventDefault();

    const trimmedName = characterForm.name.trim();

    if (!trimmedName) {
      setCharacterStatus({
        tone: "error",
        message: "Enter a character name to search.",
      });
      setCharacterResults([]);
      return;
    }

    setIsSearchingCharacters(true);
    setCharacterStatus({ tone: "idle", message: "" });

    try {
      const searchUrl = new URL(
        "/api/character-search",
        window.location.origin,
      );
      searchUrl.searchParams.set("name", trimmedName);

      if (characterForm.world) {
        searchUrl.searchParams.set("server", characterForm.world);
      }

      if (characterForm.dataCenter) {
        searchUrl.searchParams.set("dataCenter", characterForm.dataCenter);
      }

      const response = await fetch(searchUrl);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Character sync is unavailable right now.",
        );
      }

      setCharacterResults(payload.characters || []);
      setCharacterStatus({
        tone: payload.characters?.length ? "success" : "muted",
        message: payload.characters?.length
          ? `Found ${payload.characters.length} possible character${payload.characters.length === 1 ? "" : "s"}.`
          : "No matching characters were found. Try a broader search or a different world.",
      });
    } catch (error) {
      setCharacterResults([]);
      setCharacterStatus({ tone: "error", message: error.message });
    } finally {
      setIsSearchingCharacters(false);
    }
  }

  async function syncCharacterMounts(character, { closeModal = false } = {}) {
    setIsSyncingCharacter(true);
    setCharacterStatus({ tone: "idle", message: "" });
    setCharacterPanelStatus({ tone: "idle", message: "" });

    try {
      const mountUrl = new URL(config.syncEndpoint, window.location.origin);
      mountUrl.searchParams.set("id", character.id);

      const response = await fetch(mountUrl, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Character sync is unavailable right now.",
        );
      }

      const ownedMountIds = payload.ownedMountIds || [];
      const ownedMountNames = payload.ownedMountNames || [];
      const ownedCount = ownedMountIds.length;
      const isAccessorySync = config.typeGroupVariant === "accessories";

      setCharacterSyncState({
        character,
        ownedMountIds,
        ownedMountNames,
      });
      setCharacterStatus({
        tone: "success",
        message:
          isAccessorySync && ownedCount === 0
            ? `${character.name} synced successfully, but FFXIV Collect returned no accessory ownership.`
            : `${character.name} synced successfully.`,
      });
      setCharacterPanelStatus({
        tone: isAccessorySync && ownedCount === 0 ? "muted" : "success",
        message:
          `${character.name} refreshed: ${ownedCount}/${totalMountCount} ${config.pluralLabel} owned.` +
          (isAccessorySync && ownedCount === 0
            ? " FFXIV Collect currently returns no accessory ownership for this character."
            : ""),
      });

      if (closeModal) {
        setShowCharacterSync(false);
      }
    } catch (error) {
      setCharacterStatus({ tone: "error", message: error.message });
      setCharacterPanelStatus({ tone: "error", message: error.message });
    } finally {
      setIsSyncingCharacter(false);
    }
  }

  async function handleCharacterSync(character) {
    await syncCharacterMounts(character, { closeModal: true });
  }

  async function refreshCharacterSync() {
    if (!syncedCharacter) {
      return;
    }

    await syncCharacterMounts(syncedCharacter);
  }

  function clearCharacterSync() {
    setCharacterSyncState(EMPTY_CHARACTER_SYNC_STATE);
    setCharacterForm(DEFAULT_CHARACTER_FORM);
    setOwnedFilter("all");
    setCharacterResults([]);
    setCharacterStatus({ tone: "idle", message: "" });
    setCharacterPanelStatus({
      tone: "muted",
      message: "Character sync cleared.",
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const selectedMountExpansion = selectedMount
    ? getExpansion(selectedMount.patch)
    : null;
  const selectedMountSourceType = selectedMount
    ? getCollectableType(selectedMount, config)
    : "Unknown";
  const selectedMountIsFavorite = selectedMount
    ? favoriteMountIdSet.has(selectedMount.id)
    : false;
  const selectedMountIsAchievement = config.typeGroupVariant === "achievements";
  const selectedMountVerminion = selectedMount?.verminion || null;
  const selectedMountRaceName = selectedMount?.race?.name || null;
  const detailCardClassName = getDetailCardClassName(config.typeGroupVariant);
  const availableDataCenters = getDataCentersByRegion(characterForm.region);
  const availableWorlds = getWorldsByDataCenter(characterForm.dataCenter);
  const visibleCharacterResults = characterResults.slice(
    0,
    INITIAL_CHARACTER_RESULTS_COUNT,
  );

  return (
    <>
      {selectedMount ? (
        <div
          className="mount-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mount-detail-title"
          onClick={closeMountDetails}
        >
          <div
            className={detailCardClassName}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={
                selectedMountIsFavorite
                  ? "mount-detail-favorite active"
                  : "mount-detail-favorite"
              }
              onClick={() => toggleFavoriteMount(selectedMount.id)}
              aria-label={
                selectedMountIsFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              aria-pressed={selectedMountIsFavorite}
              type="button"
            >
              ★
            </button>
            <button
              className="mount-detail-close"
              onClick={closeMountDetails}
              aria-label="Close mount details"
              type="button"
            >
              ×
            </button>

            <div className="mount-detail-header">
              <div className="mount-detail-badges">
                <span className="mount-detail-badge mount-detail-expansion-badge">
                  <img
                    src={getExpansionIcon(selectedMountExpansion)}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{getExpansionName(selectedMountExpansion)}</span>
                </span>
                <span className="mount-detail-badge mount-detail-type-badge">
                  <img
                    src={
                      SOURCE_ICONS[selectedMountSourceType] ||
                      "/icons/unknown.png"
                    }
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{selectedMountSourceType}</span>
                </span>
              </div>

              <div className="mount-detail-title-row">
                <div className="mount-detail-icon">
                  <img
                    src={selectedMount.icon || selectedMount.image}
                    alt=""
                    aria-hidden="true"
                  />
                </div>

                <div className="mount-detail-title-group">
                  <h2 id="mount-detail-title">{selectedMount.name}</h2>
                  <p className="mount-detail-subtitle">
                    {getDetailSubtitle(selectedMount, config)}
                  </p>
                  {selectedMount.description ? (
                    <p className="mount-detail-description">
                      {selectedMount.description}
                    </p>
                  ) : null}
                  {selectedMountIsAchievement ? (
                    <p className="achievement-detail-earned">
                      {config.ownershipLabel || "Earned by:"}{" "}
                      <strong>{selectedMount.owned}</strong>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {selectedMountIsAchievement ? null : (
              <div className="mount-detail-body">
                <div className="mount-detail-image">
                  <img
                    src={getCollectableImage(selectedMount)}
                    alt={selectedMount.name}
                  />
                </div>

                <div className="mount-detail-info">
                  <div className="mount-detail-owned">
                    {config.ownershipLabel || "Owned by:"}{" "}
                    <strong>{selectedMount.owned}</strong>
                    {showOwnershipControls ? (
                      <p className="mount-detail-character-status">
                        {isAccessoryPage
                          ? "Manual ownership on this device: "
                          : `${syncedCharacter.name}: `}
                        <strong>
                          {isMountOwned(
                            selectedMount,
                            syncedCharacter,
                            ownedMountIdSet,
                            ownedMountNameSet,
                          )
                            ? isAccessoryPage
                              ? "Owned locally"
                              : "Owned"
                            : isAccessoryPage
                              ? "Missing locally"
                              : "Missing"}
                        </strong>
                      </p>
                    ) : null}
                    {isAccessoryPage ? (
                      <button
                        className={
                          isMountOwned(
                            selectedMount,
                            syncedCharacter,
                            ownedMountIdSet,
                            ownedMountNameSet,
                          )
                            ? "mount-manual-owned-button active"
                            : "mount-manual-owned-button"
                        }
                        type="button"
                        onClick={() =>
                          toggleManualMountOwnership(selectedMount.id)
                        }
                        aria-pressed={isMountOwned(
                          selectedMount,
                          syncedCharacter,
                          ownedMountIdSet,
                          ownedMountNameSet,
                        )}
                      >
                        {isMountOwned(
                          selectedMount,
                          syncedCharacter,
                          ownedMountIdSet,
                          ownedMountNameSet,
                        )
                          ? "Mark Missing"
                          : "Mark Owned"}
                      </button>
                    ) : null}
                  </div>

                  {selectedMountVerminion ? (
                    <details className="minion-verminion-panel">
                      <summary className="minion-verminion-header">
                        <h3>Lord of Verminion</h3>
                        {selectedMountRaceName ? (
                          <span>{selectedMountRaceName}</span>
                        ) : null}
                      </summary>

                      <div className="minion-verminion-content">
                        <dl className="minion-verminion-stats">
                          {getVerminionStats(selectedMountVerminion).map(
                            (stat) => (
                              <div key={stat.key}>
                                <dt>{stat.label}</dt>
                                <dd>
                                  {stat.key === "speed" ? (
                                    <span
                                      className="minion-verminion-speed"
                                      aria-label={`${stat.value} out of 4 speed`}
                                    >
                                      {Array.from({ length: 4 }).map(
                                        (_, index) => (
                                          <span
                                            key={index}
                                            className={
                                              index < stat.value ? "active" : ""
                                            }
                                          />
                                        ),
                                      )}
                                    </span>
                                  ) : (
                                    stat.value
                                  )}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>

                        <div className="minion-verminion-meta">
                          {typeof selectedMountVerminion.area_attack ===
                          "boolean" ? (
                            <div>
                              <span>Auto-attack</span>
                              <strong>
                                {getVerminionAutoAttack(selectedMountVerminion)}
                              </strong>
                            </div>
                          ) : null}

                          {getVerminionStrengths(selectedMountVerminion)
                            .length > 0 ? (
                            <div>
                              <span>Strengths</span>
                              <div className="minion-verminion-strengths">
                                {getVerminionStrengths(
                                  selectedMountVerminion,
                                ).map((strength) => (
                                  <strong key={strength}>{strength}</strong>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {selectedMountVerminion.skill ? (
                          <div className="minion-verminion-skill">
                            <strong>{selectedMountVerminion.skill}</strong>
                            {selectedMountVerminion.skill_description ? (
                              <p>
                                {formatVerminionSkillDescription(
                                  selectedMountVerminion.skill_description,
                                )}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="minion-verminion-footer">
                          {Number.isFinite(
                            selectedMountVerminion.skill_cost,
                          ) ? (
                            <div>
                              <span>Points</span>
                              <strong>
                                {selectedMountVerminion.skill_cost}
                              </strong>
                            </div>
                          ) : null}

                          {getVerminionSkillTypeName(selectedMountVerminion) ? (
                            <div>
                              <span>Special Type</span>
                              <strong>
                                {getVerminionSkillTypeName(
                                  selectedMountVerminion,
                                )}
                              </strong>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  ) : null}

                  <div className="mount-detail-section">
                    <h3>How to Get It</h3>

                    <div className="mount-detail-sources">
                      {getSourceList(selectedMount).map((source, index) => {
                        const sourceLinks = getSourceLinks(
                          source,
                          selectedMount,
                        );
                        const primarySourceLink =
                          getPrimarySourceLink(sourceLinks);

                        return (
                          <div
                            key={`${selectedMount.id}-${source.type}-${index}`}
                            className="mount-detail-source"
                          >
                            <div className="mount-detail-source-header">
                              <img
                                src={
                                  SOURCE_ICONS[source.type] ||
                                  "/icons/unknown.png"
                                }
                                alt={source.type}
                              />
                              <span>{source.type}</span>
                            </div>

                            {primarySourceLink ? (
                              <a
                                className="mount-detail-source-copy mount-detail-source-copy-link"
                                href={primarySourceLink.href}
                                target={
                                  primarySourceLink.external === false
                                    ? undefined
                                    : "_blank"
                                }
                              rel={
                                  primarySourceLink.external === false
                                    ? undefined
                                    : "noreferrer"
                                }
                              >
                                {getSourceDisplayText(source)}
                              </a>
                            ) : (
                              <p className="mount-detail-source-copy">
                                {getSourceDisplayText(source)}
                              </p>
                            )}

                            {sourceLinks.length > 0 ? (
                              <div className="mount-detail-source-links">
                                {sourceLinks.map((link) => (
                                  <a
                                    key={`${selectedMount.id}-${source.type}-${link.label}-${link.href}`}
                                    className="mount-detail-source-pill"
                                    href={link.href}
                                    target={
                                      link.external === false
                                        ? undefined
                                        : "_blank"
                                    }
                                    rel={
                                      link.external === false
                                        ? undefined
                                        : "noreferrer"
                                    }
                                  >
                                    {link.label}
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!isAccessoryPage && showCharacterSync ? (
        <div
          className="character-sync-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="character-sync-title"
          onClick={() => setShowCharacterSync(false)}
        >
          <div
            className="character-sync-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="character-sync-close"
              onClick={() => setShowCharacterSync(false)}
              aria-label="Close character sync"
              type="button"
            >
              ×
            </button>

            <div className="character-sync-header">
              <p className="character-sync-eyebrow">Character Sync</p>
              <h2 id="character-sync-title">Find your character</h2>
              <p className="character-sync-copy">
                Search by region, data center, world, and full or partial
                character name, then sync owned {config.pluralLabel} from FFXIV
                Collect.
              </p>
              <p className="character-sync-warning">
                If your{" "}
                <a
                  href="https://na.finalfantasyxiv.com/lodestone/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Lodestone
                </a>{" "}
                achievements or {config.singularLabel}-related visibility
                settings are private, some {config.pluralLabel} may not show as
                owned until those settings are made public there.
              </p>
              {config.typeGroupVariant === "accessories" ? (
                <p className="character-sync-warning">
                  Fashion accessory ownership is not consistently exposed by
                  FFXIV Collect yet, so this sync may still return no owned
                  accessories even after a successful search.
                </p>
              ) : null}
            </div>

            <form
              className="character-sync-form"
              onSubmit={handleCharacterSearch}
            >
              <label className="character-sync-field">
                <span>Region</span>
                <select
                  value={characterForm.region}
                  onChange={(event) =>
                    handleCharacterFieldChange("region", event.target.value)
                  }
                >
                  <option value="">All Regions</option>
                  {REGIONS.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="character-sync-field">
                <span>Data Center</span>
                <select
                  value={characterForm.dataCenter}
                  onChange={(event) =>
                    handleCharacterFieldChange("dataCenter", event.target.value)
                  }
                >
                  <option value="">All Data Centers</option>
                  {availableDataCenters.map((dataCenter) => (
                    <option key={dataCenter} value={dataCenter}>
                      {dataCenter}
                    </option>
                  ))}
                </select>
              </label>

              <label className="character-sync-field">
                <span>World</span>
                <select
                  value={characterForm.world}
                  onChange={(event) =>
                    handleCharacterFieldChange("world", event.target.value)
                  }
                >
                  <option value="">All Worlds</option>
                  {availableWorlds.map((world) => (
                    <option key={world} value={world}>
                      {world}
                    </option>
                  ))}
                </select>
              </label>

              <label className="character-sync-field character-sync-name-field">
                <span>Character Name</span>
                <input
                  type="search"
                  value={characterForm.name}
                  onChange={(event) =>
                    handleCharacterFieldChange("name", event.target.value)
                  }
                  placeholder="Enter a character name"
                />
              </label>

              <div className="character-sync-actions">
                <button
                  className="character-sync-button"
                  type="submit"
                  disabled={isSearchingCharacters}
                >
                  {isSearchingCharacters ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {characterStatus.message ? (
              <p
                className={`character-sync-status character-sync-status-${characterStatus.tone}`}
              >
                {characterStatus.message}
              </p>
            ) : null}

            <div className="character-sync-results">
              {visibleCharacterResults.map((character) => (
                <div key={character.id} className="character-result-card">
                  <img src={character.avatar} alt="" aria-hidden="true" />

                  <div className="character-result-copy">
                    <h3>{character.name}</h3>
                    <p>
                      {character.world} - {character.dataCenter} -{" "}
                      {getRegionLabel(character.region)}
                    </p>
                    <span>
                      {character.source === "lodestone"
                        ? "Lodestone search"
                        : "FFXIV Collect search"}
                    </span>
                  </div>

                  <button
                    className="character-sync-button"
                    type="button"
                    onClick={() => handleCharacterSync(character)}
                    disabled={isSyncingCharacter}
                  >
                    {isSyncingCharacter ? "Syncing..." : "Sync"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className={`page-shell ${config.pageClassName}`}>
        <header className="page-header">
          {isAccessoryPage ? (
            <div className="page-header-copy page-header-copy-unsynced">
              <h1>{config.title}</h1>
              <p className="page-header-character page-header-character-muted">
                Mark accessories you own manually. {ownedMountCount}/
                {totalMountCount} {config.pluralLabel} owned on this device.
              </p>
            </div>
          ) : syncedCharacter ? (
            <div className="page-header-row">
              <div className="page-header-spacer" aria-hidden="true" />

              <div className="page-header-copy">
                <h1>{config.title}</h1>
                <p className="page-header-character">
                  {syncedCharacter.name} - {syncedCharacter.world} -{" "}
                  {ownedMountCount}/{totalMountCount} {config.pluralLabel} owned
                </p>
              </div>

              <div className="character-summary-stack">
                <div className="character-summary-card">
                  <div className="character-summary-main">
                    <img
                      src={syncedCharacter.avatar}
                      alt=""
                      aria-hidden="true"
                    />
                    <div className="character-summary-copy">
                      <strong>{syncedCharacter.name}</strong>
                      <span>{getRegionLabel(syncedCharacter.region)}</span>
                      <span>
                        {syncedCharacter.dataCenter} / {syncedCharacter.world}
                      </span>
                    </div>
                  </div>

                  <div className="character-summary-footer">
                    <button
                      className="character-summary-change-button"
                      type="button"
                      onClick={openCharacterSyncModal}
                    >
                      Change Character
                    </button>

                    <div className="character-summary-actions">
                      <button
                        className="character-summary-action character-summary-action-refresh"
                        type="button"
                        onClick={refreshCharacterSync}
                        disabled={isSyncingCharacter}
                        aria-label={`Refresh sync for ${syncedCharacter.name}`}
                        title="Refresh sync"
                      >
                        {"\u21BB"}
                      </button>
                      <button
                        className="character-summary-action character-summary-action-danger"
                        type="button"
                        onClick={clearCharacterSync}
                        disabled={isSyncingCharacter}
                        aria-label={`Clear sync for ${syncedCharacter.name}`}
                        title="Clear sync"
                      />
                    </div>
                  </div>
                </div>

                {characterPanelStatus.message ? (
                  <p
                    className={`character-summary-status character-summary-status-${characterPanelStatus.tone}`}
                  >
                    {characterPanelStatus.message}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="page-header-copy page-header-copy-unsynced">
              <h1>{config.title}</h1>
              <p className="page-header-character page-header-character-muted">
                Sync a character to highlight owned {config.pluralLabel}.
              </p>
              <button
                className="character-launch-button page-header-launch-button"
                onClick={openCharacterSyncModal}
              >
                Sync Character
              </button>
            </div>
          )}
        </header>

        <div className="app-shell">
          <aside className="filters-sidebar">
            <div className="filters-panel">
              <h2>Filters</h2>

              <div className="search-filter">
                <input
                  type="search"
                  className="search-input"
                  placeholder={`Search ${config.pluralLabel}...`}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label={`Search ${config.pluralLabel}`}
                />
              </div>

              <div className="filter-group">
                <div className="filter-heading">
                  <h3>Collection</h3>
                </div>
                {isAccessoryPage ? (
                  <p className="collection-filter-note">
                    Manual ownership is saved locally on this device.
                  </p>
                ) : null}
                {isAccessoryPage ? (
                  <div className="collection-filter-accessory-group">
                    <div className="collection-filter-actions collection-filter-actions-accessories">
                      <button
                        className={
                          ownedFilter === "owned"
                            ? "collection-filter-button active"
                            : "collection-filter-button"
                        }
                        onClick={() =>
                          setOwnedFilter((currentValue) =>
                            currentValue === "owned" ? "all" : "owned",
                          )
                        }
                        title={`Show owned ${config.pluralLabel}`}
                        aria-label={`Show owned ${config.pluralLabel}`}
                        aria-pressed={ownedFilter === "owned"}
                        type="button"
                      >
                        <span
                          className="collection-filter-icon collection-filter-icon-owned"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        className={
                          ownedFilter === "unowned"
                            ? "collection-filter-button active"
                            : "collection-filter-button"
                        }
                        onClick={() =>
                          setOwnedFilter((currentValue) =>
                            currentValue === "unowned" ? "all" : "unowned",
                          )
                        }
                        title={`Show missing ${config.pluralLabel}`}
                        aria-label={`Show missing ${config.pluralLabel}`}
                        aria-pressed={ownedFilter === "unowned"}
                        type="button"
                      >
                        <span
                          className="collection-filter-icon collection-filter-icon-unowned"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        className={
                          showFavoritesOnly
                            ? "collection-filter-button active"
                            : "collection-filter-button"
                        }
                        onClick={() =>
                          setShowFavoritesOnly((currentValue) => !currentValue)
                        }
                        title={`Show favorite ${config.pluralLabel}`}
                        aria-label={`Show favorite ${config.pluralLabel}`}
                        aria-pressed={showFavoritesOnly}
                        type="button"
                      >
                        <span
                          className="collection-filter-icon collection-filter-icon-favorite"
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <button
                      className="collection-filter-clear-owned-button"
                      onClick={clearManualOwnership}
                      title="Clear all manual ownership"
                      aria-label="Clear all manual ownership"
                      type="button"
                      disabled={manualOwnedMountIds.length === 0}
                    >
                      Clear Owned
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      showOwnershipControls
                        ? "collection-filter-actions"
                        : "collection-filter-actions collection-filter-actions-single"
                    }
                  >
                    {showOwnershipControls ? (
                      <button
                        className={
                          ownedFilter === "owned"
                            ? "collection-filter-button active"
                            : "collection-filter-button"
                        }
                        onClick={() =>
                          setOwnedFilter((currentValue) =>
                            currentValue === "owned" ? "all" : "owned",
                          )
                        }
                        title={`Show owned ${config.pluralLabel}`}
                        aria-label={`Show owned ${config.pluralLabel}`}
                        aria-pressed={ownedFilter === "owned"}
                        type="button"
                      >
                        <span
                          className="collection-filter-icon collection-filter-icon-owned"
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                    {showOwnershipControls ? (
                      <button
                        className={
                          ownedFilter === "unowned"
                            ? "collection-filter-button active"
                            : "collection-filter-button"
                        }
                        onClick={() =>
                          setOwnedFilter((currentValue) =>
                            currentValue === "unowned" ? "all" : "unowned",
                          )
                        }
                        title={`Show missing ${config.pluralLabel}`}
                        aria-label={`Show missing ${config.pluralLabel}`}
                        aria-pressed={ownedFilter === "unowned"}
                        type="button"
                      >
                        <span
                          className="collection-filter-icon collection-filter-icon-unowned"
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                    <button
                      className={
                        showFavoritesOnly
                          ? "collection-filter-button active"
                          : "collection-filter-button"
                      }
                      onClick={() =>
                        setShowFavoritesOnly((currentValue) => !currentValue)
                      }
                      title={`Show favorite ${config.pluralLabel}`}
                      aria-label={`Show favorite ${config.pluralLabel}`}
                      aria-pressed={showFavoritesOnly}
                      type="button"
                    >
                      <span
                        className="collection-filter-icon collection-filter-icon-favorite"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="filter-group">
                <div className="filter-heading">
                  <h3>Type</h3>
                  <button
                    className={
                      selectedTypes.length === 0
                        ? "reset-filter-button active"
                        : "reset-filter-button"
                    }
                    onClick={() => setSelectedTypes([])}
                    type="button"
                  >
                    <img src="/icons/all.png" alt="" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="type-filters">
                  {visibleTypeGroups.map((group) => (
                    <div key={group.label} className="type-category">
                      <p className="type-category-title">{group.label}</p>

                      <div className="type-category-buttons">
                        {group.types.map((type) => (
                          <button
                            key={type}
                            className={
                              selectedTypes.includes(type)
                                ? "filter-button type-button active"
                                : "filter-button type-button"
                            }
                            onClick={() =>
                              toggleSelection(
                                type,
                                selectedTypes,
                                setSelectedTypes,
                              )
                            }
                            title={type}
                            type="button"
                          >
                            <img
                              src={SOURCE_ICONS[type]}
                              alt=""
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-heading">
                  <h3>Expansion</h3>
                  <button
                    className={
                      selectedExpansions.length === 0
                        ? "reset-filter-button active"
                        : "reset-filter-button"
                    }
                    onClick={() => setSelectedExpansions([])}
                    type="button"
                  >
                    <img src="/icons/all.png" alt="" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="expansion-filters">
                  {EXPANSION_OPTIONS.map((expansion) => (
                    <button
                      key={expansion.code}
                      className={
                        selectedExpansions.includes(expansion.code)
                          ? "filter-button expansion-button expansion-card active"
                          : "filter-button expansion-button expansion-card"
                      }
                      title={expansion.fullName}
                      onClick={() =>
                        toggleSelection(
                          expansion.code,
                          selectedExpansions,
                          setSelectedExpansions,
                        )
                      }
                      type="button"
                    >
                      <img src={expansion.icon} alt="" aria-hidden="true" />
                      <span className="expansion-label">{expansion.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="content-area">
            {showFavoritesEmptyState ? (
              <div className="mount-empty-state">
                <h2>No favorite {config.pluralLabel} yet</h2>
                <p>
                  Your favorite {config.pluralLabel} will show up here. Favorite
                  a {config.singularLabel} to save it locally on this device.
                </p>
                {config.emptyStateTutorial ? (
                  <img
                    className="mount-empty-state-tutorial"
                    src={config.emptyStateTutorial.imageSrc}
                    alt={config.emptyStateTutorial.imageAlt}
                  />
                ) : null}
              </div>
            ) : showFavoritesFilteredEmptyState ? (
              <div className="mount-empty-state">
                <h2>No favorites match these filters</h2>
                <p>
                  Try clearing a few filters or turn off favorites-only mode to
                  see more {config.pluralLabel} again.
                </p>
              </div>
            ) : showOwnedEmptyState ? (
              <div className="mount-empty-state">
                <h2>No {config.pluralLabel} owned yet</h2>
                <p>
                  {isAccessoryPage
                    ? "Use the manual owned buttons on the cards to mark the accessories you have on this device."
                    : `This character does not have any synced ${config.pluralLabel} yet. Happy collecting!`}
                </p>
              </div>
            ) : null}
            {!showFavoritesEmptyState &&
            !showFavoritesFilteredEmptyState &&
            !showOwnedEmptyState ? (
              <>
                <div className="mount-grid">
                  {visibleMounts.map((mount) => (
                  <div
                    key={mount.id}
                    className={getMountCardClassName(
                      mount,
                      syncedCharacter,
                      ownedMountIdSet,
                      ownedMountNameSet,
                      config.cardClassName,
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => openMountDetails(mount)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openMountDetails(mount);
                      }
                    }}
                  >
                    {favoriteMountIdSet.has(mount.id) ? (
                      <span
                        className="mount-card-favorite"
                        aria-label="Favorited"
                        title="Favorited"
                      >
                        ★
                      </span>
                    ) : null}
                    <div className="mount-patch">
                      <img src={getExpansionIcon(getExpansion(mount.patch))} />
                    </div>
                    <h2>{mount.name}</h2>
                    <div className="mount-image">
                      <img
                        src={getCollectableImage(mount)}
                        alt=""
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mount-owned">
                      <h4>
                        {config.ownershipLabel || "Owned by:"} {mount.owned}
                      </h4>
                      {showOwnershipControls ? (
                        <p className="mount-character-status">
                          {isMountOwned(
                            mount,
                            syncedCharacter,
                            ownedMountIdSet,
                            ownedMountNameSet,
                          )
                            ? isAccessoryPage
                              ? "Owned locally"
                              : "Owned"
                            : isAccessoryPage
                              ? "Missing locally"
                              : "Missing"}
                        </p>
                      ) : null}
                      {isAccessoryPage ? (
                        <button
                          className={
                            isMountOwned(
                              mount,
                              syncedCharacter,
                              ownedMountIdSet,
                              ownedMountNameSet,
                            )
                              ? "mount-manual-owned-button active"
                              : "mount-manual-owned-button"
                          }
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleManualMountOwnership(mount.id);
                          }}
                          aria-pressed={isMountOwned(
                            mount,
                            syncedCharacter,
                            ownedMountIdSet,
                            ownedMountNameSet,
                          )}
                        >
                          {isMountOwned(
                            mount,
                            syncedCharacter,
                            ownedMountIdSet,
                            ownedMountNameSet,
                          )
                            ? "Mark Missing"
                            : "Mark Owned"}
                        </button>
                      ) : null}
                    </div>

                    <div className="source-mount">
                      <img
                        src={
                          SOURCE_ICONS[getCollectableType(mount, config)] ||
                          "/icons/unknown.png"
                        }
                        alt=""
                        aria-hidden="true"
                      />
                      <p className="source-text">
                        {getCollectableSourceDisplayText(mount, config)}
                      </p>
                    </div>
                  </div>
                  ))}
                </div>
                {hasMoreMounts ? (
                  <div className="collection-load-more" ref={loadMoreRef}>
                    <button
                      className="collection-load-more-button"
                      type="button"
                      onClick={showMoreMounts}
                    >
                      Load more {config.pluralLabel}
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </main>
        </div>
      </div>

      {showScrollTopButton ? (
        <button
          className="scroll-top-button"
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <span className="scroll-top-button-icon" aria-hidden="true" />
          <span className="scroll-top-button-label">Top</span>
        </button>
      ) : null}
    </>
  );
}

function getTypeGroups(typeGroupVariant) {
  if (typeGroupVariant === "minions") {
    return MINION_TYPE_GROUPS;
  }

  if (typeGroupVariant === "accessories") {
    return MINION_TYPE_GROUPS;
  }

  if (typeGroupVariant === "achievements") {
    return ACHIEVEMENT_TYPE_GROUPS;
  }

  return MOUNT_TYPE_GROUPS;
}

function getInitialRenderCount(typeGroupVariant) {
  if (typeGroupVariant === "achievements") {
    return ACHIEVEMENT_INITIAL_RENDER_COUNT;
  }

  return DEFAULT_INITIAL_RENDER_COUNT;
}

function getRenderBatchSize(typeGroupVariant) {
  if (typeGroupVariant === "achievements") {
    return ACHIEVEMENT_RENDER_BATCH_SIZE;
  }

  return DEFAULT_RENDER_BATCH_SIZE;
}

function getDetailCardClassName(typeGroupVariant) {
  if (typeGroupVariant === "minions") {
    return "mount-detail-card minion-detail-card";
  }

  if (typeGroupVariant === "accessories") {
    return "mount-detail-card minion-detail-card accessory-detail-card";
  }

  if (typeGroupVariant === "achievements") {
    return "mount-detail-card achievement-detail-card";
  }

  return "mount-detail-card";
}

function getDetailIdFromHash(hashValue, collectionKey) {
  const normalizedHash = hashValue.replace(/^#\/?/, "").trim().toLowerCase();
  const detailMatch = normalizedHash.match(
    new RegExp(`^${collectionKey}/(\\d+)$`),
  );

  return detailMatch ? Number(detailMatch[1]) : null;
}

function setRouteHash(pathname) {
  window.history.pushState(null, "", `#${pathname}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function getCollectableType(collectable, config) {
  if (config.typeGroupVariant === "achievements") {
    return getAchievementType(collectable);
  }

  return getPrimarySource(collectable).type;
}

function getCollectableSourceText(collectable, config) {
  if (config.typeGroupVariant === "achievements") {
    return (
      collectable.category?.name || collectable.description || "Achievement"
    );
  }

  return getPrimarySource(collectable).text;
}

function getCollectableSourceDisplayText(collectable, config) {
  if (config.typeGroupVariant === "achievements") {
    return (
      collectable.category?.name || collectable.description || "Achievement"
    );
  }

  return getSourceDisplayText(getPrimarySource(collectable));
}

function getCollectableImage(collectable) {
  return collectable.image || collectable.icon || "/icons/achievement.png";
}

function getDetailSubtitle(collectable, config) {
  const patchText = `Patch ${collectable.patch || "Unknown"}`;

  if (config.typeGroupVariant === "achievements") {
    return `${patchText} - ${collectable.points ?? 0} points`;
  }

  return patchText;
}

function getAchievementType(achievement) {
  return achievement.type?.name || "Achievement";
}

function getPrimarySource(mount) {
  return getSourceList(mount)[0];
}

function getVerminionStats(verminion) {
  return [
    { key: "hp", label: "HP", value: verminion.hp },
    { key: "attack", label: "ATK", value: verminion.attack },
    { key: "defense", label: "DEF", value: verminion.defense },
    { key: "speed", label: "SPD", value: verminion.speed },
    { key: "cost", label: "Cost", value: verminion.cost },
  ].filter((stat) => Number.isFinite(stat.value));
}

function getVerminionAutoAttack(verminion) {
  return verminion.area_attack ? "Area" : "Single-target";
}

function getVerminionStrengths(verminion) {
  return [
    { key: "eye", label: "Eye" },
    { key: "gate", label: "Gate" },
    { key: "shield", label: "Shield" },
  ]
    .filter((strength) => verminion[strength.key])
    .map((strength) => strength.label);
}

function getVerminionSkillTypeName(verminion) {
  return verminion.skill_type?.name || null;
}

function formatVerminionSkillDescription(description) {
  return description.replace(/\*\*/g, "").trim();
}

function getSourceList(mount) {
  if (mount?.sources?.length) {
    return mount.sources.map((source) => ({
      ...source,
      type: source.type || "Unknown",
      text: source.text || "Unknown source",
    }));
  }

  return [{ type: "Unknown", text: "Unknown source" }];
}

function getExpansionIcon(expansion) {
  if (expansion === "ARR") {
    return "/expansions/ARR.png";
  }

  if (expansion === "HW") {
    return "/expansions/HW.webp";
  }

  if (expansion === "SB") {
    return "/expansions/SB.webp";
  }

  if (expansion === "SHB") {
    return "/expansions/SHB.webp";
  }

  if (expansion === "EW") {
    return "/expansions/EW.png";
  }

  if (expansion === "DT") {
    return "/expansions/DT.webp";
  }

  return "/icons/unknown.png";
}

function getExpansionName(expansion) {
  return EXPANSION_NAMES[expansion] || "Unknown Expansion";
}

function getSourceLinks(source, mount) {
  const linkBuilders = getSourceLinkPriority(source);
  const links = linkBuilders
    .map((builder) => builder(source, mount))
    .filter(Boolean);

  return links.filter(
    (link, index) =>
      links.findIndex((entry) => entry.href === link.href) === index,
  );
}

function getPrimarySourceLink(sourceLinks) {
  return sourceLinks[0] || null;
}

function getVendorSourceLink(source) {
  const vendorWikiTitle = getVendorWikiTitle(source);

  if (!vendorWikiTitle) {
    return null;
  }

  return {
    label: "Vendor",
    href: `https://ffxiv.consolegameswiki.com/wiki/${encodeWikiPageTitle(vendorWikiTitle)}`,
  };
}

function getCurrencySourceLink(source) {
  const garlandCurrencyName = getGarlandCurrencyName(source);

  if (!garlandCurrencyName) {
    return null;
  }

  return {
    label: "Garland DB",
    href: `https://www.garlandtools.org/db/#search/${encodeURIComponent(garlandCurrencyName)}`,
  };
}

function getCollectSourceLink(source) {
  if (source.related_type === "Achievement" && source.related_id) {
    return {
      label: "Achievement",
      href: `#/achievements/${source.related_id}`,
      external: false,
    };
  }

  return null;
}

function getMogstationSourceLink(source) {
  if (!isMogstationSource(source)) {
    return null;
  }

  return {
    label: "Mog Station",
    href: "https://store.finalfantasyxiv.com/ffxivstore/en-us/category/11",
  };
}

function getGarlandSourceLink(source) {
  const garlandType = GARLAND_TYPE_MAP[source.related_type];

  if (!garlandType || !source.related_id) {
    return null;
  }

  return {
    label: "Garland DB",
    href: `https://www.garlandtools.org/db/#${garlandType}/${source.related_id}`,
  };
}

function getWikiSourceLink(source) {
  const wikiTitle = getWikiTitle(source);

  if (!wikiTitle) {
    return null;
  }

  return {
    label: "FFXIV Wiki",
    href: `https://ffxiv.consolegameswiki.com/wiki/${encodeWikiPageTitle(wikiTitle)}`,
  };
}

function getMinionWikiSourceLink(source, mount) {
  if (!isCraftingOrGatheringSource(source) || !mount?.name) {
    return null;
  }

  return {
    label: "FFXIV Wiki",
    href: `https://ffxiv.consolegameswiki.com/wiki/${encodeWikiPageTitle(mount.name)}`,
  };
}

function getSourceLinkPriority(source) {
  if (isMogstationSource(source)) {
    return [getMogstationSourceLink];
  }

  if (source.type === "Event") {
    return [getWikiSourceLink];
  }

  if (isCosmicFortuneSource(source) || isMechPilotRewardSource(source)) {
    return [getWikiSourceLink, getVendorSourceLink];
  }

  if (isMgpSource(source) || isGilSource(source)) {
    return [getVendorSourceLink];
  }

  if (getGarlandCurrencyName(source)) {
    return [getCurrencySourceLink, getVendorSourceLink];
  }

  if (isCraftingOrGatheringSource(source)) {
    return [getMinionWikiSourceLink, getGarlandSourceLink];
  }

  if (INSTANCE_TYPES.has(source.type)) {
    return [getWikiSourceLink];
  }

  return [getCollectSourceLink, getGarlandSourceLink, getWikiSourceLink];
}

function getWikiTitle(source) {
  const sourceText = getSourceDisplayText(source);

  if (!sourceText || sourceText === "Unknown source") {
    return null;
  }

  const normalizedWikiTitle = getNormalizedWikiTitle(sourceText);

  if (normalizedWikiTitle) {
    return normalizedWikiTitle;
  }

  return sourceText;
}

function getSourceDisplayText(source) {
  const sourceText = source.text?.trim();

  if (!sourceText) {
    return "Unknown source";
  }

  if (source.type === "Event") {
    const strippedEventText = sourceText.replace(/\s+Event$/, "").trim();

    return strippedEventText || sourceText;
  }

  return sourceText;
}

function encodeWikiPageTitle(title) {
  return encodeURIComponent(title.replace(/\s+/g, "_"));
}

function getNormalizedWikiTitle(sourceText) {
  const directTitle = getDirectWikiTitle(sourceText);

  if (directTitle) {
    return directTitle;
  }

  const pvpSeriesTitle = getPvpSeriesWikiTitle(sourceText);

  if (pvpSeriesTitle) {
    return pvpSeriesTitle;
  }

  const feastTitle = getFeastWikiTitle(sourceText);

  if (feastTitle) {
    return feastTitle;
  }

  const cosmicExplorationTitle = getCosmicExplorationWikiTitle(sourceText);

  if (cosmicExplorationTitle) {
    return cosmicExplorationTitle;
  }

  const instanceContainerTitle = getInstanceContainerWikiTitle(sourceText);

  if (instanceContainerTitle) {
    return instanceContainerTitle;
  }

  const lockboxZoneTitle = getLockboxZoneWikiTitle(sourceText);

  if (lockboxZoneTitle) {
    return lockboxZoneTitle;
  }

  return null;
}

function getVendorWikiTitle(source) {
  const sourceText = source.text?.trim();

  if (!sourceText) {
    return null;
  }

  if (isMgpSource(source)) {
    return "Gold Saucer Attendant";
  }

  if (isPvpTrophyCrystalSource(source)) {
    return "Crystal Quartermaster";
  }

  if (isPvpWolfMarkSource(source)) {
    return "Mark Quartermaster";
  }

  if (isCosmicFortuneSource(source)) {
    return "Orbitingway";
  }

  if (isMechPilotRewardSource(source)) {
    return "Alerot";
  }

  const vendorSourceMatch = sourceText.match(/^(.*?) - \d[\d,]*\s+.+$/);

  if (vendorSourceMatch) {
    return getVendorNameFromSourcePrefix(vendorSourceMatch[1]);
  }

  return null;
}

function getVendorNameFromSourcePrefix(sourcePrefix) {
  const normalizedSourcePrefix = sourcePrefix.trim();

  if (!normalizedSourcePrefix) {
    return null;
  }

  const vendorSegment = normalizedSourcePrefix.includes(" / ")
    ? normalizedSourcePrefix.split(" / ")[0]
    : normalizedSourcePrefix.split(" - ")[0];

  return vendorSegment.replace(/\s*\([^)]*\)\s*$/, "").trim() || null;
}

function getDirectWikiTitle(sourceText) {
  return WIKI_TITLE_OVERRIDES[sourceText] || null;
}

function getPvpSeriesWikiTitle(sourceText) {
  if (!/^PvP Series \d+ - Level \d+$/.test(sourceText)) {
    return null;
  }

  return "Series Malmstones";
}

function getFeastWikiTitle(sourceText) {
  if (!/^The Feast: Season \d+$/.test(sourceText)) {
    return null;
  }

  return "The Feast";
}

function getCosmicExplorationWikiTitle(sourceText) {
  const cosmicFortuneMatch = sourceText.match(/^Cosmic Fortune - (.+)$/);

  if (cosmicFortuneMatch) {
    return "Cosmic Fortune";
  }

  const mechPilotRewardMatch = sourceText.match(/^Mech Pilot Reward - (.+)$/);

  if (mechPilotRewardMatch) {
    return normalizeCosmicExplorationZoneTitle(mechPilotRewardMatch[1]);
  }

  return null;
}

function normalizeCosmicExplorationZoneTitle(zoneTitle) {
  return WIKI_TITLE_OVERRIDES[zoneTitle] || zoneTitle;
}

function getInstanceContainerWikiTitle(sourceText) {
  const containerSourceMatch = sourceText.match(
    /^(.+?) - (Final Boss Chest(?:es)?|Bronze(?:\/Silver)? Coffer|Silver Coffer|Gold Sack|Silver Sack|Platinum Sack|Sack of First Light)$/,
  );

  if (!containerSourceMatch) {
    return null;
  }

  return (
    WIKI_TITLE_OVERRIDES[containerSourceMatch[1]] || containerSourceMatch[1]
  );
}

function getLockboxZoneWikiTitle(sourceText) {
  const happyBunnyLockboxMatch = sourceText.match(
    /^Happy Bunny Lockbox - (.+)$/,
  );

  if (!happyBunnyLockboxMatch) {
    return null;
  }

  return happyBunnyLockboxMatch[1];
}

function isMogstationSource(source) {
  return (
    source.type === "Premium" && source.text?.trim() === MOGSTATION_SOURCE_TEXT
  );
}

function isMgpSource(source) {
  return source.type === "Gold Saucer" && source.text?.includes("MGP");
}

function isGilSource(source) {
  return source.text?.includes("Gil");
}

function isCosmicFortuneSource(source) {
  return (
    source.type === "Cosmic Exploration" &&
    source.text?.startsWith("Cosmic Fortune - ")
  );
}

function isMechPilotRewardSource(source) {
  return (
    source.type === "Cosmic Exploration" &&
    source.text?.startsWith("Mech Pilot Reward - ")
  );
}

function isPvpTrophyCrystalSource(source) {
  return source.type === "PvP" && source.text?.includes("Trophy Crystals");
}

function isPvpWolfMarkSource(source) {
  return source.type === "PvP" && source.text?.includes("Wolf Marks");
}

function isCraftingOrGatheringSource(source) {
  return source.type === "Crafting" || source.type === "Gathering";
}

function getGarlandCurrencyName(source) {
  const sourceText = source.text?.trim();

  if (!sourceText || sourceText === "Unknown source") {
    return null;
  }

  const directAmountMatch = sourceText.match(/^\d[\d,]*\s+(.+?)(?:\s*\(|$)/);

  if (directAmountMatch) {
    return normalizeGarlandCurrencyName(directAmountMatch[1]);
  }

  const vendorAmountMatch = sourceText.match(/ - \d[\d,]*\s+(.+?)(?:\s*\(|$)/);

  if (vendorAmountMatch) {
    return normalizeGarlandCurrencyName(vendorAmountMatch[1]);
  }

  return null;
}

function getVisibleTypeGroups(typeGroups, collectables, config) {
  return typeGroups
    .map((group) => {
      const visibleTypes = group.types.filter((type) =>
        collectables.some(
          (collectable) => getCollectableType(collectable, config) === type,
        ),
      );

      return visibleTypes.length > 0
        ? { ...group, types: visibleTypes }
        : null;
    })
    .filter(Boolean);
}

function normalizeGarlandCurrencyName(currencyName) {
  const trimmedCurrencyName = currencyName.trim();
  const normalizedCurrencyName =
    normalizeGarlandCurrencyLookupKey(trimmedCurrencyName);

  if (!trimmedCurrencyName) {
    return null;
  }

  if (GARLAND_CURRENCY_NAME_OVERRIDES[normalizedCurrencyName]) {
    return GARLAND_CURRENCY_NAME_OVERRIDES[normalizedCurrencyName];
  }

  return singularizeGarlandCurrencyName(trimmedCurrencyName);
}

function normalizeGarlandCurrencyLookupKey(currencyName) {
  return currencyName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function singularizeGarlandCurrencyName(currencyName) {
  const words = currencyName.split(" ");

  for (let index = words.length - 1; index >= 0; index -= 1) {
    const word = words[index];
    const singularWord = singularizeGarlandWord(word);

    if (singularWord !== word) {
      words[index] = singularWord;
      return words.join(" ");
    }
  }

  return currencyName;
}

function singularizeGarlandWord(word) {
  if (word === "Leaves") {
    return "Leaf";
  }

  if (word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }

  return word;
}

function getStoredCharacterSyncState(storageKey) {
  if (typeof window === "undefined") {
    return EMPTY_CHARACTER_SYNC_STATE;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return EMPTY_CHARACTER_SYNC_STATE;
    }

    const parsedValue = JSON.parse(storedValue);

    return {
      character: parsedValue.character || null,
      ownedMountIds: Array.isArray(parsedValue.ownedMountIds)
        ? parsedValue.ownedMountIds
        : [],
      ownedMountNames: Array.isArray(parsedValue.ownedMountNames)
        ? parsedValue.ownedMountNames
        : [],
    };
  } catch {
    return EMPTY_CHARACTER_SYNC_STATE;
  }
}

function getStoredFavoriteMountIds(storageKey) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
      : [];
  } catch {
    return [];
  }
}

function getStoredOwnedCollectableIds(storageKey) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
      : [];
  } catch {
    return [];
  }
}

function getRegionLabel(regionCode) {
  return (
    REGIONS.find((region) => region.code === regionCode)?.label ||
    regionCode ||
    "Unknown Region"
  );
}

function normalizeMountOwnershipName(mountName) {
  return mountName.trim().toLowerCase();
}

function isMountOwned(
  mount,
  syncedCharacter,
  ownedMountIdSet,
  ownedMountNameSet,
) {
  void syncedCharacter;

  return (
    ownedMountIdSet.has(mount.id) ||
    ownedMountNameSet.has(normalizeMountOwnershipName(mount.name))
  );
}

function getMountCardClassName(
  mount,
  syncedCharacter,
  ownedMountIdSet,
  ownedMountNameSet,
  cardClassName,
) {
  void syncedCharacter;

  return isMountOwned(
    mount,
    syncedCharacter,
    ownedMountIdSet,
    ownedMountNameSet,
  )
    ? `${cardClassName} mount-card-owned`
    : `${cardClassName} mount-card-missing`;
}

function getExpansion(patch) {
  const patchNumber = parseFloat(patch);

  if (patchNumber >= 2.0 && patchNumber < 3.0) {
    return "ARR";
  } else if (patchNumber >= 3.0 && patchNumber < 4.0) {
    return "HW";
  } else if (patchNumber >= 4.0 && patchNumber < 5.0) {
    return "SB";
  } else if (patchNumber >= 5.0 && patchNumber < 6.0) {
    return "SHB";
  } else if (patchNumber >= 6.0 && patchNumber < 7.0) {
    return "EW";
  } else if (patchNumber >= 7.0 && patchNumber < 8.0) {
    return "DT";
  }

  return "Unknown";
}

export default CollectionPage;
