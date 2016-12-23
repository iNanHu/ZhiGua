var customerList = new Array();
var currCustomerJson = undefined;
/**
 * 查看客户订单的客户编号（全局变量，与订单管理里面共用）
 */
var vol_customerCode = undefined;
function _customer() {
	m_search_customer();
}

function m_search_customer() {
	_init_listview_customer_manage();
}

function _customer_filter() {
	ajaxSend("WechatBossCustomer_memberLevelSelect", null, "GET", "JSON", true, "_filter_listview_memberLevel_name");
}

function _filter_listview_memberLevel_name(data) {
	var filter_memberLevel_select = $("#filter_memberLevel_select");
	filter_memberLevel_select.empty();
	var liEle = $("<li class='x_win' onclick='set_filter_memberLevel(-1)'>全部</li>");
	filter_memberLevel_select.append(liEle);
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='x_win' onclick='set_filter_memberLevel(\"" + data[i].id + "\")'>" + data[i].name + "</li>");
		filter_memberLevel_select.append(liEle);
	}
}

function set_filter_memberLevel(id) {
	$('#filter_memberLevel_search_customer').val(id);
	_init_listview_customer_manage();
}

function m_input_search_customer(value) {
	$('#m_input_search_customer').val(value);
	m_search_customer();
}

function _init_listview_customer_manage() {
	var m_input_search_customer = $('#m_input_search_customer').val();
	var memberLevelId = $('#filter_memberLevel_search_customer').val();
	var data;
	if (memberLevelId == -1) {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"customerName" : m_input_search_customer
		};
	} else {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"customerName" : m_input_search_customer,
			"memberLevelId" : memberLevelId
		};
	}
	ajaxSend("WechatBossCustomer_customerList", data, "GET", "JSON", true, "_listview_customer_manage");
}

function _listview_customer_manage(data) {
	$('#listview_customer_manage').empty();
	customerList = data.rows;

	for (var i = 0; i < customerList.length; i++) {
		var customerName = customerList[i].customerName;
		var customerPhone = customerList[i].phone;
		var customerPhoto = customerList[i].customerPhoto;
		if (customerPhoto == "") {
			customerPhoto = "imgs/customer.png";
		}

		var liEle = $("<li onclick='_set_customer_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='ew'></div>");
		var divEle = $("<div class='o_win'  data-load='_customer_details'></div>");
		var img_liEle = $("<li class='clients-list-img' style='background-image: url(" + customerPhoto + ");'></li>");
		var mm_spanEle = $("<span class='mm'>" + customerName + "</span>");
		var p_spanEle = $("<span class='co-info'>" + customerPhone + "</span>");

		var listview_customerEle = $("#listview_customer_manage");
		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(img_liEle);
		divEle.append(mm_spanEle);
		divEle.append(p_spanEle);
		listview_customerEle.append(liEle);
	}
	refresh_node('m_customer_box');
}

function _set_customer_id(index) {
	currCustomerJson = customerList[index];
}

// 添加客户 start
function _add_memberLevel_name() {
	ajaxSend("WechatBossCustomer_memberLevelSelect", null, "GET", "JSON", true, "_add_listview_memberLevel_name");
}

function _add_listview_memberLevel_name(data) {
	_create_listview_memberLevel(data, "add");
}

function _create_listview_memberLevel(data, id) {
	$("#" + id + "_member_level_select").empty();
	var member_level_select = $("#" + id + "_member_level_select");
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='x_win' onclick='" + id + "_memberLevel_name(\"" + data[i].id + "\",\"" + data[i].name + "\")'>" + data[i].name + "</li>")
		member_level_select.append(liEle);
	}
}

