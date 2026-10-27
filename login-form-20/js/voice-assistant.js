(function () {
  'use strict';

  var SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
  var isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var isSecurePage = window.isSecureContext;
  var HELP_TEXT = '';
  var voiceI18n = function () {
    return window.SonusVoiceI18n;
  };
  var SPEECH_SPEED = 1.5;
  var WELCOME_MP3 = 'audio/welcome-gia-huy.mp3';
  var WELCOME_MP3_EN = 'audio/welcome-en.mp3';
  var WELCOME_MP3_ZH = 'audio/welcome-zh.mp3';
  var WELCOME_MP3_KO = 'audio/welcome-ko.mp3';
  var WELCOME_MP3_JA = 'audio/welcome-ja.mp3';
  var WELCOME_MP3_BY_LANG = {
    en: WELCOME_MP3_EN,
    zh: WELCOME_MP3_ZH,
    ko: WELCOME_MP3_KO,
    ja: WELCOME_MP3_JA
  };
  var MICRO_DENIED_MP3 = 'audio/micro-chua-duoc.mp3';
  var ASSISTANT_STOPPED_MP3 = 'audio/da-dung-tro-ly.mp3';
  var NOT_CLEAR_MP3 = 'audio/chua-nghe-ro.mp3';
  var NOT_UNDERSTOOD_MP3 = 'audio/chua-hieu-lenh.mp3';
  var NO_SPEECH_MP3 = 'audio/chua-nghe-thay.mp3';
  var WELCOME_KEY = 'sonus-welcome-played';
  var ASSISTANT_KEY = 'sonus-assistant-active';

  var isListening = false;
  var isSpeaking = false;
  var lessonVoice = null;
  var currentAudio = null;
  var resumeTimer = null;
  var statusEl;
  var liveRegion;
  var toggleBtn;
  var recognition = null;

  if (SpeechRecognitionApi && isSecurePage) {
    recognition = new SpeechRecognitionApi();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;
  }

  var getSpeechUnsupportedMessage = function () {
    if (!isSecurePage && isMobileDevice) {
      return 'Trên điện thoại, trợ lý AI cần link HTTPS an toàn. ' +
        'Chrome không cho dùng micro qua http://192.168.x.x. ' +
        'Hãy dùng ngrok (link https) hoặc mở web trên máy tính qua localhost.';
    }
    if (!isSecurePage) {
      return 'Trợ lý AI cần HTTPS hoặc localhost. ' +
        'Trên máy tính mở http://localhost:8080/home.html. ' +
        'Trên điện thoại cần link https qua ngrok.';
    }
    return 'Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy cập nhật Chrome hoặc Edge.';
  };

  var normalize = function (text) {
    if (voiceI18n()) {
      return voiceI18n().normalize(text);
    }
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  var vt = function (key) {
    return voiceI18n() ? voiceI18n().t(key) : key;
  };

  var getHelpText = function () {
    return vt('help');
  };

  var updateRecognitionLang = function () {
    if (!recognition || !voiceI18n()) {
      return;
    }
    var lang = getCurrentLang();
    recognition.lang = voiceI18n().recognitionLang[lang] || voiceI18n().recognitionLang.vi;
  };

  var setStatus = function (text) {
    if (statusEl) {
      statusEl.textContent = text;
    }
    if (liveRegion) {
      liveRegion.textContent = text;
    }
  };

  var cancelResumeTimer = function () {
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  };

  var stopCoursePageAudio = function () {
    var main = document.getElementById('main-course-audio');
    if (main) {
      main.pause();
      main.currentTime = 0;
    }
  };

  var stopAssistantPlayback = function () {
    cancelResumeTimer();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  var stopCurrentAudio = function () {
    stopAssistantPlayback();
  };

  var stopAllPlayback = function () {
    stopAssistantPlayback();
    stopCoursePageAudio();
  };

  var isAudioBusy = function () {
    if (isSpeaking || currentAudio) {
      return true;
    }
    var main = document.getElementById('main-course-audio');
    if (main && !main.paused && !main.ended && main.currentTime > 0) {
      return true;
    }
    return false;
  };

  var splitForTts = function (text, maxLen) {
    maxLen = maxLen || 180;
    if (text.length <= maxLen) {
      return [text];
    }

    var parts = [];
    var remaining = text;

    while (remaining.length > maxLen) {
      var slice = remaining.slice(0, maxLen);
      var breakAt = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf(', '),
        slice.lastIndexOf(' ')
      );
      if (breakAt < 40) {
        breakAt = maxLen;
      }
      parts.push(remaining.slice(0, breakAt).trim());
      remaining = remaining.slice(breakAt).trim();
    }

    if (remaining) {
      parts.push(remaining);
    }

    return parts;
  };

  var getAssetPath = function (relativePath) {
    var path = window.location.pathname.replace(/\\/g, '/');
    return /\/lessons\//i.test(path) ? '../' + relativePath : relativePath;
  };

  var playAudioUrl = function (url, playbackRate) {
    stopAllPlayback();
    return new Promise(function (resolve, reject) {
      var audio = new Audio();
      audio.playbackRate = playbackRate != null ? playbackRate : SPEECH_SPEED;
      currentAudio = audio;
      audio.onended = function () {
        if (currentAudio === audio) {
          currentAudio = null;
        }
        resolve();
      };
      audio.onerror = function () {
        if (currentAudio === audio) {
          currentAudio = null;
        }
        reject(new Error('Không phát được âm thanh'));
      };
      audio.src = url;
      audio.play().catch(reject);
    });
  };

  var buildGoogleTtsUrls = function (chunk, langCode) {
    var tl = 'vi-VN';
    if (voiceI18n() && voiceI18n().ttsLang[langCode]) {
      tl = voiceI18n().ttsLang[langCode];
    }
    var encoded = encodeURIComponent(chunk);
    return [
      'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=' + tl + '&dt=t&q=' + encoded,
      'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + tl + '&q=' + encoded,
      'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=' + tl + '&q=' + encoded
    ];
  };

  var fetchTtsBlob = function (url) {
    return fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('TTS HTTP ' + response.status);
        }
        return response.blob();
      })
      .then(function (blob) {
        if (!blob || blob.size < 256) {
          throw new Error('TTS blob rỗng');
        }
        return blob;
      });
  };

  var playGoogleChunk = function (chunk, langCode) {
    var urls = buildGoogleTtsUrls(chunk, langCode);

    var tryIndex = function (index) {
      if (index >= urls.length) {
        return Promise.reject(new Error('Hết nguồn TTS'));
      }

      var url = urls[index];

      return playAudioUrl(url).catch(function () {
        return fetchTtsBlob(url).then(function (blob) {
          var objectUrl = URL.createObjectURL(blob);
          return playAudioUrl(objectUrl).finally(function () {
            URL.revokeObjectURL(objectUrl);
          });
        });
      }).catch(function () {
        return tryIndex(index + 1);
      });
    };

    return tryIndex(0);
  };

  var delay = function (ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  };

  var speakGoogle = function (text, langCode) {
    langCode = langCode || getCurrentLang();
    var chunks = splitForTts(text, 160);
    var chain = Promise.resolve();

    chunks.forEach(function (chunk, index) {
      chain = chain.then(function () {
        if (index > 0) {
          return delay(180);
        }
        return undefined;
      }).then(function () {
        return playGoogleChunk(chunk, langCode);
      });
    });

    return chain;
  };

  var vietnameseVoice = null;
  var browserVoice = null;
  var voicesReady = false;

  var pickBrowserVoice = function (langCode) {
    if (!window.speechSynthesis) {
      return null;
    }
    var voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      return null;
    }

    var langMap = {
      vi: ['vi-VN', 'vi'],
      en: ['en-US', 'en-GB', 'en'],
      zh: ['zh-CN', 'zh-TW', 'zh'],
      ja: ['ja-JP', 'ja'],
      ko: ['ko-KR', 'ko']
    };
    var prefs = langMap[langCode] || langMap.vi;
    var i;
    var j;
    var voice;

    for (i = 0; i < prefs.length; i++) {
      voice = voices.find(function (v) { return v.lang === prefs[i]; });
      if (voice) {
        return voice;
      }
    }

    for (j = 0; j < prefs.length; j++) {
      voice = voices.find(function (v) {
        return v.lang && v.lang.indexOf(prefs[j].slice(0, 2)) === 0;
      });
      if (voice) {
        return voice;
      }
    }

    return voices[0];
  };

  var loadVoices = function () {
    if (!window.speechSynthesis) {
      return;
    }
    var voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      return;
    }
    voicesReady = true;
    vietnameseVoice = pickBrowserVoice('vi');
    browserVoice = pickBrowserVoice(getCurrentLang());
  };

  var speakBrowser = function (text, langCode) {
    if (!window.speechSynthesis) {
      return Promise.reject(new Error('Không hỗ trợ đọc văn bản'));
    }

    if (!voicesReady) {
      loadVoices();
    }

    langCode = langCode || getCurrentLang();
    var voice = pickBrowserVoice(langCode) || vietnameseVoice;
    if (!voice) {
      return Promise.reject(new Error('Không có giọng phù hợp trên trình duyệt'));
    }

    return new Promise(function (resolve, reject) {
      window.speechSynthesis.cancel();
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang || langCode;
      utterance.rate = SPEECH_SPEED;
      utterance.onend = function () { resolve(); };
      utterance.onerror = function () { reject(new Error('Đọc văn bản thất bại')); };
      window.speechSynthesis.speak(utterance);
    });
  };

  var hasWelcomePlayed = function () {
    try {
      return sessionStorage.getItem(getWelcomeSessionKey()) === '1';
    } catch (e) {
      return false;
    }
  };

  var markWelcomePlayed = function () {
    try {
      sessionStorage.setItem(getWelcomeSessionKey(), '1');
    } catch (e) {}
  };

  var isAssistantActive = function () {
    try {
      return sessionStorage.getItem(ASSISTANT_KEY) === '1';
    } catch (e) {
      return false;
    }
  };

  var enableAssistant = function () {
    try {
      sessionStorage.setItem(ASSISTANT_KEY, '1');
    } catch (e) {}
  };

  var disableAssistant = function () {
    cancelResumeTimer();
    if (lessonVoice) {
      lessonVoice.clearMode();
    }
    try {
      sessionStorage.removeItem(ASSISTANT_KEY);
    } catch (e) {}
    stopListening();
  };

  var isStopCommand = function (text) {
    if (voiceI18n()) {
      return voiceI18n().patterns.stop.test(text);
    }
    return /dung lai|dung nghe|dung tro ly|tat tro ly|tam dung tro ly|dung micro|dung bat tro ly|dung lang nghe/.test(text);
  };

  var shouldAutoResumeListening = function () {
    return isAssistantActive() && !(lessonVoice && lessonVoice.isLessonPickMode());
  };

  var resumeListeningOnce = function (delayMs) {
    cancelResumeTimer();
    if (!shouldAutoResumeListening()) {
      return;
    }
    resumeTimer = setTimeout(function () {
      resumeTimer = null;
      if (!shouldAutoResumeListening() || isListening || isAudioBusy()) {
        return;
      }
      beginListening(vt('listening'));
    }, delayMs || 500);
  };

  var speak = function (text, options) {
    options = options || {};
    var langCode = options.lang || getCurrentLang();
    setStatus(text);
    stopAllPlayback();
    isSpeaking = true;
    return speakGoogle(text, langCode).catch(function () {
      return speakBrowser(text, langCode);
    }).catch(function () {
      setStatus(text + ' (Cần internet để nghe phản hồi bằng giọng nói)');
      return Promise.resolve(false);
    }).finally(function () {
      isSpeaking = false;
      if (!options.skipResume) {
        resumeListeningOnce(500);
      }
    });
  };

  var playMp3 = function (path, playbackRate) {
    setStatus('Đang phát âm thanh...');
    return playAudioUrl(getAssetPath(path), playbackRate);
  };

  var getCurrentLang = function () {
    var i18n = window.SonusI18n;
    var isValidLang = function (code) {
      return !!(code && i18n && i18n.strings[code]);
    };

    var select = document.querySelector('.lang-select');
    if (select && select.value && isValidLang(select.value)) {
      return select.value;
    }

    if (window.SonusLang && window.SonusLang.get) {
      return window.SonusLang.get();
    }

    var htmlLang = document.documentElement.lang;
    if (isValidLang(htmlLang)) {
      return htmlLang;
    }

    try {
      var saved = localStorage.getItem('sonus-lang');
      if (isValidLang(saved)) {
        return saved;
      }
    } catch (e) {}

    return (i18n && i18n.defaultLang) || 'vi';
  };

  var getWelcomeSessionKey = function () {
    return WELCOME_KEY + ':' + getCurrentLang();
  };

  var playWelcomeAudio = function () {
    var lang = getCurrentLang();
    var path = WELCOME_MP3_BY_LANG[lang] || WELCOME_MP3;
    var statusByLang = {
      en: 'Welcome to Sonus Tactic',
      zh: '欢迎使用 Sonus Tactic',
      ko: '소누스 택틱에 오신 것을 환영합니다',
      ja: 'Sonus Tacticへようこそ'
    };
    setStatus(statusByLang[lang] || 'Chào mừng đến Sonus Tactic');
    return playMp3(path, 1);
  };

  var isMicrophoneBlockedError = function (errorCode) {
    return errorCode === 'not-allowed' ||
      errorCode === 'audio-capture' ||
      errorCode === 'service-not-allowed';
  };

  var playMicroDeniedAudio = function () {
    disableAssistant();
    setStatus('Micro chưa được cấp quyền');
    return playMp3(MICRO_DENIED_MP3, 1).catch(function () {
      return speak(
        'Micro chưa được cấp quyền. Hãy cho phép truy cập micro trong trình duyệt.',
        { skipResume: true }
      );
    });
  };

  var playAssistantStoppedAudio = function () {
    setStatus('Đã dừng trợ lý AI');
    return playMp3(ASSISTANT_STOPPED_MP3, 1).catch(function () {
      return speak('Đã dừng trợ lý AI.', { skipResume: true });
    });
  };

  var playNotClearAudio = function () {
    var message = vt('notClear');
    setStatus(message);
    if (getCurrentLang() !== 'vi') {
      return speak(message);
    }
    return playMp3(NOT_CLEAR_MP3, 1)
      .catch(function () {
        return speak(message, { skipResume: true });
      })
      .finally(function () {
        resumeListeningOnce(500);
      });
  };

  var playNotUnderstoodAudio = function () {
    var message = vt('notUnderstood');
    setStatus(message);
    if (getCurrentLang() !== 'vi') {
      return speak(message);
    }
    return playMp3(NOT_UNDERSTOOD_MP3, 1)
      .catch(function () {
        return speak(message, { skipResume: true });
      })
      .finally(function () {
        resumeListeningOnce(500);
      });
  };

  var playNoSpeechAudio = function () {
    var message = vt('noSpeech');
    setStatus(message);
    if (getCurrentLang() !== 'vi') {
      return speak(message);
    }
    return playMp3(NO_SPEECH_MP3, 1)
      .catch(function () {
        return speak(message, { skipResume: true });
      })
      .finally(function () {
        resumeListeningOnce(500);
      });
  };

  var navigate = function (target) {
    var hashIndex = target.indexOf('#');

    if (hashIndex > -1) {
      var page = target.slice(0, hashIndex);
      var hash = target.slice(hashIndex);
      var currentPage = window.location.pathname.split('/').pop() || 'index.html';

      if (page && page !== currentPage) {
        window.location.href = target;
        return;
      }

      var el = document.querySelector(hash);
      if (el) {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '-1');
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
      }
      return;
    }

    window.location.href = target;
  };

  var goToSection = function (hash) {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'home.html') {
      navigate(hash);
      return;
    }
    navigate('home.html' + hash);
  };

  var applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var logoImg = document.querySelector('.logo-img');
    if (logoImg) {
      logoImg.src = theme === 'dark'
        ? logoImg.getAttribute('data-logo-dark')
        : logoImg.getAttribute('data-logo-light');
    }
    try {
      localStorage.setItem('sonus-theme', theme);
    } catch (e) {}
  };

  var buildCommands = function () {
    var p = voiceI18n() ? voiceI18n().patterns : null;
    return [
      {
        match: function (text) { return p ? p.home.test(text) : /trang chu|ve trang chu/.test(text); },
        run: function () {},
        sayKey: 'openHome',
        handler: function () {
          var goHome = function () {
            navigate('home.html');
          };
          var homeClip = getCurrentLang() === 'en'
            ? 'audio/dang-chuyen-trang-chu-en.mp3'
            : 'audio/dang-chuyen-trang-chu.mp3';
          playMp3(homeClip, 1)
            .catch(function () {
              return speak(vt('openHome'), { skipResume: true });
            })
            .finally(goHome);
        }
      },
      {
        match: function (text) { return p ? p.music.test(text) : /bai nhac|tim bai nhac|cac bai nhac|nhac nen thu/.test(text); },
        run: function () { goToSection('#bai-nhac'); },
        sayKey: 'openMusic'
      },
      {
        match: function (text) { return p ? p.about.test(text) : /ve chung toi|gioi thieu/.test(text); },
        run: function () { goToSection('#ve-chung-toi'); },
        sayKey: 'openAbout'
      },
      {
        match: function (text) { return p ? p.contact.test(text) : /lien lac|lien he|ho tro/.test(text); },
        run: function () { goToSection('#lien-lac'); },
        sayKey: 'openContact'
      },
      {
        match: function (text) { return p ? p.account.test(text) : /tai khoan|mo tai khoan/.test(text); },
        run: function () {
          if (window.SonusAccount && window.SonusAccount.open) {
            window.SonusAccount.open();
          }
        },
        sayKey: 'openAccount'
      },
      {
        match: function (text) { return p ? p.login.test(text) : /dang nhap|mo dang nhap/.test(text); },
        run: function () { navigate('index.html'); },
        sayKey: 'openLogin'
      },
      {
        match: function (text) { return p ? p.dark.test(text) : /giao dien toi|dark mode|bat toi/.test(text); },
        run: function () { applyTheme('dark'); },
        sayKey: 'themeDark'
      },
      {
        match: function (text) { return p ? p.light.test(text) : /giao dien sang|light mode|bat sang/.test(text); },
        run: function () { applyTheme('light'); },
        sayKey: 'themeLight'
      },
      {
        match: function (text) { return p ? p.help.test(text) : /huong dan|giup toi|tro giup|lenh gi/.test(text); },
        run: function () {},
        sayKey: 'help',
        isHelp: true
      }
    ];
  };

  var commands = buildCommands();

  var runLocalCommand = function (rawText) {
    var text = normalize(rawText);

    if (text && isStopCommand(text)) {
      disableAssistant();
      playAssistantStoppedAudio();
      return;
    }

    if (!text) {
      if (lessonVoice && lessonVoice.isLessonPickMode()) {
        lessonVoice.handleEmptyTranscript();
      } else {
        playNotClearAudio();
      }
      return;
    }

    if (lessonVoice && lessonVoice.isLessonPickMode()) {
      lessonVoice.handleLessonPick(text);
      return;
    }

    if (lessonVoice && lessonVoice.handleCoursePageCommand(text)) {
      return;
    }

    for (var i = 0; i < commands.length; i++) {
      if (commands[i].match(text)) {
        commands[i].run();
        if (commands[i].handler) {
          commands[i].handler();
        } else if (commands[i].isHelp) {
          speak(getHelpText());
        } else {
          speak(vt(commands[i].sayKey));
        }
        return;
      }
    }

    if (lessonVoice && lessonVoice.tryDirectCourse(text)) {
      return;
    }

    playNotUnderstoodAudio();
  };

  var setListeningState = function (active) {
    isListening = active;
    var buttons = document.querySelectorAll('.ai-assistant-trigger, .voice-assistant-btn');
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-listening', active);
    });
  };

  var stopListening = function () {
    cancelResumeTimer();
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setListeningState(false);
  };

  var beginListening = function (statusMessage) {
    if (!recognition) {
      if (!isSecurePage) {
        playMicroDeniedAudio().finally(function () {
          setStatus(getSpeechUnsupportedMessage());
        });
        return;
      }
      var msg = getSpeechUnsupportedMessage();
      setStatus(msg);
      speak(msg, { skipResume: true });
      return;
    }

    if (isAudioBusy()) {
      resumeListeningOnce(700);
      return;
    }

    updateRecognitionLang();

    try {
      recognition.start();
      setListeningState(true);
      setStatus(statusMessage || vt('listeningDefault'));
    } catch (e) {
      resumeListeningOnce(1200);
    }
  };

  var startListening = function () {
    if (isAssistantActive() && isListening) {
      disableAssistant();
      stopAllPlayback();
      playAssistantStoppedAudio();
      return;
    }

    enableAssistant();

    if (!hasWelcomePlayed()) {
      markWelcomePlayed();
      stopListening();
      playWelcomeAudio()
        .catch(function () {
          var lang = getCurrentLang();
          if (lang === 'en') {
            return speak(
              'Welcome to Sonus Tactic. Say a command, for example: home, lessons, or help.',
              { skipResume: true }
            );
          }
          if (lang === 'zh') {
            return speak(
              '欢迎使用 Sonus Tactic。您可以说：首页、课程或帮助。',
              { skipResume: true }
            );
          }
          if (lang === 'ko') {
            return speak(
              '소누스 택틱에 오신 것을 환영합니다. 홈, 수업, 도움말 등 명령을 말씀해 주세요.',
              { skipResume: true }
            );
          }
          if (lang === 'ja') {
            return speak(
              'Sonus Tacticへようこそ。ホーム、レッスン、ヘルプなどのコマンドを話してください。',
              { skipResume: true }
            );
          }
          return speak(
            'Chào mừng đến Sonus Tactic. Hãy nói lệnh bằng tiếng Việt, ví dụ: trang chủ, bài học, hoặc hướng dẫn.',
            { skipResume: true }
          );
        })
        .finally(function () {
          resumeListeningOnce(400);
        });
      return;
    }

    beginListening(vt('listening'));
  };

  if (window.SonusVoiceLessons) {
    lessonVoice = window.SonusVoiceLessons.init({
      speak: speak,
      beginListening: beginListening,
      goToSection: goToSection,
      navigate: navigate,
      getGeneralCommands: function () { return commands; },
      stopPlayback: stopAllPlayback,
      playAudio: function (path, rate) {
        return playMp3(path, rate);
      },
      resumeListening: resumeListeningOnce
    });
    commands.unshift(lessonVoice.getEntryCommand());
  }

  var bindTriggerButtons = function () {
    document.querySelectorAll('.ai-assistant-trigger').forEach(function (btn) {
      btn.addEventListener('click', startListening);
    });
  };

  var createFloatingUI = function () {
    var panel = document.createElement('section');
    panel.className = 'voice-assistant';
    panel.setAttribute('aria-label', 'Trợ lý giọng nói Sonus Tactic');

    liveRegion = document.createElement('p');
    liveRegion.className = 'voice-assistant-live';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');

    statusEl = document.createElement('p');
    statusEl.className = 'voice-assistant-status';

    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'voice-assistant-btn ai-assistant-trigger';
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.setAttribute('aria-label', 'Bật trợ lý AI. Nhấn Alt + V để mở nhanh.');
    toggleBtn.innerHTML =
      '<span class="voice-assistant-icon" aria-hidden="true">🎤</span>' +
      '<span class="voice-assistant-label">Trợ lý AI</span>';

    var helpBtn = document.createElement('button');
    helpBtn.type = 'button';
    helpBtn.className = 'voice-assistant-help';
    helpBtn.textContent = 'Hướng dẫn lệnh';
    helpBtn.addEventListener('click', function () {
      speak(getHelpText());
    });

    panel.appendChild(liveRegion);
    panel.appendChild(toggleBtn);
    panel.appendChild(statusEl);
    panel.appendChild(helpBtn);
    document.body.appendChild(panel);
  };

  if (recognition) {
    recognition.onresult = function (event) {
      var transcript = event.results[0][0].transcript;
      stopListening();
      runLocalCommand(transcript);
    };

    recognition.onerror = function (event) {
      stopListening();
      if (isMicrophoneBlockedError(event.error)) {
        playMicroDeniedAudio();
        return;
      }
      if (event.error === 'no-speech' && lessonVoice && lessonVoice.isLessonPickMode()) {
        lessonVoice.handleNoSpeech();
        return;
      }
      if (event.error === 'no-speech' && isAssistantActive()) {
        playNoSpeechAudio();
        return;
      }
      if (event.error !== 'aborted') {
        speak(vt('speechError'));
      }
    };

    recognition.onend = function () {
      setListeningState(false);
    };
  }

  document.addEventListener('keydown', function (event) {
    if (event.altKey && (event.key === 'v' || event.key === 'V')) {
      event.preventDefault();
      startListening();
    }
  });

  createFloatingUI();
  bindTriggerButtons();

  window.SonusAI = {
    start: startListening,
    stop: disableAssistant,
    speak: speak,
    stopSpeech: stopAssistantPlayback,
    resumeListening: resumeListeningOnce,
    isActive: isAssistantActive
  };

  document.addEventListener('sonus:langchange', function () {
    updateRecognitionLang();
    loadVoices();
    setStatus(vt('statusReady'));
  });

  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  setStatus(
    recognition
      ? vt('statusReady')
      : getSpeechUnsupportedMessage()
  );
})();
