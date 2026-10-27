(function () {
  'use strict';

  var THEME_KEY = 'sonus-theme';
  var logoImg = document.querySelector('.logo-img');
  var themeToggle = document.querySelector('.theme-toggle');

  var applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (logoImg) {
      logoImg.src = theme === 'dark'
        ? logoImg.getAttribute('data-logo-dark')
        : logoImg.getAttribute('data-logo-light');
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
      );
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  };

  var getPreferredTheme = function () {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {}
    return 'light';
  };

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var lessonsTrigger = document.getElementById('nav-lessons-trigger');
  var lessonsMenu = document.getElementById('lesson-nav-menu');

  var getMenuItems = function () {
    if (!lessonsMenu) {
      return [];
    }
    return Array.prototype.slice.call(lessonsMenu.querySelectorAll('[role="menuitem"]'));
  };

  var openLessonsMenu = function () {
    if (!lessonsTrigger || !lessonsMenu) {
      return;
    }
    lessonsMenu.hidden = false;
    lessonsTrigger.setAttribute('aria-expanded', 'true');
  };

  var closeLessonsMenu = function () {
    if (!lessonsTrigger || !lessonsMenu) {
      return;
    }
    lessonsMenu.hidden = true;
    lessonsTrigger.setAttribute('aria-expanded', 'false');
    getMenuItems().forEach(function (item) {
      item.setAttribute('tabindex', '-1');
    });
  };

  var focusMenuItem = function (index) {
    var items = getMenuItems();
    if (!items.length) {
      return;
    }
    var nextIndex = index;
    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    }
    if (nextIndex >= items.length) {
      nextIndex = 0;
    }
    items.forEach(function (item, i) {
      item.setAttribute('tabindex', i === nextIndex ? '0' : '-1');
    });
    items[nextIndex].focus();
  };

  if (lessonsTrigger && lessonsMenu) {
    lessonsTrigger.addEventListener('focus', openLessonsMenu);

    lessonsTrigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLessonsMenu();
        focusMenuItem(0);
      }
      if (event.key === 'Escape') {
        closeLessonsMenu();
      }
    });

    lessonsMenu.addEventListener('keydown', function (event) {
      var items = getMenuItems();
      var currentIndex = items.indexOf(document.activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusMenuItem(currentIndex + 1);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (currentIndex <= 0) {
          closeLessonsMenu();
          lessonsTrigger.focus();
          return;
        }
        focusMenuItem(currentIndex - 1);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLessonsMenu();
        lessonsTrigger.focus();
      }
      if (event.key === 'Tab' && !event.shiftKey && currentIndex === items.length - 1) {
        closeLessonsMenu();
      }
    });

    lessonsMenu.addEventListener('focusout', function (event) {
      var related = event.relatedTarget;
      if (!lessonsMenu.contains(related) && related !== lessonsTrigger) {
        closeLessonsMenu();
      }
    });

    document.addEventListener('click', function (event) {
      if (!lessonsTrigger.contains(event.target) && !lessonsMenu.contains(event.target)) {
        closeLessonsMenu();
      }
    });
  }

  var lessonList = document.querySelector('.lesson-list');
  if (lessonList) {
    var lessonCards = Array.prototype.slice.call(lessonList.querySelectorAll('.lesson-card'));

    lessonList.addEventListener('keydown', function (event) {
      var currentIndex = lessonCards.indexOf(document.activeElement);
      if (currentIndex === -1) {
        return;
      }

      var columns = 1;
      if (window.matchMedia('(min-width: 768px)').matches) {
        columns = 2;
      }
      if (window.matchMedia('(min-width: 1100px)').matches) {
        columns = 3;
      }

      var nextIndex = currentIndex;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nextIndex = Math.min(currentIndex + columns, lessonCards.length - 1);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        nextIndex = Math.max(currentIndex - columns, 0);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, lessonCards.length - 1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
      }

      if (nextIndex !== currentIndex) {
        lessonCards[nextIndex].focus();
      }
    });

    if (window.location.hash.indexOf('bai-hoc') === 1) {
      var target = document.querySelector(window.location.hash + ' .lesson-card');
      if (target) {
        setTimeout(function () {
          target.focus({ preventScroll: false });
        }, 300);
      }
    }
  }
})();