function add_customer() {
	var add_customer_photo = $('#add_customer_photo').val();
	var add_customer_name = $('#add_customer_name').html();
	if (!validator_null("客户名称", add_customer_name)) {
		return false;
	}
	var add_memberLevel_id = $('#add_memberLevel_id').val();
	var add_memberLevel_name = $('#add_memberLevel_name').html();
	if (!validator_null("客户类型", add_memberLevel_name)) {
		return false;
	}
	var add_customer_phone = $('#add_customer_phone').html();
	if (!validator_null("联系方式", add_customer_phone)) {
		return false;
	}
	var add_customer_status = $('#add_customer_status').is(':checked');
	if (add_customer_status) {
		add_customer_status = 1;
	} else {
		add_customer_status = 0;
	}

	var add_customer_address = $('#add_customer_address').html();
	if (!validator_null("地址", add_customer_address)) {
		return false;
	}
	var add_customer_remarks = $('#add_customer_remarks').html();

	var data = {
		"customer.customerPhoto" : add_customer_photo,
		"customer.customerName" : add_customer_name,
		"customer.memberLevelId" : add_memberLevel_id,
		"customer.memberLevelName" : add_memberLevel_name,
		"customer.customerStatus" : add_customer_status,
		"customer.phone" : add_customer_phone,
		"customer.address" : add_customer_address,
		"customer.remarks" : add_customer_remarks
	};

	// alert(JSON.stringify(data));
	ajaxSend("WechatBossCustomer_addCustomer", data, "POST", "JSON", true, "_init_listview_customer_manage");
}

function add_customer_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossCustomer_uploadCustomerPhoto", data, "POST", "JSON", false, null);
	$('#add_customer_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#add_customer_photo').val(data.photoUrl);
}

function _add_customer_name() {
	$('#m_add_customer_name').focus();
}

function add_customer_name() {
	var m_add_customer_name = $('#m_add_customer_name').val();
	if (validator_varLength("客户名称", m_add_customer_name, 16)) {
		$('#add_customer_name').html(m_add_customer_name);
	}
	$('#m_add_customer_name').blur();
}

function add_memberLevel_name(id, name) {
	$('#add_memberLevel_id').val(id);
	$('#add_memberLevel_name').html(name);
}

function _add_customer_phone() {
	$('#m_add_customer_phone').focus();
}

function add_customer_phone() {
	var m_add_customer_phone = $('#m_add_customer_phone').val();
	if (validator_varLength("联系方式", m_add_customer_phone, 24)) {
		$('#add_customer_phone').html(m_add_customer_phone);
	}
	$('#m_add_customer_phone').blur();
}

function _add_customer_address() {
	$('#m_add_customer_address').focus();
}

function add_customer_address() {
	var m_add_customer_address = $('#m_add_customer_address').val();
	if (validator_varLength("地址", m_add_customer_address, 50)) {
		$('#add_customer_address').html(m_add_customer_address);
	}
	$('#m_add_customer_address').blur();
	refresh_node('add_customer_box');
}

function _add_customer_remarks() {
	$('#m_add_customer_remarks').focus();
}

function add_customer_remarks() {
	var m_add_customer_remarks = $('#m_add_customer_remarks').val();
	if (validator_remarks(m_add_customer_remarks)) {
		$('#add_customer_remarks').html(m_add_customer_remarks);
	}
	$('#m_add_customer_remarks').blur();
	refresh_node('add_customer_box');
}
// 添加客户 end

// 客户详情 start
function _customer_details() {
	var customerPhoto = currCustomerJson.customerPhoto;
	if (customerPhoto == "") {
		customerPhoto = "imgs/customer.png"
	}
	$('#det_customer_name').html(currCustomerJson.customerName);
	$('#det_customer_photo_img').attr("style", "background-image: url(" + customerPhoto + ");");
	$('#det_customer_phone').html(currCustomerJson.phone);
	if (currCustomerJson.isWXregister == 1) {
		$('#det_customer_isWXregister').html("已绑定");
	} else {
		$('#det_customer_isWXregister').html("未绑定");
	}
	$('#det_customer_qrcodeURL').attr("style", "background-image: url(" + currCustomerJson.qrcodeURL + ");");
	vol_customerCode = currCustomerJson.customerCode;
	var custoc = ajaxSend("WechatBossOrder_customerOrderCount", "customerCode=" + currCustomerJson.customerCode, "GET", "JSON", false, null);
	$('#customer_order_count').html(custoc.custOrderCount + "笔");

	$('#det_memberLevel_name').html(currCustomerJson.memberLevelName);
	$('#det_customer_address').html(currCustomerJson.address);
	if (currCustomerJson.customerStatus == 1) {
		$('#det_customer_status').html("启用");
	} else {
		$('#det_customer_status').html("停用");
	}
	var custa = ajaxSend("WechatBossOrder_customerArrears", "customerCode=" + currCustomerJson.customerCode, "GET", "JSON", false, null);
	$('#det_customer_arrears').html(custa.arrears)
	var custltt = ajaxSend("WechatBossOrder_custLatestTradingTime", "customerCode=" + currCustomerJson.customerCode, "GET", "JSON", false, null);
	$('#det_customer_latestTradingTime').html(custltt.latestTradingTime)
	$('#det_customer_remarks').html(currCustomerJson.remarks);
	refresh_node('det_customer_details_box');
}

