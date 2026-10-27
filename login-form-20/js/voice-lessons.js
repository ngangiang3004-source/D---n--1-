(function () {
  'use strict';

  var LESSON_INTRO_MP3 = 'audio/bai-hoc-gioi-thieu.mp3';
  var NO_SPEECH_MP3 = 'audio/chua-nghe-thay.mp3';
  var COURSE_NOT_FOUND_MP3 = 'audio/khong-khop-khoa.mp3';
  var LESSON_INTRO_MP3_BY_LANG = {
    en: 'audio/bai-hoc-gioi-thieu-en.mp3'
  };
  var LESSON_INTRO =
    'Chúng tôi có bảy lộ trình học. ' +
    'Cơ bản về phím — làm quen bàn phím đàn. ' +
    'Nốt nhạc — học tên nốt và thang âm. ' +
    'Sơ cấp — dành cho người mới bắt đầu. ' +
    'Trung cấp — hợp âm và kỹ thuật nâng cao. ' +
    'Cao cấp — repertoire khó hơn. ' +
    'Braille — đọc nhạc nổi. ' +
    'Thực hành — bài tập luyện tập hàng ngày.';
  var LESSON_INTRO_BY_LANG = {
    en:
      'After you start, choose a learning path. ' +
      'We have seven courses: Keyboard Basics, Music Notes, Beginner, Intermediate, Advanced, Braille, and Practice. ' +
      'Each course is a sequence of spoken lessons. ' +
      'Play the audio, follow with your hands on the piano, and move to the next lesson when you are ready.'
  };

  var LESSON_COURSES = window.SonusLessonCourses || [];
  var conversationMode = null;
  var deps = null;

  var voice = function () {
    return window.SonusVoiceI18n;
  };

  var vt = function (key) {
    return voice() ? voice().t(key) : key;
  };

  var getLang = function () {
    if (voice() && voice().getLang) {
      return voice().getLang();
    }
    if (window.SonusLang && window.SonusLang.get) {
      return window.SonusLang.get();
    }
    return document.documentElement.lang || 'vi';
  };

  var getLessonIntroMp3 = function () {
    return LESSON_INTRO_MP3_BY_LANG[getLang()] || LESSON_INTRO_MP3;
  };

  var getLessonIntroSpeech = function () {
    var lang = getLang();
    if (lang === 'en') {
      return LESSON_INTRO_BY_LANG.en;
    }
    return 'Đang mở bài học. ' + LESSON_INTRO + ' Bạn muốn học khóa nào? Hãy nói tên khóa.';
  };

  var getCourseUrl = function (course) {
    var path = window.location.pathname || '';
    var hash = '#nghe-bai-giang';
    if (path.indexOf('/lessons/') !== -1 || path.indexOf('\\lessons\\') !== -1) {
      return course.slug + '.html' + hash;
    }
    return course.url + hash;
  };

  var matchLessonCourse = function (text) {
    if (voice()) {
      return voice().matchCourse(text, LESSON_COURSES);
    }
    for (var i = 0; i < LESSON_COURSES.length; i++) {
      if (LESSON_COURSES[i].match(text)) {
        return LESSON_COURSES[i];
      }
    }
    return null;
  };

  var selectLessonCourse = function (course) {
    conversationMode = null;
    try {
      sessionStorage.setItem('sonus-speak-course', course.id);
    } catch (e) {}
    var targetUrl = getCourseUrl(course);

    var playSelect = function () {
      var lang = getLang();
      var enFile = course.selectFiles && course.selectFiles.en;
      if (lang === 'en' && enFile && course.audioFolder && deps.playAudio) {
        return deps.playAudio('audio/' + course.audioFolder + '/' + enFile, 1);
      }
      if (lang === 'en' && deps.playAudio) {
        return deps.playAudio('audio/dang-chuyen-khoa-en.mp3', 1);
      }
      if (course.selectFile && course.audioFolder && deps.playAudio) {
        return deps.playAudio('audio/' + course.audioFolder + '/' + course.selectFile, 1);
      }
      return deps.speak(course.say, { skipResume: true });
    };

    playSelect()
      .catch(function () {
        if (getLang() === 'en') {
          var fallbackSay = {
            'co-ban-phim': 'Moving on to Keyboard Basics.',
            'so-cap': 'Switching to the Beginner course.',
            'trung-cap': 'Moving to the Intermediate course.',
            'cao-cap': 'Switching to the Advanced course.'
          };
          return deps.speak(
            fallbackSay[course.id] || 'Redirecting to the course page.',
            { skipResume: true }
          );
        }
        if (!course.selectFile) {
          return deps.speak(course.say, { skipResume: true });
        }
      })
      .finally(function () {
        window.location.href = targetUrl;
      });
  };

  var parseLessonNumber = function (text) {
    if (voice()) {
      return voice().parseLessonNumber(text);
    }
    var wordMap = {
      mot: 1, hai: 2, ba: 3, bon: 4, nam: 5, sau: 6, bay: 7, tam: 8,
      chin: 9, muoi: 10
    };
    var digitMatch = text.match(/bai\s*(\d+)/);
    if (digitMatch) {
      return parseInt(digitMatch[1], 10) - 1;
    }
    var wordMatch = text.match(/bai\s*(mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)/);
    if (wordMatch && wordMap[wordMatch[1]]) {
      return wordMap[wordMatch[1]] - 1;
    }
    return -1;
  };

  var handleCoursePageCommand = function (text) {
    if (!window.SonusCourse) {
      return false;
    }

    var p = voice() ? voice().patterns : null;

    if (p && p.courseOverview.test(text)) {
      window.SonusCourse.speakOverview();
      return true;
    }

    if (p && p.courseOpenAudio.test(text)) {
      window.SonusCourse.scrollToAudioHub();
      deps.speak(vt('courseOpenAudio'));
      return true;
    }

    if (p && p.courseStopAudio.test(text)) {
      window.SonusCourse.stopAudio();
      deps.speak(vt('courseStopAudio'));
      return true;
    }

    var lessonIndex = parseLessonNumber(text);
    if (lessonIndex >= 0 || (p && p.coursePlayLesson.test(text))) {
      if (lessonIndex < 0 && p && p.coursePlayLesson.test(text)) {
        deps.speak(vt('courseSayLessonNum'));
        return true;
      }
      if (lessonIndex >= 0) {
        var lessons = window.SonusCourse.lessons || [];
        var picked = lessons[lessonIndex];
        var useVoiceIntro = !(picked && picked.file);
        window.SonusCourse.playLesson(lessonIndex, useVoiceIntro);
        return true;
      }
    }

    return false;
  };

  var listenForLessonChoice = function () {
    if (conversationMode !== 'lesson_pick') {
      return;
    }
    deps.beginListening(vt('lessonListening'));
  };

  var playLessonClipThenListen = function (path, messageKey) {
    var message = vt(messageKey);
    if (getLang() !== 'vi' || !deps.playAudio) {
      return deps.speak(message, { skipResume: true }).finally(listenForLessonChoice);
    }
    return deps.playAudio(path, 1)
      .catch(function () {
        return deps.speak(message, { skipResume: true });
      })
      .finally(listenForLessonChoice);
  };

  var openLessonsFlow = function () {
    conversationMode = 'lesson_pick';
    deps.goToSection('#bai-hoc');

    var fullMessage = getLessonIntroSpeech();

    var afterIntro = function () {
      listenForLessonChoice();
    };

    if (deps.playAudio) {
      deps.playAudio(getLessonIntroMp3(), 1)
        .catch(function () {
          return deps.speak(fullMessage, { skipResume: true });
        })
        .finally(afterIntro);
      return;
    }

    deps.speak(fullMessage, { skipResume: true }).finally(afterIntro);
  };

  var handleLessonPick = function (text) {
    var p = voice() ? voice().patterns : null;

    if (p && p.cancel.test(text)) {
      conversationMode = null;
      deps.speak(vt('lessonCancelled'));
      return true;
    }

    var course = matchLessonCourse(text);
    if (course) {
      selectLessonCourse(course);
      return true;
    }

    var commands = deps.getGeneralCommands();
    for (var i = 0; i < commands.length; i++) {
      if (commands[i].isLessonEntry) {
        continue;
      }
      if (commands[i].match(text)) {
        conversationMode = null;
        commands[i].run();
        if (commands[i].handler) {
          commands[i].handler();
        } else if (commands[i].isHelp) {
          deps.speak(voice() ? voice().t('help') : 'help');
        } else {
          deps.speak(vt(commands[i].sayKey));
        }
        return true;
      }
    }

    playLessonClipThenListen(COURSE_NOT_FOUND_MP3, 'lessonNotFound');
    return true;
  };

  var getEntryCommand = function () {
    var p = voice() ? voice().patterns : null;
    return {
      isLessonEntry: true,
      match: function (text) {
        return p ? p.lessons.test(text) : /bai hoc|hoc bai|vao bai hoc|mo bai hoc/.test(text);
      },
      run: function () {},
      handler: openLessonsFlow
    };
  };

  window.SonusVoiceLessons = {
    init: function (options) {
      deps = options;

      return {
        isLessonPickMode: function () {
          return conversationMode === 'lesson_pick';
        },
        clearMode: function () {
          conversationMode = null;
        },
        handleCoursePageCommand: handleCoursePageCommand,
        handleLessonPick: handleLessonPick,
        tryDirectCourse: function (text) {
          var course = matchLessonCourse(text);
          if (course) {
            selectLessonCourse(course);
            return true;
          }
          return false;
        },
        handleEmptyTranscript: function () {
          playLessonClipThenListen(NO_SPEECH_MP3, 'lessonPickEmpty');
        },
        handleNoSpeech: function () {
          playLessonClipThenListen(NO_SPEECH_MP3, 'lessonPickNoSpeech');
        },
        getEntryCommand: getEntryCommand
      };
    }
  };
})();
