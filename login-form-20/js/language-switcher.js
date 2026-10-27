(function () {
  'use strict';

  var LANG_KEY = 'sonus-lang';
  var i18n = window.SonusI18n;

  if (!i18n) {
    return;
  }

  var getLang = function () {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && i18n.strings[saved]) {
        return saved;
      }
    } catch (e) {}
    return i18n.defaultLang;
  };

  var interpolate = function (text, vars) {
    if (!vars) {
      return text;
    }
    return text.replace(/\{(\w+)\}/g, function (_, key) {
      return vars[key] != null ? String(vars[key]) : '';
    });
  };

  var t = function (key, vars) {
    var lang = getLang();
    var pack = i18n.strings[lang] || i18n.strings[i18n.defaultLang] || {};
    var fallback = (i18n.strings[i18n.defaultLang] || {})[key];
    var value = pack[key] != null ? pack[key] : fallback;
    return value != null ? interpolate(value, vars) : key;
  };

  var applyToElement = function (el, lang) {
    var key = el.getAttribute('data-i18n');
    var vars = {};
    var count = el.getAttribute('data-i18n-count');
    if (count) {
      vars.n = count;
    }

    if (key) {
      el.textContent = t(key, vars);
    }

    var htmlKey = el.getAttribute('data-i18n-html');
    if (htmlKey) {
      el.innerHTML = t(htmlKey, vars);
    }

    var ariaKey = el.getAttribute('data-i18n-aria');
    if (ariaKey) {
      el.setAttribute('aria-label', t(ariaKey, vars));
    }

    var placeholderKey = el.getAttribute('data-i18n-placeholder');
    if (placeholderKey) {
      el.setAttribute('placeholder', t(placeholderKey, vars));
    }

    var altKey = el.getAttribute('data-i18n-alt');
    if (altKey) {
      el.setAttribute('alt', t(altKey, vars));
    }
  };

  var applyLanguage = function (lang) {
    if (!i18n.strings[lang]) {
      lang = i18n.defaultLang;
    }

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}

    document.documentElement.lang = lang;

    var pageTitleKey = document.body.getAttribute('data-i18n-page-title');
    if (pageTitleKey) {
      document.title = t(pageTitleKey);
    }

    document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-aria], [data-i18n-placeholder], [data-i18n-title], [data-i18n-alt]')
      .forEach(function (el) {
        applyToElement(el, lang);
      });

    document.querySelectorAll('.lang-select').forEach(function (select) {
      select.value = lang;
    });

    document.dispatchEvent(new CustomEvent('sonus:langchange', { detail: { lang: lang } }));
  };

  var createLanguageSwitcher = function (container) {
    if (!container || container.querySelector('.lang-switcher')) {
      return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'lang-switcher';

    var selectId = 'sonus-lang-select-' + String(Math.random()).slice(2, 8);

    var label = document.createElement('label');
    label.className = 'lang-switcher__label';
    label.setAttribute('for', selectId);
    label.setAttribute('data-i18n', 'lang.label');
    label.textContent = t('lang.label');

    var select = document.createElement('select');
    select.id = selectId;
    select.className = 'lang-select';
    select.setAttribute('aria-label', t('lang.selectLabel'));

    i18n.languages.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.code;
      option.textContent = item.label;
      select.appendChild(option);
    });

    select.value = getLang();
    select.addEventListener('change', function () {
      applyLanguage(select.value);
    });

    label.setAttribute('for', selectId);
    wrap.appendChild(label);
    wrap.appendChild(select);

    var themeToggle = container.querySelector('.theme-toggle');
    if (themeToggle) {
      container.insertBefore(wrap, themeToggle);
    } else {
      container.appendChild(wrap);
    }
  };

  var initLoginPage = function () {
    var section = document.querySelector('.ftco-section .container');
    if (!section || section.querySelector('.login-lang-bar')) {
      return;
    }

    var bar = document.createElement('div');
    bar.className = 'login-lang-bar';
    createLanguageSwitcher(bar);
    section.insertBefore(bar, section.firstChild);

    document.body.setAttribute('data-i18n-page-title', 'page.login.title');

    var map = [
      ['.heading-section', 'login.welcome'],
      ['.heading-subtitle', 'login.subtitle'],
      ['.login-wrap h3', 'login.hasAccount'],
      ['#username-field', 'login.username', 'placeholder'],
      ['#password-field', 'login.password', 'placeholder'],
      ['.submit', 'login.submit'],
      ['.checkbox-wrap', 'login.remember'],
      ['.w-50.text-md-right a', 'login.forgot'],
      ['.login-wrap > p', 'login.noAccount'],
      ['.social a', 'login.signup']
    ];

    map.forEach(function (item) {
      var el = document.querySelector(item[0]);
      if (!el) {
        return;
      }
      if (item[2] === 'placeholder') {
        el.setAttribute('data-i18n-placeholder', item[1]);
      } else {
        el.setAttribute('data-i18n', item[1]);
      }
    });
  };

  window.SonusLang = {
    get: getLang,
    t: t,
    apply: applyLanguage,
    languages: i18n.languages
  };

  var bootstrap = function () {
    initLoginPage();

    document.querySelectorAll('.header-actions').forEach(function (actions) {
      createLanguageSwitcher(actions);
    });

    applyLanguage(getLang());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
