#!/usr/bin/env node
// MyVivaio PWA icon generator v8 — polished soccer ball
'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const BG_GREEN  = [4, 120, 87];
const PATCH_C   = [2, 82, 59];
const WHITE     = [255, 255, 255];
const RING_C    = [3, 100, 72];

const CRC_TABLE = (() => { const t=new Uint32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c;} return t; })();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=(c>>>8)^CRC_TABLE[(c^b[i])&0xFF];return(c^0xFFFFFFFF)>>>0;}
function encodePNG(size,rgba){
  const raw=Buffer.alloc(size*(1+size*4));
  for(let y=0;y<size;y++){raw[y*(1+size*4)]=0;for(let x=0;x<size;x++){const si=(y*size+x)*4,di=y*(1+size*4)+1+x*4;raw[di]=rgba[si];raw[di+1]=rgba[si+1];raw[di+2]=rgba[si+2];raw[di+3]=rgba[si+3];}}
  const comp=zlib.deflateSync(raw,{level:9});
  function ch(t2,data){const tb=Buffer.from(t2,'ascii'),db=Buffer.isBuffer(data)?data:Buffer.from(data);const lb=Buffer.alloc(4);lb.writeUInt32BE(db.length);const pl=Buffer.concat([tb,db]);const cb=Buffer.alloc(4);cb.writeUInt32BE(crc32(pl));return Buffer.concat([lb,pl,cb]);}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ihdr),ch('IDAT',comp),ch('IEND',Buffer.alloc(0))]);
}

