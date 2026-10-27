(function () {
  'use strict';

  var RECOGNITION_LANG = {
    vi: 'vi-VN',
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR'
  };

  var TTS_LANG = {
    vi: 'vi-VN',
    en: 'en',
    zh: 'zh-CN',
    ja: 'ja',
    ko: 'ko'
  };

  var MESSAGES = {
    vi: {
      help: 'Bạn có thể nói: trang chủ, bài học, bài nhạc, về chúng tôi, liên lạc, tài khoản, đăng nhập, giao diện tối, giao diện sáng, hoặc hướng dẫn. Khi vào bài học, nói tên khóa: cơ bản về phím, nốt nhạc, sơ cấp, trung cấp, cao cấp, Braille, hoặc thực hành.',
      listening: 'Đang lắng nghe... Nói «dừng lại» để tắt trợ lý AI.',
      listeningDefault: 'Đang lắng nghe... Hãy nói lệnh bằng tiếng Việt.',
      notClear: 'Tôi chưa nghe rõ. Vui lòng nói lại.',
      noSpeech: 'Tôi chưa nghe thấy gì. Vui lòng nói lại.',
      notUnderstood: 'Tôi chưa hiểu lệnh này. Nói hướng dẫn để nghe các lệnh có thể dùng.',
      speechError: 'Không thể nhận diện giọng nói. Vui lòng thử lại.',
      openHome: 'Đang mở trang chủ.',
      openMusic: 'Đang mở các bài nhạc nên thử.',
      openAbout: 'Đang mở phần về chúng tôi.',
      openContact: 'Đang mở phần liên lạc.',
      openLogin: 'Đang mở trang đăng nhập.',
      openAccount: 'Đang mở tài khoản của bạn.',
      themeDark: 'Đã bật giao diện tối.',
      themeLight: 'Đã bật giao diện sáng.',
      lessonListening: 'Đang lắng nghe tên khóa học. Hãy nói, ví dụ: sơ cấp, nốt nhạc, hoặc Braille.',
      lessonNotFound: 'Tôi chưa nhận ra khóa học đó. Hãy nói: cơ bản về phím, nốt nhạc, sơ cấp, trung cấp, cao cấp, Braille, hoặc thực hành.',
      lessonPickEmpty: 'Tôi chưa nghe rõ. Hãy nói tên khóa học bạn muốn.',
      lessonPickNoSpeech: 'Tôi chưa nghe thấy gì. Hãy nói tên khóa học bạn muốn.',
      lessonCancelled: 'Đã hủy chọn khóa học.',
      courseOpenAudio: 'Đang mở phần nghe bài giảng. Chọn bài hoặc nói bài 1, bài 2 để nghe.',
      courseStopAudio: 'Đã dừng đọc bài giảng.',
      courseSayLessonNum: 'Hãy nói rõ số bài, ví dụ: bài 1, bài 2.',
      statusReady: 'Nhấn Trợ lý AI hoặc Alt + V. Nói «dừng lại» để tắt micro.'
    },
    en: {
      help: 'You can say: home, lessons, music, about us, contact, login, dark mode, light mode, or help. For courses say: keyboard basics, music notes, beginner, intermediate, advanced, Braille, or practice.',
      listening: 'Listening... Say "stop" to turn off the assistant.',
      listeningDefault: 'Listening... Say a voice command.',
      notClear: 'I did not catch that. Please try again.',
      noSpeech: 'I did not hear anything. Please try again.',
      notUnderstood: 'I did not understand that command. Say help to hear available commands.',
      speechError: 'Speech recognition failed. Please try again.',
      openHome: 'Opening home page.',
      openMusic: 'Opening suggested music.',
      openAbout: 'Opening about us.',
      openContact: 'Opening contact.',
      openLogin: 'Opening login page.',
      openAccount: 'Opening your account.',
      themeDark: 'Dark theme enabled.',
      themeLight: 'Light theme enabled.',
      lessonListening: 'Listening for a course name. For example: beginner, music notes, or Braille.',
      lessonNotFound: 'I did not recognize that course. Say: keyboard basics, music notes, beginner, intermediate, advanced, Braille, or practice.',
      lessonPickEmpty: 'I did not hear clearly. Say the course you want.',
      lessonPickNoSpeech: 'I did not hear anything. Say the course you want.',
      lessonCancelled: 'Course selection cancelled.',
      courseOpenAudio: 'Opening lesson audio. Pick a lesson or say lesson 1, lesson 2.',
      courseStopAudio: 'Stopped lesson playback.',
      courseSayLessonNum: 'Please say the lesson number, for example: lesson 1, lesson 2.',
      statusReady: 'Press AI Assistant or Alt + V. Say "stop" to turn off the microphone.'
    },
    zh: {
      help: '您可以说：首页、课程、音乐、关于我们、联系、登录、深色模式、浅色模式或帮助。选课程可说：键盘基础、音符、初级、中级、高级、盲文或练习。',
      listening: '正在聆听…说「停止」可关闭助手。',
      listeningDefault: '正在聆听…请说出语音命令。',
      notClear: '没有听清楚，请再说一次。',
      noSpeech: '没有听到声音，请再说一次。',
      notUnderstood: '不明白该命令。说「帮助」可听取可用命令。',
      speechError: '语音识别失败，请重试。',
      openHome: '正在打开首页。',
      openMusic: '正在打开推荐曲目。',
      openAbout: '正在打开关于我们。',
      openContact: '正在打开联系页面。',
      openLogin: '正在打开登录页面。',
      openAccount: '正在打开您的账户。',
      themeDark: '已开启深色模式。',
      themeLight: '已开启浅色模式。',
      lessonListening: '正在聆听课程名称。例如：初级、音符或盲文。',
      lessonNotFound: '未识别该课程。请说：键盘基础、音符、初级、中级、高级、盲文或练习。',
      lessonPickEmpty: '没有听清楚，请说出想要的课程。',
      lessonPickNoSpeech: '没有听到声音，请说出想要的课程。',
      lessonCancelled: '已取消选课。',
      courseOpenAudio: '正在打开课程音频。选择课程或说第1课、第2课。',
      courseStopAudio: '已停止播放课程。',
      courseSayLessonNum: '请说明课次，例如：第1课、第2课。',
      statusReady: '按 AI 助手或 Alt + V。说「停止」可关闭麦克风。'
    },
    ja: {
      help: 'ホーム、レッスン、音楽、私たちについて、連絡、ログイン、ダークモード、ライトモード、ヘルプと言えます。コース名：鍵盤基礎、音符、初級、中級、上級、点字、練習。',
      listening: '聞いています…「停止」と言うとアシスタントを終了します。',
      listeningDefault: '聞いています…コマンドを話してください。',
      notClear: '聞き取れませんでした。もう一度お願いします。',
      noSpeech: '何も聞こえませんでした。もう一度お願いします。',
      notUnderstood: 'コマンドが分かりませんでした。ヘルプと言うと使える命令を聞けます。',
      speechError: '音声認識に失敗しました。もう一度お試しください。',
      openHome: 'ホームを開いています。',
      openMusic: 'おすすめ曲を開いています。',
      openAbout: '私たちについてを開いています。',
      openContact: '連絡先を開いています。',
      openLogin: 'ログインページを開いています。',
      openAccount: 'アカウントを開いています。',
      themeDark: 'ダークモードをオンにしました。',
      themeLight: 'ライトモードをオンにしました。',
      lessonListening: 'コース名を聞いています。例：初級、音符、点字。',
      lessonNotFound: 'そのコースは分かりませんでした。鍵盤基礎、音符、初級、中級、上級、点字、練習と言ってください。',
      lessonPickEmpty: '聞き取れませんでした。希望のコースを言ってください。',
      lessonPickNoSpeech: '何も聞こえませんでした。希望のコースを言ってください。',
      lessonCancelled: 'コース選択をキャンセルしました。',
      courseOpenAudio: 'レッスン音声を開いています。レッスン1、レッスン2とも言えます。',
      courseStopAudio: 'レッスン再生を停止しました。',
      courseSayLessonNum: 'レッスン番号を言ってください。例：レッスン1、レッスン2。',
      statusReady: 'AIアシスタントまたは Alt + V。停止と言うとマイクをオフにします。'
    },
    ko: {
      help: '홈, 수업, 음악, 소개, 연락, 로그인, 다크 모드, 라이트 모드, 도움말을 말할 수 있습니다. 코스: 건반 기초, 음표, 초급, 중급, 고급, 점자, 연습.',
      listening: '듣고 있습니다… "중지"라고 하면 어시스턴트가 꺼집니다.',
      listeningDefault: '듣고 있습니다… 명령을 말씀해 주세요.',
      notClear: '잘 듣지 못했습니다. 다시 말씀해 주세요.',
      noSpeech: '아무 소리도 들리지 않았습니다. 다시 말씀해 주세요.',
      notUnderstood: '명령을 이해하지 못했습니다. 도움말이라고 하면 사용 가능한 명령을 들을 수 있습니다.',
      speechError: '음성 인식에 실패했습니다. 다시 시도해 주세요.',
      openHome: '홈 페이지를 엽니다.',
      openMusic: '추천 곡을 엽니다.',
      openAbout: '소개 페이지를 엽니다.',
      openContact: '연락처를 엽니다.',
      openLogin: '로그인 페이지를 엽니다.',
      openAccount: '계정을 엽니다.',
      themeDark: '다크 모드를 켰습니다.',
      themeLight: '라이트 모드를 켰습니다.',
      lessonListening: '코스 이름을 듣고 있습니다. 예: 초급, 음표, 점자.',
      lessonNotFound: '그 코스를 인식하지 못했습니다. 건반 기초, 음표, 초급, 중급, 고급, 점자, 연습이라고 말해 주세요.',
      lessonPickEmpty: '잘 듣지 못했습니다. 원하는 코스를 말씀해 주세요.',
      lessonPickNoSpeech: '아무 소리도 들리지 않았습니다. 원하는 코스를 말씀해 주세요.',
      lessonCancelled: '코스 선택을 취소했습니다.',
      courseOpenAudio: '수업 오디오를 엽니다. 수업 1, 수업 2라고 말할 수 있습니다.',
      courseStopAudio: '수업 재생을 중지했습니다.',
      courseSayLessonNum: '수업 번호를 말씀해 주세요. 예: 수업 1, 수업 2.',
      statusReady: 'AI 어시스턴트 또는 Alt + V. 중지라고 하면 마이크가 꺼집니다.'
    }
  };

  var PATTERNS = {
    stop: new RegExp(
      'dung lai|dung nghe|dung tro ly|tat tro ly|tam dung tro ly|dung micro|dung bat tro ly|dung lang nghe|' +
      'stop|stop listening|stop assistant|turn off assistant|quit listening|' +
      '停止|停下|别听|停止助手|停止聆听|关闭助手|' +
      'ストップ|やめて|止めて|聞くのをやめ|アシスタント.*止|' +
      '중지|멈춰|그만|듣기.*중지|어시스턴트.*중지',
      'i'
    ),
    cancel: new RegExp(
      'huy|bo qua|thoat|' +
      'cancel|never mind|' +
      '取消|算了|' +
      'キャンセル|やめる|' +
      '취소|그만',
      'i'
    ),
    home: new RegExp(
      'trang chu|ve trang chu|' +
      'home|go home|homepage|' +
      '首页|主页|回到首页|' +
      'ホーム|トップ|' +
      '홈|메인|처음',
      'i'
    ),
    lessons: new RegExp(
      'bai hoc|hoc bai|vao bai hoc|mo bai hoc|' +
      'lessons|lesson|courses|open lessons|start lessons|' +
      '课程|上课|学习|打开课程|' +
      'レッスン|授業|コース|' +
      '수업|레슨|강좌',
      'i'
    ),
    music: new RegExp(
      'bai nhac|tim bai nhac|cac bai nhac|nhac nen thu|' +
      'music|songs|pieces|recommended music|' +
      '音乐|曲目|推荐音乐|' +
      '音楽|曲|おすすめ|' +
      '음악|곡|추천',
      'i'
    ),
    about: new RegExp(
      've chung toi|gioi thieu|' +
      'about|about us|introduction|' +
      '关于|关于我们|介绍|' +
      '私たちについて|紹介|' +
      '소개|우리',
      'i'
    ),
    contact: new RegExp(
      'lien lac|lien he|ho tro|' +
      'contact|support|reach us|' +
      '联系|联络|支持|' +
      '連絡|お問い合わせ|サポート|' +
      '연락|문의|지원',
      'i'
    ),
    account: new RegExp(
      'tai khoan|mo tai khoan|' +
      'my account|account panel|open account|' +
      '我的账户|打开账户|' +
      'マイアカウント|アカウントを開|' +
      '내 계정|계정 열',
      'i'
    ),
    login: new RegExp(
      'dang nhap|mo dang nhap|' +
      'login|sign in|log in|' +
      '登录|' +
      'ログイン|サインイン|' +
      '로그인',
      'i'
    ),
    dark: new RegExp(
      'giao dien toi|bat toi|' +
      'dark mode|dark theme|enable dark|' +
      '深色|暗色|黑暗模式|' +
      'ダーク|暗い|ダークモード|' +
      '다크|어두운|다크 모드',
      'i'
    ),
    light: new RegExp(
      'giao dien sang|bat sang|' +
      'light mode|light theme|enable light|' +
      '浅色|亮色|明亮模式|' +
      'ライト|明るい|ライトモード|' +
      '라이트|밝은|라이트 모드',
      'i'
    ),
    help: new RegExp(
      'huong dan|giup toi|tro giup|lenh gi|' +
      'help|commands|guide|what can i say|' +
      '帮助|指令|指南|' +
      'ヘルプ|使い方|コマンド|' +
      '도움|도움말|명령',
      'i'
    ),
    courseOverview: new RegExp(
      'danh sach bai|doc lai|gioi thieu khoa|tom tat khoa|' +
      'lesson list|course overview|course intro|read course|' +
      '课程列表|课程介绍|概述|' +
      'レッスン一覧|コース紹介|概要|' +
      '수업 목록|코스 소개|개요',
      'i'
    ),
    courseOpenAudio: new RegExp(
      'vao nghe|phan nghe|nghe bai giang|mo phan nghe|' +
      'open audio|listen to lesson|lesson audio|play section|' +
      '听讲课|打开音频|听课|' +
      '音声|レッスンを聴|聴く|' +
      '오디오|수업 듣|듣기',
      'i'
    ),
    courseStopAudio: new RegExp(
      'dung phat|dung audio|dung bai|dung doc|' +
      'stop audio|stop playback|stop lesson|' +
      '停止播放|停止音频|' +
      '再生停止|止めて|' +
      '재생 중지|멈춰',
      'i'
    ),
    coursePlayLesson: new RegExp(
      'phat bai|nghe bai|mo bai|doc bai|' +
      'play lesson|open lesson|lesson|' +
      '播放|打开课|' +
      'レッスン|再生|' +
      '수업|재생',
      'i'
    )
  };

  var COURSE_PATTERNS = {
    'co-ban-phim': new RegExp(
      'co ban ve phim|co ban phim|ve phim|ban phim|lam quen phim|' +
      'keyboard basics|piano keys|basic keys|' +
      '键盘|琴键|基础键|按键基础|' +
      '鍵盤|キーボード|基礎|' +
      '건반|키보드|기초',
      'i'
    ),
    'not-nhac': new RegExp(
      'not nhac|hoc not|ten not|am nhac co ban|' +
      'music notes|note names|notes|' +
      '音符|音名|音阶|' +
      '音符|音階|音名|' +
      '음표|음계|음이름',
      'i'
    ),
    'so-cap': new RegExp(
      'so cap|moi bat dau|nguoi moi|' +
      'beginner|basic level|starter|' +
      '初级|入门|初学者|' +
      '初級|初心者|入門|' +
      '초급|입문|초보',
      'i'
    ),
    'trung-cap': new RegExp(
      'trung cap|' +
      'intermediate|' +
      '中级|' +
      '中級|' +
      '중급',
      'i'
    ),
    'cao-cap': new RegExp(
      'cao cap|nang cao|' +
      'advanced|' +
      '高级|' +
      '上級|上級者|' +
      '고급',
      'i'
    ),
    braille: new RegExp(
      'braille|doc nhac|ban nhac noi|' +
      'braille music|tactile music|' +
      '盲文|布莱叶|点字|' +
      '点字|ブライユ|' +
      '점자',
      'i'
    ),
    'thuc-hanh': new RegExp(
      'thuc hanh|bai tap|luyen tap|luyen tay|' +
      'practice|exercises|drills|' +
      '练习|实践|训练|' +
      '練習|実践|ドリル|' +
      '연습|실습|훈련',
      'i'
    )
  };

  var getLang = function () {
    if (window.SonusLang && window.SonusLang.get) {
      return window.SonusLang.get();
    }
    try {
      var saved = localStorage.getItem('sonus-lang');
      if (saved && MESSAGES[saved]) {
        return saved;
      }
    } catch (e) {}
    return 'vi';
  };

  var t = function (key) {
    var lang = getLang();
    var pack = MESSAGES[lang] || MESSAGES.vi;
    return pack[key] != null ? pack[key] : MESSAGES.vi[key] || key;
  };

  var normalize = function (text) {
    var value = (text || '').toLowerCase().trim();
    value = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
    return value
      .replace(/[^a-z0-9\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  var parseLessonNumber = function (text) {
    var wordMap = {
      mot: 1, hai: 2, ba: 3, bon: 4, nam: 5, sau: 6, bay: 7, tam: 8, chin: 9, muoi: 10,
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };

    var patterns = [
      /bai\s*(\d+)/,
      /lesson\s*(\d+)/,
      /第\s*(\d+)\s*[课節课]/,
      /(\d+)\s*[课節课]/,
      /レッスン\s*(\d+)/,
      /(\d+)\s*レッスン/,
      /수업\s*(\d+)/,
      /(\d+)\s*수업/,
      /lesson\s*(one|two|three|four|five|six|seven|eight|nine|ten)/,
      /bai\s*(mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)/
    ];

    var i;
    var match;
    for (i = 0; i < patterns.length; i++) {
      match = text.match(patterns[i]);
      if (!match) {
        continue;
      }
      if (/^\d+$/.test(match[1])) {
        return parseInt(match[1], 10) - 1;
      }
      if (wordMap[match[1]]) {
        return wordMap[match[1]] - 1;
      }
    }

    var zhNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    var zhMatch = text.match(/第\s*([一二三四五六七八九十])\s*[课節]/);
    if (zhMatch) {
      return zhNums.indexOf(zhMatch[1]);
    }

    return -1;
  };

  var matchCourse = function (text, courses) {
    var id;
    for (id in COURSE_PATTERNS) {
      if (COURSE_PATTERNS[id].test(text)) {
        for (var i = 0; i < courses.length; i++) {
          if (courses[i].id === id) {
            return courses[i];
          }
        }
      }
    }

    for (var j = 0; j < courses.length; j++) {
      if (courses[j].match && courses[j].match(text)) {
        return courses[j];
      }
    }

    return null;
  };

  window.SonusVoiceI18n = {
    recognitionLang: RECOGNITION_LANG,
    ttsLang: TTS_LANG,
    patterns: PATTERNS,
    getLang: getLang,
    t: t,
    normalize: normalize,
    parseLessonNumber: parseLessonNumber,
    matchCourse: matchCourse
  };
})();
