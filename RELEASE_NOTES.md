### What's New in Cinemora v2.3.9 🎬

- 🏠 **Reliable Home Navigation**: Fixed bottom navigation bug where tapping Home sometimes failed to navigate back to Home. Tapping Home now reliably pops the backstack to Home from any destination, and tapping Home while on the Home feed smoothly scrolls back to the top.
- 👤 **Profile & Settings Enhancements**:
  - **Clean Profile Card**: Removed the logout option from the Profile card in Settings.
  - **Delete Profile**: Renamed "Delete Account" to "Delete Profile" with updated clear confirmation messaging.
  - **Edit Profile Flow**: Profile edit screen now displays "Save Changes" instead of "Get Started", with direct back navigation.
  - **Transparent Language Dialog Backdrop**: Fixed dialog window background artifacts, ensuring clean rounded corners without square background cutouts.
- 🔀 **Butter-Smooth Home Screen Customization**:
  - Implemented real-time smooth animated item displacement during drag-and-drop section reordering.
  - Added 1-tap quick reorder arrows (Up / Down) to seamlessly move sections without gesture friction.
  - Enabled `animateItemPlacement` on Home screen rails for animated layout updates.
- 🎨 **Unified & Optimized Themed Popups**:
  - Upgraded all dialogs (Clear Watch History, Reset Recommendations, Delete Profile) to custom `CinemoraDialog` with consistent theme styling, rounded corners, themed icons, and transparent window backdrops.
- 🪄 **Fluid Motion & Animations**:
  - **Sliding Segmented Toggles**: Added physics-based sliding pill indicators to all segmented buttons across Library (Watchlist / Favorites / History), Search, and Settings.
  - **Navbar Morph Animation**: Smooth animated transition when toggling between Floating capsule and Fixed bottom navigation.
  - **Clean Navigation Item Tap**: Removed distracting background flash/pill highlight animation when tapping navigation tabs.
  - **Polished Page Transitions**: Added smooth fade and slide transitions across app destinations.
