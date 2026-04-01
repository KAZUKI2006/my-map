document.addEventListener("DOMContentLoaded", function() {
    const TOTAL = 47;
    const prefectures = document.querySelectorAll('.prefecture');
    const navbar      = document.getElementById('navbar');
    const tooltip     = document.getElementById('pref-tooltip');
    const popup       = document.getElementById('select-popup');

    let visitedCount = 0, livedCount = 0;
    let currentPref = null;
    const states = {};

    /* ---- Navbar scroll ---- */
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    /* ---- Train bar chart (replaced with custom bar + train image) ---- */
    function rate() { return (visitedCount + livedCount) / TOTAL * 100; }

    function updateUI() {
        const r = rate();
        document.getElementById('stats-pct').textContent = r.toFixed(1) + '%';
        document.getElementById('cnt-visited').textContent = visitedCount;
        document.getElementById('cnt-lived').textContent   = livedCount;
        document.getElementById('pct-visited').textContent = (visitedCount / 47 * 100).toFixed(1);
        document.getElementById('pct-lived').textContent   = (livedCount   / 47 * 100).toFixed(1);
        document.getElementById('bar-fill').style.width = Math.max(r, 0) + '%';
    }

    /* ---- Init states ---- */
    prefectures.forEach(p => { states[p.getAttribute('data-code')] = 'not-yet'; });

    /* ---- Apply state to a prefecture ---- */
    function applyState(pref, newState) {
        const code = pref.getAttribute('data-code');
        const old  = states[code];
        if (old === newState) return;

        if (old === 'visited') visitedCount--;
        if (old === 'lived')   livedCount--;
        if (newState === 'visited') visitedCount++;
        if (newState === 'lived')   livedCount++;

        states[code] = newState;
        pref.classList.remove('visited','lived');
        if (newState !== 'not-yet') pref.classList.add(newState);

        syncTooltipStatus(pref);
        updateUI();
        saveStates();
    }

    /* ---- Tooltip ---- */
    let tipTimer;

    function syncTooltipStatus(pref) {
        const s = states[pref.getAttribute('data-code')] || 'not-yet';
        const el = document.getElementById('tip-status');
        el.className = 'tip-status ' + s;
        el.textContent = s === 'visited' ? '✈ Visited' : s === 'lived' ? '🏠 Lived here' : '○ Not yet';
    }

    function moveTooltip(e) {
        const tw = 160, margin = 10;
        let x = e.clientX + 14, y = e.clientY - 8;
        if (x + tw > window.innerWidth - margin) x = e.clientX - tw - 14;
        if (y < margin) y = e.clientY + 14;
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
    }

    prefectures.forEach(pref => {
        pref.addEventListener('mouseenter', e => {
            clearTimeout(tipTimer);
            document.getElementById('tip-ja').textContent = pref.getAttribute('data-name')    || '';
            document.getElementById('tip-en').textContent = pref.getAttribute('data-name-en') || '';
            syncTooltipStatus(pref);
            moveTooltip(e);
            tooltip.classList.add('show');
        });
        pref.addEventListener('mousemove', moveTooltip);
        pref.addEventListener('mouseleave', () => {
            tipTimer = setTimeout(() => tooltip.classList.remove('show'), 60);
        });

        pref.addEventListener('click', e => {
            e.stopPropagation();
            currentPref = pref;
            const ja = pref.getAttribute('data-name') || '';
            const en = pref.getAttribute('data-name-en') || '';
            document.getElementById('popup-title').textContent = `${ja} / ${en}`;

            const pw = 158, ph = 148, m = 10;
            let x = e.clientX + 12;
            let y = e.clientY - 10 + window.scrollY;
            if (x + pw > window.innerWidth  - m) x = e.clientX - pw - 12;
            if ((y - window.scrollY) + ph   > window.innerHeight - m) y = e.clientY - ph + window.scrollY;
            popup.style.left = x + 'px';
            popup.style.top  = y + 'px';
            popup.classList.add('show');
            tooltip.classList.remove('show');
        });
    });

    /* ---- Popup actions ---- */
    document.getElementById('btn-visited').addEventListener('click', () => {
        if (currentPref) applyState(currentPref, 'visited');
        popup.classList.remove('show');
    });
    document.getElementById('btn-lived').addEventListener('click', () => {
        if (currentPref) applyState(currentPref, 'lived');
        popup.classList.remove('show');
    });
    document.getElementById('btn-notyet').addEventListener('click', () => {
        if (currentPref) applyState(currentPref, 'not-yet');
        popup.classList.remove('show');
    });

    document.addEventListener('click', () => popup.classList.remove('show'));
    popup.addEventListener('click', e => e.stopPropagation());

    /* ---- LocalStorage ---- */
    function saveStates() {
        localStorage.setItem('pref_states_v3', JSON.stringify(states));
    }
    function loadStates() {
        const saved = JSON.parse(localStorage.getItem('pref_states_v3') || '{}');
        Object.entries(saved).forEach(([code, s]) => {
            if (s === 'not-yet') return;
            const pref = document.querySelector(`[data-code='${code}']`);
            if (!pref) return;
            states[code] = s;
            pref.classList.add(s);
            if (s === 'visited') visitedCount++;
            if (s === 'lived')   livedCount++;
        });
        updateUI();
    }
    loadStates();
});