var _check_as = undefined;
function _customer_qrcode() {
	var customerPhoto = currCustomerJson.customerPhoto;
	if (customerPhoto == "") {
		customerPhoto = "imgs/customer.png"
	}
	$('#det_customer_photo_img_').attr("style", "background-image: url(" + customerPhoto + ");");
	$('#det_customer_qrcodeURL_').attr("src", currCustomerJson.qrcodeURL);
	if (currCustomerJson.isWXregister == 1) {
		$('#det_customer_isWXregister_').html("<div class='w100 mo-btn mo-m' data-co='error' onclick='removeBinding()'>解除绑定</div>");
	} else {
		$('#det_customer_isWXregister_').html("<p class='sx ac mh1e co-success bold'>未绑定</p>");
		_check_as = window.setInterval(checkWXBindingStatus, 2 * 1000);

	}
}

function checkWXBindingStatus() {
	var data = {
		"customer.id" : currCustomerJson.id
	};
	ajaxSend("WechatBossCustomer_checkWXBindingStatus", data, "POST", "JSON", true, "_checkWXBindingStatus_callback");
}

function _checkWXBindingStatus_callback(data) {
	if (data.isWXregister == 1) {
		_clearInterval();
		currCustomerJson.isWXregister = 1;
		_customer_qrcode();
		_customer_details();
	}
}

function _clearInterval() {
	if (_check_as != undefined) {
		window.clearInterval(_check_as);
		_check_as = undefined;
	}
}

function removeBinding() {
	var data = {
		"customer.id" : currCustomerJson.id
	};
	data = ajaxSend("WechatBossCustomer_removeBinding", data, "POST", "JSON", false, null);
	if (data.resultCode == "030206") {
		currCustomerJson.isWXregister = 0;
		_customer_qrcode();
		_customer_details();
	}
}

function _customer_order() {
	// alert(vol_customerCode);
	_search_order_year = -1;
	_search_order_month = -1;
	m_search_customer_order();
}

function m_search_customer_order() {
	_init_cust_order_list();
}

function m_input_search_customer_order(value) {
	$('#m_input_search_customer_order').val(value);
	m_search_customer_order();
}

function _init_cust_order_list() {
	var where = $('#m_input_search_customer_order').val();
	var data;
	if (_search_order_year == "-1") {
		data = {
			"page" : 1,
			"pageSize" : 100,
			"customerCode" : vol_customerCode,
			"where" : where
		};
	} else {
		data = {
			"page" : 1,
			"pageSize" : 100,
			"customerCode" : vol_customerCode,
			"where" : where,
			"year" : _search_order_year,
			"month" : _search_order_month
		};
	}
	ajaxSend("WechatBossOrder_customerOrderList", data, "GET", "JSON", true, "_cust_order_list");
}

function _search_year(value) {
	$('#_search_year').val(value);
}

function _search_month(value) {
	$('#_search_month').val(value);
}

function set_year_month(value) {
	if (value != 1) {
		_search_order_year = $('#_search_year').val();
		_search_order_month = $('#_search_month').val();
	} else {
		_search_order_year = -1;
		_search_order_month = -1;
	}

	_init_cust_order_list();
}

