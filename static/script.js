// ============================================
// PARTICLE BACKGROUND
// ============================================

function createParticles() {
    const container = document.getElementById('particleContainer');
    if (!container) return;
    
    const colors = ['#00ff64', '#2196F3', '#ffd700', '#ff4444', '#9C27B0', '#00BCD4'];
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            background: radial-gradient(circle, ${color}88, transparent);
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 10}s;
            opacity: ${Math.random() * 0.5 + 0.2};
        `;
        
        container.appendChild(particle);
    }
}

// ============================================
// KONFIGURASI GAME
// ============================================

const KONFIGURASI = {
    LEBAR: 900,     
    TINGGI: 600,     
    UKURAN_SEL: 30,  
    APEL_MENANG: 10,
    PERTANYAAN_PER_GAME: 5,
    FPS: 12,
    WAKTU_PERTANYAAN: 10
};
const WARNA_ULAR = {
    'Emerald': '#00c853',
    'Sapphire': '#2196F3',
    'Gold': '#ffd700',
    'Ruby': '#f44336',
    'Amethyst': '#9C27B0',
    'Rose': '#E91E63',
    'Cyan': '#00BCD4',
    'Teal': '#009688',
    'Lavender': '#CE93D8',
    'Platinum': '#B0BEC5'
};

const WARNA_KEPALA = {
    'Emerald': '#00ff64',
    'Sapphire': '#64B5F6',
    'Gold': '#ffe082',
    'Ruby': '#ef9a9a',
    'Amethyst': '#CE93D8',
    'Rose': '#f48fb1',
    'Cyan': '#4DD0E1',
    'Teal': '#4DB6AC',
    'Lavender': '#E1BEE7',
    'Platinum': '#CFD8DC'
};

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// ============================================
// STATE GAME
// ============================================

let state = {
    nama: '',
    warna: 'Emerald',
    skor: 0,
    ular: [],
    arah: { x: 1, y: 0 },
    arahBerikutnya: { x: 1, y: 0 },
    makanan: null,
    partikel: [],
    menang: false,
    gameOver: false,
    berjalan: false,
    pertanyaanDijawab: 0,
    paused: false,
    pertanyaanData: [],
    jawabanBenar: 0,
    jawabanSalah: 0,
    timer: null,
    waktuTersisa: KONFIGURASI.WAKTU_PERTANYAAN
};

// ============================================
// DOM ELEMENTS
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuUtama = document.getElementById('menuUtama');
const gameContainer = document.getElementById('gameContainer');
const modalPertanyaan = document.getElementById('modalPertanyaan');
const modalRiwayat = document.getElementById('modalRiwayat');
const modalLeaderboard = document.getElementById('modalLeaderboard');
const modalLoginAdmin = document.getElementById('modalLoginAdmin');
const modalAdmin = document.getElementById('modalAdmin');
const modalGameOver = document.getElementById('modalGameOver');
const modalHasil = document.getElementById('modalHasil');
const modalHasilKuis = document.getElementById('modalHasilKuis');
const modalKonfirmasi = document.getElementById('modalKonfirmasi');

// ============================================
// FUNGSI UTILITY
// ============================================

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function posisiMakananBaru() {
    const maxX = Math.floor(KONFIGURASI.LEBAR / KONFIGURASI.UKURAN_SEL);
    const maxY = Math.floor(KONFIGURASI.TINGGI / KONFIGURASI.UKURAN_SEL);
    let pos;
    let attempts = 0;
    do {
        pos = {
            x: randomRange(0, maxX) * KONFIGURASI.UKURAN_SEL,
            y: randomRange(0, maxY) * KONFIGURASI.UKURAN_SEL
        };
        attempts++;
    } while (state.ular.some(s => s.x === pos.x && s.y === pos.y) && attempts < 100);
    return pos;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('');
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        const r = typeof radii === 'number' ? radii : (radii || 0);
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}

// ============================================
// KELAS PARTIKEL
// ============================================

class Partikel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.ukuran = randomRange(3, 8);
        this.hidup = 30;
        this.maksHidup = 30;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.hidup--;
        return this.hidup > 0;
    }

    draw(ctx) {
        const alpha = this.hidup / this.maksHidup;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.ukuran * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ============================================
// FUNGSI DRAWING
// ============================================

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, KONFIGURASI.TINGGI);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, KONFIGURASI.LEBAR, KONFIGURASI.TINGGI);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= KONFIGURASI.LEBAR; x += KONFIGURASI.UKURAN_SEL) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, KONFIGURASI.TINGGI);
        ctx.stroke();
    }
    for (let y = 0; y <= KONFIGURASI.TINGGI; y += KONFIGURASI.UKURAN_SEL) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(KONFIGURASI.LEBAR, y);
        ctx.stroke();
    }
}

function drawMakanan() {
    if (!state.makanan) return;
    const { x, y } = state.makanan;
    const waktu = Date.now();
    const skala = 1 + 0.1 * Math.sin(waktu / 200);
    const ukuran = KONFIGURASI.UKURAN_SEL * skala;
    const offset = (KONFIGURASI.UKURAN_SEL - ukuran) / 2;

    for (let i = 3; i > 0; i--) {
        ctx.globalAlpha = (50 - i * 15) / 255;
        const glowSize = ukuran + i * 8;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(x + KONFIGURASI.UKURAN_SEL / 2, y + KONFIGURASI.UKURAN_SEL / 2, glowSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(x + KONFIGURASI.UKURAN_SEL / 2, y + KONFIGURASI.UKURAN_SEL / 2, ukuran / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(x + KONFIGURASI.UKURAN_SEL / 2, y + 5, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawUlar() {
    state.ular.forEach((segmen, i) => {
        const progress = state.ular.length > 1 ? i / (state.ular.length - 1) : 0;
        const isKepala = i === 0;
        
        let warna;
        let ukuran = KONFIGURASI.UKURAN_SEL;
        if (isKepala) {
            warna = WARNA_KEPALA[state.warna];
        } else {
            const warnaDasar = hexToRgb(WARNA_ULAR[state.warna]);
            const warnaKepala = hexToRgb(WARNA_KEPALA[state.warna]);
            warna = rgbToHex(
                Math.round(warnaKepala.r * (1 - progress * 0.5) + warnaDasar.r * (progress * 0.5)),
                Math.round(warnaKepala.g * (1 - progress * 0.5) + warnaDasar.g * (progress * 0.5)),
                Math.round(warnaKepala.b * (1 - progress * 0.5) + warnaDasar.b * (progress * 0.5))
            );
            ukuran = KONFIGURASI.UKURAN_SEL * (1 - progress * 0.1);
        }

        const offset = (KONFIGURASI.UKURAN_SEL - ukuran) / 2;
        const x = segmen.x + offset;
        const y = segmen.y + offset;

        if (isKepala) {
            ctx.shadowColor = WARNA_KEPALA[state.warna];
            ctx.shadowBlur = 15;
        }

        ctx.fillStyle = warna;
        ctx.beginPath();
        ctx.roundRect(x, y, ukuran, ukuran, 3);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, ukuran, ukuran, 3);
        ctx.stroke();

        if (isKepala && state.ular.length > 1) {
            const dx = state.ular[0].x - state.ular[1].x;
            const dy = state.ular[0].y - state.ular[1].y;
            let mata1, mata2;
            const size = 3;
            
            if (dx > 0) {
                mata1 = { x: segmen.x + ukuran - 6, y: segmen.y + 4 };
                mata2 = { x: segmen.x + ukuran - 6, y: segmen.y + ukuran - 4 };
            } else if (dx < 0) {
                mata1 = { x: segmen.x + 4, y: segmen.y + 4 };
                mata2 = { x: segmen.x + 4, y: segmen.y + ukuran - 4 };
            } else if (dy > 0) {
                mata1 = { x: segmen.x + 4, y: segmen.y + ukuran - 6 };
                mata2 = { x: segmen.x + ukuran - 4, y: segmen.y + ukuran - 6 };
            } else {
                mata1 = { x: segmen.x + 4, y: segmen.y + 4 };
                mata2 = { x: segmen.x + ukuran - 4, y: segmen.y + 4 };
            }

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(mata1.x, mata1.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mata2.x, mata2.y, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(mata1.x, mata1.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mata2.x, mata2.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawEfekMenang() {
    const waktu = Date.now();
    for (let i = 0; i < 30; i++) {
        const angle = (waktu / 1000 + i * 0.5) % (2 * Math.PI);
        const radius = 150 + 50 * Math.sin(waktu / 500 + i);
        const x = KONFIGURASI.LEBAR / 2 + radius * Math.cos(angle);
        const y = KONFIGURASI.TINGGI / 2 + radius * Math.sin(angle) * 0.5;
        const ukuran = 3 + 2 * Math.sin(waktu / 300 + i);
        const hue = (waktu / 50 + i * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(waktu / 200 + i);
        ctx.beginPath();
        ctx.arc(x, y, ukuran, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ============================================
// GAME LOGIC
// ============================================

function initGame() {
    const startX = Math.floor(KONFIGURASI.LEBAR / 2 / KONFIGURASI.UKURAN_SEL) * KONFIGURASI.UKURAN_SEL;
    const startY = Math.floor(KONFIGURASI.TINGGI / 2 / KONFIGURASI.UKURAN_SEL) * KONFIGURASI.UKURAN_SEL;
    state.ular = [{ x: startX, y: startY }];
    state.arah = { x: 1, y: 0 };
    state.arahBerikutnya = { x: 1, y: 0 };
    state.skor = 0;
    state.menang = false;
    state.gameOver = false;
    state.berjalan = true;
    state.pertanyaanDijawab = 0;
    state.partikel = [];
    state.makanan = posisiMakananBaru();
    state.jawabanBenar = 0;
    state.jawabanSalah = 0;
    state.paused = false;
    
    // Update UI segera
    updateUI();
    
    ctx.clearRect(0, 0, KONFIGURASI.LEBAR, KONFIGURASI.TINGGI);
    gameLoop();
}

function gameLoop() {
    if (!state.berjalan || state.paused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    update();
    render();
    if (!state.gameOver) {
        setTimeout(() => requestAnimationFrame(gameLoop), 1000 / KONFIGURASI.FPS);
    }
}

function update() {
    if (state.gameOver || state.paused) return;
    state.arah = { ...state.arahBerikutnya };
    const kepala = state.ular[0];
    const kepalaBaru = {
        x: kepala.x + state.arah.x * KONFIGURASI.UKURAN_SEL,
        y: kepala.y + state.arah.y * KONFIGURASI.UKURAN_SEL
    };
    if (kepalaBaru.x < 0 || kepalaBaru.x >= KONFIGURASI.LEBAR || kepalaBaru.y < 0 || kepalaBaru.y >= KONFIGURASI.TINGGI) {
        gameOver(false);
        return;
    }
    if (state.ular.some(s => s.x === kepalaBaru.x && s.y === kepalaBaru.y)) {
        gameOver(false);
        return;
    }
    state.ular.unshift(kepalaBaru);
    if (kepalaBaru.x === state.makanan.x && kepalaBaru.y === state.makanan.y) {
    state.skor++;
    // tambahkan ini untuk debug
    console.log('🍎 Makanan dimakan! Skor:', state.skor);
    
    for (let i = 0; i < 20; i++) {
        state.partikel.push(new Partikel(
            state.makanan.x + KONFIGURASI.UKURAN_SEL / 2,
            state.makanan.y + KONFIGURASI.UKURAN_SEL / 2,
            '#ffd700'
        ));
    }
    if (state.skor >= KONFIGURASI.APEL_MENANG) {
        gameOver(true);
        return;
    }
    state.makanan = posisiMakananBaru();
} else {
    state.ular.pop();
}
    state.partikel = state.partikel.filter(p => p.update());
    updateUI();
}

function render() {
    ctx.clearRect(0, 0, KONFIGURASI.LEBAR, KONFIGURASI.TINGGI);
    drawBackground();
    drawGrid();
    drawMakanan();
    drawUlar();
    state.partikel.forEach(p => p.draw(ctx));
    if (state.menang) {
        drawEfekMenang();
    }
}

function gameOver(menang) {
    state.berjalan = false;
    state.gameOver = true;
    state.menang = menang;
    if (menang) {
        saveRiwayat(0, 0);
        showGameOver('🏆 SELAMAT! KAMU MENANG!', 'Anda berhasil mengumpulkan 10 apel!', true);
    } else {
        if (state.skor < KONFIGURASI.APEL_MENANG) {
            state.jawabanBenar = 0;
            state.jawabanSalah = 0;
            showPertanyaan();
        } else {
            saveRiwayat(0, 0);
            showGameOver('💀 GAME OVER', `Skor: ${state.skor}`, false);
        }
    }
}

function updateUI() {
    // Update skor
    const skorEl = document.getElementById('skor');
    const targetEl = document.getElementById('targetSkor');
    const progressFill = document.getElementById('progressFill');
    const progressPersen = document.getElementById('progressPersen');
    
    if (skorEl) skorEl.textContent = state.skor;
    if (targetEl) targetEl.textContent = KONFIGURASI.APEL_MENANG;
    
    // Hitung progress
    const progress = Math.min((state.skor / KONFIGURASI.APEL_MENANG) * 100, 100);
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressPersen) progressPersen.textContent = Math.round(progress) + '%';
    
    console.log('📊 Update UI - Skor:', state.skor, 'Progress:', progress + '%');
}

// ============================================
// PERTANYAAN
// ============================================

function showPertanyaan() {
    state.paused = true;
    state.pertanyaanDijawab = 0;
    state.jawabanBenar = 0;
    state.jawabanSalah = 0;
    fetch('/api/pertanyaan')
        .then(res => res.json())
        .then(pertanyaan => {
            state.pertanyaanData = pertanyaan;
            tampilkanPertanyaan();
        })
        .catch(() => {
            alert('Gagal memuat pertanyaan!');
            kembaliKeMenu();
        });
}

function tampilkanPertanyaan() {
    if (state.pertanyaanDijawab >= KONFIGURASI.PERTANYAAN_PER_GAME) {
        modalPertanyaan.style.display = 'none';
        showHasilKuis();
        return;
    }
    const q = state.pertanyaanData[state.pertanyaanDijawab];
    if (!q) {
        showHasilKuis();
        return;
    }
    document.getElementById('nomorPertanyaan').textContent = `${state.pertanyaanDijawab + 1}/${KONFIGURASI.PERTANYAAN_PER_GAME}`;
    document.getElementById('teksPertanyaan').textContent = q.pertanyaan;
    const container = document.getElementById('pilihanJawaban');
    container.innerHTML = '';
    q.pilihan.forEach((pilihan, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `${i + 1}. ${pilihan}`;
        btn.dataset.index = i;
        btn.addEventListener('click', () => jawabPertanyaan(i, q.jawaban));
        container.appendChild(btn);
    });
    state.waktuTersisa = KONFIGURASI.WAKTU_PERTANYAAN;
    updateTimerDisplay();
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
        state.waktuTersisa--;
        updateTimerDisplay();
        if (state.waktuTersisa <= 0) {
            clearInterval(state.timer);
            state.jawabanSalah++;
            state.pertanyaanDijawab++;
            const options = document.querySelectorAll('.option-btn');
            options.forEach(btn => btn.disabled = true);
            showHasil('⏱️', 'Waktu Habis!', 'error');
            setTimeout(() => {
                modalHasil.style.display = 'none';
                if (state.pertanyaanDijawab >= KONFIGURASI.PERTANYAAN_PER_GAME) {
                    modalPertanyaan.style.display = 'none';
                    showHasilKuis();
                } else {
                    tampilkanPertanyaan();
                }
            }, 1500);
        }
    }, 1000);
    const keyHandler = (e) => {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
            jawabPertanyaan(num - 1, q.jawaban);
            document.removeEventListener('keydown', keyHandler);
        }
    };
    document.addEventListener('keydown', keyHandler);
    modalPertanyaan.style.display = 'flex';
    modalPertanyaan.dataset.keyHandler = keyHandler;
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = `⏱️ ${state.waktuTersisa}s`;
    if (state.waktuTersisa <= 3) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }
}

function jawabPertanyaan(jawaban, jawabanBenar) {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, i) => {
        btn.disabled = true;
        if (i === jawabanBenar) btn.classList.add('correct');
        if (i === jawaban && i !== jawabanBenar) btn.classList.add('wrong');
        if (i === jawaban) btn.classList.add('selected');
    });
    const benar = jawaban === jawabanBenar;
    if (benar) {
        state.jawabanBenar++;
    } else {
        state.jawabanSalah++;
    }
    state.pertanyaanDijawab++;
    setTimeout(() => {
        modalPertanyaan.style.display = 'none';
        if (benar) {
            showHasil('✅', 'Jawaban Benar!', 'success');
        } else {
            showHasil('❌', 'Jawaban Salah!', 'error');
        }
        setTimeout(() => {
            modalHasil.style.display = 'none';
            if (state.pertanyaanDijawab >= KONFIGURASI.PERTANYAAN_PER_GAME) {
                showHasilKuis();
            } else {
                tampilkanPertanyaan();
            }
        }, 1200);
    }, 800);
}

function showHasil(title, text, type) {
    document.getElementById('hasilTitle').textContent = title;
    document.getElementById('hasilText').textContent = text;
    document.getElementById('hasilTitle').style.color = type === 'success' ? '#4CAF50' : '#f44336';
    modalHasil.style.display = 'flex';
}

function showHasilKuis() {
    saveRiwayat(state.jawabanBenar, state.jawabanSalah);
    document.getElementById('hasilKuisTitle').textContent = '📊 HASIL KUIS';
    document.getElementById('hasilKuisText').textContent = 'Anda telah menyelesaikan semua pertanyaan!';
    document.getElementById('benarCount').textContent = state.jawabanBenar;
    document.getElementById('salahCount').textContent = state.jawabanSalah;
    modalHasilKuis.style.display = 'flex';
}

function showGameOver(title, subtitle, menang) {
    document.getElementById('gameOverTitle').textContent = title;
    document.getElementById('gameOverTitle').style.color = menang ? '#ffd700' : '#f44336';
    document.getElementById('gameOverSubtitle').textContent = subtitle;
    document.getElementById('goNama').textContent = state.nama;
    document.getElementById('goSkor').textContent = state.skor;
    document.getElementById('goTarget').textContent = KONFIGURASI.APEL_MENANG;
    modalGameOver.style.display = 'flex';
}

// ============================================
// RIWAYAT
// ============================================

function saveRiwayat(benar, salah) {
    const data = {
        nama: state.nama,
        skor: state.skor,
        menang: state.menang,
        warna: state.warna,
        benar: benar,
        salah: salah
    };
    fetch('/api/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

function showRiwayat() {
    fetch('/api/riwayat')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('historyList');
            list.innerHTML = '';
            if (data.length === 0) {
                list.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">Belum ada riwayat permainan</p>';
            } else {
                data.slice().reverse().forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'history-item';
                    const statusClass = item.menang ? 'status-win' : 'status-lose';
                    const statusText = item.menang ? '🏆 MENANG' : '💀 KALAH';
                    let benarSalahText = '-';
                    if (!item.menang && item.benar !== undefined && item.salah !== undefined) {
                        benarSalahText = `✅${item.benar}/❌${item.salah}`;
                    } else if (item.menang) {
                        benarSalahText = '🏆';
                    }
                    div.innerHTML = `
                        <span>${item.tanggal || '-'}</span>
                        <span>${item.nama}</span>
                        <span>${item.skor}/${KONFIGURASI.APEL_MENANG}</span>
                        <span>${benarSalahText}</span>
                        <span class="${statusClass}">${statusText}</span>
                    `;
                    list.appendChild(div);
                });
            }
            modalRiwayat.style.display = 'flex';
        });
}

// ============================================
// LEADERBOARD
// ============================================

function showLeaderboard() {
    fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
            showLeaderboardTab('menang', data);
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    showLeaderboardTab(this.dataset.tab, data);
                });
            });
            modalLeaderboard.style.display = 'flex';
        });
}

function showLeaderboardTab(tab, data) {
    const container = document.getElementById('leaderboardContent');
    let items = [];
    let scoreLabel = '';
    if (tab === 'menang') { items = data.peringkat_menang; scoreLabel = '🏆 Menang'; }
    else if (tab === 'skor') { items = data.peringkat_skor; scoreLabel = '🍎 Skor'; }
    else if (tab === 'kuis') { items = data.peringkat_kuis; scoreLabel = '✅ Benar'; }
    if (items.length === 0) {
        container.innerHTML = `<div class="leaderboard-empty"><p>😅 Belum ada data untuk peringkat ini</p></div>`;
        return;
    }
    let html = `<div class="leaderboard-header" style="display:grid;grid-template-columns:50px 1fr 1fr;padding:10px 15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;font-weight:bold;color:#888;font-size:13px;">
        <span>#</span><span>Pemain</span><span style="text-align:right">${scoreLabel}</span>
    </div>`;
    items.forEach((item, index) => {
        const rank = index + 1;
        let rankClass = '';
        let rankEmoji = '';
        if (rank === 1) { rankClass = 'gold'; rankEmoji = '🥇'; }
        else if (rank === 2) { rankClass = 'silver'; rankEmoji = '🥈'; }
        else if (rank === 3) { rankClass = 'bronze'; rankEmoji = '🥉'; }
        let scoreValue = '';
        if (tab === 'menang') scoreValue = `${item.menang} (${item.total_main} main)`;
        else if (tab === 'skor') scoreValue = item.skor_tertinggi;
        else if (tab === 'kuis') scoreValue = `${item.benar} benar (${item.rata_rata}%)`;
        html += `<div class="leaderboard-item">
            <span class="rank ${rankClass}">${rankEmoji || rank}</span>
            <span class="name">${item.nama}</span>
            <span class="score">${scoreValue}</span>
        </div>`;
    });
    container.innerHTML = html;
}

// ============================================
// ADMIN
// ============================================

function showLoginAdmin() {
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
    modalLoginAdmin.style.display = 'flex';
}

function handleLoginAdmin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const errorEl = document.getElementById('loginError');
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        modalLoginAdmin.style.display = 'none';
        showAdmin();
    } else {
        errorEl.textContent = '❌ Username atau password salah!';
        errorEl.style.display = 'block';
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

let editingId = null;

function showAdmin() {
    modalAdmin.style.display = 'flex';
    loadDaftarPertanyaan();
    resetFormAdmin();
}

function resetFormAdmin() {
    document.getElementById('adminPertanyaan').value = '';
    document.getElementById('adminPilihan0').value = '';
    document.getElementById('adminPilihan1').value = '';
    document.getElementById('adminPilihan2').value = '';
    document.getElementById('adminPilihan3').value = '';
    document.getElementById('adminJawaban').value = '0';
    const btnTambah = document.getElementById('btnTambahPertanyaan');
    btnTambah.textContent = '➕ Tambah Pertanyaan';
    btnTambah.dataset.editId = '';
    btnTambah.style.background = 'linear-gradient(135deg, #2196F3, #00BCD4)';
    document.getElementById('btnBatalEdit').style.display = 'none';
    editingId = null;
}

function loadDaftarPertanyaan() {
    fetch('/api/admin/pertanyaan')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('daftarPertanyaan');
            document.getElementById('totalPertanyaan').textContent = data.length;
            container.innerHTML = '';
            data.forEach((q) => {
                const div = document.createElement('div');
                div.style.cssText = `padding:12px 15px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;gap:10px;`;
                const textDiv = document.createElement('div');
                textDiv.style.flex = '1';
                textDiv.innerHTML = `
                    <div style="color:white;font-size:14px;"><span style="color:#888;font-size:12px;">#${q.id}</span> ${q.pertanyaan}</div>
                    <div style="color:#888;font-size:12px;">Jawaban: ${q.pilihan[q.jawaban]} | Pilihan: ${q.pilihan.join(', ')}</div>
                `;
                const btnGroup = document.createElement('div');
                btnGroup.style.cssText = `display:flex;gap:8px;`;
                const editBtn = document.createElement('button');
                editBtn.textContent = '✏️';
                editBtn.style.cssText = `padding:5px 10px;background:rgba(33,150,243,0.2);border:1px solid rgba(33,150,243,0.3);border-radius:6px;color:#2196F3;cursor:pointer;`;
                editBtn.onclick = () => { showEditQuestion(q); };
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️';
                deleteBtn.style.cssText = `padding:5px 10px;background:rgba(255,68,68,0.2);border:1px solid rgba(255,68,68,0.3);border-radius:6px;color:#ff4444;cursor:pointer;`;
                deleteBtn.onclick = () => {
                    if (confirm(`Hapus pertanyaan: "${q.pertanyaan}"?`)) {
                        deletePertanyaan(q.id);
                    }
                };
                btnGroup.appendChild(editBtn);
                btnGroup.appendChild(deleteBtn);
                div.appendChild(textDiv);
                div.appendChild(btnGroup);
                container.appendChild(div);
            });
        });
}

