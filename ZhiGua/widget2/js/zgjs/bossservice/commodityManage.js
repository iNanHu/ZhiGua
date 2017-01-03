var commodityList = new Array();
var currCommodityJson = undefined;

function _commodity() {
	m_search_commodity();
}

function m_search_commodity() {
	_init_listview_commodity_manage();
}

function _commodity_filter() {
	ajaxSend("WechatBossCommodity_supplierSelect", null, "GET", "JSON", true, "_filter_listview_supplier_name");
}

function _filter_listview_supplier_name(data) {
	var filter_supplier_select = $("#filter_supplier_select");
	filter_supplier_select.empty();
	var liEle = $("<li class='x_win' onclick='set_filter_supplier(-1)'>全部</li>");
	filter_supplier_select.append(liEle);
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='x_win' onclick='set_filter_supplier(\"" + data[i].id + "\")'>" + data[i].name + "</li>");
		filter_supplier_select.append(liEle);
	}
}

function set_filter_supplier(id) {
	$('#filter_supplier_search_commodity').val(id);
	_init_listview_commodity_manage();
}

function m_input_search_commodity(value) {
	$('#m_input_search_commodity').val(value);
	m_search_commodity();
}

function _init_listview_commodity_manage() {
	var m_input_search_commodity = $('#m_input_search_commodity').val();
	var supplierId = $('#filter_supplier_search_commodity').val();
	var data;
	if (supplierId == -1) {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : m_input_search_commodity
		};
	} else {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : m_input_search_commodity,
			"supplierId" : supplierId
		};
	}
	ajaxSend("WechatBossCommodity_commodityList", data, "GET", "JSON", true, "_listview_commodity_manage");
}

function _listview_commodity_manage(data) {
	commodityList = data.rows;
	var listview_commodityEle = $("#listview_commodity_manage");
	listview_commodityEle.empty();

	for (var i = 0; i < commodityList.length; i++) {
		var picturePath = commodityList[i].picturePath;
		if (picturePath == "") {
			picturePath = "imgs/commodity.png"
		}

		var liEle = $("<li class='move_del' onclick='_set_commodity_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='o_win ew ew-mw1e' data-load='_commodity_details'></div>");
		var cimg_divEle = $("<div class='goods-img nr20x' style='background-image:url(" + picturePath + ")'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $("<h6 class='goods-name mb15x'>" + commodityList[i].commodityName + "</h6>");
		var cs_pEle = $("<p class='co-info ss'>供应商：<span>" + commodityList[i].supplierName + "</span></p>");
		var cp_pEle = $("<p class='co-info ss'>零售价：<span class='goods-price co-warn'>" + commodityList[i].commodityPrice + " / 件</span></p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_commodity(" + i + ")'><i class='icon icon-delete'></i></div>");

		liEle.append(ew_divEle);
		liEle.append(del_divEle);
		ew_divEle.append(cimg_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(cs_pEle);
		divEle.append(cp_pEle);
		listview_commodityEle.append(liEle);
	}
	refresh_node('commodity_box');
}

function _set_commodity_id(index) {
	currCommodityJson = commodityList[index];
}

// 添加商品 start

function _add_commodity() {
	ajaxSend("WechatBossCommodity_createBarCode", null, "GET", "JSON", true, "init_add_bar_code");
}

function add_commodity_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossCommodity_uploadCommodityImage", data, "POST", "JSON", false, null);
	$('#add_commodity_photo_img').attr("style", "background-image: url(" + data.picturePath + ");");
	$('#add_commodity_photo').val(data.picturePath);
}

function init_add_bar_code(data) {
	$('#add_bar_code').html(data.barCodeString);
}

function _add_bar_code() {
	$('#m_add_bar_code').val($('#add_bar_code').html());
	oKey123('#m_add_bar_code');
}

function m_add_bar_code(value) {
	$('#m_add_bar_code').val(value);
}

function add_bar_code() {
	var m_add_bar_code = $('#m_add_bar_code').val();
	if (validator_varLength("条形码", m_add_bar_code, 20)) {
		$('#add_bar_code').html(m_add_bar_code);
	}
	$('#m_add_bar_code').blur();
}

function _add_commodity_name() {
	$('#m_add_commodity_name').focus();
}

function add_commodity_name() {
	var m_add_commodity_name = $('#m_add_commodity_name').val();
	if (validator_varLength("商品名称", m_add_commodity_name, 16)) {
		$('#add_commodity_name').html(m_add_commodity_name);
	}
	$('#m_add_commodity_name').blur();
}

function _add_supplier_name() {
	ajaxSend("WechatBossCommodity_supplierSelect", null, "GET", "JSON", true, "_add_listview_supplier_name");
}

function _add_listview_supplier_name(data) {
	var add_supplier_select = $("#add_supplier_select");
	add_supplier_select.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='x_win' onclick='add_supplier_name(\"" + data[i].id + "\",\"" + data[i].name + "\")'>" + data[i].name + "</li>")
		add_supplier_select.append(liEle);
	}
}

