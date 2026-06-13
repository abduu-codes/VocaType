'use strict';

/* ── ELEMENTS ── */
const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const interimBox = document.getElementById('interimBox');
const interimText = document.getElementById('interimText');
const editorArea = document.getElementById('editorArea');
const wordCountEl = document.getElementById('wordCount');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const langSelect = document.getElementById('langSelect');
const themeToggle = document.getElementById('themeToggle');
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const browserNote = document.getElementById('browserNote');
const waveform = document.getElementById('waveform');
const fontFamilySelect = document.getElementById('fontFamilySelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const textColorPicker = document.getElementById('textColorPicker');
const bgColorPicker = document.getElementById('bgColorPicker');
const textColorSwatch = document.getElementById('textColorSwatch');
const bgColorSwatch = document.getElementById('bgColorSwatch');
const micPulseBar = document.getElementById('micPulseBar');
const autosaveBadge = document.getElementById('autosaveBadge');
const aiToggleBtn = document.getElementById('aiToggleBtn');
const aiStatusEl = document.getElementById('aiStatus');

/* ── STATE ── */
let isRecording = false;
let recognition = null;
let restartTimer = null;
let isDark = true;
let aiEnabled = true;

/* ══════════════════════════════════════════
   THE REAL FIX — confirmed from your logs:

   INTERIM fires every ~200ms while speaking.
   We must write it DIRECTLY into the editor,
   not into a separate preview box.

   We use one <span id="vt-interim"> that sits
   at the end of the editor. Every interim event
   just updates its textContent — instant, 0ms.

   When FINAL fires, we replace that span with
   a permanent text node.

   NETWORK ERROR fix: on 'network' error we
   restart immediately — same as onend.
══════════════════════════════════════════ */

/* The live span inside the editor */
let liveSpan = null;

function getLiveSpan() {
    if (liveSpan && editorArea.contains(liveSpan)) return liveSpan;
    liveSpan = document.createElement('span');
    liveSpan.id = 'vt-interim';
    liveSpan.setAttribute('style',
        'color:var(--accent);opacity:0.75;');
    editorArea.appendChild(liveSpan);
    return liveSpan;
}

function commitLiveSpan(finalText) {
    /* Replace interim span with permanent text */
    if (liveSpan && editorArea.contains(liveSpan)) {
        const node = document.createTextNode(finalText);
        liveSpan.replaceWith(node);
        liveSpan = null;
    } else {
        editorArea.appendChild(document.createTextNode(finalText));
    }
    editorArea.scrollTop = editorArea.scrollHeight;
}

function removeLiveSpan() {
    if (liveSpan && editorArea.contains(liveSpan)) {
        liveSpan.remove();
        liveSpan = null;
    }
}

/* ── SPELL MAP ── */
const FIX = {
    'recieve': 'receive',
    'recieved': 'received',
    'beleive': 'believe',
    'definately': 'definitely',
    'definetly': 'definitely',
    'occured': 'occurred',
    'seperate': 'separate',
    'wich': 'which',
    'teh': 'the',
    'adn': 'and',
    'waht': 'what',
    'thier': 'their',
    'freind': 'friend',
    'becuase': 'because',
    'becasue': 'because',
    'becouse': 'because',
    'untill': 'until',
    'alot': 'a lot',
    'wierd': 'weird',
    'reccommend': 'recommend',
    'recomend': 'recommend',
    'begining': 'beginning',
    'bussiness': 'business',
    'buisness': 'business',
    'completly': 'completely',
    'convience': 'convenience',
    'developement': 'development',
    'devlopment': 'development',
    'enviroment': 'environment',
    'excercise': 'exercise',
    'experiance': 'experience',
    'familar': 'familiar',
    'finaly': 'finally',
    'foriegn': 'foreign',
    'fourty': 'forty',
    'goverment': 'government',
    'grammer': 'grammar',
    'happend': 'happened',
    'hieght': 'height',
    'independant': 'independent',
    'intellegent': 'intelligent',
    'intresting': 'interesting',
    'knowlege': 'knowledge',
    'laguage': 'language',
    'libary': 'library',
    'neccessary': 'necessary',
    'neccesary': 'necessary',
    'noticable': 'noticeable',
    'oppertunity': 'opportunity',
    'peice': 'piece',
    'powerfull': 'powerful',
    'proffesional': 'professional',
    'profesional': 'professional',
    'relevent': 'relevant',
    'rember': 'remember',
    'remeber': 'remember',
    'resturant': 'restaurant',
    'rythm': 'rhythm',
    'simalar': 'similar',
    'similiar': 'similar',
    'sofware': 'software',
    'somthing': 'something',
    'speach': 'speech',
    'succesful': 'successful',
    'suprise': 'surprise',
    'tecnology': 'technology',
    'therfore': 'therefore',
    'tomorow': 'tomorrow',
    'tommorrow': 'tomorrow',
    'truely': 'truly',
    'unfortunatly': 'unfortunately',
    'usefull': 'useful',
    'usualy': 'usually',
    'visable': 'visible',
    'writting': 'writing',
    'receit': 'receipt',
};

function spellFix(text) {
    return text.replace(/\b([a-zA-Z']+)\b/g, function(word) {
        const lo = word.toLowerCase().replace(/[',.]$/, '');
        const fix = FIX[lo];
        if (!fix) return word;
        return word[0] === word[0].toUpperCase() ?
            fix[0].toUpperCase() + fix.slice(1) : fix;
    });
}

function finalFix(text) {
    text = text.trim();
    if (aiEnabled) text = spellFix(text);
    text = text.replace(/\bi\b/g, 'I').replace(/\bi'/g, "I'");
    text = text[0].toUpperCase() + text.slice(1);
    return text + ' ';
}

/* ── LOAD EXTRA FONTS ── */
(function() {
    const f = [
        'Playfair+Display:wght@400;700', 'Libre+Baskerville:wght@400;700',
        'Lora:wght@400;600', 'Merriweather:wght@300;400;700',
        'EB+Garamond:wght@400;600', 'Crimson+Text:wght@400;600',
        'Raleway:wght@300;400;600', 'Montserrat:wght@300;400;600',
        'Nunito:wght@300;400;600', 'Poppins:wght@300;400;600',
        'Open+Sans:wght@300;400;600', 'Roboto:wght@300;400;700',
        'Inter:wght@300;400;600', 'Exo+2:wght@300;400;600',
        'Oxanium:wght@300;400;600', 'Bebas+Neue', 'Abril+Fatface',
        'Cinzel:wght@400;600', 'Righteous',
        'Dancing+Script:wght@400;700', 'Pacifico',
        'Caveat:wght@400;700', 'Sacramento'
    ].join('&family=');
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f + '&display=swap';
    document.head.appendChild(l);
})();

/* ── BROWSER CHECK ── */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
if (!SR) {
    micBtn.disabled = true;
    micBtn.style.opacity = '0.38';
    micBtn.style.cursor = 'not-allowed';
    browserNote.textContent = '⚠ Use Google Chrome or Edge';
    setStatus('Not supported', 'error');
    micStatus.textContent = 'Voice needs Chrome or Edge.';
} else {
    browserNote.textContent = 'Best in Chrome · Edge';
    setStatus('Ready', 'ready');
}

/* ── CORE: BUILD RECOGNITION ── */
function buildAndStart() {
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langSelect.value;
    recognition = rec;

    rec.onstart = function() {
        micBtn.classList.add('recording');
        waveform.classList.add('active');
        micPulseBar.classList.add('active');
        micStatus.textContent = 'Listening… speak now';
        setStatus('Recording', 'active');
    };

    rec.onresult = function(e) {
        /* This fires every ~200ms with interim words.
           We update the live span directly — instant. */
        let interimStr = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;

            if (e.results[i].isFinal) {
                /* Commit permanent text, remove live span */
                commitLiveSpan(finalFix(t));
                interimStr = '';
                interimText.textContent = '';
                interimBox.classList.remove('visible');
                updateWordCount();
            } else {
                interimStr += t;
            }
        }

        /* Update live span in editor with current interim */
        if (interimStr) {
            getLiveSpan().textContent = interimStr;
            editorArea.scrollTop = editorArea.scrollHeight;
            /* Also update the small preview box */
            interimText.textContent = interimStr;
            interimBox.classList.add('visible');
        }
    };

    rec.onend = function() {
        /* onend fires after silence OR network error.
           If still recording → restart immediately. */
        if (isRecording) {
            restartTimer = setTimeout(function() {
                buildAndStart();
            }, 100);
        } else {
            /* User stopped intentionally */
            removeLiveSpan();
            micBtn.classList.remove('recording');
            waveform.classList.remove('active');
            micPulseBar.classList.remove('active');
            interimText.textContent = '';
            interimBox.classList.remove('visible');
            const has = editorArea.innerText.trim().length > 0;
            micStatus.textContent = has ?
                'Stopped · click mic to continue' :
                'Click mic to start · Space to toggle · Esc to stop';
            setStatus(has ? 'Stopped' : 'Ready', has ? 'stopped' : 'ready');
            if (has) runPunctuationCheck();
            updateWordCount();
        }
    };

    rec.onerror = function(e) {
        /* network error = internet blip → restart silently */
        if (e.error === 'network') {
            if (isRecording) {
                setTimeout(function() { buildAndStart(); }, 300);
            }
            return;
        }
        /* no-speech = silence → onend will restart */
        if (e.error === 'no-speech') return;
        /* aborted = we called stop() → ignore */
        if (e.error === 'aborted') return;

        /* Real errors — show message */
        isRecording = false;
        removeLiveSpan();
        micBtn.classList.remove('recording');
        waveform.classList.remove('active');
        micPulseBar.classList.remove('active');
        const msgs = {
            'not-allowed': '⚠ Mic blocked — click 🔒 in address bar, allow mic, refresh.',
            'audio-capture': '⚠ No microphone found.',
        };
        micStatus.textContent = msgs[e.error] || 'Error: ' + e.error;
        setStatus('Error', 'error');
    };

    try {
        rec.start();
    } catch (e) {
        /* "already started" — wait and retry */
        setTimeout(function() { buildAndStart(); }, 200);
    }
}

/* ── MIC BUTTON ── */
micBtn.addEventListener('click', function() {
    if (!SR) return;

    if (isRecording) {
        /* STOP */
        isRecording = false;
        clearTimeout(restartTimer);
        try { recognition.stop(); } catch (e) {}
        removeLiveSpan();
        micBtn.classList.remove('recording');
        waveform.classList.remove('active');
        micPulseBar.classList.remove('active');
        interimText.textContent = '';
        interimBox.classList.remove('visible');
        micStatus.textContent = 'Stopped · click mic to continue';
        setStatus('Stopped', 'stopped');
        runPunctuationCheck();
    } else {
        /* START */
        isRecording = true;
        buildAndStart();
    }
});

/* ── AI TOGGLE ── */
if (aiToggleBtn) {
    aiToggleBtn.addEventListener('click', function() {
        aiEnabled = !aiEnabled;
        aiToggleBtn.classList.toggle('active', aiEnabled);
        const dot = aiToggleBtn.querySelector('.ai-dot');
        if (dot) dot.style.background = aiEnabled ? '' : 'var(--text-dim)';
        showToast(aiEnabled ? 'Smart correct ON ✓' : 'Smart correct OFF');
        if (aiStatusEl) {
            aiStatusEl.textContent = aiEnabled ? 'Smart correct ON' : 'Smart correct OFF';
            aiStatusEl.dataset.state = aiEnabled ? 'ready' : 'off';
        }
    });
}

/* ── LANGUAGE CHANGE ── */
langSelect.addEventListener('change', function() {
    if (!isRecording) return;
    try { recognition.stop(); } catch (e) {}
    /* onend will trigger restart with new language */
});

/* ── WORD COUNT ── */
function updateWordCount() {
    const txt = editorArea.innerText.replace(/\s+/g, ' ').trim();
    const words = txt ? txt.split(' ').filter(Boolean).length : 0;
    wordCountEl.textContent = words + (words === 1 ? ' word' : ' words') + ' · ' + txt.length + ' ch';
}
editorArea.addEventListener('input', updateWordCount);

/* ── PUNCTUATION CHECK ── */
function runPunctuationCheck() {
    clearPunctHighlights();
    const txt = editorArea.innerText.trim();
    if (!txt || txt.length < 20) return;
    let count = 0;
    txt.split(/(?<=[.!?])\s+/).forEach(function(s) {
        s = s.trim();
        if (s.split(/\s+/).length >= 6 && !/[.!?,;:]$/.test(s)) {
            highlightLastWord(s);
            count++;
        }
    });
    if (count > 0) showToast(count + ' sentence' + (count > 1 ? 's' : '') + ' may need punctuation');
}

function highlightLastWord(sentence) {
    const walker = document.createTreeWalker(editorArea, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        if (node.parentNode.classList && node.parentNode.classList.contains('punct-hint')) continue;
        const content = node.textContent;
        if (!content.includes(sentence.slice(0, 12))) continue;
        const words = sentence.trim().split(/\s+/);
        const last = words[words.length - 1];
        if (!last || last.length < 2) continue;
        const si = content.lastIndexOf(last);
        if (si === -1) continue;
        const before = content.slice(0, si);
        const after = content.slice(si + last.length);
        const hint = document.createElement('span');
        hint.className = 'punct-hint';
        hint.textContent = last;
        hint.title = 'Add punctuation here: .  ,  ?  !';
        const p = node.parentNode;
        if (before) p.insertBefore(document.createTextNode(before), node);
        p.insertBefore(hint, node);
        if (after) p.insertBefore(document.createTextNode(after), node);
        p.removeChild(node);
        break;
    }
}

function clearPunctHighlights() {
    editorArea.querySelectorAll('.punct-hint').forEach(function(el) {
        el.replaceWith(document.createTextNode(el.textContent));
    });
}

/* ── TOOLBAR ── */
document.querySelectorAll('.fmt-btn').forEach(function(btn) {
    btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, null);
        refreshStates();
    });
});
document.querySelectorAll('.align-btn').forEach(function(btn) {
    btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (btn.dataset.cmd) {
            document.execCommand(btn.dataset.cmd, false, null);
            refreshStates();
        }
    });
});