function showEditQuestion(q) {
    document.getElementById('adminPertanyaan').value = q.pertanyaan;
    document.getElementById('adminPilihan0').value = q.pilihan[0] || '';
    document.getElementById('adminPilihan1').value = q.pilihan[1] || '';
    document.getElementById('adminPilihan2').value = q.pilihan[2] || '';
    document.getElementById('adminPilihan3').value = q.pilihan[3] || '';
    document.getElementById('adminJawaban').value = q.jawaban;
    const btnTambah = document.getElementById('btnTambahPertanyaan');
    btnTambah.textContent = '✏️ Update Pertanyaan';
    btnTambah.dataset.editId = q.id;
    btnTambah.style.background = 'linear-gradient(135deg, #FF9800, #F44336)';
    document.getElementById('btnBatalEdit').style.display = 'inline-block';
    editingId = q.id;
    document.getElementById('adminPertanyaan').scrollIntoView({ behavior: 'smooth' });
}

function tambahPertanyaan() {
    const btnTambah = document.getElementById('btnTambahPertanyaan');
    const editId = btnTambah.dataset.editId;
    if (editId) {
        updatePertanyaan(parseInt(editId));
    } else {
        tambahPertanyaanBaru();
    }
}

function tambahPertanyaanBaru() {
    const pertanyaan = document.getElementById('adminPertanyaan').value.trim();
    const pilihan = [
        document.getElementById('adminPilihan0').value.trim(),
        document.getElementById('adminPilihan1').value.trim(),
        document.getElementById('adminPilihan2').value.trim(),
        document.getElementById('adminPilihan3').value.trim()
    ];
    const jawaban = parseInt(document.getElementById('adminJawaban').value);
    if (!pertanyaan) { alert('❌ Pertanyaan tidak boleh kosong!'); return; }
    if (pilihan.some(p => !p)) { alert('❌ Semua pilihan harus diisi!'); return; }
    const data = { pertanyaan, pilihan, jawaban };
    fetch('/api/admin/pertanyaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.status === 'success') {
            alert('✅ ' + result.message);
            resetFormAdmin();
            loadDaftarPertanyaan();
        } else {
            alert('❌ ' + result.message);
        }
    });
}

