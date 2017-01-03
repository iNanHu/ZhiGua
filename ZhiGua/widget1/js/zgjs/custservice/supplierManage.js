var supplierList = undefined;
var currSupplierJson = undefined;

function _supplier() {
	m_search_supplier();
}

function m_search_supplier() {
	_init_listview_supplier();
}

function _init_listview_supplier() {
	var m_input_search_merchantName = $('#m_input_search_merchantName').val();
	var data;
	data = {
		"merchantName" : m_input_search_merchantName
	};
	ajaxSend("WechatCustSupplier_merchantInfoList", data, "GET", "JSON", true, "_listview_supplier");
}

function _listview_supplier(data) {
	var listview_supplier = $("#listview_supplier");
	listview_supplier.empty();
	supplierList = data;
	for (var i = 0; i < supplierList.length; i++) {
		var merchantName = supplierList[i].merchantName;
		var supplierPhone = supplierList[i].phone;
		var imgPath = supplierList[i].imgPath;
		if (imgPath == "") {
			imgPath = "imgs/customer.png";
		}

		var liEle = $("<li onclick='_set_supplier_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='ew'></div>");
		var divEle = $("<div class='o_win'  data-load='_supplier_details'></div>");
		var img_liEle = $("<li class='clients-list-img' style='background-image: url(" + imgPath + ");'></li>");
		var mm_spanEle = $("<span class='mm'>" + merchantName + " </span>");
		var p_spanEle = $("<span class='co-info'>" + supplierPhone + "</span>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(img_liEle);
		divEle.append(mm_spanEle);
		divEle.append(p_spanEle);
		listview_supplier.append(liEle);
	}
	refresh_node('supplier_box');
}

function _set_supplier_id(index) {
	currSupplierJson = supplierList[index];
}

function _supplier_details() {
	var imgPath = currSupplierJson.imgPath;
	if (imgPath == "") {
		imgPath = "imgs/customer.png"
	}
	$('#det_merchant_img').attr("style", "background-image: url(" + imgPath + ");");
	$('#det_merchant_name').html(currSupplierJson.merchantName);
	$('#det_merchant_phone').html(currSupplierJson.phone);
	$('#det_merchant_address').html(currSupplierJson.address);
	$('#det_merchant_introduce').html(currSupplierJson.introduce);
	$('#det_merchant_sales').html(currSupplierJson.sales);
	$('#det_merchant_actualPayment').html(currSupplierJson.actualPayment);
	$('#det_merchant_discountPay').html(currSupplierJson.discountPay);
	$('#det_merchant_currdebts').html(currSupplierJson.currdebts);
	$('#det_merchant_paymentTime').html(currSupplierJson.paymentTime);
	var data = {
		"merchantAccount" : currSupplierJson.merchantAccount
	};
	ajaxSend("WechatCustOrder_customerOrderCount", data, "GET", "JSON", true, "_init_merchant_order_count");
	ajaxSend("WechatCustSupplier_bankAccountList", data, "GET", "JSON", true, "_init_listview_bankAccount");
}

function set_merchant_account(_type) {
	merchantAccount_search_order = currSupplierJson.merchantAccount;
	_order_type = _type;
}

function _init_merchant_order_count(data) {
	$('#det_merchant_order_count').html(data.custOrderCount + "笔");
}

function _init_listview_bankAccount(data) {
	var listview_bankAccount = $("#listview_bankAccount");
	listview_bankAccount.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li></li>");
		var ew_divEle = $("<div class='ew'></div>");
		var spanEle = $("<span class='co-info w7e'>汇款账户" + (i + 1) + "： </span>");
		var emEle = $("<em class='al'>" + data[i].name + "（" + data[i].bankName + "）" + data[i].bankAccount + "</em>");

		liEle.append(ew_divEle);
		ew_divEle.append(spanEle);
		ew_divEle.append(emEle);
		listview_bankAccount.append(liEle);
	}
	refresh_node('merchant_details_box');
}
