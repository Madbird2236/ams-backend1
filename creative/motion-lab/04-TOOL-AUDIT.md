# Tool audit — what is really installed (2026-10-22)

Checked across the whole cloud environment (global npm, every node_modules, Claude skills, both repos). This environment is a cloud container, not Adriano's computer, so tools installed earlier on his computer are not here.

| Tool | Found installed? | Reachable / works here? | Licence for AMS (company) | Decision |
|---|---|---|---|---|
| **FFmpeg** 6.1 | ✅ system | ✅ | LGPL/GPL tool, fine | Used: encoding, mixing, motion blur (`tmix`) |
| **GSAP** 3.13 (+ MorphSVG, DrawSVG, SplitText, MotionPath, CustomEase, Physics2D) | ✅ in `motion/` and `ams-os` | ✅ | Free incl. commercial (since 3.13) | Main animation engine |
| **Three.js** | ❌ (installed now, r150) | ✅ software WebGL (SwiftShader) | MIT | Used for 3D map in VOX-1 |
| **Remotion** 4.0.537 | ❌ | ✅ installed in a scratch folder and rendered a test clip successfully | ⚠ **Company licence required** for for-profit companies with more than 3 employees (paid) | **Not used** until Adriano decides on the licence. Our GSAP renderer covers the same ground |
| **Remotion Skills** | ❌ not in the synced skills | — | — | Not available here |
| **Motion Canvas** | ❌ | npm reachable; rendering runs through its browser editor, no official headless CLI | MIT | Not practical for automated rendering here |
| **Anime.js** 4 | ❌ (installed now) | ✅ | MIT | Available; GSAP already covers it, so not used to avoid duplication |
| **React Three Fiber** | ❌ | npm reachable | MIT | Not needed without React; plain three.js used |
| **Rive** | ❌ | Runtime installable, but `.riv` files are authored in the Rive editor (online account) | Runtime MIT | Not usable for authoring here |
| **Satori** | ❌ | npm reachable (pure JS) | MPL-2.0 | Not needed yet; opentype.js installed for text → outlines |
| Also installed now | d3-geo, topojson-client, **swiss-maps** (© swisstopo data), **Phosphor icons** (MIT), opentype.js, JetBrains Mono (OFL) | ✅ | Free | Used in VOX-1 |
| Engine upgrades | `render-html.mjs --blur N` (motion blur by supersampling) | ✅ | — | Used in KT-1 (crash zooms) and VOX-1 |

Nothing was rebuilt that an installed tool already does: maps, icons, 3D, easing, morphing and text splitting all come from libraries.
