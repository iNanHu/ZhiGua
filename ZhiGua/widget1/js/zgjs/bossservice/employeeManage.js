var employeeList = new Array();
var currEmployeeJson = undefined;

function _employee() {
	m_search_employee();
}

function m_search_employee() {
	_init_listview_employee_manage();
}

function m_input_search_employee(value) {
	$('#m_input_search_employee').val(value);
	m_search_employee();
}

function _init_listview_employee_manage() {
	var where = $('#m_input_search_employee').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : where
	};
	ajaxSend("WechatBossEmployee_employeeList", data, "GET", "JSON", true, "_listview_employee_manage");
}

function _listview_employee_manage(data) {
	var listview_employee_manage = $("#listview_employee_manage");
	listview_employee_manage.empty();
	employeeList = data.rows;
	for (var i = 0; i < employeeList.length; i++) {
		var employeePhoto = employeeList[i].employeePhoto;
		if (employeePhoto == "") {
			employeePhoto = "imgs/employee.png";
		}

		var liEle = $("<li class='move_del' onclick='_set_employee_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='ew'></div>");
		var divEle = $("<div class='o_win'  data-load='_employee_details'></div>");
		var img_liEle = $("<li class='clients-list-img' style='background-image: url(" + employeePhoto + ");'></li>");
		var mm_spanEle = $("<span class='mm'>" + employeeList[i].employeeName + "</span>");
		var p_spanEle = $("<span class='co-info'> " + employeeList[i].phone + "</span>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_employee(" + i + ")'><i class='icon icon-delete'></i></div>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(img_liEle);
		divEle.append(mm_spanEle);
		divEle.append(p_spanEle);
		liEle.append(del_divEle);
		listview_employee_manage.append(liEle);
	}
	refresh_node('m_employee_box');
}

function _set_employee_id(index) {
	currEmployeeJson = employeeList[index];
}

function _employee_details() {
	var employeePhoto = currEmployeeJson.employeePhoto;
	if (employeePhoto == "") {
		employeePhoto = "imgs/employee.png"
	}
	$('#det_employee_name').html(currEmployeeJson.employeeName);
	$('#det_employee_photo_img').attr("style", "background-image: url(" + employeePhoto + ");");
	$('#det_employee_phone').html(currEmployeeJson.phone);
	if (currEmployeeJson.isWXregister == 1) {
		$('#det_employee_isWXregister').html("已绑定");
	} else {
		$('#det_employee_isWXregister').html("未绑定");
	}
	$('#det_employee_qrcodeURL').attr("style", "background-image: url(" + currEmployeeJson.qrcodeURL + ");");

	$('#det_employee_id').html(currEmployeeJson.employeeId);
	$('#det_employee_shopName').html(currEmployeeJson.shopName);
	$('#det_employee_pwd').html(currEmployeeJson.password);
	if (currEmployeeJson.sex == 1) {
		$('#det_employee_sex').html("男");
	} else {
		$('#det_employee_sex').html("女");
	}
	$('#det_employee_address').html(currEmployeeJson.address);
	$('#det_employee_remarks').html(currEmployeeJson.remarks);
	refresh_node('det_employee_details_box');
}

function _employee_qrcode() {
	var employeePhoto = currEmployeeJson.employeePhoto;
	if (employeePhoto == "") {
		employeePhoto = "imgs/employee.png"
	}
	$('#det_employee_photo_img_').attr("style", "background-image: url(" + employeePhoto + ");");
	$('#det_employee_qrcodeURL_').attr("src", currEmployeeJson.qrcodeURL);
	if (currEmployeeJson.isWXregister == 1) {
		$('#det_employee_isWXregister_').html("<div class='w100 mo-btn mo-m' data-co='error' onclick='removeEmployeeBinding()'>解除绑定</div>");
	} else {
		$('#det_employee_isWXregister_').html("<p class='sx ac mh1e co-success bold'>未绑定</p>");
		_check_as = window.setInterval(checkEmpWXBindingStatus, 2 * 1000);

	}
}

function checkEmpWXBindingStatus() {
	var data = {
		"employee.id" : currEmployeeJson.id
	};
	ajaxSend("WechatBossEmployee_checkWXBindingStatus", data, "POST", "JSON", true, "_checkEmpWXBindingStatus_callback");
}

function _checkEmpWXBindingStatus_callback(data) {
	if (data.isWXregister == 1) {
		_clearInterval();
		currEmployeeJson.isWXregister = 1;
		_employee_qrcode();
		_employee_details();
	}
}

function removeEmployeeBinding() {
	var data = {
		"employee.id" : currEmployeeJson.id
	};
	data = ajaxSend("WechatBossEmployee_removeBinding", data, "POST", "JSON", false, null);
	if (data.resultCode == "040204") {
		currEmployeeJson.isWXregister = 0;
		_employee_qrcode();
		_employee_details();
	}
}

// 添加员工start
function add_employee_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossEmployee_uploadEmployeePhoto", data, "POST", "JSON", false, null);
	$('#add_employee_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#add_employee_photo').val(data.photoUrl);
}

