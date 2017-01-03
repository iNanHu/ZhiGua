/**
 * 0表示刷新所有订单，1表示刷新商户订单
 */
var _order_type = 0;
function set_order_type(value) {
	_order_type = value;
}

function _order() {
	_search_order_year = -1;
	_search_order_month = -1;
	if (_order_type == 0) {
		merchantAccount_search_order = undefined;
	}
	m_search_order();
}

function m_search_order() {
	_init_order_list();
}

function m_input_search_order(value) {
	$('#m_input_search_order').val(value);
	m_search_order();
}

function _search_year(value) {
	$('#_search_year').val(value);
}

function _search_month(value) {
	$('#_search_month').val(value);
}

var morderList = new Array();
var morderIndex = undefined;
var merchantAccount_search_order = undefined;
function _init_order_list() {
	var where = $('#m_input_search_order').val();
	var data;
	if (_search_order_year == "-1") {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : where,
			"merchantAccount" : merchantAccount_search_order
		};
	} else {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : where,
			"year" : _search_order_year,
			"month" : _search_order_month,
			"merchantAccount" : merchantAccount_search_order
		};
	}
	ajaxSend("WechatCustOrder_custOrderList", data, "GET", "JSON", true, "_order_list");
}

var _search_order_year = -1;
var _search_order_month = -1;

function set_year_month(value) {
	if (value != 1) {
		_search_order_year = $('#_search_year').val();
		_search_order_month = $('#_search_month').val();
	} else {
		_search_order_year = -1;
		_search_order_month = -1;
	}

	_init_order_list();
}

function _order_list(data) {
	morderList = data.rows;

	var listview_m_order_list = $('#listview_m_order_list');
	listview_m_order_list.empty();
	for (var i = 0; i < morderList.length; i++) {
		var liEle = $("<li></li>");
		var divEle = $("<div class='o_win' data-load='_order_details' onclick='_set_morderIndex(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>订单号：<span>" + morderList[i].orderCode + "</span></h5>");
		var ms_Ele = $("<p>商户：<span>" + morderList[i].merchantName + "(" + morderList[i].shopName + ")</span></p>");
		var pe_Ele = $("<p>开单员：<span>" + morderList[i].creator + "</span></p>");
		var pct_Ele = $("<p>开单时间：<span>" + morderList[i].createTime + "</span></p>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(ms_Ele);
		divEle.append(pe_Ele);
		divEle.append(pct_Ele);
		listview_m_order_list.append(liEle);
	}
	refresh_node('order_box');
}

var currOrderCode = undefined
function _set_morderIndex(index) {
	custOrderIndex = index;
	currOrderCode = morderList[custOrderIndex].orderCode;
}

function _order_details() {
	var data = {
		"orderCode" : currOrderCode
	};
	ajaxSend("WechatCustOrder_orderDetails", data, "GET", "JSON", true, "_init_m_order_details");
}

function _init_m_order_details(data) {
	var _bill = data.bill;
	var _orderGoods = data.orderGoods;
	var _order = data.order;
	$('#det_m_bill_cust_code').html(_bill.orderCode);
	$('#det_m_bill_mshopName').html(_order.merchantName + "(" + _order.shopName + ")");
	$('#det_m_bill_cust_name').html(_bill.customerName);

	var det_m_bill_goods_list = $('#det_m_bill_goods_list');
	det_m_bill_goods_list.empty();
	for (var i = 0; i < _orderGoods.length; i++) {
		var _ta = parseFloat(_orderGoods[i].goodsPrice) * parseFloat(_orderGoods[i].goodsCount);
		var liEle = $("<li></li>");
		var h6Ele = $("<h6>" + _orderGoods[i].goodsName + "</h6>");
		var divEle = $("<div class='nr1e-z co-back sm'><span>单价:￥" + _orderGoods[i].goodsPrice + "</span><span>数量:" + _orderGoods[i].goodsCount
				+ "</span><span>金额:￥" + _ta + "</span></div>");
		liEle.append(h6Ele);
		liEle.append(divEle);
		det_m_bill_goods_list.append(liEle);
	}

	$('#det_m_bill_pgoodsCount').html(_order.pgoodsCount);
	$('#det_m_bill_rgoodsCount').html(_order.rgoodsCount);
	$('#det_m_bill_billAmount').html(_bill.billAmount);

	var det_m_bill_history_arrears = parseFloat(_bill.receivablePay) + parseFloat(_bill.discountPay) - parseFloat(_bill.billAmount);
	$('#det_m_bill_history_arrears').html(det_m_bill_history_arrears);
	$('#det_m_bill_receivablePay').html(_bill.receivablePay);
	$('#det_m_bill_discountPay').html(_bill.discountPay);
	$('#det_m_bill_actualPayment').html(_bill.actualPayment);
	$('#det_m_bill_curr_arrears').html(_bill.debts);

	$('#det_m_bill_creator').html(_order.creator);
	$('#det_m_bill_operator').html(_order.operator);
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
	$('#det_m_bill_paymentType').html(paymentType_info);
	$('#det_m_bill_paymentTime').html(_bill.paymentTime);
	$('#det_m_bill_remarks').html(_bill.remarks);

	refresh_node('order_detail_box');
}
