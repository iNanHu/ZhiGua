var _check_emp_nrmc = undefined;
$(function() {
	getEmployeeInfo();
	get_noRead_message_count();
	_check_emp_nrmc = window.setInterval(get_noRead_message_count, 5 * 1000);
})

function close_key() {
	xKeyABC();
	xKey123();
}

$('.win').each(function() {
	$(this).on('touchstart', function() {
		close_key();
	});
});

$('.mo-back').each(function() {
	$(this).on('touchstart', function() {
		_clearInterval();
	});
});

function exit(value) {
	if (_check_emp_nrmc != undefined) {
		window.clearInterval(_check_emp_nrmc);
		_check_emp_nrmc = undefined;
	}
	window.location.href = "WechatLoginAction_exit?roleType=" + value;
}