function updatePertanyaan(id) {
    const pertanyaan = document.getElementById('adminPertanyaan').value.trim();
    const pilihan = [
        document.getElementById('adminPilihan0').value.trim(),
        document.getElementById('adminPilihan1').value.trim(),
        document.getElementById('adminPilihan2').value.trim(),
        document.getElementById('adminPilihan3').value.trim()
    ];
    const jawaban = parseInt(document.getElementById('adminJawaban').value);
    if (!pertanyaan) { alert('❌ Pertanyaan tidak boleh kosong!'); return; }
    if (pilihan.some(p => !p)) { alert('❌ Semua pilihan harus diisi!'); return; }
    const data = { pertanyaan, pilihan, jawaban };
    fetch(`/api/admin/pertanyaan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.status === 'success') {
            alert('✅ ' + result.message);
            resetFormAdmin();
            loadDaftarPertanyaan();
        } else {
            alert('❌ ' + result.message);
        }
    });
}

function deletePertanyaan(id) {
    fetch(`/api/admin/pertanyaan/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
            if (result.status === 'success') {
                alert('✅ ' + result.message);
                loadDaftarPertanyaan();
            } else {
                alert('❌ ' + result.message);
            }
        });
}

function resetPertanyaan() {
    if (confirm('Reset semua pertanyaan ke default?')) {
        fetch('/api/admin/pertanyaan/reset', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('✅ ' + data.message);
                    loadDaftarPertanyaan();
                } else {
                    alert('❌ ' + data.message);
                }
            });
    }
}