function add_supplier_name(id, name) {
	$('#add_supplier_id').val(id);
	$('#add_supplier_name').html(name);
}

function _add_commodity_category_name() {
	ajaxSend("WechatBossCommodity_commodityCategorySelect", null, "GET", "JSON", true, "_add_listview_commodity_category_name");
}

function _add_listview_commodity_category_name(data) {
	var add_commodity_category_select = $("#add_commodity_category_select");
	add_commodity_category_select.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='x_win' onclick='add_commodity_category_name(\"" + data[i].id + "\",\"" + data[i].name + "\")'>" + data[i].name + "</li>")
		add_commodity_category_select.append(liEle);
	}
}

function add_commodity_category_name(id, name) {
	$('#add_commodity_category_id').val(id);
	$('#add_commodity_category_name').html(name);
}

function _add_unit_name() {
	ajaxSend("WechatBossCommodity_commodityUnitSelect", null, "GET", "JSON", true, "_add_listview_unit_name");
}

function _add_listview_unit_name(data) {
	var add_unit_select = $("#add_unit_select");
	add_unit_select.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='x_win' onclick='add_unit_name(\"" + data[i].id + "\",\"" + data[i].name + "\")'>" + data[i].name + "</li>")
		add_unit_select.append(liEle);
	}
}

function add_unit_name(id, name) {
	$('#add_unit_id').val(id);
	$('#add_unit_name').html(name);
}

function _add_commodity_price() {
	oKey123('#m_add_commodity_price');
}

function m_add_commodity_price(value) {
	$('#m_add_commodity_price').val(value);
}

function add_commodity_price() {
	var value = $('#m_add_commodity_price').val();
	$('#add_commodity_price').html(value);
}

function _add_reference_price() {
	oKey123('#m_add_reference_price');
}

function m_add_reference_price(value) {
	$('#m_add_reference_price').val(value);
	$('#add_reference_price').html(value);
}

function add_reference_price() {
	var value = $('#m_add_reference_price').val();
	$('#add_reference_price').html(value);
}

function _add_commodity_remarks() {
	$('#m_add_commodity_remarks').focus();
}

function add_commodity_remarks() {
	var m_add_commodity_remarks = $('#m_add_commodity_remarks').val();
	if (validator_remarks(m_add_commodity_remarks)) {
		$('#add_commodity_remarks').html(m_add_commodity_remarks);
	}
	$('#m_add_commodity_remarks').blur();
	refresh_node('add_commodity_box');
}

function add_commodity() {
	var picturePath = $('#add_commodity_photo').val();
	var add_bar_code = $('#add_bar_code').html();
	var add_commodity_name = $('#add_commodity_name').html();
	if (!validator_null("商品名称", add_commodity_name)) {
		return false;
	}
	var add_supplier_id_sign = $('#add_supplier_id').val();
	var add_sign = add_supplier_id_sign.split(";")[1];
	var add_supplier_id = add_supplier_id_sign.split(";")[0];
	var add_supplier_name = $('#add_supplier_name').html();
	if (!validator_null("供应商", add_supplier_name)) {
		return false;
	}
	var add_commodity_category_id = $('#add_commodity_category_id').val();
	var add_commodity_category_name = $('#add_commodity_category_name').html();
	if (!validator_null("商品种类", add_commodity_category_name)) {
		return false;
	}
	var add_unit_id = $('#add_unit_id').val();
	var add_unit_name = $('#add_unit_name').html();
	if (!validator_null("单位", add_unit_name)) {
		return false;
	}
	var add_commodity_price = $('#add_commodity_price').html();
	var add_reference_price = $('#add_reference_price').html();
	var add_commodit_status = $('#add_commodit_status').is(':checked');
	if (add_commodit_status) {
		add_commodit_status = 1;
	} else {
		add_commodit_status = 0;
	}
	var add_commodity_remarks = $('#add_commodity_remarks').html();

	var data = {
		"commodity.picturePath" : picturePath,
		"commodity.barCode" : add_bar_code,
		"commodity.commodityName" : add_commodity_name,
		"commodity.supplierId" : add_supplier_id,
		"commodity.supplierName" : add_supplier_name,
		"commodity.commodityCategoryName" : add_commodity_category_name,
		"commodity.unitName" : add_unit_name,
		"commodity.commodityPrice" : add_commodity_price,
		"commodity.referencePrice" : add_reference_price,
		"commodity.commodityStatus" : add_commodit_status,
		"commodity.remarks" : add_commodity_remarks,
		"commodity.sign" : add_sign
	};
	ajaxSend("WechatBossCommodity_addCommodity", data, "POST", "JSON", true, "_init_listview_commodity_manage");
}

// 添加商品 end

// 商品详情 start

