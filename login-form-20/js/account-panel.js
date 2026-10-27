(function () {
  'use strict';

  var panel = null;
  var backdrop = null;
  var lastFocus = null;
  var activeTab = 'profile';

  var isLessonPage = function () {
    return /\/lessons\//i.test(window.location.pathname.replace(/\\/g, '/'));
  };

  var prefix = function (path) {
    return isLessonPage() ? '../' + path : path;
  };

  var t = function (key) {
    if (window.SonusLang && window.SonusLang.t) {
      return window.SonusLang.t(key);
    }
    return key;
  };

  var getUsername = function () {
    try {
      return localStorage.getItem('sonus-user') || 'Học viên';
    } catch (e) {
      return 'Học viên';
    }
  };

  var icon = function (name) {
    var paths = {
      back: '<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      refresh: '<polyline points="23 4 23 10 17 10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" fill="none" stroke="currentColor" stroke-width="2"/>',
      star: '<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      share: '<circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      qr: '<rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 14h3v3h-3zM20 14v7M14 20h3" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 2v6h6M8 13h8M8 17h5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      chevron: '<path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    };
    return '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  };

  var buildMarkup = function () {
    return (
      '<div class="account-backdrop" id="account-backdrop" hidden></div>' +
      '<div class="account-panel" id="account-panel" role="dialog" aria-modal="true" aria-labelledby="account-panel-title" hidden>' +
        '<div class="account-panel__top">' +
          '<button type="button" class="account-panel__icon-btn js-account-close" data-i18n-aria="account.close">' +
            icon('back') +
          '</button>' +
          '<h2 class="account-panel__title" id="account-panel-title" data-i18n="account.title">Tài khoản</h2>' +
          '<button type="button" class="account-panel__icon-btn js-account-refresh" data-i18n-aria="account.refresh">' +
            icon('refresh') +
          '</button>' +
        '</div>' +
        '<div class="account-panel__tabs" role="tablist">' +
          '<button type="button" class="account-panel__tab" role="tab" id="account-tab-profile" aria-controls="account-pane-profile" aria-selected="true" data-tab="profile" data-i18n="account.tabProfile">Hồ sơ</button>' +
          '<button type="button" class="account-panel__tab" role="tab" id="account-tab-progress" aria-controls="account-pane-progress" aria-selected="false" data-tab="progress" data-i18n="account.tabProgress">Tiến độ</button>' +
          '<button type="button" class="account-panel__tab" role="tab" id="account-tab-settings" aria-controls="account-pane-settings" aria-selected="false" data-tab="settings" data-i18n="account.tabSettings">Cài đặt</button>' +
        '</div>' +
        '<div class="account-panel__body">' +
          '<div class="account-profile is-active" id="account-pane-profile" role="tabpanel" data-pane="profile">' +
            '<div class="account-panel__chips">' +
              '<span class="account-chip is-active" id="account-username-chip"></span>' +
              '<span class="account-chip" data-i18n="account.chipPlan">Gói học thử</span>' +
              '<span class="account-chip" data-i18n="account.chipVoice">Giọng nói bật</span>' +
            '</div>' +
            '<p class="account-total-label" data-i18n="account.totalLabel">Tổng tiến độ học</p>' +
            '<p class="account-total-value">42%</p>' +
            '<a class="account-hero-card" href="' + prefix('lessons/co-ban-phim.html') + '">' +
              '<span>' +
                '<strong data-i18n="account.heroTitle">Đang học: Cơ bản về phím</strong>' +
                '<span data-i18n="account.heroMeta">5 / 8 bài · tiếp tục bài 6</span>' +
              '</span>' +
              icon('chevron') +
            '</a>' +
            '<article class="account-card">' +
              '<div class="account-card__head">' +
                '<div>' +
                  '<p class="account-card__id" data-i18n="course.not-nhac.title">Nốt nhạc</p>' +
                  '<p class="account-card__balance">2 / 10</p>' +
                '</div>' +
                '<div class="account-card__tools">' +
                  '<span aria-hidden="true">' + icon('star') + '</span>' +
                  '<span aria-hidden="true">' + icon('share') + '</span>' +
                  '<span aria-hidden="true">' + icon('qr') + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="account-actions">' +
                '<a href="' + prefix('lessons/not-nhac.html') + '"><span class="account-round">' + icon('cal') + '</span><span data-i18n="account.actionLessons">Bài học</span></a>' +
                '<a href="' + prefix('lessons/not-nhac.html#nghe-bai-giang') + '"><span class="account-round">' + icon('clock') + '</span><span data-i18n="account.actionListen">Nghe lại</span></a>' +
                '<a href="' + prefix('home.html') + '#bai-hoc"><span class="account-round">' + icon('file') + '</span><span data-i18n="account.actionDetail">Chi tiết</span></a>' +
              '</div>' +
            '</article>' +
            '<article class="account-card">' +
              '<div class="account-card__head">' +
                '<div>' +
                  '<p class="account-card__id" data-i18n="course.so-cap.title">Sơ cấp</p>' +
                  '<p class="account-card__balance">0 / 12</p>' +
                '</div>' +
                '<div class="account-card__tools">' +
                  '<span aria-hidden="true">' + icon('star') + '</span>' +
                  '<span aria-hidden="true">' + icon('share') + '</span>' +
                  '<span aria-hidden="true">' + icon('qr') + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="account-actions">' +
                '<a href="' + prefix('lessons/so-cap.html') + '"><span class="account-round">' + icon('cal') + '</span><span data-i18n="account.actionLessons">Bài học</span></a>' +
                '<a href="' + prefix('lessons/so-cap.html#nghe-bai-giang') + '"><span class="account-round">' + icon('clock') + '</span><span data-i18n="account.actionListen">Nghe lại</span></a>' +
                '<a href="' + prefix('home.html') + '#bai-hoc"><span class="account-round">' + icon('file') + '</span><span data-i18n="account.actionDetail">Chi tiết</span></a>' +
              '</div>' +
            '</article>' +
            '<div class="account-bottom">' +
              '<a class="account-bottom__ghost js-account-logout" href="' + prefix('index.html') + '" data-i18n="account.logout">Đăng xuất</a>' +
              '<a class="account-bottom__gold" href="' + prefix('lessons/co-ban-phim.html') + '" data-i18n="account.continue">Tiếp tục học</a>' +
            '</div>' +
          '</div>' +
          '<div class="account-settings" id="account-pane-progress" role="tabpanel" hidden data-pane="progress">' +
            '<p class="account-total-label" data-i18n="account.progressIntro">Các khóa bạn đã mở</p>' +
            '<div class="account-setting-row"><span data-i18n="course.co-ban-phim.title">Cơ bản về phím</span><strong>62%</strong></div>' +
            '<div class="account-setting-row"><span data-i18n="course.not-nhac.title">Nốt nhạc</span><strong>20%</strong></div>' +
            '<div class="account-setting-row"><span data-i18n="course.so-cap.title">Sơ cấp</span><strong>0%</strong></div>' +
            '<div class="account-setting-row"><span data-i18n="account.practiceTime">Thời gian luyện tuần này</span><strong>3 giờ 20 phút</strong></div>' +
          '</div>' +
          '<div class="account-settings" id="account-pane-settings" role="tabpanel" hidden data-pane="settings">' +
            '<button type="button" class="account-setting-row js-account-theme"><span data-i18n="account.settingTheme">Đổi giao diện sáng / tối</span><span aria-hidden="true">→</span></button>' +
            '<a class="account-setting-row js-account-logout" href="' + prefix('index.html') + '"><span data-i18n="account.logout">Đăng xuất</span><span aria-hidden="true">→</span></a>' +
          '</div>' +
        '</div>' +
        '<span class="account-live" id="account-live" aria-live="polite"></span>' +
      '</div>'
    );
  };

  var announce = function (text) {
    var live = document.getElementById('account-live');
    if (live) {
      live.textContent = text;
    }
  };

  var setTab = function (name) {
    activeTab = name;
    panel.querySelectorAll('[role="tab"]').forEach(function (tab) {
      var selected = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    panel.querySelectorAll('[data-pane]').forEach(function (pane) {
      var on = pane.getAttribute('data-pane') === name;
      pane.hidden = !on;
      pane.classList.toggle('is-active', on);
    });
  };

  var getFocusable = function () {
    return Array.prototype.slice.call(
      panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return !el.disabled && !el.closest('[hidden]') && el.getClientRects().length;
    });
  };

  var open = function () {
    if (!panel) {
      return;
    }
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    panel.hidden = false;
    requestAnimationFrame(function () {
      backdrop.classList.add('is-open');
      panel.classList.add('is-open');
    });
    document.body.classList.add('account-open');
    var chip = document.getElementById('account-username-chip');
    if (chip) {
      chip.textContent = getUsername();
    }
    announce(t('account.opened'));
    var closeBtn = panel.querySelector('.js-account-close');
    if (closeBtn) {
      closeBtn.focus();
    }
  };

  var close = function () {
    if (!panel) {
      return;
    }
    backdrop.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.classList.remove('account-open');
    window.setTimeout(function () {
      backdrop.hidden = true;
      panel.hidden = true;
    }, 250);
    if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  };

  var onKeydown = function (event) {
    if (!panel || !panel.classList.contains('is-open')) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    var nodes = getFocusable();
    if (!nodes.length) {
      return;
    }
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  var applyI18n = function () {
    if (window.SonusLang && window.SonusLang.apply) {
      window.SonusLang.apply(window.SonusLang.get());
    }
    var chip = document.getElementById('account-username-chip');
    if (chip) {
      chip.textContent = getUsername();
    }
  };

  var init = function () {
    if (document.getElementById('account-panel')) {
      return;
    }

    var wrap = document.createElement('div');
    wrap.innerHTML = buildMarkup();
    while (wrap.firstChild) {
      document.body.appendChild(wrap.firstChild);
    }

    panel = document.getElementById('account-panel');
    backdrop = document.getElementById('account-backdrop');

    document.querySelectorAll('.js-account-open').forEach(function (btn) {
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-controls', 'account-panel');
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        open();
      });
    });

    backdrop.addEventListener('click', close);
    panel.querySelectorAll('.js-account-close').forEach(function (btn) {
      btn.addEventListener('click', close);
    });

    panel.querySelectorAll('[role="tab"]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        setTab(tab.getAttribute('data-tab'));
      });
    });

    var refreshBtn = panel.querySelector('.js-account-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        applyI18n();
        announce(t('account.refreshed'));
      });
    }

    panel.querySelectorAll('.js-account-logout').forEach(function (link) {
      link.addEventListener('click', function () {
        try {
          localStorage.removeItem('sonus-user');
        } catch (e) {}
      });
    });

    var themeBtn = panel.querySelector('.js-account-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var toggle = document.querySelector('.theme-toggle');
        if (toggle) {
          toggle.click();
        }
      });
    }

    document.addEventListener('keydown', onKeydown);
    document.addEventListener('sonus:langchange', applyI18n);
    applyI18n();
  };

  window.SonusAccount = {
    open: open,
    close: close
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
