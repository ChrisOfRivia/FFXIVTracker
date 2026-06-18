import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage.jsx";

const HOME_ROUTE = "home";

const COLLECTION_PAGES = {
  mounts: {
    key: "mounts",
    title: "FFXIV Mount Tracker",
    singularLabel: "mount",
    pluralLabel: "mounts",
    dataEndpoint: "https://ffxivcollect.com/api/mounts",
    syncEndpoint: "/api/character-mounts",
    characterStorageKey: "ffxiv-mount-tracker-character-sync",
    favoritesStorageKey: "ffxiv-mount-tracker-favorites",
    pageClassName: "page-shell-mounts",
    cardClassName: "mount-card",
    emptyStateTutorial: {
      imageSrc: "/tutorials/favoriteMount.png",
      imageAlt: "Tutorial showing how to favorite a mount",
    },
    typeGroupVariant: "mounts",
  },
  minions: {
    key: "minions",
    title: "FFXIV Minion Tracker",
    singularLabel: "minion",
    pluralLabel: "minions",
    dataEndpoint: "https://ffxivcollect.com/api/minions",
    syncEndpoint: "/api/character-minions",
    characterStorageKey: "ffxiv-minion-tracker-character-sync",
    favoritesStorageKey: "ffxiv-minion-tracker-favorites",
    pageClassName: "page-shell-minions",
    cardClassName: "mount-card minion-card",
    emptyStateTutorial: {
      imageSrc: "/tutorials/favoriteMinion.png",
      imageAlt: "Tutorial showing how to favorite a minion",
    },
    typeGroupVariant: "minions",
  },
  accessories: {
    key: "accessories",
    title: "FFXIV Accessories Tracker",
    singularLabel: "accessory",
    pluralLabel: "accessories",
    dataEndpoint: "https://ffxivcollect.com/api/fashions",
    syncEndpoint: "/api/character-accessories",
    characterStorageKey: "ffxiv-accessory-tracker-character-sync",
    ownershipStorageKey: "ffxiv-accessory-tracker-owned-accessories",
    favoritesStorageKey: "ffxiv-accessory-tracker-favorites",
    pageClassName: "page-shell-accessories",
    cardClassName: "mount-card minion-card accessory-card",
    typeGroupVariant: "accessories",
  },
  achievements: {
    key: "achievements",
    title: "FFXIV Achievement Tracker",
    singularLabel: "achievement",
    pluralLabel: "achievements",
    dataEndpoint: "https://ffxivcollect.com/api/achievements",
    syncEndpoint: "/api/character-achievements",
    characterStorageKey: "ffxiv-achievement-tracker-character-sync",
    favoritesStorageKey: "ffxiv-achievement-tracker-favorites",
    pageClassName: "page-shell-achievements",
    cardClassName: "mount-card achievement-card",
    typeGroupVariant: "achievements",
    ownershipLabel: "Earned by:",
    detailHashEnabled: true,
  },
};

