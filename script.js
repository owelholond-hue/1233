// ====================================================
// 1. АКТУАЛЬНЫЙ ГОД В ПОДВАЛЕ
// ====================================================
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ====================================================
// 2. ПЕРЕКЛЮЧЕНИЕ ТЁМНОЙ ТЕМЫ
// ====================================================
const THEME_KEY = 'theme-dark';
const themeBtn = document.querySelector('#theme-toggle');

function applyTheme(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    if (themeBtn) {
        themeBtn.textContent = isDark ? '☀️' : '🌙';
        themeBtn.setAttribute('aria-pressed', String(isDark));
        themeBtn.title = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';
        themeBtn.setAttribute('aria-label', themeBtn.title);
    }
    try { localStorage.setItem(THEME_KEY, isDark ? '1' : '0'); } catch (e) {}
}

try { applyTheme(localStorage.getItem(THEME_KEY) === '1'); }
catch (e) { applyTheme(false); }

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('dark');
        applyTheme(isDark);
    });
}


// ====================================================
// 3. ОТПРАВКА ФОРМЫ БЕЗ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ
// ====================================================
const form = document.querySelector('form');
const statusMsg = document.querySelector('#form-status');

if (form && statusMsg) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();        // отменяем перезагрузку

        const nameInput = document.querySelector('#name');
        const name = nameInput ? nameInput.value.trim() : '';

        if (!name) {
            statusMsg.textContent = 'Пожалуйста, укажите имя.';
            statusMsg.classList.add('visible');
            return;
        }

        statusMsg.textContent = `Спасибо, ${name}! Сообщение отправлено.`;
        statusMsg.classList.add('visible');

        form.reset();                  // очищаем поля

        // Скрываем сообщение через 5 секунд
        setTimeout(() => statusMsg.classList.remove('visible'), 5000);
    });
}


// ====================================================
// 4. КНОПКА «НАВЕРХ» ПОЯВЛЯЕТСЯ ПРИ ПРОКРУТКЕ
// ====================================================
const upBtn = document.querySelector('#to-top');

