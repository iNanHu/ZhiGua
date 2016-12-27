var bossJson = undefined;
function _boss_info() {
	getBossInfo();
}

function getBossInfo() {
	ajaxSend("WechatBossMy_bossInfo", null, "GET", "JSON", true, "init_boss_info");
}

function init_boss_info(data) {
	bossJson = data;
	_init_boss_info();
}

function _init_boss_info() {
	//if (bossJson.loginType == "web_login") {
	//	$('#link_printer').remove();
	//} else if (bossJson.loginType == "wechat_login") {
	//	$('#exit_login').remove();
	//	$('#link_printer').remove();
	//}
	
	var accountPhoto = bossJson.accountPhoto;
	if (accountPhoto == "") {
		accountPhoto = "imgs/logo.png";
	}
	$('#det_accounts_photo_img').attr("style", "background-image: url(" + accountPhoto + ");");
	var name = bossJson.name;
	$('#det_accounts_Name').html(name);
}

function _boss_setting() {
	var accountPhoto = bossJson.accountPhoto;
	$('#set_boss_photo').val(accountPhoto);
	if (accountPhoto == "") {
		accountPhoto = "imgs/logo.png";
	}
	$('#set_boss_photo_img').attr("style", "background-image: url(" + accountPhoto + ");");
	$('#set_boss_Name').html(bossJson.name);
	$('#set_boss_phone').html(bossJson.phone);
}

function _set_boss_name() {
	$('#m_set_boss_Name').focus();
	$('#m_set_boss_Name').val(bossJson.name);
}

function set_boss_name() {
	var m_set_boss_Name = $('#m_set_boss_Name').val();
	$('#m_set_boss_Name').blur();
	if (validator_varLength("昵称", m_set_boss_Name, 16)) {
		$('#set_boss_Name').html(m_set_boss_Name);
		update_bossInfo();
	}
}

function _set_boss_phone() {
	$('#m_set_boss_phone').focus();
	$('#m_set_boss_phone').val(bossJson.phone);
}
function set_boss_phone() {
	var m_set_boss_phone = $('#m_set_boss_phone').val();
	$('#m_set_boss_phone').blur();
	if (validator_phone("手机号", m_set_boss_phone)) {
		$('#set_boss_phone').html(m_set_boss_phone);
		update_bossInfo();
	}
}

function update_bossInfo_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossMy_uploadAccountPhoto", data, "POST", "JSON", false, null);
	$('#set_boss_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#set_boss_photo').val(data.photoUrl);
	update_bossInfo();
}

function update_bossInfo() {
	var set_boss_photo = $('#set_boss_photo').val();
	var set_boss_Name = $('#set_boss_Name').html();
	var set_boss_phone = $('#set_boss_phone').html();

	var data = {
		"name" : set_boss_Name,
		"phone" : set_boss_phone,
		"accountPhoto" : set_boss_photo
	};

	ajaxSend("WechatBossMy_updateAccounts", data, "GET", "JSON", true, "update_bossInfo_callback");
}

function update_bossInfo_callback(data) {
	bossJson = data;
	_boss_setting();
	_init_boss_info();
}

function link_printer() {
	window.location.href = "link_printer";
}

function show_position(){
    window.location.href = "show_position";
}