function _add_employee_id() {
	$('#m_add_employee_id').focus();
}

function add_employee_id() {
	var m_add_employee_id = $('#m_add_employee_id').val();
	if (validator_account("员工编号", m_add_employee_id, 2, 6)) {
		var data = {
			"employee.employeeId" : m_add_employee_id,
			"employee.ext1" : "add"
		};
		data = ajaxSend("WechatBossEmployee_isExist", data, "GET", "JSON", false, null);
		if (data.resultCode == "040401") {
			window.wxc.xcConfirm("员工已存在！", "info", null);
			return false;
		}
		$('#add_employee_id').html(m_add_employee_id);
		close_win();
	}
	$('#m_add_employee_id').blur();
}

function _add_employee_name() {
	$('#m_add_employee_name').focus();
}

function add_employee_name() {
	var m_add_employee_name = $('#m_add_employee_name').val();
	if (validator_varLength("员工名称", m_add_employee_name, 16)) {
		var data = {
			"employee.employeeName" : m_add_employee_name,
			"employee.ext1" : "add"
		};
		data = ajaxSend("WechatBossEmployee_isExist", data, "GET", "JSON", false, null);
		if (data.resultCode == "040401") {
			window.wxc.xcConfirm("员工已存在！", "info", null);
			return false;
		}
		$('#add_employee_name').html(m_add_employee_name);
		close_win();
	}
	$('#m_add_employee_name').blur();
}

function _add_employee_shop() {
	ajaxSend("WechatBossEmployee_shopSelect", null, "GET", "JSON", true, "_init_listview_employee_shop");
}

function _init_listview_employee_shop(data) {
	var add_listview_shop = $("#add_listview_shop");
	add_listview_shop.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		liEle = $("<li class='x_win' onclick=\"add_employee_shop('" + data[i].shopCode + "', '" + data[i].shopName + "'," + data[i].onlineStatus + ")\">"
				+ data[i].shopName + "</li>");
		add_listview_shop.append(liEle);
	}
	refresh_node('add_employee_shop_box');
}

function add_employee_shop(shopCode, shopName) {
	$('#add_employee_shopName').html(shopName);
	$('#add_employee_shopCode').val(shopCode);
}

function _add_employee_phone() {
	$('#m_add_employee_phone').focus();
}

function add_employee_phone() {
	var m_add_employee_phone = $('#m_add_employee_phone').val();
	if (validator_phone("手机号码", m_add_employee_phone)) {
		$('#add_employee_phone').html(m_add_employee_phone);
		close_win();
	}
	$('#m_add_employee_phone').blur();
}

function _add_employee_pwd() {
	$('#m_add_employee_pwd').focus();
}

function add_employee_pwd() {
	var m_add_employee_pwd = $('#m_add_employee_pwd').val();
	if (validator_password("密码", m_add_employee_pwd, m_add_employee_pwd)) {
		$('#add_employee_pwd').html(m_add_employee_pwd);
		close_win();
	}
	$('#m_add_employee_pwd').blur();
}

function add_employee_sex(value) {
	if (value == 0) {
		$('#add_employee_sex_span').html("女");
	} else {
		$('#add_employee_sex_span').html("男");
	}
	$('#add_employee_sex').val(value);
}

function _add_employee_address() {
	$('#m_add_employee_address').focus();
}

function add_employee_address() {
	var m_add_employee_address = $('#m_add_employee_address').val();
	if (validator_varLength("地址", m_add_employee_address, 50)) {
		$('#add_employee_address').html(m_add_employee_address);
		close_win();
	}
	$('#m_add_employee_address').blur();
	refresh_node('add_employee_box');
}

function _add_employee_remarks() {
	$('#m_add_employee_remarks').focus();
}

function add_employee_remarks() {
	var m_add_employee_remarks = $('#m_add_employee_remarks').val();
	if (validator_remarks(m_add_employee_remarks)) {
		$('#add_employee_remarks').html(m_add_employee_remarks);
		close_win();
	}
	$('#m_add_employee_remarks').blur();
	refresh_node('add_employee_box');
}

