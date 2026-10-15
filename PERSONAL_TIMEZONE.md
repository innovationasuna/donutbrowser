# Per-profile timezone selection

This personal fork keeps Donut Browser's AGPL-3.0 license and adds an independent timezone selection to each Wayfern profile.

- In **New profile → Advanced options**, select **Timezone selection → Choose manually**, search an IANA timezone (for example `America/Los_Angeles`), and create the profile.
- For an existing stopped profile, open **Profile information → Fingerprint**, change the timezone selection, and save. Start the profile to apply it.
- **Follow location settings** removes the manual choice. After switching back, the next launch resolves its timezone through the profile's normal route. If automatic location is disabled, enable it before switching back.
- The timezone and its daylight-saving offset change together. Language, coordinates, device identity, cookies, and other fingerprint settings retain their existing behavior.
- Manual selection remains effective after restarting the app, regenerating a device, and matching location to a proxy. A real difference between the selected timezone and the proxy's GeoIP timezone still produces the normal consistency warning.
- A profile that is running must be stopped before editing its saved settings.

This replaces the previous local single-IP geolocation correction. No address-specific override is included. The Wayfern engine and other plan/entitlement checks are unchanged.

The new stored fields are `timezone_override` (IANA name or null) and internal `timezone_auto_pending` (an explicit switch back to automatic location waiting for the next launch route). Old profiles default to automatic mode without changing their existing startup behavior.

## Validation

Backend regression tests cover validation, preserving device and location fields, clearing a manual selection, resolving automatic location, retaining pending state after errors, legacy payloads, old-profile compatibility, and preserving mismatch warnings. Native UI tests cover searching and saving a timezone while the hardware fingerprint editor remains locked. Actual browser validation is recorded separately with the local build.

The upstream browser E2E suite requires a Wayfern test token; running this fork does not itself supply a paid plan or unlock other features.

## Web language selection

New and stopped existing profiles also offer **Web language selection → Choose manually**. Search a supported locale such as `en-US`. Its primary language and fallback are sent through Wayfern's existing launch identity location channel, so websites receive `en-US, en`. Browser menus and the Donut manager keep their own interface language.

`language_override` stores the chosen primary locale; `language_auto_pending` tracks an explicit return to automatic location. Manual language survives device generation and matching location to a proxy. Returning to automatic clears the old manual language and requires automatic location to be enabled; the next launch resolves only the pending dimensions through the profile's normal route. Other profiles default to their existing behavior. The catalog is shared by the selector and backend validation in `src/lib/browser-language-options.json`.

Language validation on Wayfern 152.0.7977.64: the existing profile returned `navigator.language = "en-US"`, `navigator.languages = ["en-US", "en"]`, `Intl.DateTimeFormat().resolvedOptions().locale = "en-US"`, and retained `America/Los_Angeles`. Format/lint, four language backend regressions, two targeted native UI cases, and proxy/VPN/sync integration tests passed. The complete unit run had 1362 passes and one existing sync network test failure (`an_unreachable_storage_host_survives_the_whole_way_to_the_message`): the reserved test host received a prematurely closed connection instead of the expected unreachable-host error. An isolated retry reproduced it; no sync or proxy code was changed for that failure. The full upstream browser suite still requires a Wayfern test token.
