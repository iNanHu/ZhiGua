var employeeJson = undefined;
function _employee_info() {
	_init_employee_info()
	// getEmployeeInfo();
	getEmployeeTotalSales();
	get_sign_count();
}

function getEmployeeInfo() {
	ajaxSend("WechatEmpMy_employeeInfo", null, "GET", "JSON", true, "init_employee_info");
}

function getEmployeeTotalSales() {
	ajaxSend("WechatEmpStatistics_employeeTotalSales", null, "GET", "JSON", true, "init_employee_total_sales");
}

function init_employee_info(data) {
	employeeJson = data;
	_init_employee_info();
}

function init_employee_total_sales(data) {
	if (data.sales) {
		$('#order_count').html(data.count);
		$('#order_sales').html(data.sales);
	}
}

function _init_employee_info() {
	if (employeeJson.loginType == "web_login") {
		$('#link_printer').remove();
	} else if (employeeJson.loginType == "wechat_login") {
		$('#exit_login').remove();
		$('#link_printer').remove();
	}

	var employeePhoto = employeeJson.employeePhoto;
	if (employeePhoto == "") {
		employeePhoto = "imgs/employee.png";
	}
	$('#det_employee_photo_img').attr("style", "background-image: url(" + employeePhoto + ");");
	$('#det_employee_Name').html(employeeJson.employeeName);
	$('#det_shop_name').html(employeeJson.shopName);
}

function _employee_setting() {
	var employeePhoto = employeeJson.employeePhoto;
	$('#set_employee_photo').val(employeePhoto);
	if (employeePhoto == "") {
		employeePhoto = "imgs/employee.png";
	}
	$('#set_employee_photo_img').attr("style", "background-image: url(" + employeePhoto + ");");
	$('#set_employee_Name').html(employeeJson.employeeName);
	$('#set_employee_phone').html(employeeJson.phone);
}

function _set_name() {
	$('#m_set_employee_Name').focus();
	$('#m_set_employee_Name').val(employeeJson.employeeName);
}

function set_name() {
	var m_set_employee_Name = $('#m_set_employee_Name').val();
	$('#m_set_employee_Name').blur();
	if (validator_varLength("昵称", m_set_employee_Name, 16)) {
		$('#set_employee_Name').html(m_set_employee_Name);
		update_employee();
		close_win();
	}
}

function _set_phone() {
	$('#m_set_employee_phone').focus();
	$('#m_set_employee_phone').val(employeeJson.phone);
}
function set_phone() {
	var m_set_employee_phone = $('#m_set_employee_phone').val();
	$('#m_set_employee_phone').blur();
	if (validator_phone("手机号", m_set_employee_phone)) {
		$('#set_employee_phone').html(m_set_employee_phone);
		update_employee();
		close_win();
	}
}

function update_employee() {
	var set_employee_photo = $('#set_employee_photo').val();
	var set_employee_Name = $('#set_employee_Name').html();
	var set_employee_phone = $('#set_employee_phone').html();

	var data = {
		"employee.id" : employeeJson.id,
		"employee.employeePhoto" : set_employee_photo,
		"employee.employeeName" : set_employee_Name,
		"employee.phone" : set_employee_phone
	};

	ajaxSend("WechatEmpMy_updateEmployee", data, "GET", "JSON", true, "update_employee_callback");
}

function update_employee_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatEmpMy_uploadEmployeePhoto", data, "POST", "JSON", false, null);
	$('#set_employee_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#set_employee_photo').val(data.photoUrl);
	update_employee();
}

function update_employee_callback(data) {
	employeeJson = data;
	_employee_setting();
	_init_employee_info();
}

var employeeOrderList = new Array();

function _employee_order() {
	_search_order_year = -1;
	_search_order_month = -1;
	_init_employee_order_list();
}

function m_search_employee_order() {
	_init_employee_order_list();
}

function m_input_search_employee_order(value) {
	$('#m_input_search_employee_order').val(value);
	m_search_employee_order();
}

function _init_employee_order_list() {
	var where = $('#m_input_search_employee_order').val();
	var data;
	if (_search_order_year == "-1") {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : where
		};
	} else {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : where,
			"year" : _search_order_year,
			"month" : _search_order_month
		};
	}

	ajaxSend("WechatEmpOrder_employeeOrderList", data, "GET", "JSON", true, "_employee_order_list");
}