function refreshStates() {
    document.querySelectorAll('.fmt-btn').forEach(function(btn) {
        try { btn.classList.toggle('active', document.queryCommandState(btn.dataset.cmd)); } catch (e) {}
    });
}
editorArea.addEventListener('keyup', refreshStates);
editorArea.addEventListener('mouseup', refreshStates);
document.addEventListener('selectionchange', function() {
    if (document.activeElement === editorArea) refreshStates();
});

fontFamilySelect.addEventListener('change', function() {
    editorArea.focus();
    document.execCommand('fontName', false, fontFamilySelect.value);
});
fontSizeSelect.addEventListener('change', function() {
    editorArea.focus();
    document.execCommand('fontSize', false, fontSizeSelect.value);
});
textColorPicker.addEventListener('input', function() { textColorSwatch.style.background = textColorPicker.value; });
textColorPicker.addEventListener('change', function() {
    textColorSwatch.style.background = textColorPicker.value;
    editorArea.focus();
    document.execCommand('foreColor', false, textColorPicker.value);
});
bgColorPicker.addEventListener('input', function() { bgColorSwatch.style.background = bgColorPicker.value; });
bgColorPicker.addEventListener('change', function() {
    bgColorSwatch.style.background = bgColorPicker.value;
    editorArea.focus();
    try { document.execCommand('hiliteColor', false, bgColorPicker.value); } catch (e) { document.execCommand('backColor', false, bgColorPicker.value); }
});

