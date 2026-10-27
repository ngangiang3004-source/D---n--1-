(function () {
  'use strict';

  var courseId = document.documentElement.getAttribute('data-course-id');
  var courses = window.SonusLessonCourses || [];
  var contentMap = window.SonusLessonContent || {};
  var course = courses.find(function (c) { return c.id === courseId; });
  var lessonItems = [];
  var nowPlayingLabel = null;
  var lessonChatText = null;
  var mainCourseAudio = null;
  var currentLessonIndex = -1;
  var isPlayingLesson = false;
  var progressLessonIndex = -1;
  var ttsProgressToken = 0;

  if (!course) {
    return;
  }

  var getContentList = function () {
    return contentMap[course.id] || [];
  };

  var getCurrentLang = function () {
    if (window.SonusLang && window.SonusLang.get) {
      return window.SonusLang.get();
    }
    if (window.SonusVoiceI18n && window.SonusVoiceI18n.getLang) {
      return window.SonusVoiceI18n.getLang();
    }
    return 'vi';
  };

  var getLessonFile = function (lesson) {
    if (!lesson) {
      return null;
    }
    var lang = getCurrentLang();
    if (lesson.files && lesson.files[lang]) {
      return lesson.files[lang];
    }
    return lesson.file || null;
  };

  var normalizeLesson = function (lesson, index) {
    var base = typeof lesson === 'string'
      ? { title: lesson }
      : {
        title: lesson.title,
        file: lesson.file || null,
        files: lesson.files || null
      };

    var contentItem = getContentList()[index];
    if (contentItem && !base.file) {
      base.text = contentItem.text;
      base.title = contentItem.title || base.title;
    } else if (contentItem) {
      base.title = contentItem.title || base.title;
    }

    return base;
  };

  var getLessons = function () {
    return (course.lessons || []).map(normalizeLesson);
  };

  var getAudioSrc = function (lesson) {
    var file = getLessonFile(lesson);
    if (!file || !course.audioFolder) {
      return '';
    }
    return '../audio/' + course.audioFolder + '/' + file;
  };

  var getIntroAudioSrc = function () {
    if (!course.introFile || !course.audioFolder) {
      return '';
    }
    return '../audio/' + course.audioFolder + '/' + course.introFile;
  };

  var playCourseIntroMp3 = function () {
    var src = getIntroAudioSrc();
    if (!src || !mainCourseAudio) {
      return Promise.reject(new Error('Không có file giới thiệu khóa'));
    }

    if (window.SonusAI && window.SonusAI.stopSpeech) {
      window.SonusAI.stopSpeech();
    }
    isPlayingLesson = false;
    progressLessonIndex = -1;
    if (mainCourseAudio) {
      mainCourseAudio.pause();
    }
    scrollToLessonHub();
    mainCourseAudio.src = src;
    mainCourseAudio.load();

    return new Promise(function (resolve, reject) {
      var onEnded = function () {
        mainCourseAudio.removeEventListener('ended', onEnded);
        mainCourseAudio.removeEventListener('error', onError);
        resolve();
      };
      var onError = function () {
        mainCourseAudio.removeEventListener('ended', onEnded);
        mainCourseAudio.removeEventListener('error', onError);
        reject(new Error('Không phát được giới thiệu khóa'));
      };
      mainCourseAudio.addEventListener('ended', onEnded);
      mainCourseAudio.addEventListener('error', onError);
      mainCourseAudio.play().catch(reject);
    });
  };

  var setText = function (id, text) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  };

  document.title = course.title + ' — SONUS TACTIC';

  var applyCourseI18n = function () {
    var langPack = window.SonusLang;
    if (!langPack) {
      setText('course-title', course.title);
      setText('course-intro', course.intro);
      setText('course-step', course.title);
      setText('course-step-badge', course.step);
      setText('course-meta', getLessons().length + ' bài học');
      return;
    }

    var t = langPack.t;
    var prefix = 'course.' + course.id + '.';
    var title = t(prefix + 'title');
    var step = t(prefix + 'step');
    var desc = t(prefix + 'desc');

    setText('course-title', title !== prefix + 'title' ? title : course.title);
    setText('course-intro', desc !== prefix + 'desc' ? desc : course.intro);
    setText('course-step', title !== prefix + 'title' ? title : course.title);
    setText('course-step-badge', step !== prefix + 'step' ? step : course.step);
    setText('course-meta', t('course.lessonCount', { n: getLessons().length }));
    document.title = (title !== prefix + 'title' ? title : course.title) + ' — SONUS TACTIC';
  };

  applyCourseI18n();
  document.addEventListener('sonus:langchange', applyCourseI18n);

  nowPlayingLabel = document.getElementById('now-playing-label');
  lessonChatText = document.getElementById('lesson-chat-text');
  mainCourseAudio = document.getElementById('main-course-audio');

  var updateNowPlaying = function (index) {
    var lessons = getLessons();
    if (index < 0 || index >= lessons.length) {
      if (nowPlayingLabel) {
        nowPlayingLabel.textContent = 'Chưa chọn bài — hãy chọn một bài để nghe';
      }
      return;
    }
    currentLessonIndex = index;
    if (nowPlayingLabel) {
      nowPlayingLabel.textContent = 'Bài ' + (index + 1) + ': ' + lessons[index].title;
    }
  };

  var showLessonInChat = function (lesson, index) {
    updateNowPlaying(index);
    if (lessonChatText) {
      if (getLessonFile(lesson)) {
        lessonChatText.textContent = '';
        lessonChatText.hidden = true;
      } else {
        lessonChatText.hidden = false;
        lessonChatText.textContent = lesson.text || '';
      }
    }
  };

  var syncLessonButtons = function (activeIndex) {
    document.querySelectorAll('.lesson-play-btn').forEach(function (btn, i) {
      var isActive = i === activeIndex && isPlayingLesson;
      btn.classList.toggle('is-playing', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  var stopLessonPlayback = function () {
    isPlayingLesson = false;
    progressLessonIndex = -1;
    ttsProgressToken += 1;
    if (window.SonusAI && window.SonusAI.stopSpeech) {
      window.SonusAI.stopSpeech();
    }
    if (mainCourseAudio) {
      mainCourseAudio.pause();
      mainCourseAudio.currentTime = 0;
    }
    syncLessonButtons(-1);
    if (currentLessonIndex >= 0) {
      setLessonStatus(currentLessonIndex, 'Đã dừng.');
    }
  };

  var setLessonStatus = function (lessonIndex, message) {
    var statusEl = document.getElementById('lesson-status-' + lessonIndex);
    if (statusEl) {
      statusEl.textContent = message;
    }
  };

  var scrollToLessonHub = function () {
    var hub = document.getElementById('nghe-bai-giang');
    if (hub) {
      hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  var playLessonMp3 = function (index, lesson) {
    var src = getAudioSrc(lesson);
    if (!src || !mainCourseAudio) {
      return false;
    }

    if (window.SonusAI && window.SonusAI.stopSpeech) {
      window.SonusAI.stopSpeech();
    }

    isPlayingLesson = true;
    progressLessonIndex = index;
    syncLessonButtons(index);
    setLessonStatus(index, 'Đang phát bài giảng MP3');

    mainCourseAudio.src = src;
    mainCourseAudio.load();
    mainCourseAudio.play().catch(function () {
      isPlayingLesson = false;
      syncLessonButtons(-1);
      setLessonStatus(
        index,
        'Không tìm thấy file — đặt ' + getLessonFile(lesson) + ' vào audio/' + course.audioFolder
      );
    });

    return true;
  };

  var speakLessonTts = function (index, lesson, announceIntro) {
    if (!lesson.text) {
      if (window.SonusAI && window.SonusAI.speak) {
        window.SonusAI.speak('Nội dung bài ' + (index + 1) + ' đang được cập nhật.');
      }
      setLessonStatus(index, 'Chưa có nội dung bài giảng');
      return false;
    }

    isPlayingLesson = true;
    syncLessonButtons(index);
    setLessonStatus(index, 'Trợ lý AI đang đọc bài giảng...');

    if (!window.SonusAI || !window.SonusAI.speak) {
      isPlayingLesson = false;
      syncLessonButtons(-1);
      setLessonStatus(index, 'Cần Trợ lý AI để đọc bài giảng.');
      return false;
    }

    var speech = announceIntro
      ? 'Bài ' + (index + 1) + ': ' + lesson.title + '. ' + lesson.text
      : lesson.text;

    var token = ++ttsProgressToken;
    window.SonusAI.speak(speech).finally(function () {
      isPlayingLesson = false;
      syncLessonButtons(-1);
      setLessonStatus(index, 'Đã đọc xong bài giảng.');
      if (token === ttsProgressToken && window.SonusProgress) {
        window.SonusProgress.markLessonComplete(course.id, index);
      }
    });

    return true;
  };

  var playLesson = function (index, announceIntro) {
    var lessons = getLessons();
    if (index < 0 || index >= lessons.length) {
      return false;
    }

    var lesson = lessons[index];
    stopLessonPlayback();
    showLessonInChat(lesson, index);
    scrollToLessonHub();

    var row = document.getElementById('lesson-' + (index + 1));
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (getLessonFile(lesson) && course.audioFolder) {
      return playLessonMp3(index, lesson);
    }

    return speakLessonTts(index, lesson, announceIntro);
  };

  var buildLessonOverviewSpeech = function () {
    var lessons = getLessons();
    var hasMp3 = lessons.some(function (l) { return getLessonFile(l); });
    var parts = [
      'Khóa ' + course.title + '.',
      course.intro,
      hasMp3
        ? 'Một số bài có file nghe sẵn. Chọn bài bên dưới để phát.'
        : 'Trợ lý AI sẽ đọc nội dung các bài chưa có file nghe.',
      'Khóa có ' + lessons.length + ' bài.',
      'Danh sách bài học:'
    ];

    lessons.forEach(function (lesson, index) {
      parts.push('Bài ' + (index + 1) + ': ' + lesson.title + '.');
    });

    parts.push('Nói bài 1 để bắt đầu nghe, hoặc nhấn nút Nghe bài 1.');
    return parts.join(' ');
  };

  var getLessonStatusText = function (lesson) {
    if (getLessonFile(lesson)) {
      return 'Nhấn để nghe bài giảng';
    }
    if (lesson.text) {
      return 'Nhấn để Trợ lý AI đọc bài giảng';
    }
    return 'Nội dung đang cập nhật';
  };

  var renderLessons = function () {
    var listEl = document.getElementById('course-lesson-list');
    if (!listEl) {
      return;
    }

    getLessons().forEach(function (lesson, index) {
      var li = document.createElement('li');
      li.className = 'course-lesson-item';
      li.id = 'lesson-' + (index + 1);

      var article = document.createElement('article');
      article.className = 'lesson-row';

      var playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'lesson-play-btn';
      playBtn.setAttribute('aria-pressed', 'false');
      playBtn.setAttribute('aria-label', 'Nghe bài ' + (index + 1) + ': ' + lesson.title);
      playBtn.innerHTML = '<span class="lesson-play-icon" aria-hidden="true">▶</span>';

      var info = document.createElement('div');
      info.className = 'lesson-info';

      var title = document.createElement('h3');
      title.className = 'lesson-name';
      title.textContent = 'Bài ' + (index + 1) + ': ' + lesson.title;

      var status = document.createElement('p');
      status.className = 'lesson-audio-status';
      status.id = 'lesson-status-' + index;
      status.textContent = getLessonStatusText(lesson);

      playBtn.addEventListener('click', function () {
        if (currentLessonIndex === index && isPlayingLesson) {
          stopLessonPlayback();
          return;
        }
        playLesson(index, !getLessonFile(lesson));
      });

      info.appendChild(title);
      info.appendChild(status);
      article.appendChild(playBtn);
      article.appendChild(info);
      li.appendChild(article);
      listEl.appendChild(li);

      lessonItems[index] = { button: playBtn };
    });
  };

  if (mainCourseAudio) {
    mainCourseAudio.addEventListener('play', function () {
      isPlayingLesson = true;
      syncLessonButtons(currentLessonIndex);
      if (currentLessonIndex >= 0) {
        setLessonStatus(currentLessonIndex, 'Đang phát MP3...');
      }
    });

    mainCourseAudio.addEventListener('pause', function () {
      if (mainCourseAudio.ended) {
        return;
      }
      isPlayingLesson = false;
      syncLessonButtons(-1);
    });

    mainCourseAudio.addEventListener('ended', function () {
      isPlayingLesson = false;
      syncLessonButtons(-1);
      if (progressLessonIndex >= 0) {
        if (window.SonusProgress) {
          window.SonusProgress.markLessonComplete(course.id, progressLessonIndex);
        }
        setLessonStatus(progressLessonIndex, 'Đã nghe xong bài MP3.');
        progressLessonIndex = -1;
      } else if (currentLessonIndex >= 0) {
        setLessonStatus(currentLessonIndex, 'Đã nghe xong bài MP3.');
      }
    });
  }

  var playFirstBtn = document.getElementById('play-first-lesson');
  if (playFirstBtn) {
    playFirstBtn.addEventListener('click', function () {
      playLesson(0, !getLessonFile(getLessons()[0]));
    });
  }

  var stopBtn = document.getElementById('stop-course-audio');
  if (stopBtn) {
    stopBtn.addEventListener('click', stopLessonPlayback);
  }

  renderLessons();

  window.SonusCourse = {
    id: course.id,
    title: course.title,
    lessons: getLessons(),
    playLesson: playLesson,
    stopAudio: stopLessonPlayback,
    scrollToAudioHub: scrollToLessonHub,
    speakOverview: function () {
      var resumeAssistant = function () {
        if (window.SonusAI && window.SonusAI.resumeListening) {
          window.SonusAI.resumeListening();
        }
      };

      if (course.introFile && course.audioFolder) {
        return playCourseIntroMp3().finally(function () {
          scrollToLessonHub();
          resumeAssistant();
        });
      }
      if (window.SonusAI && window.SonusAI.speak) {
        return window.SonusAI.speak(buildLessonOverviewSpeech(), { skipResume: true }).finally(function () {
          scrollToLessonHub();
          resumeAssistant();
        });
      }
      scrollToLessonHub();
      resumeAssistant();
      return Promise.resolve(false);
    }
  };

  var shouldAutoSpeak = function () {
    try {
      return sessionStorage.getItem('sonus-speak-course') === course.id;
    } catch (e) {
      return false;
    }
  };

  var clearAutoSpeak = function () {
    try {
      sessionStorage.removeItem('sonus-speak-course');
    } catch (e) {}
  };

  if (window.location.hash === '#nghe-bai-giang') {
    setTimeout(scrollToLessonHub, 400);
  }

  if (shouldAutoSpeak()) {
    clearAutoSpeak();
    setTimeout(function () {
      window.SonusCourse.speakOverview();
    }, 600);
  }
})();
