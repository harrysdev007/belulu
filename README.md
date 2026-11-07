# $BELULU — cosmic home

React + Three.js homepage for BELULU on Solana, launched on bonk.fun. Includes the optimized Cosmic Shiba model, procedural 3D ornaments, a golden plasma orb between the paws, and Minecraft-inspired pixel typography.

## Local development

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host. Relative asset paths support hosting in a subdirectory.

The original model is untouched. `public/models/cosmic-shiba.glb` is 640,144 bytes, down from 9,765,640 bytes. Geometry uses Meshopt compression; textures use 1024px WebP. To regenerate:

```sh
npm run optimize:model -- "C:/path/to/source.glb"
```

The user-provided reference image is the logo and favicon. Both community links lead to https://x.com/belulu_sol. No token contract or purchase URL has been configured.

Move the pointer for parallax. Send a cosmic hug to amplify the orb and send a wave through the ornaments. The animation can be paused and respects reduced motion. The mascot is anchored at the lower edge. Only the homepage has been implemented.

Preserve LICENSE and NOTICE when redistributing.