function resetRiwayat() {
    modalKonfirmasi.style.display = 'flex';
}

function confirmReset() {
    fetch('/api/riwayat/reset', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            modalKonfirmasi.style.display = 'none';
            if (data.status === 'success') {
                alert('✅ ' + data.message);
                if (modalRiwayat.style.display === 'flex') showRiwayat();
                if (modalLeaderboard.style.display === 'flex') showLeaderboard();
            } else {
                alert('❌ ' + data.message);
            }
        });
}

// ============================================
// NAVIGASI
// ============================================

function startGame() {
    const nama = document.getElementById('inputNama').value.trim();
    if (!nama) {
        document.getElementById('inputNama').focus();
        document.getElementById('inputNama').style.borderBottomColor = '#f44336';
        setTimeout(() => {
            document.getElementById('inputNama').style.borderBottomColor = 'rgba(255,255,255,0.1)';
        }, 2000);
        return;
    }
    state.nama = nama;
    document.getElementById('namaPemain').textContent = nama;
    menuUtama.style.display = 'none';
    gameContainer.style.display = 'block';
    canvas.width = KONFIGURASI.LEBAR;
    canvas.height = KONFIGURASI.TINGGI;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    setTimeout(() => { initGame(); }, 100);
}

function kembaliKeMenu() {
    state.berjalan = false;
    state.gameOver = false;
    state.paused = false;
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    gameContainer.style.display = 'none';
    menuUtama.style.display = 'flex';
    document.getElementById('inputNama').value = '';
    document.getElementById('inputNama').focus();
}