var custOrderList = new Array();
var custOrderIndex = undefined;
function _cust_order_list(data) {
	custOrderList = data.rows;

	var listview_cust_order_list = $('#listview_cust_order_list');
	listview_cust_order_list.empty();
	for (var i = 0; i < custOrderList.length; i++) {
		var liEle = $("<li></li>");
		var divEle = $("<div class='o_win' data-load='_customer_order_details' onclick='_set_custOrderIndex(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>订单号：<span>" + custOrderList[i].orderCode + "</span></h5>");
		var pc_Ele = $("<p>客户：<span>" + custOrderList[i].customerName + "</span></p>");
		var pe_Ele = $("<p>开单员：<span>" + custOrderList[i].creator + "</span></p>");
		var pct_Ele = $("<p>开单时间：<span>" + custOrderList[i].createTime + "</span></p>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(pc_Ele);
		divEle.append(pe_Ele);
		divEle.append(pct_Ele);
		listview_cust_order_list.append(liEle);
	}
	refresh_node('cust_order_box');
}

function _set_custOrderIndex(index) {
	custOrderIndex = index;
}

function _customer_order_details() {
	var data = {
		"orderCode" : custOrderList[custOrderIndex].orderCode
	};
	ajaxSend("WechatBossOrder_orderDetails", data, "GET", "JSON", true, "_init_customer_order_details");
}

function _init_customer_order_details(data) {
	var _bill = data.bill;
	var _orderGoods = data.orderGoods;
	$('#det_bill_cust_code').html(_bill.orderCode);
	$('#det_bill_cust_name').html(_bill.customerName);

	var det_bill_goods_list = $('#det_bill_goods_list');
	det_bill_goods_list.empty();
	for (var i = 0; i < _orderGoods.length; i++) {
		var _ta = parseFloat(_orderGoods[i].goodsPrice) * parseFloat(_orderGoods[i].goodsCount);
		var liEle = $("<li></li>");
		var h6Ele = $("<h6>" + _orderGoods[i].goodsName + "</h6>");
		var divEle = $("<div class='nr1e-z co-back sm'><span>单价:￥" + _orderGoods[i].goodsPrice + "</span><span>数量:" + _orderGoods[i].goodsCount
				+ "</span><span>金额:￥" + _ta + "</span></div>");
		liEle.append(h6Ele);
		liEle.append(divEle);
		det_bill_goods_list.append(liEle);
	}

	$('#det_bill_pgoodsCount').html(custOrderList[custOrderIndex].pgoodsCount);
	$('#det_bill_rgoodsCount').html(custOrderList[custOrderIndex].rgoodsCount);
	$('#det_bill_billAmount').html(_bill.billAmount);

	var det_bill_history_arrears = parseFloat(_bill.receivablePay) + parseFloat(_bill.discountPay) - parseFloat(_bill.billAmount);
	$('#det_bill_history_arrears').html(det_bill_history_arrears);
	$('#det_bill_receivablePay').html(_bill.receivablePay);
	$('#det_bill_discountPay').html(_bill.discountPay);
	$('#det_bill_actualPayment').html(_bill.actualPayment);
	$('#det_bill_curr_arrears').html(_bill.debts);

	$('#det_bill_creator').html(custOrderList[custOrderIndex].creator);
	$('#det_bill_operator').html(custOrderList[custOrderIndex].operator);
	var paymentType_info = "";
	if (_bill.paymentType == 0) {
		paymentType_info = "现金支付";
	} else if (_bill.paymentType == 1) {
		paymentType_info = "银联支付";
	} else if (_bill.paymentType == 2) {
		paymentType_info = "支付宝";
	} else if (_bill.paymentType == 3) {
		paymentType_info = "微信支付";
	}
	$('#det_bill_paymentType').html(paymentType_info);
	$('#det_bill_paymentTime').html(_bill.paymentTime);
	$('#det_bill_remarks').html(_bill.remarks);
	refresh_node('cust_order_detail_box');
}

// 客户详情 end
// 客户编辑 start
function _edit_customer() {
	var customerPhoto = currCustomerJson.customerPhoto;
	if (currCustomerJson.customerPhoto == "") {
		customerPhoto = "imgs/customer.png";
	}
	$('#update_customer_photo_img').attr("style", "background-image: url(" + customerPhoto + ");");
	$('#update_customer_photo').val(currCustomerJson.customerPhoto);
	$('#update_customer_name').html(currCustomerJson.customerName);
	$('#update_memberLevel_id').val(currCustomerJson.memberLevelId);
	$('#update_memberLevel_name').html(currCustomerJson.memberLevelName);
	$('#update_customer_phone').html(currCustomerJson.phone);
	if (currCustomerJson.customerStatus == 1) {
		$('#update_customer_status').attr("checked", true);
	} else {
		$('#update_customer_status').attr("checked", false);
	}

	$('#update_customer_address').html(currCustomerJson.address);
	$('#update_customer_remarks').html(currCustomerJson.remarks);
	refresh_node('edit_customer_box');
}

function _update_customer_name() {
	$('#m_update_customer_name').focus();
	$('#m_update_customer_name').val(currCustomerJson.customerName);
}

function _update_memberLevel_name() {
	ajaxSend("WechatBossCustomer_memberLevelSelect", null, "GET", "JSON", true, "_update_listview__memberLevel_name");
}

function _update_listview__memberLevel_name(data) {
	_create_listview_memberLevel(data, "update");
}

function _update_customer_phone() {
	$('#m_update_customer_phone').focus();
	$('#m_update_customer_phone').val(currCustomerJson.phone);
}

function _update_customer_address() {
	$('#m_update_customer_address').focus();
	$('#m_update_customer_address').val(currCustomerJson.address);
}

function _update_customer_remarks() {
	$('#m_update_customer_remarks').focus();
	$('#m_update_customer_remarks').val(currCustomerJson.remarks);
}

function update_customer_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossCustomer_uploadCustomerPhoto", data, "POST", "JSON", false, null);
	$('#update_customer_photo_img').attr("style", "background-image: url(" + data.photoUrl + ");");
	$('#update_customer_photo').val(data.photoUrl);
}