function _commodity_details() {
	var picturePath = currCommodityJson.picturePath;
	if (picturePath == "") {
		picturePath = "imgs/commodity.png";
	}
	$('#det_commodity_photo').attr("style", "background-image: url(" + picturePath + ");");
	$('#det_bar_code').html(currCommodityJson.barCode);
	$('#det_commodity_name').html(currCommodityJson.commodityName);
	$('#det_supplier_name').html(currCommodityJson.supplierName);
	$('#det_commodity_category_name').html(currCommodityJson.commodityCategoryName);
	$('#det_unit_name').html(currCommodityJson.unitName);
	$('#det_commodity_price').html(currCommodityJson.commodityPrice);
	$('#det_reference_price').html(currCommodityJson.referencePrice);
	if (currCommodityJson.commodityStatus == 1) {
		$('#det_commodit_status').html("启用");
	} else {
		$('#det_commodit_status').html("停用");
	}
	$('#det_commodity_remarks').html(currCommodityJson.remarks);
	refresh_node('det_commodity_box');
}

// 商品详情 end

// 商品编辑 start
function _edit_commodity() {
	var picturePath = currCommodityJson.picturePath;
	if (picturePath == "") {
		picturePath = "imgs/commodity.png";
	}
	$('#update_commodity_photo_img').attr("style", "background-image: url(" + picturePath + ");");

	$('#update_commodity_photo').val(currCommodityJson.picturePath);
	$('#update_bar_code').html(currCommodityJson.barCode);
	$('#update_commodity_name').html(currCommodityJson.commodityName);
	$('#update_supplier_name').html(currCommodityJson.supplierName);
	$('#update_commodity_category_name').html(currCommodityJson.commodityCategoryName);
	$('#update_unit_name').html(currCommodityJson.unitName);
	$('#update_commodity_price').html(currCommodityJson.commodityPrice);
	$('#update_reference_price').html(currCommodityJson.referencePrice);
	if (currCommodityJson.commodityStatus == 1) {
		$('#update_commodit_status').attr("checked", true);
	} else {
		$('#update_commodit_status').attr("checked", false);
	}
	$('#update_commodity_remarks').html(currCommodityJson.remarks);
	refresh_node('edit_commodity_box');
}

function update_commodity_photo(dataURL) {
	var data = {
		"imgBase64" : dataURL.split(",")[1]
	};
	data = ajaxSend("WechatBossCommodity_uploadCommodityImage", data, "POST", "JSON", false, null);
	$('#update_commodity_photo_img').attr("style", "background-image: url(" + data.picturePath + ");");
	$('#update_commodity_photo').val(data.picturePath);
}

function _update_commodity_price() {
	$('#m_update_commodity_price').val(currCommodityJson.commodityPrice);
	oKey123('#m_update_commodity_price');
}

function m_update_commodity_price(value) {
	$('#m_update_commodity_price').val(value);
}

function update_commodity_price() {
	var value = $('#m_update_commodity_price').val();
	$('#update_commodity_price').html(value);
}

function _update_reference_price() {
	$('#m_update_reference_price').val(currCommodityJson.referencePrice);
	oKey123('#m_update_reference_price');
}

function m_update_reference_price(value) {
	$('#m_update_reference_price').val(value);
}

function update_reference_price() {
	var value = $('#m_update_reference_price').val();
	$('#update_reference_price').html(value);
}

function _update_commodity_remarks() {
	$('#m_update_commodity_remarks').focus();
	$('#m_update_commodity_remarks').val(currCommodityJson.remarks);
}

function update_commodity_remarks() {
	var m_update_commodity_remarks = $('#m_update_commodity_remarks').val();
	if (validator_remarks(m_update_commodity_remarks)) {
		$('#update_commodity_remarks').html(m_update_commodity_remarks);
	}
	$('#m_update_commodity_remarks').blur();
	refresh_node('edit_commodity_box');
}

function update_commodity() {
	var update_commodity_photo = $('#update_commodity_photo').val();
	var update_commodity_price = $('#update_commodity_price').html();
	var update_reference_price = $('#update_reference_price').html();
	var update_commodit_status = $('#update_commodit_status').is(':checked');
	if (update_commodit_status) {
		update_commodit_status = 1;
	} else {
		update_commodit_status = 0;
	}
	var update_commodity_remarks = $('#update_commodity_remarks').html();

	var data = {
		"commodity.id" : currCommodityJson.id,
		"commodity.picturePath" : update_commodity_photo,
		"commodity.commodityPrice" : update_commodity_price,
		"commodity.referencePrice" : update_reference_price,
		"commodity.commodityStatus" : update_commodit_status,
		"commodity.remarks" : update_commodity_remarks
	};
	ajaxSend("WechatBossCommodity_updateCommodity", data, "POST", "JSON", true, "update_commodity_callback");
}

function update_commodity_callback(data) {
	if (data.resultCode == "020201") {
		currCommodityJson = data;
		_commodity_details();
		_init_listview_commodity_manage();
	}
}
// 商品编辑 end
// 商品删除 start
function delete_commodity(index) {
	var data = {
		"commodity.id" : commodityList[index].id
	}
	commodityList.splice(index);
	ajaxSend("WechatBossCommodity_deleteCommodity", data, "POST", "JSON", true, "_init_listview_commodity_manage");
}
// 商品删除 end

