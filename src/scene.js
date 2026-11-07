import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createEnergy } from './energy.js';

const TAU = Math.PI * 2;
const candy = color => new THREE.MeshPhysicalMaterial({ color, roughness:.25, metalness:.08, clearcoat:1, clearcoatRoughness:.16 });
const pink = candy('#ff4a9f'), gold = candy('#ffce39'), blue = candy('#53d9ff'), white = candy('#fff7ec'), ink = candy('#3e203e');
const sphere = new THREE.SphereGeometry(1,32,24);
function ball(material, x,y,z, sx,sy=sx,sz=sx){const m=new THREE.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;}
function tube(points, radius, material){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,radius,10,false),material);}
function puff(shape, depth=.19, bevel=.14){return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:6,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:32});}
function heart(){
  const vertices=[], indices=[], rings=32, segments=64;
  for(let j=0;j<=rings;j++) {const phi=j/rings*Math.PI,r=Math.sin(phi);for(let i=0;i<=segments;i++){const t=i/segments*TAU;const x=.65*Math.pow(Math.sin(t),3);const y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.045;vertices.push(x*r,(y-.08)*r+.08,.29*Math.cos(phi));}}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const g=new THREE.Group();g.add(new THREE.Mesh(geometry,pink));return g;
}
function star(sparkle=false){const s=new THREE.Shape();const count=sparkle?4:5;for(let i=0;i<count*2;i++){const a=Math.PI/2+i*Math.PI/count;const r=i%2?(sparkle?.19:.28):.65;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();const g=new THREE.Group();g.add(new THREE.Mesh(puff(s,.16,.065),gold));return g;}
function cloud(){const g=new THREE.Group();g.add(ball(white,-.26,0,0,.27,.22,.23),ball(white,0,.12,0,.31,.3,.25),ball(white,.29,0,0,.25,.21,.22));return g;}
function rainbow(){const g=new THREE.Group();['#ff5388','#ff9f38','#ffe15a','#76e6a1','#58c8ff','#a28aff'].forEach((c,i)=>{const r=.78-i*.085;const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,.054,12,48,Math.PI),candy(c));g.add(mesh);});const a=cloud(),b=cloud();a.position.set(-.57,-.01,.08);b.position.set(.57,-.01,.08);a.scale.setScalar(.65);b.scale.setScalar(.65);g.add(a,b);return g;}
function smile(){const g=new THREE.Group();g.add(ball(gold,0,0,0,.57,.57,.28));g.add(ball(ink,-.18,.13,.26,.046,.075,.04),ball(ink,.18,.13,.26,.046,.075,.04));g.add(tube([[-.24,-.08,.26],[-.13,-.23,.285],[0,-.27,.295],[.13,-.23,.285],[.24,-.08,.26]],.035,ink));const blush=candy('#ff915a');g.add(ball(blush,-.32,-.05,.23,.09,.045,.025),ball(blush,.32,-.05,.23,.09,.045,.025));return g;}
function butterfly(){const g=new THREE.Group();g.add(ball(blue,-.24,.18,0,.26,.34,.12),ball(blue,.24,.18,0,.26,.34,.12),ball(blue,-.18,-.2,0,.19,.23,.11),ball(blue,.18,-.2,0,.19,.23,.11),ball(candy('#7063e9'),0,0,.08,.065,.34,.07));return g;}