function App() {
  const [activeRoute, setActiveRoute] = useState(() =>
    getRouteFromHash(window.location.hash),
  );
  const [showHomeDisclaimer, setShowHomeDisclaimer] = useState(
    () => getRouteFromHash(window.location.hash) === HOME_ROUTE,
  );

  useEffect(() => {
    function handleHashChange() {
      const nextRoute = getRouteFromHash(window.location.hash);
      setActiveRoute(nextRoute);

      if (nextRoute !== HOME_ROUTE) {
        setShowHomeDisclaimer(false);
      }
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    document.title =
      activeRoute === HOME_ROUTE
        ? "FFXIVTracker"
        : `${COLLECTION_PAGES[activeRoute]?.title || "FFXIVTracker"} | FFXIVTracker`;
  }, [activeRoute]);

  useEffect(() => {
    if (activeRoute === HOME_ROUTE && showHomeDisclaimer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeRoute, showHomeDisclaimer]);

  const activeConfig = COLLECTION_PAGES[activeRoute] || null;

  return (
    <div className={`app-route-shell app-route-shell-${activeRoute}`}>
      {activeRoute !== HOME_ROUTE ? (
        <nav className="collection-nav" aria-label="Primary navigation">
          <a
            className={
              activeRoute === HOME_ROUTE
                ? "collection-nav-link active"
                : "collection-nav-link"
            }
            href="#/"
          >
            Home
          </a>
          {Object.values(COLLECTION_PAGES).map((page) => (
            <a
              key={page.key}
              className={
                page.key === activeRoute
                  ? "collection-nav-link active"
                  : "collection-nav-link"
              }
              href={`#/${page.key}`}
              aria-current={page.key === activeRoute ? "page" : undefined}
            >
              {getCollectionNavLabel(page.key)}
            </a>
          ))}
        </nav>
      ) : null}

      {activeRoute === HOME_ROUTE ? (
        <HomePage
          showDisclaimer={showHomeDisclaimer}
          onDismissDisclaimer={() => setShowHomeDisclaimer(false)}
        />
      ) : (
        <CollectionPage key={activeConfig.key} config={activeConfig} />
      )}
    </div>
  );
}

function HomePage({ showDisclaimer, onDismissDisclaimer }) {
  return (
    <main className="page-shell page-shell-home home-page">
      {showDisclaimer ? (
        <div
          className="project-notice-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-notice-title"
        >
          <div className="project-notice-card">
            <p className="project-notice-eyebrow">Heads Up</p>
            <h2 id="project-notice-title">This app is still in development.</h2>
            <p className="project-notice-text">
              Some features may be unfinished or buggy while the tracker is
              still being built out.
            </p>
            <button
              className="project-notice-button"
              onClick={onDismissDisclaimer}
              type="button"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
      <section className="home-hero">
        <p className="home-eyebrow">Final Fantasy XIV collection tracker</p>
        <h1>Start Tracking!</h1>
        <p className="home-copy">
          Track mounts, minions, accessories, and achievements with filters,
          favorites, and ownership sync.
        </p>

        <div className="home-route-grid">
          <a className="home-route-card home-route-card-mounts" href="#/mounts">
            <span className="home-route-card-label">Mounts</span>
            <div className="home-route-card-icon" aria-hidden="true">
              <img src="/icons/chocobo.png" alt="" />
            </div>
            <h2>Mount Tracker</h2>
            <p>Browse mounts by source, expansion and collection status.</p>
            <span className="home-route-card-cta">Open mounts</span>
          </a>

          <a
            className="home-route-card home-route-card-minions"
            href="#/minions"
          >
            <span className="home-route-card-label">Minions</span>
            <div className="home-route-card-icon" aria-hidden="true">
              <img src="/icons/minion.png" alt="" />
            </div>
            <h2>Minion Tracker</h2>
            <p>
              Browse minions by source, expansion and check Verminion details in
              a dedicated view.
            </p>
            <span className="home-route-card-cta">Open minions</span>
          </a>

          <a
            className="home-route-card home-route-card-accessories"
            href="#/accessories"
          >
            <span className="home-route-card-label">Accessories</span>
            <div className="home-route-card-icon" aria-hidden="true">
              <img src="/icons/crown.png" alt="" />
            </div>
            <h2>Accessory Tracker</h2>
            <p>
              Browse fashion accessories with the same compact card layout and
              collection filters.
            </p>
            <span className="home-route-card-cta">Open accessories</span>
          </a>

          <a
            className="home-route-card home-route-card-achievements"
            href="#/achievements"
          >
            <span className="home-route-card-label">Achievements</span>
            <div className="home-route-card-icon" aria-hidden="true">
              <img src="/icons/xp.png" alt="" />
            </div>
            <h2>Achievement Tracker</h2>
            <p>
              Browse achievements by category, expansion, points and synced
              completion status.
            </p>
            <span className="home-route-card-cta">Open achievements</span>
          </a>
        </div>
      </section>
    </main>
  );
}

function getCollectionNavLabel(pageKey) {
  if (pageKey === "mounts") {
    return "Mounts";
  }

  if (pageKey === "minions") {
    return "Minions";
  }

  if (pageKey === "accessories") {
    return "Accessories";
  }

  return "Achievements";
}

function getRouteFromHash(hashValue) {
  const normalizedHash = hashValue.replace(/^#\/?/, "").trim().toLowerCase();

  if (normalizedHash === "mounts") {
    return "mounts";
  }

  if (normalizedHash === "minions") {
    return "minions";
  }

  if (normalizedHash === "accessories") {
    return "accessories";
  }

  if (
    normalizedHash === "achievements" ||
    normalizedHash.startsWith("achievements/")
  ) {
    return "achievements";
  }

  return HOME_ROUTE;
}

export default App;