function add_employee() {
	var add_employee_photo = $('#add_employee_photo').val();
	var add_employee_id = $('#add_employee_id').html();
	if (!validator_null("员工编号", add_employee_id)) {
		return false;
	}
	var add_employee_name = $('#add_employee_name').html();
	if (!validator_null("员工名称", add_employee_name)) {
		return false;
	}
	var add_employee_shopName = $('#add_employee_shopName').html();
	if (!validator_null("所属门店", add_employee_shopName)) {
		return false;
	}
	var add_employee_shopCode = $('#add_employee_shopCode').val();
	var add_employee_phone = $('#add_employee_phone').html();
	if (!validator_null("手机号码", add_employee_phone)) {
		return false;
	}
	var add_employee_pwd = $('#add_employee_pwd').html();
	if (!validator_null("密码", add_employee_pwd)) {
		return false;
	}
	var add_employee_sex = $('#add_employee_sex').val();
	var add_employee_address = $('#add_employee_address').html();
	if (!validator_null("地址", add_employee_address)) {
		return false;
	}
	var add_employee_remarks = $('#add_employee_remarks').html();

	var data = {
		"employee.employeePhoto" : add_employee_photo,
		"employee.employeeId" : add_employee_id,
		"employee.employeeName" : add_employee_name,
		"employee.sex" : add_employee_sex,
		"employee.password" : add_employee_pwd,
		"employee.phone" : add_employee_phone,
		"employee.address" : add_employee_address,
		"employee.shopCode" : add_employee_shopCode,
		"employee.shopName" : add_employee_shopName,
		"employee.remarks" : add_employee_remarks
	};

	// alert(JSON.stringify(data));
	ajaxSend("WechatBossEmployee_addEmployee", data, "GET", "JSON", true, "_add_employee_callback");
	close_win();
}

function _add_employee_callback(data) {
	if (data.resultCode == "040101") {
		_init_listview_employee_manage();
		window.wxc.xcConfirm("员工添加成功！", "info", null);
	} else {
		window.wxc.xcConfirm("员工添加失败！", "info", null);
	}
}

// 添加员工end

// 编辑员工start
function _edit_employee() {
	var employeePhoto = currEmployeeJson.employeePhoto;
	if (employeePhoto == "") {
		employeePhoto = "imgs/employee.png"
	}
	$('#update_employee_name').html(currEmployeeJson.employeeName);
	$('#update_employee_photo_img').attr("style", "background-image: url(" + employeePhoto + ");");
	$('#update_employee_photo').val(employeePhoto);
	$('#update_employee_phone').html(currEmployeeJson.phone);

	$('#update_employee_id').html(currEmployeeJson.employeeId);
	$('#update_employee_shopName').html(currEmployeeJson.shopName);
	$('#update_employee_shopCode').val(currEmployeeJson.shopCode);

	$('#update_employee_pwd').html(currEmployeeJson.password);

	if (currEmployeeJson.sex == 1) {
		$('#update_employee_sex_span').html("男");
	} else {
		$('#update_employee_sex_span').html("女");
	}
	$('#update_employee_sex').val(currEmployeeJson.sex);
	$('#update_employee_address').html(currEmployeeJson.address);
	$('#update_employee_remarks').html(currEmployeeJson.remarks);
	refresh_node('edit_employee_box');
}

function update_employee_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossEmployee_uploadEmployeePhoto", data, "POST", "JSON", false, null);
	$('#update_employee_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#update_employee_photo').val(data.photoUrl);
}

function _update_employee_name() {
	$('#m_update_employee_name').val(currEmployeeJson.employeeName);
	$('#m_update_employee_name').focus();
}

function update_employee_name() {
	var m_update_employee_name = $('#m_update_employee_name').val();
	if (validator_varLength("员工名称", m_update_employee_name, 16)) {
		var data = {
			"employee.employeeName" : m_update_employee_name,
			"employee.employeeId" : currEmployeeJson.employeeId,
			"employee.ext1" : "update"
		};
		data = ajaxSend("WechatBossEmployee_isExist", data, "GET", "JSON", false, null);
		if (data.resultCode == "040401") {
			window.wxc.xcConfirm("员工已存在！", "info", null);
			return false;
		}
		$('#update_employee_name').html(m_update_employee_name);
		close_win();
	}
	$('#m_update_employee_name').blur();
}

function _update_employee_shop() {
	ajaxSend("WechatBossEmployee_shopSelect", null, "GET", "JSON", true, "_init_listview_update_employee_shop");
}

function _init_listview_update_employee_shop(data) {
	var update_listview_shop = $("#update_listview_shop");
	update_listview_shop.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		liEle = $("<li class='x_win' onclick=\"update_employee_shop('" + data[i].shopCode + "', '" + data[i].shopName + "'," + data[i].onlineStatus + ")\">"
				+ data[i].shopName + "</li>");
		update_listview_shop.append(liEle);
	}
	refresh_node('update_employee_shop_box');
}

