function _order() {
	_search_order_year = -1;
	_search_order_month = -1;
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
function _init_order_list() {
	var where = $('#m_input_search_order').val();
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
	ajaxSend("WechatEmpOrder_allOrderList", data, "GET", "JSON", true, "_order_list");
}

var _search_order_year = -1;
var _search_order_month = -1;
/**
 * 0表示刷新所有订单，1表示刷新客户订单，2表示刷新员工订单
 */
var _order_type = 0;
function set_year_month(value) {
	if (value != 1) {
		_search_order_year = $('#_search_year').val();
		_search_order_month = $('#_search_month').val();
	} else {
		_search_order_year = -1;
		_search_order_month = -1;
	}

	if (_order_type == 0) {
		_init_order_list();
	} else if (_order_type == 1) {
		_init_cust_order_list();
	} else if (_order_type == 2) {
		_init_employee_order_list();
	}
}

function set_order_type(value) {
	_order_type = value;
}

function _order_list(data) {
	morderList = data.rows;

	var listview_m_order_list = $('#listview_m_order_list');
	listview_m_order_list.empty();
	for (var i = 0; i < morderList.length; i++) {
		var liEle = $("<li></li>");
		var divEle = $("<div class='o_win' data-load='_order_details' onclick='_set_morderIndex(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>订单号：<span>" + morderList[i].orderCode + "</span></h5>");
		var pc_Ele = $("<p>客户：<span>" + morderList[i].customerName + "</span></p>");
		var pe_Ele = $("<p>开单员：<span>" + morderList[i].creator + "</span></p>");
		var pct_Ele = $("<p>开单时间：<span>" + morderList[i].createTime + "</span></p>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(pc_Ele);
		divEle.append(pe_Ele);
		divEle.append(pct_Ele);
		listview_m_order_list.append(liEle);
	}
	refresh_node('order_box');
}

function _set_morderIndex(index) {
	custOrderIndex = index;
}

function _order_details() {
	var data = {
		"orderCode" : morderList[custOrderIndex].orderCode
	};
	ajaxSend("WechatEmpOrder_orderDetails", data, "GET", "JSON", true, "_init_m_order_details");
}

function _init_m_order_details(data) {
	var _bill = data.bill;
	var _orderGoods = data.orderGoods;
	vol_customerCode = morderList[custOrderIndex].customerCode;
	$('#emp_print_again_order').on('click', function() {
		set_print_order(_bill.orderCode);
	});
	$('#det_m_bill_cust_code').html(_bill.orderCode);
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

	$('#det_m_bill_pgoodsCount').html(morderList[custOrderIndex].pgoodsCount);
	$('#det_m_bill_rgoodsCount').html(morderList[custOrderIndex].rgoodsCount);
	$('#det_m_bill_billAmount').html(_bill.billAmount);

	var det_m_bill_history_arrears = parseFloat(_bill.receivablePay) + parseFloat(_bill.discountPay) - parseFloat(_bill.billAmount);
	$('#det_m_bill_history_arrears').html(det_m_bill_history_arrears);
	$('#det_m_bill_receivablePay').html(_bill.receivablePay);
	$('#det_m_bill_discountPay').html(_bill.discountPay);
	$('#det_m_bill_actualPayment').html(_bill.actualPayment);
	$('#det_m_bill_curr_arrears').html(_bill.debts);

	$('#det_m_bill_creator').html(morderList[custOrderIndex].creator);
	$('#det_m_bill_operator').html(morderList[custOrderIndex].operator);

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

function _print_again_order() {
	data = ajaxSend("WechatEmpBilling_getDefualtPrinter", null, "GET", "JSON", false, null);
	if (data.onlineStatus == 0) {
		$('#s_print_equipment_name').html(data.printerNickName + "<span class='co-error'>(离线)</span>");
	} else {
		if (data.printerStatus) {
			$('#s_print_equipment_name').html(data.printerNickName + "<span class='co-error'>(" + data.printerStatus + ")</span>");
		} else {
			$('#s_print_equipment_name').html(data.printerNickName);
		}
	}
	$('#s_print_equipment_id').val(data.equipmentID);
	select_print_count(data.printType);
}

var printOrdercode = undefined;
function set_print_order(orderCode) {
	printOrdercode = orderCode;
}

function _select_print_equipment() {
	ajaxSend("WechatEmpBilling_printerSelect", null, "GET", "JSON", true, "_init_s_listview_printer");
}

function _init_s_listview_printer(data) {
	var select_listview_printer = $("#select_listview_printer");
	select_listview_printer.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		if (data[i].onlineStatus == 0) {
			liEle = $("<li class='x_win' onclick=\"select_print_equipment('" + data[i].equipmentID + "', '" + data[i].printerNickName + "',"
					+ data[i].onlineStatus + ")\">" + data[i].printerNickName + "<span class='co-error'>(离线)</span></li>");
		} else {
			if (data[i].printerStatus) {
				liEle = $("<li class='x_win' onclick=\"select_print_equipment('" + data[i].equipmentID + "', '" + data[i].printerNickName + "',"
						+ data[i].onlineStatus + ",'" + data[i].printerStatus + "')\">" + data[i].printerNickName + "<span class='co-error'>("
						+ data[i].printerStatus + ")</span></li>");
			} else {
				liEle = $("<li class='x_win' onclick=\"select_print_equipment('" + data[i].equipmentID + "', '" + data[i].printerNickName + "',"
						+ data[i].onlineStatus + ")\">" + data[i].printerNickName + "</li>");
			}
		}
		select_listview_printer.append(liEle);
	}
	refresh_node('add_print_equipment_box');
}

function select_print_equipment(equipmentID, equipmentName, onlineStatus, printerStatus) {
	if (onlineStatus == 0) {
		$('#s_print_equipment_name').html(equipmentName + "<span class='co-error'>(离线)</span>");
	} else {
		if (printerStatus) {
			$('#s_print_equipment_name').html(equipmentName + "<span class='co-error'>(" + printerStatus + ")</span>");
		} else {
			$('#s_print_equipment_name').html(equipmentName);
		}
	}
	$('#s_print_equipment_id').val(equipmentID);
	update_defualt_printer(equipmentID, "");
}

function select_print_count(value) {
	if (value == 1) {
		$('#s_print_count_name').html("单打");
		$('#s_print_count').val(value);
	} else if (value == 2) {
		$('#s_print_count_name').html("双打");
		$('#s_print_count').val(value);
	} else if (value == 3) {
		$('#s_print_count_name').html("三打");
		$('#s_print_count').val(value);
	}
	update_defualt_printer("", value);
}

function printAgain() {
	var equipmentID = $('#s_print_equipment_id').val();
	var printCount = $('#s_print_count').val();
	var data = {
		"orderCode" : printOrdercode,
		"equipmentID" : equipmentID,
		"printCount" : printCount
	};
	ajaxSend("WechatEmpOrder_printAgain", data, "GET", "JSON", true, "_printAgain_callback");
}

function _printAgain_callback(data) {
    if("130208" == data.resultCode) {
        alert('打印订单失败！请检查设备是否故障或在线！');
    }
    else{
        alert('打印订单成功！');
    }
}
