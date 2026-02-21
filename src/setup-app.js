import { createSetupRequestClient, SetupRequestError } from "/setup/request-client.js";
import { createErrorBannerController } from "/setup/error-boundary.js";

// OpenClaw Setup - Client-side logic
// Served at /setup/app.js

(function () {
  'use strict';

  // ======== Toast System ========
  var toastContainer = document.getElementById('toastContainer');
  var TOAST_ICONS = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  function toast(message, type) {
    type = type || 'info';
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = (TOAST_ICONS[type] || '') + '<span>' + escapeHtml(message) + '</span>';
    toastContainer.appendChild(el);
    setTimeout(function () {
      el.classList.add('removing');
      setTimeout(function () { el.remove(); }, 250);
    }, 4000);
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ======== Tab Navigation ========
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.tab-panel');
  var TAB_NAMES = ['setup', 'channels', 'tools'];

  function switchTab(name) {
    tabs.forEach(function (t) {
      var isActive = t.getAttribute('data-tab') === name;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    panels.forEach(function (p) {
      p.classList.toggle('active', p.id === 'panel-' + name);
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      switchTab(t.getAttribute('data-tab'));
    });
  });

  // Keyboard shortcuts: 1/2/3 for tabs, arrow keys within tab bar
  document.addEventListener('keydown', function (e) {
    // Don't capture if user is typing in an input/textarea/select
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === '1') switchTab('setup');
    else if (e.key === '2') switchTab('channels');
    else if (e.key === '3') switchTab('tools');

    // Arrow key navigation within tabs
    if (e.target.classList && e.target.classList.contains('tab')) {
      var idx = TAB_NAMES.indexOf(e.target.getAttribute('data-tab'));
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var next = TAB_NAMES[(idx + 1) % TAB_NAMES.length];
        switchTab(next);
        document.querySelector('[data-tab="' + next + '"]').focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = TAB_NAMES[(idx - 1 + TAB_NAMES.length) % TAB_NAMES.length];
        switchTab(prev);
        document.querySelector('[data-tab="' + prev + '"]').focus();
      }
    }
  });

  // ======== Channel Accordion ========
  var channelCards = document.querySelectorAll('.channel-card');
  channelCards.forEach(function (card) {
    var header = card.querySelector('.channel-header');
    if (!header) return;
    header.addEventListener('click', function () {
      var wasOpen = card.classList.contains('open');
      card.classList.toggle('open');
      header.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
    });
  });

  // Track channel token inputs for "Connected" badges
  function updateChannelBadges() {
    var tg = document.getElementById('telegramToken');
    var dc = document.getElementById('discordToken');
    var sb = document.getElementById('slackBotToken');
    if (tg) document.getElementById('channelTelegram').classList.toggle('has-token', !!tg.value.trim());
    if (dc) document.getElementById('channelDiscord').classList.toggle('has-token', !!dc.value.trim());
    if (sb) document.getElementById('channelSlack').classList.toggle('has-token', !!sb.value.trim());
  }
  ['telegramToken', 'discordToken', 'slackBotToken', 'slackAppToken'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', updateChannelBadges);
  });

  // ======== Element refs ========
  var statusEl = document.getElementById('status');
  var statusDot = document.getElementById('statusDot');
  var statusVersion = document.getElementById('statusVersion');
  var logEl = document.getElementById('log');

  var authChoiceEl = document.getElementById('authChoice');
  var modelEl = document.getElementById('model');
  var modelFieldEl = document.getElementById('modelField');
  var modelHintEl = document.getElementById('modelHint');

  var consoleCmdEl = document.getElementById('consoleCmd');
  var consoleArgEl = document.getElementById('consoleArg');
  var consoleRunEl = document.getElementById('consoleRun');
  var consoleOutEl = document.getElementById('consoleOut');

  var configPathEl = document.getElementById('configPath');
  var configTextEl = document.getElementById('configText');
  var configReloadEl = document.getElementById('configReload');
  var configSaveEl = document.getElementById('configSave');
  var configOutEl = document.getElementById('configOut');

  var importFileEl = document.getElementById('importFile');
  var importRunEl = document.getElementById('importRun');
  var importOutEl = document.getElementById('importOut');
  var previewCaptureEl = document.getElementById('previewCapture');


  var previewToggleEl = document.getElementById('previewToggle');
  var previewGalleryLinkEl = document.getElementById('previewGalleryLink');
  var previewFramesLinkEl = document.getElementById('previewFramesLink');

  var pageRoot = document.querySelector('main') || document.body;
  var errorBoundary = createErrorBannerController({ root: pageRoot });

  // ======== Model field visibility ========
  var providersWithModel = {
    'openrouter-api-key': { placeholder: 'anthropic/claude-sonnet-4', hint: 'OpenRouter: <code>provider/model-name</code>' },
    'openai-api-key': { placeholder: 'gpt-4o', hint: 'e.g. gpt-4o, gpt-4o-mini, o1-preview' },
    'gemini-api-key': { placeholder: 'gemini-2.5-pro', hint: 'e.g. gemini-2.5-pro, gemini-2.5-flash' },
    'ai-gateway-api-key': { placeholder: 'anthropic/claude-sonnet-4', hint: 'provider/model format via Vercel AI Gateway' },
    'apiKey': { placeholder: 'claude-sonnet-4-20250514', hint: 'e.g. claude-sonnet-4-20250514, claude-opus-4-20250514' }
  };

  function updateModelVisibility() {
    var choice = authChoiceEl.value;
    var cfg = providersWithModel[choice];
    if (cfg) {
      modelFieldEl.style.display = '';
      modelEl.placeholder = cfg.placeholder;
      modelHintEl.innerHTML = cfg.hint;
    } else {
      modelFieldEl.style.display = 'none';
    }
  }

  authChoiceEl.addEventListener('change', updateModelVisibility);
  updateModelVisibility();

  var requestClient = createSetupRequestClient({
    onAuthRequired: function () {
      window.location.href = '/auth/login';
    }
  });

  function findSectionFromElement(el) {
    return el ? el.closest('.card') : null;
  }

  function toErrorString(err) {
    return err && err.message ? err.message : String(err);
  }

  function runInSectionBoundary(task, opts) {
    opts = opts || {};
    return Promise.resolve()
      .then(task)
      .catch(function (err) {
        var sectionEl = opts.sectionEl || null;
        if (sectionEl) errorBoundary.markSectionBoundary(sectionEl, true);

        errorBoundary.showForError(err, { sectionLabel: opts.sectionLabel || 'this section' }, {
          onAction: function () {
            errorBoundary.hideBanner();
            if (sectionEl) errorBoundary.markSectionBoundary(sectionEl, false);
            if (typeof opts.onRetry === 'function') opts.onRetry();
          }
        });

        if (typeof opts.onError === 'function') opts.onError(err);
        throw err;
      });
  }

  window.addEventListener('error', function (event) {
    errorBoundary.showForError(event.error || new Error(event.message || 'Unexpected error'), { sectionLabel: 'the setup page' });
  });

  window.addEventListener('unhandledrejection', function (event) {
    errorBoundary.showForError(event.reason || new Error('Unhandled async error'), { sectionLabel: 'the setup page' });
  });

  // ======== Helpers ========
  function showLog(text) {
    logEl.textContent = text;
    logEl.classList.add('visible');
  }

  function appendLog(text) {
    logEl.textContent += text;
    logEl.classList.add('visible');
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setStatus(text, state) {
    statusEl.textContent = text;
    statusDot.className = 'status-dot';
    if (state === 'ok') statusDot.classList.add('ok');
    else if (state === 'err') statusDot.classList.add('err');
    else if (state === 'loading') statusDot.classList.add('loading');
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle('loading', loading);
    btn.disabled = loading;
  }

  function collectDraftState() {
    return pickDraftState({
      flow: document.getElementById('flow') ? document.getElementById('flow').value : '',
      authChoice: authChoiceEl ? authChoiceEl.value : '',
      authSecret: document.getElementById('authSecret') ? document.getElementById('authSecret').value : '',
      model: modelEl ? modelEl.value : '',
      telegramToken: document.getElementById('telegramToken') ? document.getElementById('telegramToken').value : '',
      discordToken: document.getElementById('discordToken') ? document.getElementById('discordToken').value : '',
      slackBotToken: document.getElementById('slackBotToken') ? document.getElementById('slackBotToken').value : '',
      slackAppToken: document.getElementById('slackAppToken') ? document.getElementById('slackAppToken').value : '',
      configText: configTextEl ? configTextEl.value : ''
    });
  }

  function applyDraftState(state) {
    if (document.getElementById('flow')) document.getElementById('flow').value = state.flow || '';
    if (authChoiceEl) authChoiceEl.value = state.authChoice || authChoiceEl.value;
    if (document.getElementById('authSecret')) document.getElementById('authSecret').value = state.authSecret || '';
    if (modelEl) modelEl.value = state.model || '';
    if (document.getElementById('telegramToken')) document.getElementById('telegramToken').value = state.telegramToken || '';
    if (document.getElementById('discordToken')) document.getElementById('discordToken').value = state.discordToken || '';
    if (document.getElementById('slackBotToken')) document.getElementById('slackBotToken').value = state.slackBotToken || '';
    if (document.getElementById('slackAppToken')) document.getElementById('slackAppToken').value = state.slackAppToken || '';
    if (configTextEl) configTextEl.value = state.configText || configTextEl.value;
    updateModelVisibility();
    updateChannelBadges();
  }

  function hideDraftBanner() {
    if (draftBannerEl) draftBannerEl.remove();
    draftBannerEl = null;
  }

  function showDraftBanner(message, actions) {
    hideDraftBanner();
    draftBannerEl = document.createElement('div');
    draftBannerEl.style.margin = '0 0 1rem 0';
    draftBannerEl.style.padding = '0.85rem 1rem';
    draftBannerEl.style.borderRadius = '10px';
    draftBannerEl.style.border = '1px solid rgba(59,130,246,.45)';
    draftBannerEl.style.background = 'rgba(59,130,246,.12)';
    draftBannerEl.style.color = '#bfdbfe';
    draftBannerEl.style.display = 'flex';
    draftBannerEl.style.justifyContent = 'space-between';
    draftBannerEl.style.alignItems = 'center';
    draftBannerEl.style.gap = '0.75rem';

    var text = document.createElement('span');
    text.textContent = message;

    var controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '0.5rem';

    actions.forEach(function (action) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = action.label;
      btn.style.border = '1px solid rgba(255,255,255,.25)';
      btn.style.background = 'rgba(255,255,255,.08)';
      btn.style.color = '#fff';
      btn.style.borderRadius = '8px';
      btn.style.padding = '0.35rem 0.65rem';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', action.onClick);
      controls.appendChild(btn);
    });

    draftBannerEl.appendChild(text);
    draftBannerEl.appendChild(controls);
    pageRoot.prepend(draftBannerEl);
  }

  function persistDraftNow() {
    try {
      var draft = createDraft(collectDraftState());
      saveDraft(window.localStorage, draft);
    } catch (_e) {
      // best-effort only
    }
  }

  function scheduleDraftSave() {
    clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(persistDraftNow, 200);
  }

  function initDraftResume() {
    var loaded = loadDraft(window.localStorage, { ttlMs: DRAFT_TTL_MS });

    if (loaded.reason === 'stale') {
      clearDraft(window.localStorage);
      return;
    }

    if (!loaded.draft || loaded.reason !== 'ok') return;

    var current = collectDraftState();
    var merged = mergeDraftState(current, loaded.draft.state, { allowConflict: false });
    var ageMinutes = Math.max(1, Math.round((Date.now() - Number(loaded.draft.updatedAt || loaded.draft.createdAt || Date.now())) / 60000));

    if (merged.conflicts.length > 0) {
      showDraftBanner('Unsaved draft found (' + ageMinutes + ' min ago). Some fields already have values.', [
        {
          label: 'Restore safe fields',
          onClick: function () {
            applyDraftState(merged.state);
            hideDraftBanner();
            toast('Draft partially restored', 'info');
          }
        },
        {
          label: 'Force restore all',
          onClick: function () {
            applyDraftState(mergeDraftState(current, loaded.draft.state, { allowConflict: true }).state);
            hideDraftBanner();
            toast('Draft restored', 'success');
          }
        },
        {
          label: 'Discard draft',
          onClick: function () {
            clearDraft(window.localStorage);
            hideDraftBanner();
            toast('Draft discarded', 'info');
          }
        }
      ]);
      return;
    }

    showDraftBanner('Unsaved draft found (' + ageMinutes + ' min ago).', [
      {
        label: 'Resume',
        onClick: function () {
          applyDraftState(loaded.draft.state);
          hideDraftBanner();
          toast('Draft restored', 'success');
        }
      },
      {
        label: 'Discard',
        onClick: function () {
          clearDraft(window.localStorage);
          hideDraftBanner();
          toast('Draft discarded', 'info');
        }
      }
    ]);
  }


  function initPreviewMode() {
    var devAllowed = Boolean(window.__OPENCLAW_DEV_FEATURES_ALLOWED__);
    if (!devAllowed) {
      if (previewToggleEl) previewToggleEl.style.display = 'none';
      if (previewGalleryLinkEl) previewGalleryLinkEl.style.display = 'none';
      if (previewFramesLinkEl) previewFramesLinkEl.style.display = 'none';
      if (previewCaptureEl) previewCaptureEl.style.display = 'none';
      return;
    }
    if (!previewToggleEl) return;

    if (previewGalleryLinkEl) previewGalleryLinkEl.style.display = '';
    if (previewFramesLinkEl) previewFramesLinkEl.style.display = '';
    if (previewCaptureEl) previewCaptureEl.style.display = '';
    previewToggleEl.style.display = '';

    function setPreviewButton(enabled) {
      previewToggleEl.textContent = enabled ? 'Preview: ON' : 'Preview: OFF';
      previewToggleEl.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      previewToggleEl.style.borderColor = enabled ? 'rgba(34,197,94,.55)' : 'rgba(244,244,245,.1)';
      previewToggleEl.style.color = enabled ? '#86efac' : '';
    }

    httpJson('/setup/api/dev/preview-mode').then(function (j) {
      setPreviewButton(Boolean(j.enabled));
    }).catch(function () {
      previewToggleEl.style.display = 'none';
      if (previewGalleryLinkEl) previewGalleryLinkEl.style.display = 'none';
      if (previewFramesLinkEl) previewFramesLinkEl.style.display = 'none';
    });

    previewToggleEl.addEventListener('click', function () {
      var nextEnabled = previewToggleEl.textContent.indexOf('OFF') !== -1;
      httpJson('/setup/api/dev/preview-mode', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled })
      }).then(function (j) {
        setPreviewButton(Boolean(j.enabled));
        toast('Preview Mode ' + (j.enabled ? 'enabled' : 'disabled'), 'info');
      }).catch(function (e) {
        toast('Failed to toggle Preview Mode: ' + toErrorString(e), 'error');
      });
    });

    if (previewCaptureEl) {
      previewCaptureEl.addEventListener('click', function () {
        setLoading(previewCaptureEl, true);
        httpJson('/setup/api/dev/screenshot?path=' + encodeURIComponent('/setup'))
          .then(function (j) {
            toast('Screenshot captured', 'success');
            if (j && j.url) {
              window.open(j.url, '_blank');
            }
          })
          .catch(function (err) {
            toast('Screenshot capture failed: ' + toErrorString(err), 'error');
          })
          .finally(function () {
            setLoading(previewCaptureEl, false);
          });
      });
    }

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        previewToggleEl.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g' && previewGalleryLinkEl) {
        e.preventDefault();
        window.open('/setup/gallery', '_blank');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        httpJson('/setup/api/dev/screenshot?path=' + encodeURIComponent('/setup')).then(function (j) {
          toast('Screenshot captured', 'success');
          if (j && j.url) window.open(j.url, '_blank');
        }).catch(function (err) {
          toast('Screenshot capture failed: ' + toErrorString(err), 'error');
        });
      }
    });
  }

  function httpJson(url, opts) {
    return requestClient.requestJson(url, opts || {});
  }

  function httpText(url, opts) {
    return requestClient.requestText(url, opts || {});
  }

  // ======== Status ========
  function refreshStatus() {
    setStatus('Checking...', 'loading');
    return httpJson('/setup/api/status').then(function (j) {
      var ver = j.openclawVersion ? j.openclawVersion : '';
      if (statusVersion) statusVersion.textContent = ver ? 'v' + ver : '';
      if (j.configured) {
        setStatus('Instance running', 'ok');
      } else {
        setStatus('Not configured', 'err');
      }
      errorBoundary.hideBanner();
      errorBoundary.setSafeMode(false);
      errorBoundary.markSectionBoundary(null, false);
      loadConfigRaw();
    }).catch(function (e) {
      setStatus('Connection error', 'err');
      if (statusVersion) statusVersion.textContent = '';
    });
  }

  // ======== Run setup ========
  var runBtn = document.getElementById('run');
  runBtn.addEventListener('click', function () {
    var secret = document.getElementById('authSecret').value.trim();
    if (!secret && authChoiceEl.value !== 'claude-cli' && authChoiceEl.value !== 'codex-cli') {
      toast('Please enter an API key', 'error');
      document.getElementById('authSecret').focus();
      return;
    }

    setLoading(runBtn, true);

    var payload = {
      flow: document.getElementById('flow').value,
      authChoice: authChoiceEl.value,
      authSecret: document.getElementById('authSecret').value,
      model: modelEl.value,
      telegramToken: document.getElementById('telegramToken').value,
      discordToken: document.getElementById('discordToken').value,
      slackBotToken: document.getElementById('slackBotToken').value,
      slackAppToken: document.getElementById('slackAppToken').value
    };

    showLog('Deploying configuration...\n');

    runInSectionBoundary(function () {
      return httpText('/setup/api/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        maxRetries: 0
      });
    }, {
      sectionEl: findSectionFromElement(runBtn),
      sectionLabel: 'setup deployment',
      onRetry: function () { runBtn.click(); }
    }).then(function (text) {
      var j;
      try { j = JSON.parse(text); } catch (_e) { j = { ok: false, output: text }; }
      appendLog(j.output || JSON.stringify(j, null, 2));
      if (j.ok) {
        clearDraft(window.localStorage);
        hideDraftBanner();
        toast('Configuration deployed successfully', 'success');
      } else {
        toast('Setup completed with warnings -- check the log', 'info');
      }
      return refreshStatus();
    }).catch(function (e) {
      appendLog('\nError: ' + toErrorString(e) + '\n');
      toast('Deployment failed: ' + toErrorString(e), 'error');
    }).finally(function () {
      setLoading(runBtn, false);
    });
  });

  // ======== Reset ========
  document.getElementById('reset').addEventListener('click', function () {
    if (!confirm('Reset configuration? This deletes the config file so setup can run again.')) return;
    showLog('Resetting...\n');
    runInSectionBoundary(function () {
      return httpText('/setup/api/reset', { method: 'POST', maxRetries: 0 });
    }, {
      sectionEl: findSectionFromElement(document.getElementById('reset')),
      sectionLabel: 'configuration reset',
      onRetry: function () { document.getElementById('reset').click(); }
    }).then(function (t) {
        appendLog(t + '\n');
        toast('Configuration reset', 'info');
        return refreshStatus();
      })
      .catch(function (e) {
        appendLog('Error: ' + toErrorString(e) + '\n');
        toast('Reset failed', 'error');
      });
  });

  // ======== Debug Console ========
  function runConsole() {
    if (!consoleCmdEl || !consoleRunEl) return;
    var cmd = consoleCmdEl.value;
    var arg = consoleArgEl ? consoleArgEl.value : '';

    setLoading(consoleRunEl, true);
    if (consoleOutEl) { consoleOutEl.textContent = 'Running ' + cmd + '...\n'; consoleOutEl.classList.add('visible'); }

    return runInSectionBoundary(function () {
      return httpJson('/setup/api/console/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cmd: cmd, arg: arg })
      });
    }, {
      sectionEl: findSectionFromElement(consoleRunEl),
      sectionLabel: 'debug console',
      onRetry: runConsole
    }).then(function (j) {
      if (consoleOutEl) consoleOutEl.textContent = (j.output || JSON.stringify(j, null, 2));
      toast('Command completed', 'success');
      return refreshStatus();
    }).catch(function (e) {
      if (consoleOutEl) consoleOutEl.textContent += '\nError: ' + toErrorString(e) + '\n';
      toast('Command failed', 'error');
    }).finally(function () {
      setLoading(consoleRunEl, false);
    });
  }

  if (consoleRunEl) consoleRunEl.addEventListener('click', runConsole);

  // ======== Config Editor ========
  function loadConfigRaw() {
    if (!configTextEl) return;
    if (configOutEl) configOutEl.textContent = '';
    return httpJson('/setup/api/config/raw').then(function (j) {
      if (configPathEl) {
        configPathEl.textContent = (j.path || 'Config file') + (j.exists ? '' : ' (not yet created)');
      }
      configTextEl.value = j.content || '';
    }).catch(function () {
      // Silent -- config may not exist yet
    });
  }

  function saveConfigRaw() {
    if (!configTextEl) return;
    if (!confirm('Save config and restart gateway?')) return;

    setLoading(configSaveEl, true);
    if (configOutEl) { configOutEl.textContent = 'Saving...\n'; configOutEl.classList.add('visible'); }

    return runInSectionBoundary(function () {
      return httpJson('/setup/api/config/raw', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: configTextEl.value })
      });
    }, {
      sectionEl: findSectionFromElement(configSaveEl),
      sectionLabel: 'config editor',
      onRetry: saveConfigRaw
    }).then(function () {
      if (configOutEl) configOutEl.textContent = 'Saved. Gateway restarting...\n';
      toast('Configuration saved', 'success');
      return refreshStatus();
    }).catch(function (e) {
      if (configOutEl) configOutEl.textContent += '\nError: ' + toErrorString(e) + '\n';
      toast('Save failed: ' + toErrorString(e), 'error');
    }).finally(function () {
      setLoading(configSaveEl, false);
    });
  }

  if (configReloadEl) configReloadEl.addEventListener('click', function () {
    loadConfigRaw().then(function () { toast('Config reloaded', 'info'); });
  });
  if (configSaveEl) configSaveEl.addEventListener('click', saveConfigRaw);

  // ======== Import ========
  function runImport() {
    if (!importRunEl || !importFileEl) return;
    var f = importFileEl.files && importFileEl.files[0];
    if (!f) { toast('Pick a .tar.gz file first', 'error'); return; }
    if (!confirm('Import backup? This overwrites files and restarts the gateway.')) return;

    setLoading(importRunEl, true);
    if (importOutEl) { importOutEl.textContent = 'Uploading...\n'; importOutEl.classList.add('visible'); }

    return f.arrayBuffer().then(function (buf) {
      return runInSectionBoundary(function () {
        return httpText('/setup/import', {
          method: 'POST',
          headers: { 'content-type': 'application/gzip' },
          body: buf,
          maxRetries: 0,
          timeoutMs: 60000
        });
      }, {
        sectionEl: findSectionFromElement(importRunEl),
        sectionLabel: 'backup import',
        onRetry: runImport
      });
    }).then(function (t) {
      if (importOutEl) importOutEl.textContent += t + '\n';
      toast('Backup imported successfully', 'success');
      return refreshStatus();
    }).catch(function (e) {
      if (importOutEl) importOutEl.textContent += '\nError: ' + toErrorString(e) + '\n';
      toast('Import failed', 'error');
    }).finally(function () {
      setLoading(importRunEl, false);
    });
  }

  if (importRunEl) importRunEl.addEventListener('click', runImport);

  // ======== Pairing ========
  var pairingBtn = document.getElementById('pairingApprove');
  if (pairingBtn) {
    pairingBtn.addEventListener('click', function () {
      var channel = prompt('Channel (telegram or discord):');
      if (!channel) return;
      channel = channel.trim().toLowerCase();
      if (channel !== 'telegram' && channel !== 'discord') {
        toast('Must be "telegram" or "discord"', 'error');
        return;
      }
      var code = prompt('Pairing code:');
      if (!code) return;
      showLog('Approving pairing for ' + channel + '...\n');
      runInSectionBoundary(function () {
        return httpText('/setup/api/pairing/approve', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channel: channel, code: code.trim() }),
          maxRetries: 0
        });
      }, {
        sectionEl: findSectionFromElement(pairingBtn),
        sectionLabel: 'device pairing',
        onRetry: function () { pairingBtn.click(); }
      }).then(function (t) {
          appendLog(t + '\n');
          toast('Pairing approved', 'success');
        })
        .catch(function (e) {
          appendLog('Error: ' + toErrorString(e) + '\n');
          toast('Pairing failed', 'error');
        });
    });
  }

  // ======== Config textarea: Tab key inserts tab instead of moving focus ========
  if (configTextEl) {
    configTextEl.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
      // Ctrl+S / Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveConfigRaw();
      }
    });
  }

  // ======== Init ========
  [runBtn, document.getElementById('reset'), configSaveEl, importRunEl, pairingBtn].forEach(function (el) {
    if (el) el.setAttribute('data-safe-mode-lock', 'true');
  });

  initPreviewMode();
  initDraftResume();
  refreshStatus();
})();
