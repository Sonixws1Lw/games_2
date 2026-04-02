const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const body = document.getElementById('mainBody');

canvas.width = 1000;
canvas.height = 600;

class Demon {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 30; this.h = 30;
        this.vx = 0; this.vy = 0;
        this.speed = 8.5; 
        this.jump = -17;  
        this.gravity = 0.8;
        this.onGround = false;
        this.wingTimer = 0;
    }

    draw() {
        // Тіло та роги
        ctx.fillStyle = "#535353";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.beginPath(); ctx.moveTo(this.x+5, this.y); ctx.lineTo(this.x-2, this.y-12); ctx.lineTo(this.x+10, this.y); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.x+25, this.y); ctx.lineTo(this.x+32, this.y-12); ctx.lineTo(this.x+20, this.y); ctx.fill();
        
        // Червоні очі
        ctx.fillStyle = "#f00";
        ctx.fillRect(this.x+5, this.y+10, 6, 6); ctx.fillRect(this.x+20, this.y+10, 6, 6);
        
        // Крила, що махають
        ctx.fillStyle = "#333";
        let s = Math.sin(this.wingTimer) * 10;
        ctx.fillRect(this.x-10, this.y+5+s, 8, 15); ctx.fillRect(this.x+32, this.y+5+s, 8, 15);
        this.wingTimer += 0.5;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
    }
}

let player, platforms, keys = {}, gameState = "PLAY";
let lavaY = 700;

function init() {
    player = new Demon(50, 450);
    lavaY = 750;
    gameState = "PLAY";
    platforms = [
        {x:0, y:520, w:180, type:'solid', life:1, act:false},
        {x:280, y:430, w:130, type:'bad', life:1, act:false}, // Зникаюча платформа
        {x:550, y:360, w:130, type:'solid', life:1, act:false},
        {x:800, y:280, w:130, type:'bad', life:1, act:false},
        {x:550, y:180, w:130, type:'bad', life:1, act:false},
        {x:300, y:110, w:130, type:'solid', life:1, act:false},
        {x:80, y:60, w:80, type:'exit', life:1, act:false}    // Вихід (документ)
    ];
}

window.onkeydown = e => keys[e.code] = true;
window.onkeyup = e => keys[e.code] = false;

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === "PLAY") {
        player.vx = keys['ArrowRight'] ? player.speed : (keys['ArrowLeft'] ? -player.speed : 0);
        if ((keys['Space'] || keys['ArrowUp']) && player.onGround) { 
            player.vy = player.jump; 
            player.onGround = false; 
        }
        
        player.update();
        player.onGround = false;

        // Підйом лави (швидкість видалення)
        lavaY -= 0.65; 
        
        // Вмикаємо трясіння, якщо лава близько
        if (Math.abs(player.y - lavaY) < 200) {
            body.classList.add('shake-fast');
        } else {
            body.classList.remove('shake-fast');
        }

        if (player.y + player.h > lavaY) gameState = "OVER";
    }

    // Малюємо лаву "DELETING..."
    let flash = 0.4 + Math.abs(Math.sin(Date.now()/200)) * 0.4;
    ctx.fillStyle = `rgba(255, 0, 0, ${flash})`;
    ctx.fillRect(0, lavaY, canvas.width, 600);
    ctx.fillStyle = "#fff"; ctx.font = "bold 12px monospace";
    for(let i=0; i<canvas.width; i+=80) ctx.fillText("DELETING...", i, lavaY + 20);

    // Малюємо платформи
    platforms.forEach(p => {
        if (p.type === 'exit') {
            let pS = Math.sin(Date.now()/150) * 8;
            ctx.fillStyle = "#535353"; ctx.fillRect(p.x + 20, p.y - 50 + pS, 40, 55);
            ctx.fillStyle = "#fff"; ctx.fillRect(p.x + 25, p.y - 45 + pS, 30, 4);
            ctx.fillStyle = "#f00"; ctx.fillRect(p.x, p.y, p.w, 15);
        } else {
            ctx.fillStyle = p.type === 'bad' ? `rgba(83,83,83,${p.life})` : "#535353";
            ctx.fillRect(p.x, p.y, p.w, 15);
        }
        
        // Колізія
        if (player.x+player.w > p.x+5 && player.x < p.x+p.w-5 && player.y+player.h > p.y && player.y+player.h < p.y+20 && player.vy >= 0) {
            player.y = p.y - player.h; player.vy = 0; player.onGround = true;
            if (p.type === 'bad') p.act = true;
            if (p.type === 'exit') gameState = "WIN";
        }
        if (p.act) p.life -= 0.018; // Платформа повільно зникає
    });

    platforms = platforms.filter(p => p.life > 0.05);
    player.draw();

    // Екран завершення
    if (gameState !== "PLAY") {
        body.classList.remove('shake-fast');
        ctx.fillStyle = (gameState === "WIN") ? "rgba(83,83,83,0.95)" : "rgba(255,0,0,0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 40px monospace";
        ctx.fillText(gameState === "WIN" ? "DATA_RECOVERED" : "CONNECTION_LOST", 500, 300);
        ctx.font = "20px monospace"; ctx.fillText("CLICK TO REBOOT SYSTEM", 500, 360);
    }

    requestAnimationFrame(loop);
}

canvas.addEventListener('mousedown', () => { if (gameState !== "PLAY") init(); });
init();
loop();