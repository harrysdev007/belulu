import * as THREE from 'three';

// All parts live in the mascot's 3D space, including light and orbiting embers.
export function createEnergy() {
  const group = new THREE.Group();
  group.position.set(-.42, -.14, .95);
  const uniforms = {uTime:{value:0}, uPower:{value:1}};
  const material = new THREE.ShaderMaterial({
    uniforms, transparent:true, depthWrite:false,
    vertexShader:`varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;
      void main(){vPosition=position;vec4 mv=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;uniform float uTime;uniform float uPower;
      float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=noise(p)*a;p=p*2.03+3.1;a*=.5;}return n;}
      void main(){vec3 p=vPosition*6.;float n=fbm(p+vec3(uTime*.35,-uTime*.5,uTime*.2));float plasma=fbm(p*2.+n*3.-uTime*.3);float facing=max(dot(normalize(vNormal),normalize(vView)),0.);float core=pow(facing,1.8);vec3 orange=vec3(1.,.22,.008);vec3 yellow=vec3(1.,.77,.035);vec3 hot=vec3(1.,.95,.5);vec3 col=mix(orange,yellow,smoothstep(.15,.7,n));col=mix(col,hot,core*.65+smoothstep(.48,.75,plasma)*.3);float alpha=smoothstep(0.,.24,facing)*(.78+plasma*.2);gl_FragColor=vec4(col*uPower,alpha);}`
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(.39,48,32),material);
  group.add(core);
  const corona=new THREE.Group();
  const filamentMaterial=new THREE.MeshBasicMaterial({color:'#ffe793',transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending});
  for(let strand=0;strand<7;strand++){
    const points=[];
    for(let i=0;i<=64;i++){const angle=i/64*TAU*.82+strand;const radius=.45+Math.sin(angle*7+strand)*.025+Math.sin(angle*13)*.012;points.push(new THREE.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(angle*4+strand)*.035));}
    const filament=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.007,5,false),filamentMaterial);filament.rotation.set(strand*.73,strand*1.2,strand*.91);corona.add(filament);
  }
  group.add(corona);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');const gradient=ctx.createRadialGradient(128,128,0,128,128,128);
  gradient.addColorStop(0,'rgba(255,221,55,.25)');gradient.addColorStop(.11,'rgba(255,215,40,.4)');gradient.addColorStop(.25,'rgba(255,182,15,.5)');gradient.addColorStop(.46,'rgba(255,135,0,.25)');gradient.addColorStop(.72,'rgba(255,101,0,.08)');gradient.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
  const texture=new THREE.CanvasTexture(canvas);
  const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.85}));aura.scale.set(2.65,2.65,1);group.add(aura);
  const light=new THREE.PointLight('#ffb92e',12,4,2);group.add(light);
  const count=95, positions=new Float32Array(count*3), seeds=[];
  for(let i=0;i<count;i++)seeds.push({angle:i*2.39996,radius:.35+(i%17)/17*.62,speed:.2+(i%7)*.06,tilt:Math.sin(i*5.3),height:Math.cos(i*3.7)});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const embers=new THREE.Points(geometry,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uPower:uniforms.uPower},vertexShader:`uniform float uPower;varying float vBrightness;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vBrightness=.55+.45*sin(position.x*48.+position.y*39.);gl_PointSize=(2.+vBrightness*3.)*uPower*(6./-mv.z);gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying float vBrightness;void main(){vec2 p=gl_PointCoord-.5;float a=exp(-dot(p,p)*22.);gl_FragColor=vec4(1.,.65+vBrightness*.3,.18,a*vBrightness);}`}));
  group.add(embers);
  return {group,update(time,burst){uniforms.uTime.value=time;uniforms.uPower.value=1+burst*.9;const pulse=1+Math.sin(time*2.3)*.045+burst*.15;core.scale.setScalar(pulse);corona.scale.setScalar(pulse);corona.rotation.set(time*.12,time*.18,time*.1);aura.scale.setScalar(2.65*pulse);light.intensity=10+Math.sin(time*2.3)*1.5+burst*12;seeds.forEach((s,i)=>{const angle=s.angle+time*s.speed;positions[i*3]=Math.cos(angle)*s.radius;positions[i*3+1]=Math.sin(angle)*s.radius*.8;positions[i*3+2]=Math.sin(angle*.7+s.tilt)*s.radius*.65;});geometry.attributes.position.needsUpdate=true;}};
}

const TAU=Math.PI*2;