function _employee_order_list(data) {
	morderList = data.rows;
	employeeOrderList = morderList;
	var listview_employee_order_list = $('#listview_employee_order_list');
	listview_employee_order_list.empty();
	for (var i = 0; i < employeeOrderList.length; i++) {
		var liEle = $("<li></li>");
		var divEle = $("<div class='o_win' data-load='_order_details' onclick='_set_employeeOrderIndex(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>订单号：<span>" + employeeOrderList[i].orderCode + "</span></h5>");
		var pc_Ele = $("<p>客户：<span>" + employeeOrderList[i].customerName + "</span></p>");
		var pe_Ele = $("<p>开单员：<span>" + employeeOrderList[i].creator + "</span></p>");
		var pct_Ele = $("<p>开单时间：<span>" + employeeOrderList[i].createTime + "</span></p>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(pc_Ele);
		divEle.append(pe_Ele);
		divEle.append(pct_Ele);
		listview_employee_order_list.append(liEle);
	}
	refresh_node('employee_order_box');
}

function _set_employeeOrderIndex(index) {
	custOrderIndex = index;
}

// 签到start
var isSign = undefined;
function get_sign_count() {
	ajaxSend("WechatEmpSign_getSignCount", null, "GET", "JSON", true, "get_sign_count_callback");
}

function get_sign_count_callback(data) {
	$('#employee_sign').html(data.signCount);
	if (data.isSign == 1) {
		isSign = data.isSign;
		$('#employee_sign_info').html("已签到");
	}
}

function add_employee_sign() {
	if (isSign == undefined) {
		ajaxSend("WechatEmpSign_addSign", null, "GET", "JSON", true, "add_employee_sign_callback");
	}
}

function add_employee_sign_callback(data) {
	if (data.resultCode == "240101") {
		var signCount = $('#employee_sign').html();
		signCount = parseInt(signCount) + 1;
		$('#employee_sign').html(signCount);
		$('#employee_sign_info').html("已签到");
	}
}
// 签到end

// 工作笔记start
var workNotesList = new Array();
var currWorkNotesJson = undefined;
function _work_notes() {
	m_search_workNotes();
}

function m_search_workNotes() {
	_init_listview_workNotes_manage();
}

function _init_listview_workNotes_manage() {
	var m_input_search_workNotes = $('#m_input_search_workNotes').val();
	var data = {
		"page" : 1,
		"pageSize" : 1000,
		"where" : m_input_search_workNotes
	};
	ajaxSend("WechatEmpWorkNotes_workNotesList", data, "GET", "JSON", true, "_listview_workNotes_manage");
}

function _listview_workNotes_manage(data) {
	workNotesList = data.rows;
	var listview_workNotes_manage = $("#listview_workNotes_manage");
	listview_workNotes_manage.empty();
	for (var i = 0; i < workNotesList.length; i++) {
		var liEle = $("<li class='move_del' onclick='_set_workNotes_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='o_win ew' data-load='_work_notes_details'></div>");
		var ct_divEle = $("<div><i class='co-warn'>" + workNotesList[i].createTime + "</i></div>");
		var divEle = $("<div></div>");
		var h4Ele = $("<h4 class='mm row1'>" + workNotesList[i].title + "</h4>");
		var c_pEle = $("<p class='co-back sm row1 v1e5'>" + workNotesList[i].content + "</p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_workNotes(" + i + ")'><i class='icon icon-delete'></i></div>");

		liEle.append(ew_divEle);
		liEle.append(del_divEle);
		ew_divEle.append(ct_divEle);
		ew_divEle.append(divEle);
		divEle.append(h4Ele);
		divEle.append(c_pEle);
		listview_workNotes_manage.append(liEle);
	}

	refresh_node('workNotes_box');
}

function _set_workNotes_id(index) {
	currWorkNotesJson = workNotesList[index];
}

function _work_notes_details() {
	$('#det_m_workNotes_createTime').html(currWorkNotesJson.createTime1);
	$('#det_m_workNotes_title').html(currWorkNotesJson.title);
	$('#det_m_workNotes_content').html(currWorkNotesJson.content);
}

function delete_workNotes(index) {
	var data = {
		"workNotes.id" : workNotesList[index].id
	};
	workNotesList.splice(index);
	ajaxSend("WechatEmpWorkNotes_deleteWorkNotes", data, "GET", "JSON", true, "_init_listview_workNotes_manage");
}

function add_workNotes_title() {
	var value = $('#m_add_workNotes_title').val();
	if (validator_varLength("标题", value, 16)) {
		$('#add_workNotes_title').html(value);
		close_win();
	}
	$('#m_add_workNotes_title').blur();
}

function add_workNotes_content() {
	var value = $('#m_add_workNotes_content').val();
	if (validator_remarks(value)) {
		$('#add_workNotes_content').html(value);
		close_win();
	}
	$('#m_add_workNotes_content').blur();
}

function add_workNotes() {
	var title = $('#add_workNotes_title').html();
	var content = $('#add_workNotes_content').html();
	if (title != "" && content != "") {
		var data = {
			"workNotes.title" : title,
			"workNotes.content" : content
		};
		ajaxSend("WechatEmpWorkNotes_addWorkNotes", data, "GET", "JSON", true, "_init_listview_workNotes_manage");
		close_win();
	} else {
		window.wxc.xcConfirm("标题或内容不能为空！", "info", null);
		// alert("标题或内容不能为空！");
	}
}
// 工作笔记end

function link_printer() {
	window.location.href = "link_printer";
}

function show_position(){
	window.location.href = "show_position";
}

function sendfeedbackInfo() {
	var emp_feedbackInfo = $('#emp_feedbackInfo').val();
	if (emp_feedbackInfo != "") {
		var data = {
			"userFeedback.feedbackInfo" : emp_feedbackInfo
		};
		ajaxSend("WechatEmpMy_addFeedback", data, "GET", "JSON", true, null);
		close_win();
	} else {
		window.wxc.xcConfirm("反馈信息不能为空！", "info", null);
	}
}