function updateWarnaPreview(warna) {
    state.warna = warna;
    document.getElementById('warnaNama').textContent = warna;
    document.getElementById('colorPreview').style.background = WARNA_ULAR[warna];
    document.getElementById('colorPreview').style.color = 'white';
    document.getElementById('colorPreview').style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
}

// ============================================
// TOMBOL PLAY EFEK - FIXED (TIDAK KELUAR LAYAR)
// ============================================

function createButtonSpark(button, e) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Batasi posisi spark dalam tombol agar tidak keluar
    const boundedX = Math.max(5, Math.min(rect.width - 5, x));
    const boundedY = Math.max(5, Math.min(rect.height - 5, y));
    
    const spark = document.createElement('span');
    spark.className = 'btn-spark';
    
    const size = Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 35 + 10;
    const colors = ['#00ff64', '#ffd700', '#00ffaa', '#ffffff'];
    
    spark.style.cssText = `
        left: ${boundedX}px !important;
        top: ${boundedY}px !important;
        width: ${size}px !important;
        height: ${size}px !important;
        background: ${colors[Math.floor(Math.random() * colors.length)]} !important;
        --tx: ${Math.cos(angle) * distance}px !important;
        --ty: ${Math.sin(angle) * distance}px !important;
    `;
    
    button.appendChild(spark);
    setTimeout(() => spark.remove(), 700);
}