if (upBtn) {
    window.addEventListener('scroll', () => {
        upBtn.classList.toggle('visible', window.scrollY > 400);
    });

    upBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ====================================================
// 5. ДОСТУПНОСТЬ: РАЗМЕР ШРИФТА (для слабовидящих)
// ====================================================
const FONT_KEY = 'a11y-font'; // 'normal' | 'large' | 'xlarge'
const fontClasses = ['font-large', 'font-xlarge'];

const btnFontMinus = document.querySelector('#font-decrease');
const btnFontReset = document.querySelector('#font-reset');
const btnFontPlus  = document.querySelector('#font-increase');

function updateResetVisibility(mode) {
    if (!btnFontReset) return;
    // Показываем кнопку сброса только когда шрифт увеличен
    btnFontReset.hidden = (mode === 'normal');
}

function applyFont(mode) {
    document.documentElement.classList.remove(...fontClasses);
    if (mode === 'large')  document.documentElement.classList.add('font-large');
    if (mode === 'xlarge') document.documentElement.classList.add('font-xlarge');
    try { localStorage.setItem(FONT_KEY, mode); } catch (e) {}
    updateResetVisibility(mode);
}

function getFontMode() {
    try { return localStorage.getItem(FONT_KEY) || 'normal'; }
    catch (e) { return 'normal'; }
}

// Восстановление при загрузке
try { applyFont(getFontMode()); }
catch (e) { applyFont('normal'); }

if (btnFontPlus) {
    btnFontPlus.addEventListener('click', () => {
        const current = getFontMode();
        const next = current === 'normal' ? 'large' : 'xlarge';
        applyFont(next);
    });
}

if (btnFontMinus) {
    btnFontMinus.addEventListener('click', () => {
        const current = getFontMode();
        const next = current === 'xlarge' ? 'large' : 'normal';
        applyFont(next);
    });
}

if (btnFontReset) {
    btnFontReset.addEventListener('click', () => applyFont('normal'));
}


// ====================================================
// 6. ДОСТУПНОСТЬ: ВЫСОКИЙ КОНТРАСТ (для неразличающих цвет)
// ====================================================
const CONTRAST_KEY = 'a11y-contrast';
const btnContrast = document.querySelector('#contrast-toggle');

function applyContrast(on) {
    document.documentElement.classList.toggle('contrast', on);
    if (btnContrast) {
        btnContrast.setAttribute('aria-pressed', String(on));
        btnContrast.title = on ? 'Выключить высокий контраст' : 'Включить высокий контраст';
        btnContrast.setAttribute('aria-label', btnContrast.title);
    }
    try { localStorage.setItem(CONTRAST_KEY, on ? '1' : '0'); } catch (e) {}
}

try { applyContrast(localStorage.getItem(CONTRAST_KEY) === '1'); }
catch (e) { applyContrast(false); }

if (btnContrast) {
    btnContrast.addEventListener('click', () => {
        const on = !document.documentElement.classList.contains('contrast');
        applyContrast(on);
    });
}


// ====================================================
// 7. ДОСТУПНОСТЬ: ОЗВУЧКА СТРАНИЦЫ (для невидящих)
//    Использует Web Speech API (speechSynthesis).
// ====================================================
const btnSpeak = document.querySelector('#speak-toggle');
const speechSupported = 'speechSynthesis' in window;
let speaking = false;

function getReadableText() {
    // Собираем осмысленный текст: заголовки, абзацы, пункты,
    // ссылки, подписи. Исключаем панель доступности, skip-link,
    // сообщение формы и кнопку «наверх».
    const selector = 'h1, h2, h3, p, li, a, label, button[type="submit"]';
    const nodes = document.querySelectorAll(selector);
    const parts = [];

    nodes.forEach(el => {
        if (el.closest('.a11y-panel')) return;
        if (el.classList.contains('skip-link')) return;
        if (el.id === 'form-status') return;
        if (el.id === 'to-top') return;

        const text = el.textContent.trim().replace(/\s+/g, ' ');
        if (text) parts.push(text);
    });

    return parts.join('. ');
}

function stopSpeaking() {
    if (speechSupported) window.speechSynthesis.cancel();
    speaking = false;
    if (btnSpeak) {
        btnSpeak.textContent = '🔊';
        btnSpeak.setAttribute('aria-pressed', 'false');
        btnSpeak.setAttribute('aria-label', 'Озвучить страницу');
        btnSpeak.title = 'Озвучить страницу';
    }
}

function startSpeaking() {
    if (!speechSupported) {
        alert('Ваш браузер не поддерживает озвучку (Web Speech API).');
        return;
    }

    const text = getReadableText();
    if (!text) return;

    // Отменяем предыдущее, если было
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = stopSpeaking;
    utterance.onerror = stopSpeaking;

    speaking = true;
    if (btnSpeak) {
        btnSpeak.textContent = '⏹';
        btnSpeak.setAttribute('aria-pressed', 'true');
        btnSpeak.setAttribute('aria-label', 'Остановить озвучку');
        btnSpeak.title = 'Остановить озвучку';
    }

    window.speechSynthesis.speak(utterance);
}

if (btnSpeak && speechSupported) {
    btnSpeak.addEventListener('click', () => {
        if (speaking) stopSpeaking();
        else startSpeaking();
    });
} else if (btnSpeak) {
    // Если API не поддерживается — прячем кнопку
    btnSpeak.style.display = 'none';
}


// ====================================================
// 8. ОСТАНОВКА ОЗВУЧКИ ПРИ УХОДЕ СО СТРАНИЦЫ
// ====================================================
window.addEventListener('beforeunload', () => {
    if (speechSupported) window.speechSynthesis.cancel();
});