const gameList = [
    "Báo May Mắn", "Bát Kho Báu X-Huge", "Cao Bồi Hoang Dã", "Chiến Thắng Poker", 
    "Chợ Đêm", "Cú Đánh Mạt Chược", "Đế Quốc Hoàng Kim", "DJ Boom Boom", 
    "Đường Mạt Chược 1", "Đường Mạt Chược 2", "Kho Báu Aztec", "Kỳ Lân Mách Nước", 
    "Mèo May Mắn", "Ngọc May Mắn 2", "Ngọc May Mắn 3", "Ngọc May Mắn", 
    "Phi Công", "Quyết Chiến Tiền Thưởng", "Siêu Ace Deluxe", "Siêu Át", 
    "Soccer Striker", "Tết Nguyên Đán Moreways", "Thần Chiến Garuda 500", 
    "Tiếng Gọi Danh Dự", "Thắng Mahjong 4", "Vận May Garuda 1000"
];

const DEFAULT_URL = "https://google.com";
const DEFAULT_SUPPORT_TEXT = "💬 Liên Hệ Hỗ Trợ";
const DEFAULT_SUPPORT_URL = "https://t.me";

let adminConfig = JSON.parse(localStorage.getItem('xx88_admin_config')) || {};

const urlParams = new URLSearchParams(window.location.search);
const currentRef = urlParams.get('ref');

let finalDestination = DEFAULT_URL;
let supportText = DEFAULT_SUPPORT_TEXT;
let supportUrl = DEFAULT_SUPPORT_URL;

if (currentRef && adminConfig[currentRef]) {
    try {
        const decodedData = JSON.parse(atob(adminConfig[currentRef]));
        finalDestination = decodedData.targetUrl || DEFAULT_URL;
        supportText = decodedData.supportText || DEFAULT_SUPPORT_TEXT;
        supportUrl = decodedData.supportUrl || DEFAULT_SUPPORT_URL;
    } catch(e) {
        try { finalDestination = atob(adminConfig[currentRef]); } catch(err) { finalDestination = adminConfig[currentRef]; }
    }
} else {
    finalDestination = localStorage.getItem('xx88_last_direct_link') || DEFAULT_URL;
    supportText = localStorage.getItem('xx88_last_support_text') || DEFAULT_SUPPORT_TEXT;
    supportUrl = localStorage.getItem('xx88_last_support_url') || DEFAULT_SUPPORT_URL;
}

document.getElementById('cta-link').href = finalDestination;
const btnSupportObj = document.getElementById('btn-support');
if (btnSupportObj) {
    btnSupportObj.innerText = supportText;
    btnSupportObj.href = supportUrl;
}

function generateGoldenTime() {
    const startHour = Math.floor(Math.random() * (23 - 9 + 1)) + 9;
    const minutesString = "0,10,20,30,40,50";
    const evenMinutes = minutesString.split(",");
    const randomIdx = Math.floor(Math.random() * evenMinutes.length);
    const startMin = parseInt(evenMinutes[randomIdx]);
    
    const durationMin = Math.floor(Math.random() * (120 - 60 + 1)) + 60;
    const startDate = new Date();
    startDate.setHours(startHour, startMin, 0);
    const endDate = new Date(startDate.getTime() + durationMin * 60000);
    
    const shStr = String(startDate.getHours()).padStart(2, '0');
    const smStr = String(startDate.getMinutes()).padStart(2, '0');
    const ehStr = String(endDate.getHours()).padStart(2, '0');
    const emStr = String(endDate.getMinutes()).padStart(2, '0');
    
    return `${shStr}:${smStr} - ${ehStr}:${emStr}`;
}
function generateSmartGameStates() {
    const forcedTopGames = ["Quyết Chiến Tiền Thưởng", "Đường Mạt Chược 1"];
    const remainingGameNames = gameList.filter(name => !forcedTopGames.includes(name));
    
    for (let i = remainingGameNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingGameNames[i], remainingGameNames[j]] = [remainingGameNames[j], remainingGameNames[i]];
    }
    
    const chosenToTop5 = remainingGameNames.slice(0, 3);
    const finalRestGames = remainingGameNames.slice(3);
    const top5Names = [...forcedTopGames, ...chosenToTop5];
    
    const top5States = top5Names.map(name => ({
        name: name, time: generateGoldenTime(), rate: Math.floor(Math.random() * (97 - 70 + 1)) + 70
    }));
    const restStates = finalRestGames.map(name => ({
        name: name, time: generateGoldenTime(), rate: Math.floor(Math.random() * (65 - 20 + 1)) + 20
    }));
    return [...top5States, ...restStates];
}

let gameStates = generateSmartGameStates();
const gameGrid = document.getElementById('game-grid');
const gridLockOverlay = document.getElementById('grid-lock-overlay');

