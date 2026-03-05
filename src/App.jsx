import { useEffect, useRef } from "react";
import { initMonkeyType } from "./monkeytype-core";

const APP_MARKUP = `<div class="page">
    <header class="topbar">
      <div class="top-left">
        <div class="brand">
          <div class="logo-box" aria-hidden="true">
            <svg viewBox="0 0 28 22" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.8">
              <path d="M5 2 L13 11 L5 20"></path>
              <path d="M13 2 L21 11 L13 20"></path>
            </svg>
          </div>
          <div class="brand-copy">
            <div class="brand-sub">coddy camp</div>
            <div class="brand-title"><span class="brand-accent">Coddy</span>Type</div>
          </div>
        </div>

        <div class="top-icons" aria-hidden="true">
          <button class="icon-btn" type="button" tabindex="-1">
            <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"></rect><line x1="6.5" y1="10.5" x2="8.5" y2="10.5"></line><line x1="10" y1="10.5" x2="12" y2="10.5"></line><line x1="13.5" y1="10.5" x2="15.5" y2="10.5"></line><line x1="7.5" y1="13.5" x2="13" y2="13.5"></line></svg>
          </button>
          <button class="icon-btn" type="button" tabindex="-1">
            <svg viewBox="0 0 24 24"><path d="M4 18h16"></path><path d="M6 18 5 8l4 2 3-5 3 5 4-2-1 10"></path></svg>
          </button>
          <button class="icon-btn" type="button" tabindex="-1">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><line x1="12" y1="10" x2="12" y2="16"></line><circle cx="12" cy="7" r="1"></circle></svg>
          </button>
          <button class="icon-btn" type="button" tabindex="-1">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.2-2-3.4-2.2.9a7 7 0 0 0-1.7-1L14.5 3h-5L9 6.3a7 7 0 0 0-1.7 1l-2.2-.9-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.2 2 3.4 2.2-.9a7 7 0 0 0 1.7 1l.5 3.3h5l.5-3.3a7 7 0 0 0 1.7-1l2.2.9 2-3.4-2-1.2c.1-.3.1-.7.1-1z"></path></svg>
          </button>
        </div>
      </div>

      <div class="top-actions">
        <button class="icon-btn" type="button" tabindex="-1">
          <svg viewBox="0 0 24 24"><path d="M18 16v-5a6 6 0 1 0-12 0v5"></path><path d="M5 16h14"></path><path d="M10 19a2 2 0 0 0 4 0"></path></svg>
        </button>
        <button id="profileBtn" class="icon-btn" type="button" tabindex="-1">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M5 20c1.6-3.2 4.1-5 7-5s5.4 1.8 7 5"></path></svg>
        </button>
      </div>
    </header>

    <div class="typing-view">
      <div class="mode-bar" id="modeBar">
        <span class="mode-item"><span class="char-icon">@</span><span>punctuation</span></span>
        <span class="mode-item"><span class="char-icon">#</span><span>numbers</span></span>
        <span class="mode-sep">|</span>
        <span class="mode-item active"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l3 2"></path></svg><span>time</span></span>
        <span class="mode-item"><span class="char-icon">A</span><span>words</span></span>
        <span class="mode-item"><span class="char-icon">"</span><span>quote</span></span>
        <span class="mode-item"><span class="char-icon">^</span><span>zen</span></span>
        <span class="mode-item"><svg viewBox="0 0 24 24"><path d="M14 7 7 14"></path><path d="M16 3h5v5"></path><path d="m3 21 6-6"></path><path d="M14 14 21 7"></path></svg><span>custom</span></span>
        <span class="mode-sep">|</span>
        <span class="time-item active" data-time="15">15</span>
        <span class="time-item" data-time="30">30</span>
        <span class="time-item" data-time="60">60</span>
        <span class="time-item" data-time="120">120</span>
        <span class="mode-item"><svg viewBox="0 0 24 24"><path d="M4 12h16"></path><path d="M8 8h8"></path><path d="M8 16h8"></path></svg></span>
      </div>

      <div class="lang-row" aria-hidden="true">
        <span class="lang-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path></svg>
          <span>english</span>
        </span>
        <span class="lang-item">
          <svg viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="m16 3 4 4-4 4"></path><path d="M20 17H4"></path><path d="m8 13-4 4 4 4"></path></svg>
          <span>opposite shift (keymap)</span>
        </span>
      </div>

      <div id="liveTime" class="live-time">15</div>

      <main class="typing-wrap" id="typingWrap">
        <div id="smoothCaret" class="smooth-caret" aria-hidden="true"></div>
        <div id="words" class="words"></div>
        <input id="hiddenInput" class="hidden-input" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">
      </main>

      <div class="restart-row">
        <button id="restartBtn" class="restart-btn" type="button" aria-label="Restart">
          <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 1-3-6.2"></path><path d="M20 4v7h-7"></path></svg>
        </button>
      </div>
      <div id="result" class="result"></div>
    </div>

    <section id="resultsScreen" class="results-screen" aria-live="polite">
      <div class="results-top">
        <div class="summary-left">
          <div class="metric">
            <span class="label">wpm</span>
            <span class="value" id="resultWpm">0.00</span>
          </div>
          <div class="metric">
            <span class="label">acc</span>
            <span class="value" id="resultAcc">100.00%</span>
          </div>
        </div>
        <div class="chart-wrap">
          <svg id="resultChart" class="chart-svg" viewBox="0 0 1120 260" preserveAspectRatio="none">
            <g id="chartGrid"></g>
            <polyline id="chartRaw" class="chart-line-raw" points=""></polyline>
            <polyline id="chartWpm" class="chart-line-wpm" points=""></polyline>
            <g id="chartRawDots"></g>
            <g id="chartWpmDots"></g>
            <g id="chartErrors"></g>
            <line id="chartHoverLine" class="chart-hover-line" x1="0" y1="0" x2="0" y2="0"></line>
            <circle id="chartHoverDotRaw" class="chart-hover-dot-raw" cx="0" cy="0" r="4.5"></circle>
            <circle id="chartHoverDotWpm" class="chart-hover-dot-wpm" cx="0" cy="0" r="4.5"></circle>
          </svg>
          <div id="chartTooltip" class="chart-tooltip" aria-hidden="true"></div>
        </div>
      </div>

      <div class="results-bottom">
        <div class="bottom-card">
          <div class="label">test type</div>
          <div class="meta" id="resultTestType">time 15<br>english</div>
        </div>
        <div class="bottom-card">
          <div class="label">raw</div>
          <div class="value" id="resultRaw">0.00</div>
        </div>
        <div class="bottom-card">
          <div class="label">characters</div>
          <div class="value" id="resultChars">0/0/0/0</div>
        </div>
        <div class="bottom-card">
          <div class="label">consistency</div>
          <div class="value" id="resultConsistency">100.00%</div>
        </div>
        <div class="bottom-card">
          <div class="label">time</div>
          <div class="value" id="resultTime">0.00s</div>
          <div class="meta" id="resultTimeMeta">00:00:00 session</div>
        </div>
      </div>

      <div class="result-actions" aria-hidden="true">
        <span class="result-action"><svg viewBox="0 0 24 24"><path d="M9 6 15 12 9 18"></path></svg></span>
        <span class="result-action"><svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 1-3-6.2"></path><path d="M20 4v7h-7"></path></svg></span>
        <span class="result-action"><svg viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3z"></path><line x1="12" y1="9" x2="12" y2="14"></line><circle cx="12" cy="17" r="1"></circle></svg></span>
        <span class="result-action"><svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="10" y1="18" x2="20" y2="18"></line></svg></span>
        <span class="result-action"><svg viewBox="0 0 24 24"><polygon points="5 12 11 8 11 16 5 12"></polygon><polygon points="13 12 19 8 19 16 13 12"></polygon></svg></span>
        <span class="result-action"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"></rect><circle cx="8.5" cy="10.5" r="1.4"></circle><path d="M21 15 15.5 10 12.5 13 10.5 11 3 18"></path></svg></span>
      </div>
      <div class="result-signin">Sign in to save your result</div>
    </section>

    <section id="adminPage" class="admin-page hidden">
      <div class="ap-header">
        <div class="ap-title-row">
          <h1 class="ap-title">Панель администратора</h1>
          <div class="ap-controls">
            <input id="adminSearch" class="ap-search" type="text" placeholder="Поиск по имени или фамилии…" autocomplete="off">
            <select id="adminGroupFilter" class="ap-select">
              <option value="">Все группы</option>
            </select>
            <button id="refreshAdminBtn" class="ap-btn" type="button">
              <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 1-3-6.2"></path><path d="M20 4v7h-7"></path></svg>
              Обновить
            </button>
          </div>
        </div>
        <div class="ap-config" id="apConfig">
          <div class="ap-config-label">Настройки теста для учеников</div>
          <div class="ap-config-bar">
            <span class="ap-cfg-mode" data-mode="time">⏱ time</span>
            <span class="ap-cfg-mode" data-mode="words">A words</span>
            <span class="ap-cfg-sep">|</span>
            <span class="ap-cfg-time" data-time="15">15</span>
            <span class="ap-cfg-time" data-time="30">30</span>
            <span class="ap-cfg-time" data-time="60">60</span>
            <span class="ap-cfg-time" data-time="120">120</span>
            <span class="ap-cfg-sep">|</span>
            <span class="ap-cfg-toggle" data-toggle="punctuation">@ punctuation</span>
            <span class="ap-cfg-toggle" data-toggle="numbers"># numbers</span>
            <span class="ap-cfg-sep">|</span>
            <span class="ap-cfg-diff" data-diff="very easy">very easy</span>
            <span class="ap-cfg-diff" data-diff="easy">easy</span>
            <span class="ap-cfg-diff" data-diff="medium">medium</span>
            <span class="ap-cfg-diff" data-diff="hard">hard</span>
            <span class="ap-cfg-diff" data-diff="random">random</span>
            <span class="ap-cfg-sep">|</span>
            <button id="saveConfigBtn" class="ap-cfg-save" type="button">Сохранить</button>
          </div>
        </div>

        <div class="ap-stats" id="apStats">
          <div class="ap-stat-card">
            <div class="ap-stat-label">Учеников</div>
            <div class="ap-stat-value" id="apStatTotal">—</div>
          </div>
          <div class="ap-stat-card">
            <div class="ap-stat-label">Средний WPM</div>
            <div class="ap-stat-value" id="apStatAvgWpm">—</div>
          </div>
          <div class="ap-stat-card">
            <div class="ap-stat-label">Лучший WPM</div>
            <div class="ap-stat-value" id="apStatTopWpm">—</div>
          </div>
          <div class="ap-stat-card">
            <div class="ap-stat-label">Средняя точность</div>
            <div class="ap-stat-value" id="apStatAvgAcc">—</div>
          </div>
        </div>
      </div>

      <div class="ap-table-wrap">
        <table class="ap-table">
          <thead>
            <tr>
              <th class="ap-th" style="width:40px">#</th>
              <th class="ap-th" data-col="name">Ученик <span class="ap-sort-icon"></span></th>
              <th class="ap-th" data-col="group">Группа <span class="ap-sort-icon"></span></th>
              <th class="ap-th" data-col="maxWpm">Max WPM <span class="ap-sort-icon"></span></th>
              <th class="ap-th" data-col="maxAcc">Max ACC <span class="ap-sort-icon"></span></th>
              <th class="ap-th" data-col="maxRaw">Max RAW <span class="ap-sort-icon"></span></th>
              <th class="ap-th" data-col="restartCount">Попыток <span class="ap-sort-icon"></span></th>
              <th class="ap-th" data-col="lastResultAt">Последний результат <span class="ap-sort-icon"></span></th>
              <th class="ap-th" style="width:90px;cursor:default">Действия</th>
            </tr>
          </thead>
          <tbody id="adminTableBody"></tbody>
        </table>
        <div id="adminLoading" class="ap-loading hidden">
          <div class="ap-spinner"></div>
          <span>Загрузка данных…</span>
        </div>
        <div id="adminEmpty" class="ap-empty hidden">Нет данных</div>
      </div>
    </section>
  </div>

  <div id="userModal" class="user-modal hidden">
    <div class="user-modal-name" id="userModalName">guest</div>
    <div class="user-modal-divider"></div>
    <button id="adminToggleBtn" class="user-modal-btn hidden" type="button">admin panel</button>
    <button id="logoutBtn" class="user-modal-btn user-modal-logout hidden" type="button">logout</button>
  </div>

  <div id="pageLoading" class="page-loading hidden">
    <div class="page-loading-spinner"></div>
  </div>

  <div id="authGate" class="auth-gate hidden">
    <div class="auth-card">

      <div class="auth-brand">
        <div class="auth-logo">
          <svg viewBox="0 0 28 22" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.8">
            <path d="M5 2 L13 11 L5 20"></path>
            <path d="M13 2 L21 11 L13 20"></path>
          </svg>
        </div>
        <div class="auth-brand-name"><span class="auth-brand-accent">Coddy</span>Type</div>
      </div>

      <div id="authLoading" class="auth-loading">
        <div class="auth-spinner"></div>
        <span id="authLoadingText">Loading...</span>
      </div>

      <div class="auth-tabs">
        <button id="showLoginBtn" class="auth-tab active" type="button">Sign in</button>
        <button id="showRegisterBtn" class="auth-tab" type="button">Sign up</button>
        <div class="auth-tab-indicator"></div>
      </div>

      <form id="loginForm" class="auth-form">
        <div class="auth-field">
          <label class="auth-label">First name</label>
          <input id="loginFirstName" type="text" class="auth-input" placeholder="John" required autocomplete="given-name">
        </div>
        <div class="auth-field">
          <label class="auth-label">Last name</label>
          <input id="loginLastName" type="text" class="auth-input" placeholder="Doe" required autocomplete="family-name">
        </div>
        <div class="auth-field">
          <label class="auth-label">Group</label>
          <input id="loginGroup" type="text" class="auth-input" placeholder="A1" required autocomplete="off">
        </div>
        <div class="auth-field">
          <label class="auth-label">Password</label>
          <input id="loginPassword" type="password" class="auth-input" placeholder="••••••••" required autocomplete="current-password">
        </div>
        <button class="auth-submit" type="submit">Sign in</button>
      </form>

      <form id="registerForm" class="auth-form hidden">
        <div class="auth-row">
          <div class="auth-field">
            <label class="auth-label">First name</label>
            <input id="regFirstName" type="text" class="auth-input" placeholder="John" required autocomplete="given-name">
          </div>
          <div class="auth-field">
            <label class="auth-label">Last name</label>
            <input id="regLastName" type="text" class="auth-input" placeholder="Doe" required autocomplete="family-name">
          </div>
        </div>
        <div class="auth-field">
          <label class="auth-label">Group</label>
          <input id="regGroup" type="text" class="auth-input" placeholder="A1" required autocomplete="off">
        </div>
        <div class="auth-row">
          <div class="auth-field">
            <label class="auth-label">Password</label>
            <input id="regPassword" type="password" class="auth-input" placeholder="••••••••" required autocomplete="new-password">
          </div>
          <div class="auth-field">
            <label class="auth-label">Confirm password</label>
            <input id="regPasswordConfirm" type="password" class="auth-input" placeholder="••••••••" required autocomplete="new-password">
          </div>
        </div>
        <button class="auth-submit" type="submit">Create account</button>
      </form>

      <div id="authMessage" class="auth-message"></div>
    </div>
  </div>`;

export default function App() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    initMonkeyType();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: APP_MARKUP }} />;
}
