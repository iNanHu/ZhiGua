var _check_cust_nrmc = undefined;
$(function() {
	get_noRead_message_count();
	_check_cust_nrmc = window.setInterval(get_noRead_message_count, 5 * 1000);
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