/* ── CLEAR ── */
clearBtn.addEventListener('click', function() {
    if (isRecording) {
        isRecording = false;
        clearTimeout(restartTimer);
        try { recognition.stop(); } catch (e) {}
        micBtn.classList.remove('recording');
        waveform.classList.remove('active');
        micPulseBar.classList.remove('active');
    }
    removeLiveSpan();
    editorArea.innerHTML = '';
    interimText.textContent = '';
    interimBox.classList.remove('visible');
    localStorage.removeItem('vocatype-draft');
    updateWordCount();
    setStatus('Ready', 'ready');
    micStatus.textContent = 'Click mic to start · Space to toggle · Esc to stop';
});

/* ── COPY ── */
copyBtn.addEventListener('click', function() {
    const txt = editorArea.innerText.trim();
    if (!txt) { showToast('Nothing to copy!'); return; }
    navigator.clipboard.writeText(txt)
        .then(function() { showToast('Copied ✓'); })
        .catch(function() {
            const sel = window.getSelection();
            const r = document.createRange();
            r.selectNodeContents(editorArea);
            sel.removeAllRanges();
            sel.addRange(r);
            document.execCommand('copy');
            sel.removeAllRanges();
            showToast('Copied ✓');
        });
});

/* ── SAVE ── */
downloadBtn.addEventListener('click', function() {
    const txt = editorArea.innerText.trim();
    if (!txt) { showToast('Nothing to save!'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
    a.download = 'vocatype-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    showToast('Saved ✓');
});

/* ── AUTO-SAVE ── */
setInterval(function() {
    const html = editorArea.innerHTML.trim();
    if (html) {
        localStorage.setItem('vocatype-draft', html);
        autosaveBadge.classList.add('show');
        setTimeout(function() { autosaveBadge.classList.remove('show'); }, 2000);
    }
}, 10000);
(function() {
    const d = localStorage.getItem('vocatype-draft');
    if (d) {
        editorArea.innerHTML = d;
        updateWordCount();
        showToast('Draft restored ✓');
    }
})();

/* ── TOAST ── */
function showToast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function() { requestAnimationFrame(function() { t.classList.add('show'); }); });
    setTimeout(function() {
        t.classList.remove('show');
        setTimeout(function() { t.remove(); }, 350);
    }, 2800);
}