function createButtonRipple(button, e) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.min(rect.width, rect.height) * 0.8;
    
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.cssText = `
        left: ${x - size/2}px !important;
        top: ${y - size/2}px !important;
        width: ${size}px !important;
        height: ${size}px !important;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    const colorPreview = document.getElementById('colorPreview');
    if (colorPreview) {
        colorPreview.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.borderColor = 'rgba(255,255,255,0.3)';
        });
        colorPreview.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.borderColor = 'rgba(255,255,255,0.15)';
        });
    }
    
    const inputNama = document.getElementById('inputNama');
    if (inputNama) {
        inputNama.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s';
        });
        inputNama.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
    
    const warnaList = Object.keys(WARNA_ULAR);
    let warnaIndex = 0;
    
    document.getElementById('warnaPrev').addEventListener('click', function() {
        warnaIndex = (warnaIndex - 1 + warnaList.length) % warnaList.length;
        updateWarnaPreview(warnaList[warnaIndex]);
    });
    document.getElementById('warnaNext').addEventListener('click', function() {
        warnaIndex = (warnaIndex + 1) % warnaList.length;
        updateWarnaPreview(warnaList[warnaIndex]);
    });
    
    document.getElementById('btnMulai').addEventListener('click', startGame);
    
    // ============================================
    // EVENT LISTENER TOMBOL - FIXED
    // ============================================
    const btnMulai = document.getElementById('btnMulai');
    if (btnMulai) {
        // Spark saat hover
        btnMulai.addEventListener('mouseenter', function(e) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => createButtonSpark(this, e), i * 50);
            }
        });
        
        // Glow mengikuti kursor
        btnMulai.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            this.style.setProperty('--mouse-x', x + '%');
            this.style.setProperty('--mouse-y', y + '%');
        });
        
        // Klik - ripple + spark burst
        btnMulai.addEventListener('click', function(e) {
            createButtonRipple(this, e);
            
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const rect = this.getBoundingClientRect();
                    const fakeEvent = {
                        clientX: rect.left + 10 + Math.random() * (rect.width - 20),
                        clientY: rect.top + 10 + Math.random() * (rect.height - 20)
                    };
                    createButtonSpark(this, fakeEvent);
                }, i * 40);
            }
        });
    }
    
    document.getElementById('inputNama').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') startGame();
    });
    
    document.getElementById('btnRiwayat').addEventListener('click', showRiwayat);
    document.getElementById('btnRiwayatGame').addEventListener('click', showRiwayat);
    document.getElementById('btnLeaderboard').addEventListener('click', showLeaderboard);
    document.getElementById('btnLeaderboardGame').addEventListener('click', showLeaderboard);
    
    document.getElementById('btnAdmin').addEventListener('click', showLoginAdmin);
    document.getElementById('btnLoginAdmin').addEventListener('click', handleLoginAdmin);
    document.getElementById('closeLoginAdmin').addEventListener('click', function() {
        modalLoginAdmin.style.display = 'none';
    });
    document.getElementById('adminUsername').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') document.getElementById('adminPassword').focus();
    });
    document.getElementById('adminPassword').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleLoginAdmin();
    });
    
    document.getElementById('closeAdmin').addEventListener('click', function() {
        modalAdmin.style.display = 'none';
    });
    document.getElementById('closeAdminBtn').addEventListener('click', function() {
        modalAdmin.style.display = 'none';
    });
    document.getElementById('btnTambahPertanyaan').addEventListener('click', tambahPertanyaan);
    document.getElementById('btnBatalEdit').addEventListener('click', resetFormAdmin);
    document.getElementById('btnResetPertanyaan').addEventListener('click', resetPertanyaan);
    document.getElementById('btnResetDataAdmin').addEventListener('click', resetRiwayat);
    
    document.getElementById('btnConfirmYes').addEventListener('click', confirmReset);
    document.getElementById('btnConfirmNo').addEventListener('click', function() {
        modalKonfirmasi.style.display = 'none';
    });
    
    document.getElementById('closeRiwayat').addEventListener('click', function() {
        modalRiwayat.style.display = 'none';
    });
    document.getElementById('closeRiwayatBtn').addEventListener('click', function() {
        modalRiwayat.style.display = 'none';
    });
    document.getElementById('closeLeaderboard').addEventListener('click', function() {
        modalLeaderboard.style.display = 'none';
    });
    document.getElementById('closeLeaderboardBtn').addEventListener('click', function() {
        modalLeaderboard.style.display = 'none';
    });
    document.getElementById('btnRestart').addEventListener('click', function() {
        modalGameOver.style.display = 'none';
        kembaliKeMenu();
    });
    document.getElementById('btnQuit').addEventListener('click', function() {
        modalGameOver.style.display = 'none';
        kembaliKeMenu();
    });
    document.getElementById('btnKembaliMenu').addEventListener('click', function() {
        modalHasilKuis.style.display = 'none';
        kembaliKeMenu();
    });
    document.getElementById('btnLanjut').addEventListener('click', function() {
        modalHasil.style.display = 'none';
    });
    
    const adminBtn = document.getElementById('btnAdmin');
    if (adminBtn) {
        adminBtn.addEventListener('mouseenter', function(e) {
            for (let i = 0; i < 6; i++) {
                const spark = document.createElement('span');
                const x = e.offsetX || Math.random() * this.offsetWidth;
                const y = e.offsetY || Math.random() * this.offsetHeight;
                spark.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 4 + 2}px;
                    height: ${Math.random() * 4 + 2}px;
                    background: rgba(150, 150, 255, ${Math.random() * 0.5 + 0.3});
                    border-radius: 50%;
                    pointer-events: none;
                    left: ${x}px;
                    top: ${y}px;
                    animation: sparkFloat ${Math.random() * 0.8 + 0.4}s ease-out forwards;
                    z-index: 10;
                `;
                this.appendChild(spark);
                setTimeout(() => spark.remove(), 1200);
            }
        });
    }
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes sparkFloat {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(${Math.random() * 80 - 40}px, ${Math.random() * -80 - 20}px) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    window.addEventListener('click', function(e) {
        if (e.target === modalRiwayat) modalRiwayat.style.display = 'none';
        if (e.target === modalLeaderboard) modalLeaderboard.style.display = 'none';
        if (e.target === modalLoginAdmin) modalLoginAdmin.style.display = 'none';
        if (e.target === modalAdmin) modalAdmin.style.display = 'none';
        if (e.target === modalKonfirmasi) modalKonfirmasi.style.display = 'none';
        if (e.target === modalPertanyaan) modalPertanyaan.style.display = 'none';
        if (e.target === modalHasil) modalHasil.style.display = 'none';
        if (e.target === modalHasilKuis) modalHasilKuis.style.display = 'none';
    });
});