export class CosmicScene {
  constructor(container,onReady,onError){
    this.container=container;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.time=0;this.energy=0;this.target=new THREE.Vector2();this.pointer=new THREE.Vector2();this.objects=[];this.disposed=false;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.setClearColor('#45215e');this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;container.appendChild(this.renderer.domElement);
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(38,1,.1,60);this.camera.position.set(0,0,10);
    const pmrem=new THREE.PMREMGenerator(this.renderer);const room=new RoomEnvironment();this.environment=pmrem.fromScene(room,.04);this.scene.environment=this.environment.texture;room.dispose();pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight('#d3e9ff','#8f335f',1.1));
    const key=new THREE.DirectionalLight('#fff3cf',2.5);key.position.set(-3,5,6);this.scene.add(key);
    const rim=new THREE.DirectionalLight('#ffb5df',3);rim.position.set(4,1,-3);this.scene.add(rim);
    const fill=new THREE.PointLight('#ffd18d',25,10);fill.position.set(0,-1,3);this.scene.add(fill);
    this.background=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{uTime:{value:0},uAspect:{value:1}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uAspect;
    vec3 palette(float t){return .53+.45*cos(6.28318*(vec3(1.,1.,1.)*t+vec3(0.,.33,.67)));}
    void main(){vec2 p=vUv-vec2(.53,.49);p.x*=uAspect;float r=length(p);float a=atan(p.y,p.x);float turn=a/6.28318;float wave=sin(a*8.+sin(a*3.)*.7+uTime*.04);vec3 col=palette(turn*3.+uTime*.006+sin(a*9.)*.035);float rays=.68+.32*smoothstep(-1.,1.,wave);col*=rays;vec3 center=vec3(.23,.10,.29);col=mix(center,col,smoothstep(.05,.8,r));float vignette=1.-.25*smoothstep(.3,1.2,length(p));col*=vignette;col=mix(col,vec3(.96,.62,.44),.09);gl_FragColor=vec4(col,1.);}`});
    const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.background);bg.frustumCulled=false;bg.renderOrder=-100;this.scene.add(bg);
    this.hero=new THREE.Group();this.scene.add(this.hero);
    this.glow=createEnergy();this.hero.add(this.glow.group);
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(import.meta.env.BASE_URL+'models/cosmic-shiba.glb',gltf=>{
      if(this.disposed)return;
      const model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.material.metalness=0;o.material.roughness=.52;o.material.envMapIntensity=.65;o.material.normalScale?.setScalar(.45);}});const box=new THREE.Box3().setFromObject(model);const center=box.getCenter(new THREE.Vector3());const size=box.getSize(new THREE.Vector3());model.position.sub(center);const normalized=new THREE.Group();normalized.add(model);normalized.scale.setScalar(4.4/size.y);this.hero.add(normalized);this.model=normalized;onReady();
    },undefined,e=>{console.error('Model loading failed',e);onError();});
    this.makeObjects();
    this.onMove=e=>{this.target.set((e.clientX/innerWidth-.5)*2,-(e.clientY/innerHeight-.5)*2);};
    this.onLeave=()=>this.target.set(0,0);
    this.onVisibility=()=>{this.last=performance.now();};
    window.addEventListener('pointermove',this.onMove);document.addEventListener('pointerleave',this.onLeave);document.addEventListener('visibilitychange',this.onVisibility);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.last=performance.now();this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
  }
  makeObjects(){
    const makers=[heart,rainbow,star,smile,butterfly,()=>star(true),cloud];
    // Fixed composition keeps the mascot clear while every ornament moves in depth.
    const layout=[[-.84,.43,0,.65],[-.62,-.5,1,.68],[-.99,-.28,0,.65],[-.36,-.67,3,.48],[.73,.56,1,.72],[.87,.1,0,.7],[.74,-.48,3,.7],[.42,-.72,0,.58],[-.24,.71,5,.45],[.28,.75,0,.5],[-1.05,.1,4,.48],[.95,-.65,2,.5],[-.55,.62,2,.38],[.57,.22,4,.45],[.1,-.78,1,.52],[-.45,-.34,5,.32],[.94,.75,5,.36],[-.95,.8,6,.48],[.55,-.2,5,.34],[.11,.9,4,.33],[-.7,-.8,2,.44],[.81,-.17,6,.4],[.47,.6,2,.28],[-.16,-.51,5,.2]];
    layout.forEach(([x,y,type,scale],i)=>{const object=makers[type]();object.scale.setScalar(scale);object.rotation.set(.1+(i%3)*.12,Math.sin(i*2)*.4,Math.sin(i*3)*.3);this.scene.add(object);this.objects.push({object,x,y,scale,phase:i*2.399,z:i%4===0?1.1:-.5-(i%3)*.5});});
    const positions=[];for(let i=0;i<100;i++){const a=i*2.399,r=2.8+(i%13)*.36;positions.push(Math.cos(a)*r,Math.sin(a)*r,-2-(i%5)*.2);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.dust=new THREE.Points(geo,new THREE.PointsMaterial({color:'#fff1ba',size:.025,transparent:true,opacity:.55}));this.scene.add(this.dust);
  }
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;this.width=w;this.height=h;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.background.uniforms.uAspect.value=w/h;this.viewH=2*Math.tan(THREE.MathUtils.degToRad(19))*10;this.viewW=this.viewH*w/h;this.mobile=w<650;this.heroScale=this.mobile?.85:1.45;this.heroBaseY=this.mobile?-1.75:-1.35;this.hero.scale.setScalar(this.heroScale);this.hero.position.set(this.mobile?-.18:this.viewW*.15,this.heroBaseY,0);}
  hug(){this.energy=1;}
  tick(now){
    if(this.disposed)return;this.frame=requestAnimationFrame(this.tick);const dt=Math.min((now-this.last)/1000,.05);this.last=now;if(document.hidden)return;
    if(!this.paused)this.time+=dt;const t=this.time;this.energy=Math.max(0,this.energy-dt*.32);this.pointer.lerp(this.target,1-Math.exp(-dt*3));
    const motion=this.paused?0:1;
    // Look slightly upward and toward the front: the near paw covers the torso end.
    // Keep parallax inside this framing so animation cannot expose the cut again.
    this.hero.rotation.set(-.32+this.pointer.y*.015*motion,-.45+(Math.sin(t*.32)*.025+this.pointer.x*.035)*motion,-.025+Math.sin(t*.48)*.008*motion);
    this.hero.position.y=this.heroBaseY+Math.sin(t*.9)*.045;
    const s=this.heroScale*(1+Math.sin(this.energy*Math.PI)*.025);this.hero.scale.setScalar(s);
    this.glow.update(t,this.energy);
    this.objects.forEach(({object,x,y,phase,z,scale})=>{const angle=Math.sin(t*.15+phase)*.055;const spread=1+this.energy*.24;const xx=x*Math.cos(angle)-y*Math.sin(angle),yy=x*Math.sin(angle)+y*Math.cos(angle);object.position.set(xx*this.viewW*.49*spread+Math.sin(t*.7+phase)*.1+this.pointer.x*.13*motion,yy*this.viewH*.47*spread+Math.cos(t*.8+phase)*.11,z+Math.sin(t*.4+phase)*.25);object.rotation.y=Math.sin(t*.5+phase)*.45;object.rotation.z=Math.sin(t*.4+phase)*.2;const small=this.mobile?.7:1;object.scale.setScalar(scale*small);});
    this.dust.rotation.z=t*.015;this.background.uniforms.uTime.value=t;this.renderer.render(this.scene,this.camera);
  }
  dispose(){this.disposed=true;cancelAnimationFrame(this.frame);clearTimeout(this.messageTimer);this.resizeObserver.disconnect();window.removeEventListener('pointermove',this.onMove);document.removeEventListener('pointerleave',this.onLeave);document.removeEventListener('visibilitychange',this.onVisibility);const geometries=new Set(),materials=new Set(),textures=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});materials.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)textures.add(v);});m.dispose();});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());this.environment.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}


