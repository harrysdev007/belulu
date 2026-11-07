import sharp from 'sharp';
const input=process.argv[2];
if(!input) throw new Error('Usage: node tools/prepare-brand.mjs "path/to/logo.png"');
await sharp(input).pipelineColourspace('srgb').toColourspace('srgb').resize(256,256).webp({quality:90}).toFile('public/brand/belulu.webp');
await sharp(input).pipelineColourspace('srgb').toColourspace('srgb').resize(64,64).png().toFile('public/brand/favicon.png');
