var wechatUserJson = undefined;
function _customer_info() {
	getWechatUserInfo();
}

function getWechatUserInfo() {
	ajaxSend("WechatCustMy_wechatUserInfo", null, "GET", "JSON", true, "init_wechatUser_info");
}

function init_wechatUser_info(data) {
	wechatUserJson = data;
	_init_wechatUser_info();
}

function _init_wechatUser_info() {
	var customerPhoto = wechatUserJson.customerPhoto;
	if (customerPhoto == "") {
		customerPhoto = wechatUserJson.headimgUrl;
	}
	$('#det_wechatUser_photo_img').attr("style", "background-image: url(" + customerPhoto + ");");
	var name = wechatUserJson.name;
	if (name == "") {
		name = wechatUserJson.nickName;
	}
	$('#det_wechatUser_Name').html(name);
}

function _customer_setting() {
	var customerPhoto = wechatUserJson.customerPhoto;
	$('#set_customerInfo_photo').val(customerPhoto);
	if (customerPhoto == "") {
		customerPhoto = "imgs/customer.png";
	}
	$('#set_customerInfo_photo_img').attr("style", "background-image: url(" + customerPhoto + ");");
	$('#set_customerInfo_Name').html(wechatUserJson.name);
	$('#set_customerInfo_phone').html(wechatUserJson.phone);
}

function _set_customer_info_name() {
	$('#m_set_customerInfo_Name').focus();
	$('#m_set_customerInfo_Name').val(wechatUserJson.name);
}

function set_customerInfo_name() {
	var m_set_customerInfo_Name = $('#m_set_customerInfo_Name').val();
	$('#m_set_customerInfo_Name').blur();
	if (validator_varLength("昵称", m_set_customerInfo_Name, 16)) {
		$('#set_customerInfo_Name').html(m_set_customerInfo_Name);
		update_customerInfo();
	}
}

function _set_customer_info_phone() {
	$('#m_set_customerInfo_phone').focus();
	$('#m_set_customerInfo_phone').val(wechatUserJson.phone);
}
function set_customerInfo_phone() {
	var m_set_customerInfo_phone = $('#m_set_customerInfo_phone').val();
	$('#m_set_customerInfo_phone').blur();
	if (validator_phone("手机号", m_set_customerInfo_phone)) {
		$('#set_customerInfo_phone').html(m_set_customerInfo_phone);
		update_customerInfo();
	}
}

function update_customerInfo() {
	var set_customerInfo_photo = $('#set_customerInfo_photo').val();
	var set_customerInfo_Name = $('#set_customerInfo_Name').html();
	var set_customerInfo_phone = $('#set_customerInfo_phone').html();

	var data = {
		"customerInfo.id" : wechatUserJson.id,
		"customerInfo.customerPhoto" : set_customerInfo_photo,
		"customerInfo.name" : set_customerInfo_Name,
		"customerInfo.phone" : set_customerInfo_phone
	};

	ajaxSend("WechatCustMy_updateCustomerInfo", data, "GET", "JSON", true, "update_customerInfo_callback");
}

function update_customerInfo_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatCustMy_uploadCustomerInfoPhoto", data, "POST", "JSON", false, null);
	$('#set_customerInfo_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#set_customerInfo_photo').val(data.photoUrl);
	update_customerInfo();
}

function update_customerInfo_callback(data) {
	wechatUserJson = data;
	_customer_setting();
	_init_wechatUser_info();
}