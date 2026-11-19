### What's New in Cinemora v2.3.16 🎬

- 📺 **Unified "Series" Terminology Across Cinemora**: Consistent use of "Series" instead of "TV Show" across Search, Library, and Details, fixing all spelling and naming discrepancies.
- 🍿 **Dedicated Series Discovery Rails on Home**: Added new "Trending Series" and "Binge-Worthy Series" rails to the Home Screen so you can seamlessly explore both blockbuster movies and captivating multi-season series.
- 🌟 **Extensive Series Catalog**: Expanded mock data with 11+ acclaimed, high-rating series (Stranger Shadows, Breaking Bad, The Last Frontier, Severance, Dark, Arcane, Peaky Syndicate, The Culinary Order, Chernobyl, Better Call Saul, and more) complete with episode breakdowns, cast, and high-res backdrops.
- ⚙️ **"Disable Series" Toggle (Movies-Only Mode)**: Added a new `CONTENT` section in Settings allowing you to completely hide all TV series across Home, Search, and Library.
- 📚 **Tailored Library UI/UX in Movies-Only Mode**: When "Disable Series" is active, Library transitions to a specialized Movies-only layout with an instant collection search bar and collection badge, hiding the redundant category filter chips.
- 🏷️ **Sleek "SERIES" Badge on Poster Cards**: Visual badge indicators on poster cards for quick distinction between standalone movies and episodic series.

---

### What's New in Cinemora v2.3.15 🎬

- 🚀 **100% Native Kotlin Compose Architecture**: Completely purged all legacy web code, Capacitor plugins, and Node artifacts. The codebase is now strictly focused on the ultra-fast native Android APK with zero bloat.
- 🎨 **Unified Navigation Bar Grey Border**: Styled the navigation bar border outline to perfectly match the sleek grey border color used on settings tiles and cards (`colors.divider`).
- 🏠 **Enhanced Library Empty State Action**: Tapping "Find Movies" or "Discover" in the empty Watchlist or Favorites screen now smoothly takes you back to the Home discovery rails.
- 🏷️ **Clean Settings Version Display**: Removed "(Native)" from the Settings footer version display, showing a clean `"Cinemora v2.3.15"`.
- 🧹 **Complete Codebase Cleanup**: Comprehensive cleanup of orphaned configs, boilerplate tests, and dead files with added Kotlin unit tests.
