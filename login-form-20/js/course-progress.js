(function () {
  'use strict';

  var KEY = 'sonus-course-progress';

  var load = function () {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  var save = function (data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {}
  };

  var courseById = function (courseId) {
    var courses = window.SonusLessonCourses || [];
    for (var i = 0; i < courses.length; i++) {
      if (courses[i].id === courseId) {
        return courses[i];
      }
    }
    return null;
  };

  var lessonCount = function (course) {
    if (!course) {
      return 0;
    }
    if (course.lessons && course.lessons.length) {
      return course.lessons.length;
    }
    return course.count || 0;
  };

  var markLessonComplete = function (courseId, index) {
    if (!courseId || index == null || index < 0) {
      return;
    }
    var data = load();
    if (!data[courseId]) {
      data[courseId] = {};
    }
    data[courseId][String(index)] = true;
    save(data);
  };

  var getCourseStats = function (courseId) {
    var course = courseById(courseId);
    var total = lessonCount(course);
    var doneMap = load()[courseId] || {};
    var done = 0;
    Object.keys(doneMap).forEach(function (key) {
      var n = parseInt(key, 10);
      if (doneMap[key] && n >= 0 && n < total) {
        done += 1;
      }
    });
    var pct = total ? Math.round((done * 100) / total) : 0;
    var nextIndex = 0;
    for (var i = 0; i < total; i++) {
      if (!doneMap[String(i)]) {
        nextIndex = i;
        break;
      }
      if (i === total - 1) {
        nextIndex = total;
      }
    }
    return {
      id: courseId,
      title: course ? course.title : courseId,
      done: done,
      total: total,
      pct: pct,
      nextIndex: nextIndex,
      url: course ? course.url : 'home.html#bai-hoc'
    };
  };

  var getAllStats = function () {
    return (window.SonusLessonCourses || []).map(function (course) {
      return getCourseStats(course.id);
    });
  };

  var getOverallPct = function () {
    var all = getAllStats();
    var done = 0;
    var total = 0;
    all.forEach(function (item) {
      done += item.done;
      total += item.total;
    });
    return total ? Math.round((done * 100) / total) : 0;
  };

  var getFocusCourse = function () {
    var all = getAllStats();
    var i;
    for (i = 0; i < all.length; i++) {
      if (all[i].done > 0 && all[i].pct < 100) {
        return all[i];
      }
    }
    for (i = 0; i < all.length; i++) {
      if (all[i].pct < 100) {
        return all[i];
      }
    }
    return all[0] || null;
  };

  window.SonusProgress = {
    markLessonComplete: markLessonComplete,
    getCourseStats: getCourseStats,
    getAllStats: getAllStats,
    getOverallPct: getOverallPct,
    getFocusCourse: getFocusCourse
  };
})();