/* ── STATUS ── */
function setStatus(label, type) {
    statusText.textContent = label;
    statusDot.className = 'status-dot ' + type;
}

/* ── THEME ── */
themeToggle.addEventListener('click', function() {
    isDark = !isDark;
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        iconSun.style.display = '';
        iconMoon.style.display = 'none';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        iconSun.style.display = 'none';
        iconMoon.style.display = '';
    }
    localStorage.setItem('vocatype-theme', isDark ? 'dark' : 'light');
});
(function() {
    if (localStorage.getItem('vocatype-theme') === 'light') {
        isDark = false;
        document.documentElement.setAttribute('data-theme', 'light');
        iconSun.style.display = 'none';
        iconMoon.style.display = '';
    }
})();

/* ── KEYBOARD ── */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isRecording) { micBtn.click(); return; }
    if (e.code === 'Space') {
        if (document.activeElement === editorArea) return;
        if (document.activeElement.tagName === 'SELECT') return;
        if (document.activeElement.tagName === 'INPUT') return;
        e.preventDefault();
        micBtn.click();
    }
});

/* ── INJECT EXTRA STYLES ── */
(function() {
    const s = document.createElement('style');
    s.textContent = `
    #vt-interim  { color:var(--accent); opacity:0.72; }
    .punct-hint  { text-decoration:underline wavy #ffcc44; cursor:help; }
    #aiStatus[data-state="off"] { color:var(--text-dim); }
  `;
    document.head.appendChild(s);
})();

/* ── INIT ── */
updateWordCount();
if (aiStatusEl) {
    aiStatusEl.textContent = 'Smart correct ON';
    aiStatusEl.dataset.state = 'ready';
}
console.log('%c VocaType 🎙 ', 'background:#7c6fff;color:#fff;font-size:14px;padding:6px 16px;border-radius:6px;');
console.log('%c Muhammad Abdullah · UET CS · Gaming & Animation · 2026', 'color:#7c6fff;');