(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('min-height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('min-height', $(window).height());
		});

	};
	fullHeight();

	$(".toggle-password").click(function() {

	  $(this).toggleClass("fa-eye fa-eye-slash");
	  var input = $($(this).attr("toggle"));
	  if (input.attr("type") == "password") {
	    input.attr("type", "text");
	  } else {
	    input.attr("type", "password");
	  }
	});

	var usernamePattern = /^[a-zA-Z0-9_]+$/;
	var passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

	var validationRules = {
		username: [
			{
				test: function(value) { return value.length > 0; },
				message: 'Vui lòng nhập Username.'
			},
			{
				test: function(value) { return value.length >= 3; },
				message: 'Username phải có ít nhất 3 ký tự.'
			},
			{
				test: function(value) { return value.length <= 30; },
				message: 'Username không được vượt quá 30 ký tự.'
			},
			{
				test: function(value) { return usernamePattern.test(value); },
				message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới (_).'
			}
		],
		password: [
			{
				test: function(value) { return value.length > 0; },
				message: 'Vui lòng nhập Password.'
			},
			{
				test: function(value) { return value.length >= 6; },
				message: 'Password phải có ít nhất 6 ký tự.'
			},
			{
				test: function(value) { return value.length <= 50; },
				message: 'Password không được vượt quá 50 ký tự.'
			},
			{
				test: function(value) { return passwordPattern.test(value); },
				message: 'Password phải chứa ít nhất 1 chữ cái và 1 số.'
			}
		]
	};

	var validateField = function(fieldName) {
		var $input = fieldName === 'username' ? $('#username-field') : $('#password-field');
		var $error = fieldName === 'username' ? $('#username-error') : $('#password-error');
		var value = $.trim($input.val());
		var rules = validationRules[fieldName];
		var message = '';

		for (var i = 0; i < rules.length; i++) {
			if (!rules[i].test(value)) {
				message = rules[i].message;
				break;
			}
		}

		if (message) {
			$input.addClass('is-invalid');
			$error.text(message);
			return false;
		}

		$input.removeClass('is-invalid');
		$error.text('');
		return true;
	};

	$('#username-field').on('input blur', function() {
		validateField('username');
	});

	$('#password-field').on('input blur', function() {
		validateField('password');
	});

	$('.signin-form').on('submit', function(e) {
		var isUsernameValid = validateField('username');
		var isPasswordValid = validateField('password');

		e.preventDefault();

		if (isUsernameValid && isPasswordValid) {
			try {
				localStorage.setItem('sonus-user', $.trim($('#username-field').val()) || 'Học viên');
			} catch (err) {}
			window.location.href = 'home.html';
		}
	});

})(jQuery);