function update_employee_shop(shopCode, shopName) {
	$('#update_employee_shopName').html(shopName);
	$('#update_employee_shopCode').val(shopCode);
}

function _update_employee_phone() {
	$('#m_update_employee_phone').val(currEmployeeJson.phone);
	$('#m_update_employee_phone').focus();
}

function update_employee_phone() {
	var m_update_employee_phone = $('#m_update_employee_phone').val();
	if (validator_phone("手机号码", m_update_employee_phone)) {
		$('#update_employee_phone').html(m_update_employee_phone);
		close_win();
	}
	$('#m_update_employee_phone').blur();
}

function _update_employee_pwd() {
	$('#m_update_employee_pwd').val(currEmployeeJson.password);
	$('#m_update_employee_pwd').focus();
}

function update_employee_pwd() {
	var m_update_employee_pwd = $('#m_update_employee_pwd').val();
	if (validator_password("密码", m_update_employee_pwd, m_update_employee_pwd)) {
		$('#update_employee_pwd').html(m_update_employee_pwd);
		close_win();
	}
	$('#m_update_employee_pwd').blur();
}

function update_employee_sex(value) {
	if (value == 0) {
		$('#update_employee_sex_span').html("女");
	} else {
		$('#update_employee_sex_span').html("男");
	}
	$('#update_employee_sex').val(value);
}

function _update_employee_address() {
	$('#m_update_employee_address').val(currEmployeeJson.address);
	$('#m_update_employee_address').focus();
}

function update_employee_address() {
	var m_update_employee_address = $('#m_update_employee_address').val();
	if (validator_varLength("地址", m_update_employee_address, 50)) {
		$('#update_employee_address').html(m_update_employee_address);
		close_win();
	}
	$('#m_update_employee_address').blur();
	refresh_node('edit_employee_box');
}

function _update_employee_remarks() {
	$('#m_update_employee_remarks').val(currEmployeeJson.remarks);
	$('#m_update_employee_remarks').focus();
}

function update_employee_remarks() {
	var m_update_employee_remarks = $('#m_update_employee_remarks').val();
	if (validator_remarks(m_update_employee_remarks)) {
		$('#update_employee_remarks').html(m_update_employee_remarks);
		close_win();
	}
	$('#m_update_employee_remarks').blur();
	refresh_node('edit_employee_box');
}

function update_employee() {
	var update_employee_photo = $('#update_employee_photo').val();
	var update_employee_name = $('#update_employee_name').html();
	if (!validator_null("员工名称", update_employee_name)) {
		return false;
	}
	var update_employee_shopName = $('#update_employee_shopName').html();
	if (!validator_null("所属门店", update_employee_shopName)) {
		return false;
	}
	var update_employee_shopCode = $('#update_employee_shopCode').val();
	var update_employee_phone = $('#update_employee_phone').html();
	if (!validator_null("电话号码", update_employee_phone)) {
		return false;
	}
	var update_employee_pwd = $('#update_employee_pwd').html();
	if (!validator_null("密码", update_employee_pwd)) {
		return false;
	}
	var update_employee_sex = $('#update_employee_sex').val();
	var update_employee_address = $('#update_employee_address').html();
	if (!validator_null("地址", update_employee_address)) {
		return false;
	}
	var update_employee_remarks = $('#update_employee_remarks').html();

	var data = {
		"employee.id" : currEmployeeJson.id,
		"employee.employeePhoto" : update_employee_photo,
		"employee.employeeName" : update_employee_name,
		"employee.sex" : update_employee_sex,
		"employee.password" : update_employee_pwd,
		"employee.phone" : update_employee_phone,
		"employee.address" : update_employee_address,
		"employee.shopCode" : update_employee_shopCode,
		"employee.shopName" : update_employee_shopName,
		"employee.remarks" : update_employee_remarks
	};

	// alert(JSON.stringify(data));
	ajaxSend("WechatBossEmployee_updateEmployee", data, "GET", "JSON", true, "update_employee_callback");
	close_win();
}

function update_employee_callback(data) {
	if (data.resultCode == "040201") {
		currEmployeeJson = data;
		_employee_details();
		_init_listview_employee_manage();
		window.wxc.xcConfirm("员工更新成功！", "info", null);
	} else {
		window.wxc.xcConfirm("员工更新失败！", "info", null);
	}
}

// 编辑员工end

function delete_employee(index) {
	var data = {
		"employee.id" : employeeList[index].id
	};
	ajaxSend("WechatBossEmployee_deleteEmployee", data, "GET", "JSON", true, "_init_listview_employee_manage");
}