function update_customer_name() {
	var m_update_customer_name = $('#m_update_customer_name').val();
	if (validator_varLength("客户名称", m_update_customer_name, 16)) {
		$('#update_customer_name').html(m_update_customer_name);
	}
	$('#m_update_customer_name').blur();
}

function update_memberLevel_name(id, name) {
	$('#update_memberLevel_id').val(id);
	$('#update_memberLevel_name').html(name);
}

function update_customer_phone() {
	var m_update_customer_phone = $('#m_update_customer_phone').val();
	if (validator_varLength("联系方式", m_update_customer_phone, 24)) {
		$('#update_customer_phone').html(m_update_customer_phone);
	}
}

function update_customer_address() {
	var m_update_customer_address = $('#m_update_customer_address').val();
	if (validator_varLength("地址", m_update_customer_address, 50)) {
		$('#update_customer_address').html(m_update_customer_address);
	}
	$('#m_update_customer_address').blur();
	refresh_node('edit_customer_box');
}

function update_customer_remarks() {
	var m_update_customer_remarks = $('#m_update_customer_remarks').val();
	if (validator_remarks(m_update_customer_remarks)) {
		$('#update_customer_remarks').html(m_update_customer_remarks);
	}
	$('#m_update_customer_remarks').blur();
	refresh_node('edit_customer_box');
}

function update_customer() {
	var update_customer_photo = $('#update_customer_photo').val();
	var update_customer_name = $('#update_customer_name').html();
	if (!validator_null("客户名称", update_customer_name)) {
		return false;
	}
	var update_memberLevel_id = $('#update_memberLevel_id').val();
	var update_memberLevel_name = $('#update_memberLevel_name').html();
	if (!validator_null("客户类型", update_memberLevel_name)) {
		return false;
	}
	var update_customer_phone = $('#update_customer_phone').html();
	if (!validator_null("联系方式", update_customer_phone)) {
		return false;
	}
	var update_customer_status = $('#update_customer_status').is(':checked');
	if (update_customer_status) {
		update_customer_status = 1;
	} else {
		update_customer_status = 0;
	}

	var update_customer_address = $('#update_customer_address').html();
	if (!validator_null("地址", update_customer_address)) {
		return false;
	}
	var update_customer_remarks = $('#update_customer_remarks').html();

	var data = {
		"customer.id" : currCustomerJson.id,
		"customer.customerPhoto" : update_customer_photo,
		"customer.customerName" : update_customer_name,
		"customer.memberLevelId" : update_memberLevel_id,
		"customer.memberLevelName" : update_memberLevel_name,
		"customer.customerStatus" : update_customer_status,
		"customer.phone" : update_customer_phone,
		"customer.address" : update_customer_address,
		"customer.remarks" : update_customer_remarks
	};

	// alert(JSON.stringify(data));
	ajaxSend("WechatBossCustomer_updateCustomer", data, "POST", "JSON", true, "update_customer_callback");
}

function update_customer_callback(data) {
	if (data.resultCode == "030201") {
		currCustomerJson = data;
		_customer_details();
		_init_listview_customer_manage();
	}
}

// 客户编辑end