function makeIcon(size) {
  const rgba = new Uint8Array(size*size*4);
  function set(x,y,[r,g,b]){if(x<0||x>=size||y<0||y>=size)return;const i=(y*size+x)*4;rgba[i]=r;rgba[i+1]=g;rgba[i+2]=b;rgba[i+3]=255;}
  function blend(x,y,[r,g,b],a){
    if(x<0||x>=size||y<0||y>=size||a<=0)return;
    if(a>=255){set(x,y,[r,g,b]);return;}
    const i=(y*size+x)*4,f=a/255;
    rgba[i]=Math.round(rgba[i]*(1-f)+r*f);rgba[i+1]=Math.round(rgba[i+1]*(1-f)+g*f);rgba[i+2]=Math.round(rgba[i+2]*(1-f)+b*f);rgba[i+3]=255;
  }
  function fillCircle(cx,cy,r,col,clipCX,clipCY,clipR){
    const hc=(clipR!==undefined);
    for(let y=Math.max(0,Math.floor(cy-r-1.5));y<=Math.min(size-1,Math.ceil(cy+r+1.5));y++)
    for(let x=Math.max(0,Math.floor(cx-r-1.5));x<=Math.min(size-1,Math.ceil(cx+r+1.5));x++){
      const d=Math.hypot(x+.5-cx,y+.5-cy);
      let a=d<r-.5?255:d<r+.5?Math.round(255*(r+.5-d)):0;if(!a)continue;
      if(hc){const dc=Math.hypot(x+.5-clipCX,y+.5-clipCY);const ac=dc<clipR-.5?255:dc<clipR+.5?Math.round(255*(clipR+.5-dc)):0;a=Math.min(a,ac);}
      blend(x,y,col,a);
    }
  }
  function fillPolygon(verts,col){
    const n=verts.length;
    const minY=Math.max(0,Math.floor(Math.min(...verts.map(v=>v[1]))));
    const maxY=Math.min(size-1,Math.ceil(Math.max(...verts.map(v=>v[1]))));
    for(let sy=minY;sy<=maxY;sy++){
      const hits=[];for(let i=0;i<n;i++){const[x1,y1]=verts[i],[x2,y2]=verts[(i+1)%n];if((y1<sy+.5)!==(y2<sy+.5))hits.push(x1+(sy+.5-y1)/(y2-y1)*(x2-x1));}
      hits.sort((a,b)=>a-b);
      for(let k=0;k<hits.length-1;k+=2){const[xa,xb]=[hits[k],hits[k+1]];for(let x=Math.max(0,Math.floor(xa));x<=Math.min(size-1,Math.ceil(xb));x++){const cov=Math.min(x+1,xb)-Math.max(x,xa);if(cov>0)blend(x,sy,col,Math.round(255*Math.min(cov,1)));}}
    }
  }
  function strokeLine(x1,y1,x2,y2,w,col){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);if(len<.001)return;
    const hw=w/2;
    for(let y=Math.max(0,Math.floor(Math.min(y1,y2)-hw-1));y<=Math.min(size-1,Math.ceil(Math.max(y1,y2)+hw+1));y++)
    for(let x=Math.max(0,Math.floor(Math.min(x1,x2)-hw-1));x<=Math.min(size-1,Math.ceil(Math.max(x1,x2)+hw+1));x++){
      const px=x+.5-x1,py=y+.5-y1;let t=(px*dx+py*dy)/(len*len);t=Math.max(0,Math.min(1,t));
      const d=Math.hypot(px-t*dx,py-t*dy);
      if(d<hw-.5)set(x,y,col);else if(d<hw+.5)blend(x,y,col,Math.round(255*(hw+.5-d)));
    }
  }

  // ── draw ─────────────────────────────────────────────────────────────────

  // 1. Green background
  for(let i=0;i<size*size;i++){rgba[i*4]=BG_GREEN[0];rgba[i*4+1]=BG_GREEN[1];rgba[i*4+2]=BG_GREEN[2];rgba[i*4+3]=255;}

  // 2. White rounded card
  const pad=Math.round(size*.075),crr=Math.round(size*.18);
  const x0=pad,y0=pad,x1=size-1-pad,y1=size-1-pad;
  for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){
    const cs=[x<x0+crr&&y<y0+crr?Math.hypot(x-(x0+crr),y-(y0+crr))-crr:-1,x>x1-crr&&y<y0+crr?Math.hypot(x-(x1-crr),y-(y0+crr))-crr:-1,x<x0+crr&&y>y1-crr?Math.hypot(x-(x0+crr),y-(y1-crr))-crr:-1,x>x1-crr&&y>y1-crr?Math.hypot(x-(x1-crr),y-(y1-crr))-crr:-1];
    const d=Math.max(...cs);
    if(d<-.5)set(x,y,WHITE);else if(d<.5)blend(x,y,WHITE,Math.round(255*(.5-d)));
  }

  // 3. Ball ring (green outline) + white interior
  const cx=size/2,cy=size/2,ballR=size*0.340;
  const bw=Math.max(2,ballR*0.038);
  const iR=ballR-bw;          // inner radius (white area)
  fillCircle(cx,cy,ballR,RING_C);
  fillCircle(cx,cy,iR,WHITE);

  // Soccer ball geometry — proportions tuned for clean seam gaps
  const pentR  = ballR * 0.275;   // pentagon vertex radius
  const patchR = ballR * 0.350;   // outer disc radius (smaller → more white seam space)
  const patchD = ballR * 0.710;   // outer disc centre distance
  const seamW  = Math.max(1.5, ballR * 0.060);

  const pv = Array.from({length:5},(_,k)=>{ const a=-Math.PI/2+2*Math.PI*k/5; return[cx+pentR*Math.cos(a),cy+pentR*Math.sin(a)]; });
  const pc = Array.from({length:5},(_,k)=>{ const a=-Math.PI/2+2*Math.PI*k/5; return[cx+patchD*Math.cos(a),cy+patchD*Math.sin(a)]; });

  // Draw patches (no inter-patch seam lines — let the natural white gap show)
  for(const[pcx,pcy]of pc) fillCircle(pcx,pcy,patchR,PATCH_C,cx,cy,iR);
  fillPolygon(pv,PATCH_C);

  // Seam lines — pentagon outline + 5 radial seams only
  for(let k=0;k<5;k++) strokeLine(...pv[k],...pv[(k+1)%5],seamW,WHITE);
  for(let k=0;k<5;k++){
    const[vx,vy]=pv[k],[ocx,ocy]=pc[k];
    const dx=ocx-vx,dy=ocy-vy,dist=Math.hypot(dx,dy),nx=dx/dist,ny=dy/dist;
    strokeLine(vx,vy,ocx-patchR*nx,ocy-patchR*ny,seamW,WHITE);
  }
  // Re-draw pentagon fill and outline (cleanest on top)
  fillPolygon(pv,PATCH_C);
  for(let k=0;k<5;k++) strokeLine(...pv[k],...pv[(k+1)%5],seamW,WHITE);

  return encodePNG(size,rgba);
}

const outDir=process.argv[2]||path.join(__dirname,'icons');
const SIZES=[72,96,128,144,152,192,384,512];
for(const size of SIZES){
  const buf=makeIcon(size);
  fs.writeFileSync(path.join(outDir,`icon-${size}.png`),buf);
  console.log(`  icon-${size}.png  ${buf.length} B`);
}
console.log('Done.');