// ============================================
// KEYBOARD CONTROLS
// ============================================

function handleGameControls(key) {
    if (!state.berjalan || state.paused || modalPertanyaan.style.display === 'flex') return;
    const arah = state.arah;
    let newArah = null;
    const keyLower = key.toLowerCase();
    if (keyLower === 'w' && arah.y !== 1) newArah = { x: 0, y: -1 };
    else if (keyLower === 's' && arah.y !== -1) newArah = { x: 0, y: 1 };
    else if (keyLower === 'a' && arah.x !== 1) newArah = { x: -1, y: 0 };
    else if (keyLower === 'd' && arah.x !== -1) newArah = { x: 1, y: 0 };
    else if (key === 'ArrowUp' && arah.y !== 1) newArah = { x: 0, y: -1 };
    else if (key === 'ArrowDown' && arah.y !== -1) newArah = { x: 0, y: 1 };
    else if (key === 'ArrowLeft' && arah.x !== 1) newArah = { x: -1, y: 0 };
    else if (key === 'ArrowRight' && arah.x !== -1) newArah = { x: 1, y: 0 };
    if (newArah) state.arahBerikutnya = newArah;
}

document.addEventListener('keydown', function(e) {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');
    if (isInputFocused) return;
    const key = e.key;
    const kontrolKeys = ['w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) e.preventDefault();
    if (kontrolKeys.includes(key) && state.berjalan && !state.paused) handleGameControls(key);
});

// ============================================
// TOUCH CONTROLS
// ============================================

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) { touchStartX = touch.clientX; touchStartY = touch.clientY; }
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (!state.berjalan || state.paused) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    const arah = state.arah;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && arah.x !== -1) state.arahBerikutnya = { x: 1, y: 0 };
        else if (dx < 0 && arah.x !== 1) state.arahBerikutnya = { x: -1, y: 0 };
    } else {
        if (dy > 0 && arah.y !== -1) state.arahBerikutnya = { x: 0, y: 1 };
        else if (dy < 0 && arah.y !== 1) state.arahBerikutnya = { x: 0, y: -1 };
    }
}, { passive: false });

console.log('🐍 Snake Game Premium Loaded!');
console.log('✨ Effects by Premium Edition');
console.log('🎮 Controls: WASD or Arrow Keys');
console.log('🔑 Admin: admin / admin123');