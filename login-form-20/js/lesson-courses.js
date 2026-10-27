(function () {
  'use strict';

  window.SonusLessonCourses = [
    {
      id: 'co-ban-phim',
      slug: 'co-ban-phim',
      title: 'Cơ bản về phím',
      step: 'Bước 1',
      count: 8,
      url: 'lessons/co-ban-phim.html',
      intro: 'Làm quen bàn phím piano: phím trắng, phím đen, vị trí tay và cách xác định phím bằng xúc giác.',
      say: 'Đã chọn khóa Cơ bản về phím. Bạn sẽ làm quen phím trắng, phím đen và vị trí tay trên đàn. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /co ban ve phim|co ban phim|ve phim|ban phim|lam quen phim/.test(text);
      },
      audioFolder: 'co-ban-phim',
      selectFile: 'da-chon-khoa.mp3',
      selectFiles: { en: 'da-chon-khoa-en.mp3' },
      introFile: 'gioi-thieu-khoa.mp3',
      lessons: [
        { title: 'Giới thiệu bàn phím piano', file: 'bai1_khoacoban.mp3', files: { en: 'bai1_khoacoban-en.mp3' } },
        { title: 'Phím trắng và phím đen' },
        { title: 'Tìm nốt Đô trung tâm' },
        { title: 'Vị trí tay chuẩn' },
        { title: 'Di chuyển ngón trên phím trắng' },
        { title: 'Nhận biết quãng phím bằng xúc giác' },
        { title: 'Thực hành gõ phím từng tay' },
        { title: 'Ôn tập và kiểm tra' }
      ]
    },
    {
      id: 'not-nhac',
      slug: 'not-nhac',
      title: 'Nốt nhạc',
      step: 'Bước 2',
      count: 10,
      url: 'lessons/not-nhac.html',
      intro: 'Học tên nốt Đô–Rê–Mi, quãng, thang âm và cách nghe phân biệt cao độ trên đàn.',
      say: 'Đã chọn khóa Nốt nhạc. Bạn sẽ học tên nốt, quãng và thang âm qua âm thanh. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /not nhac|hoc not|ten not|am nhac co ban/.test(text) ||
          (/\bnot\b/.test(text) && !/bai nhac/.test(text));
      },
      audioFolder: 'not-nhac',
      selectFile: 'da-chon-khoa.mp3',
      lessons: [
        'Tên bảy nốt cơ bản',
        'Thang âm Đô trưởng',
        'Quãng 2 và quãng 3',
        'Nghe phân biệt cao–thấp',
        'Nốt trên phím đàn',
        'Nhịp và phách',
        'Luyện nghe nốt đơn',
        'Luyện nghe chuỗi nốt',
        'Đọc tên nốt qua giọng nói',
        'Ôn tập thang âm'
      ]
    },
    {
      id: 'so-cap',
      slug: 'so-cap',
      title: 'Sơ cấp',
      step: 'Sơ cấp',
      count: 12,
      url: 'lessons/so-cap.html',
      intro: 'Bài tập ngón cơ bản, nhịp đơn giản và những bản nhạc ngắn phù hợp người mới bắt đầu.',
      say: 'Đã chọn khóa Sơ cấp. Đây là lộ trình phù hợp người mới với bài tập và bản nhạc ngắn. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /so cap|moi bat dau|nguoi moi/.test(text);
      },
      audioFolder: 'so-cap',
      selectFile: 'da-chon-khoa.mp3',
      selectFiles: { en: 'da-chon-khoa-en.mp3' },
      lessons: [
        'Tư thế ngồi và đặt tay',
        'Bài tập ngón 1–2–3–4–5',
        'Chơi nốt đơn tay phải',
        'Chơi nốt đơn tay trái',
        'Hai tay luân phiên',
        'Nhịp 4/4 cơ bản',
        'Bản nhạc: Twinkle Twinkle',
        'Bản nhạc: Happy Birthday',
        'Luyện tốc độ chậm',
        'Luyện tốc độ trung bình',
        'Ghi nhớ vị trí phím',
        'Kiểm tra cuối khóa'
      ]
    },
    {
      id: 'trung-cap',
      slug: 'trung-cap',
      title: 'Trung cấp',
      step: 'Trung cấp',
      count: 18,
      url: 'lessons/trung-cap.html',
      intro: 'Hợp âm, nhịp phức tạp hơn, kỹ thuật ngón liên tục và bản nhạc có độ khó trung bình.',
      say: 'Đã chọn khóa Trung cấp. Bạn sẽ luyện hợp âm, nhịp phức tạp hơn và kỹ thuật ngón. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /trung cap/.test(text);
      },
      audioFolder: 'trung-cap',
      selectFile: 'da-chon-khoa.mp3',
      selectFiles: { en: 'da-chon-khoa-en.mp3' },
      lessons: [
        'Giới thiệu hợp âm 3 nốt',
        'Hợp âm C, G, F',
        'Hợp âm Am, Dm, Em',
        'Chuyển hợp âm mượt',
        'Nhịp 3/4',
        'Nhịp 6/8',
        'Kỹ thuật legato',
        'Kỹ thuật staccato',
        'Arpeggio cơ bản',
        'Bản nhạc trung cấp 1',
        'Bản nhạc trung cấp 2',
        'Luyện tay trái hợp âm',
        'Đệm nhạc đơn giản',
        'Dynamics: to–nhỏ',
        'Pedal sustain cơ bản',
        'Luyện theo metronome',
        'Biểu diễn bản ngắn',
        'Ôn tập trung cấp'
      ]
    },
    {
      id: 'cao-cap',
      slug: 'cao-cap',
      title: 'Cao cấp',
      step: 'Cao cấp',
      count: 14,
      url: 'lessons/cao-cap.html',
      intro: 'Kỹ thuật biểu cảm, pedal, tốc độ cao và repertoire cổ điển nâng cao.',
      say: 'Đã chọn khóa Cao cấp. Lộ trình này tập trung biểu cảm, pedal và tác phẩm khó hơn. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /cao cap|nang cao/.test(text);
      },
      audioFolder: 'cao-cap',
      selectFile: 'da-chon-khoa.mp3',
      selectFiles: { en: 'da-chon-khoa-en.mp3' },
      lessons: [
        'Phân tích tác phẩm qua nghe',
        'Voicing và melody line',
        'Pedal nâng cao',
        'Rubato và biểu cảm',
        'Octave và double notes',
        'Trills và ornaments',
        'Scale tốc độ cao',
        'Etude luyện ngón',
        'Repertoire cổ điển 1',
        'Repertoire cổ điển 2',
        'Chuẩn bị biểu diễn',
        'Ghi âm và tự đánh giá',
        'Luyện tập có cấu trúc',
        'Tổng kết cao cấp'
      ]
    },
    {
      id: 'braille',
      slug: 'braille',
      title: 'Đọc nhạc Braille',
      step: 'Braille',
      count: 12,
      url: 'lessons/braille.html',
      intro: 'Hướng dẫn đọc ký hiệu Braille âm nhạc, bản nhạc nổi và cách luyện tập song song với nghe.',
      say: 'Đã chọn khóa Braille. Bạn sẽ học đọc ký hiệu Braille âm nhạc và luyện tập song song với nghe. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /braille|doc nhac|ban nhac noi/.test(text);
      },
      audioFolder: 'braille',
      selectFile: 'da-chon-khoa.mp3',
      lessons: [
        'Giới thiệu Braille âm nhạc',
        'Ký hiệu nốt cơ bản',
        'Nhịp và ô nhịp',
        'Dấu hóa và dấu lặng',
        'Đọc tay phải',
        'Đọc tay trái',
        'Đọc hai tay',
        'Bản nhạc Braille mẫu 1',
        'Bản nhạc Braille mẫu 2',
        'Kết hợp nghe và đọc',
        'Luyện tập hàng ngày',
        'Kiểm tra đọc Braille'
      ]
    },
    {
      id: 'thuc-hanh',
      slug: 'thuc-hanh',
      title: 'Thực hành',
      step: 'Thực hành',
      count: 15,
      url: 'lessons/thuc-hanh.html',
      intro: 'Bài tập lặp lại theo nhịp, luyện tay trái–phải và các drill ngắn để củng cố kỹ năng.',
      say: 'Đã chọn khóa Thực hành. Đây là các bài drill ngắn để củng cố kỹ năng mỗi ngày. Đang chuyển đến trang khóa học.',
      match: function (text) {
        return /thuc hanh|bai tap|luyen tap|luyen tay/.test(text);
      },
      audioFolder: 'thuc-hanh',
      selectFile: 'da-chon-khoa.mp3',
      lessons: [
        'Khởi động ngón 5 phút',
        'Drill tay phải',
        'Drill tay trái',
        'Drill hai tay',
        'Luyện nhịp với metronome',
        'Luyện quãng',
        'Luyện hợp âm block',
        'Luyện arpeggio',
        'Luyện chuyển vị trí',
        'Luyện tốc độ tăng dần',
        'Luyện nghe lại bản thu',
        'Thực hành bản yêu thích',
        'Thực hành bản mới',
        'Cool-down cuối buổi',
        'Nhật ký luyện tập'
      ]
    }
  ];
})();
