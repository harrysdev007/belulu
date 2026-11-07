import { defineConfig } from 'vite';
export default defineConfig({base:'./',build:{rollupOptions:{output:{manualChunks:{react:['react','react-dom/client'],three:['three','three/addons/loaders/GLTFLoader.js','three/addons/environments/RoomEnvironment.js','three/addons/libs/meshopt_decoder.module.js']}}}}});
