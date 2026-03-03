const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.scale(30, 30);

const scoreEl = document.getElementById('score');
const W = 10, H = 20;
const arena = createMatrix(W, H);
const colors = [null, '#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93','#f72585','#4cc9f0'];

const pieces = {
  T: [[0,0,0],[1,1,1],[0,1,0]],
  O: [[2,2],[2,2]],
  L: [[0,3,0],[0,3,0],[0,3,3]],
  J: [[0,4,0],[0,4,0],[4,4,0]],
  I: [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]],
  S: [[0,6,6],[6,6,0],[0,0,0]],
  Z: [[7,7,0],[0,7,7],[0,0,0]],
};

const player = { pos:{x:0,y:0}, matrix:null, score:0 };
let dropCounter=0, dropInterval=700, lastTime=0, gameOver=false;

function createMatrix(w,h){ const m=[]; while(h--) m.push(new Array(w).fill(0)); return m; }
function collide(arena, player){
  const [m,o]=[player.matrix, player.pos];
  for(let y=0;y<m.length;y++) for(let x=0;x<m[y].length;x++) if(m[y][x]!==0 && (arena[y+o.y] && arena[y+o.y][x+o.x])!==0) return true;
  return false;
}
function merge(arena, player){ player.matrix.forEach((row,y)=>row.forEach((v,x)=>{ if(v!==0) arena[y+player.pos.y][x+player.pos.x]=v; })); }
function rotate(matrix, dir){
  for(let y=0;y<matrix.length;y++) for(let x=0;x<y;x++) [matrix[x][y],matrix[y][x]]=[matrix[y][x],matrix[x][y]];
  dir>0?matrix.forEach(r=>r.reverse()):matrix.reverse();
}
function playerRotate(dir){
  const pos=player.pos.x; let offset=1;
  rotate(player.matrix, dir);
  while(collide(arena, player)){
    player.pos.x += offset;
    offset = -(offset + (offset>0?1:-1));
    if(offset > player.matrix[0].length){ rotate(player.matrix, -dir); player.pos.x=pos; return; }
  }
}
function arenaSweep(){
  let rowCount=1;
  outer: for(let y=arena.length-1;y>0;y--){
    for(let x=0;x<arena[y].length;x++) if(arena[y][x]===0) continue outer;
    const row=arena.splice(y,1)[0].fill(0); arena.unshift(row); y++;
    player.score += rowCount*10; rowCount*=2;
  }
}
function playerDrop(){
  player.pos.y++;
  if(collide(arena, player)){
    player.pos.y--; merge(arena, player); arenaSweep(); playerReset(); updateScore();
  }
  dropCounter=0;
}
function playerHardDrop(){ while(!collide(arena, player)) player.pos.y++; player.pos.y--; playerDrop(); }
function playerMove(dir){ player.pos.x += dir; if(collide(arena, player)) player.pos.x -= dir; }
function playerReset(){
  const keys = Object.keys(pieces);
  player.matrix = pieces[keys[(Math.random()*keys.length)|0]].map(r=>r.slice());
  player.pos.y=0; player.pos.x=((arena[0].length/2)|0)-((player.matrix[0].length/2)|0);
  if(collide(arena, player)) gameOver=true;
}
function drawMatrix(matrix, offset){ matrix.forEach((row,y)=>row.forEach((v,x)=>{ if(v!==0){ ctx.fillStyle=colors[v]; ctx.fillRect(x+offset.x,y+offset.y,1,1); ctx.strokeStyle='#111'; ctx.strokeRect(x+offset.x,y+offset.y,1,1);} })); }
function draw(){ ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height); drawMatrix(arena,{x:0,y:0}); drawMatrix(player.matrix,player.pos); if(gameOver){ ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(0,8,10,4); ctx.fillStyle='#fff'; ctx.font='1px sans-serif'; ctx.fillText('Game Over',2.2,10.2);} }
function update(time=0){ const delta=time-lastTime; lastTime=time; if(!gameOver){ dropCounter+=delta; if(dropCounter>dropInterval) playerDrop(); } draw(); requestAnimationFrame(update); }
function updateScore(){ scoreEl.textContent=player.score; }

document.addEventListener('keydown', e=>{
  if(gameOver) return;
  if(e.key==='ArrowLeft') playerMove(-1);
  else if(e.key==='ArrowRight') playerMove(1);
  else if(e.key==='ArrowDown') playerDrop();
  else if(e.key==='ArrowUp') playerRotate(1);
  else if(e.code==='Space') playerHardDrop();
});
document.getElementById('restart').addEventListener('click', ()=>{
  for(let y=0;y<arena.length;y++) arena[y].fill(0);
  player.score=0; gameOver=false; updateScore(); playerReset();
});

playerReset(); updateScore(); update();
