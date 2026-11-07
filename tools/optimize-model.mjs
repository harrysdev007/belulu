import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder': MeshoptEncoder});
const input = process.argv[2];
if (!input) throw new Error('Usage: npm run optimize:model -- "path/to/source.glb"');
const doc = await io.read(input);
await doc.transform(dedup(), weld(), simplify({simplifier: MeshoptSimplifier, ratio: 0.45, error: 0.001}));
for (const texture of doc.getRoot().listTextures()) {
  const image = await sharp(texture.getImage()).pipelineColourspace('srgb').toColourspace('srgb').resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
  texture.setImage(new Uint8Array(image)).setMimeType('image/webp');
}
doc.createExtension(EXTTextureWebP).setRequired(true);
await doc.transform(prune(), meshopt({encoder: MeshoptEncoder, level:'high'}));
await io.write('public/models/cosmic-shiba.glb', doc);
console.log('Optimized model saved.');