// HÀM ĐÃ SỬA: THUẬT TOÁN QUÉT ĐA TẦNG THƯ MỤC CHỐNG LỆCH ĐƯỜNG DẪN TRÊN GITHUB
function updateAndRenderGrid() {
    gameStates.sort((a, b) => b.rate - a.rate);
    gameGrid.innerHTML = '';
    gameStates.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = "game-card";
        
        // Cơ chế tự động tìm ở "Anh/anh/", nếu lỗi tự chuyển sang "Anh/", lỗi tiếp sang "anh/"
        card.innerHTML = `
            <div class="rank-badge">TOP ${index + 1}</div>
            <div class="img-container">
                <img src="Anh/anh/${game.name}.png" alt="${game.name}" 
                     onerror="this.onerror=null; this.src='Anh/${game.name}.png'; this.addEventListener('error', function(){ this.onerror=null; this.src='anh/${game.name}.png'; })}">
                <div class="img-fallback">🎮 ${game.name}</div>
            </div>
            <div style="width: 100%;">
                <div class="game-name" title="${game.name}">${game.name}</div>
                <div class="time-badge">🕒 Giờ Vàng: ${game.time}</div>
                <div class="rate-label">Tỉ Lệ Nhả</div>
                <div id="rate-value-${index}" class="rate-value">${game.rate}%</div>
            </div>
        `;
        gameGrid.appendChild(card);
    });
}
updateAndRenderGrid();

setInterval(() => {
    gameStates = generateSmartGameStates();
    if (gridLockOverlay && gridLockOverlay.style.display === 'none') { updateAndRenderGrid(); }
}, 600000);
let currentOnlineUsers = 3842;
const statTextContainer = document.querySelector('.stats-banner .stat-item:nth-child(2)');
setInterval(() => {
    const fluctuation = Math.floor(Math.random() * 7) - 3;
    currentOnlineUsers += fluctuation;
    if (currentOnlineUsers < 3800) currentOnlineUsers = 3815;
    if (currentOnlineUsers > 3900) currentOnlineUsers = 3885;
    if (statTextContainer) { statTextContainer.innerHTML = `👥 Đang quét: ${currentOnlineUsers.toLocaleString('vi-VN')} người`; }
}, 3500);

const btnCheck = document.getElementById('btn-check');
const scanContainer = document.getElementById('scan-container');
const scanLoading = document.getElementById('scan-loading');
const scanResult = document.getElementById('scan-result');

btnCheck.addEventListener('click', () => {
    scanContainer.style.display = 'block';
    scanLoading.style.display = 'block';
    scanResult.style.display = 'none';
    scanContainer.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        scanLoading.style.display = 'none';
        scanResult.style.display = 'block';
        if (gridLockOverlay) gridLockOverlay.style.setProperty('display', 'none', 'important');
        if (gameGrid) {
            gameGrid.style.setProperty('opacity', '1', 'important');
            gameGrid.style.setProperty('pointer-events', 'auto', 'important');
        }
        updateAndRenderGrid();
    }, 2000);
});

let logoClickCount = 0;
const adminPanel = document.getElementById('admin-panel');

document.body.addEventListener('click', (e) => {
    if (e.target.closest('#logo-click')) {
        logoClickCount++;
        if (logoClickCount === 10) {
            logoClickCount = 0;
            const user = prompt('Nhập tài khoản quản trị:');
            if (user !== 'mrsauaxk') { alert('Tài khoản sai!'); return; }
            const pass = prompt('Nhập mật khẩu xác thực:');
            if (pass !== 'mrsauaxk@') { alert('Mật khẩu sai!'); return; }
            adminPanel.style.display = 'block';
            adminPanel.scrollIntoView({ behavior: 'smooth' });
            alert('Đăng nhập thành công!');
        }
    }
});

if (document.getElementById('btn-close-admin')) {
    document.getElementById('btn-close-admin').addEventListener('click', () => {
        adminPanel.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

const inputTargetUrl = document.getElementById('admin-target-url');
const inputSupportText = document.getElementById('admin-support-text');
const inputSupportUrl = document.getElementById('admin-support-url');
const inputRefCode = document.getElementById('admin-ref-code');
const btnGenerateRef = document.getElementById('btn-generate-ref');
const outputBox = document.getElementById('output-box');
const outputLink = document.getElementById('output-link');

if (inputTargetUrl) inputTargetUrl.value = localStorage.getItem('xx88_last_direct_link') || '';
if (inputSupportText) inputSupportText.value = localStorage.getItem('xx88_last_support_text') || DEFAULT_SUPPORT_TEXT;
if (inputSupportUrl) inputSupportUrl.value = localStorage.getItem('xx88_last_support_url') || DEFAULT_SUPPORT_URL;

if (btnGenerateRef) {
    btnGenerateRef.addEventListener('click', () => {
        const targetUrl = inputTargetUrl.value.trim();
        const sText = inputSupportText.value.trim() || DEFAULT_SUPPORT_TEXT;
        const sUrl = inputSupportUrl.value.trim() || DEFAULT_SUPPORT_URL;
        const refCode = inputRefCode.value.trim().replace(/\s+/g, '-');

        if (!targetUrl) { alert('Vui lòng điền link đăng ký game mục 1!'); return; }
        if (!refCode) { alert('Vui lòng nhập mã đại lý mục 2!'); return; }

        localStorage.setItem('xx88_last_direct_link', targetUrl);
        localStorage.setItem('xx88_last_support_text', sText);
        localStorage.setItem('xx88_last_support_url', sUrl);

        const configPackage = { targetUrl: targetUrl, supportText: sText, supportUrl: sUrl };
        adminConfig[refCode] = btoa(JSON.stringify(configPackage));
        localStorage.setItem('xx88_admin_config', JSON.stringify(adminConfig));

        outputLink.innerText = `index.html?ref=${refCode}`;
        outputBox.style.display = 'block';
        alert('Đã lưu và đồng bộ cấu hình thành công!');
    });
}

document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
        return false;
    }
};
