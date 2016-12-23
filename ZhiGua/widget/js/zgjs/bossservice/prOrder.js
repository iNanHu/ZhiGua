var _search_pr_order_year = -1;
var _search_pr_order_month = -1;
var prOrderList = new Array();
var prOrderIndex = undefined;

function _pr_order_list() {
	_search_pr_order_year = -1;
	_search_pr_order_month = -1;
	m_search_pr_order();
}

function m_search_pr_order() {
	_init_pr_order_list();
}

function m_input_search_pr_order(value) {
	$('#m_input_search_pr_order').val(value);
	m_search_pr_order();
}

function _pr_search_year(value) {
	$('#_pr_search_year').val(value);
}

function _pr_search_month(value) {
	$('#_pr_search_month').val(value);
}

function set_pr_year_month(value) {
	if (value != 1) {
		_search_pr_order_year = $('#_pr_search_year').val();
		_search_pr_order_month = $('#_pr_search_month').val();
	} else {
		_search_pr_order_year = -1;
		_search_pr_order_month = -1;
	}
	_init_pr_order_list();
}

function _init_pr_order_list() {
	var where = $('#m_input_search_pr_order').val();
	var data;
	if (_search_pr_order_year == "-1") {
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
			"year" : _search_pr_order_year,
			"month" : _search_pr_order_month
		};
	}
	// alert(JSON.stringify(data));
	ajaxSend("WechatBossPRorder_purchaseReturnOrderList", data, "GET", "JSON", true, "_view_pr_order_list");
}

function _view_pr_order_list(data) {
	prOrderList = data.rows;
	var listview_pr_order_list = $('#listview_pr_order_list');
	listview_pr_order_list.empty();
	for (var i = 0; i < prOrderList.length; i++) {
		var liEle = $("<li class='move_del'></li>");
		var divEle = $("<div class='o_win' data-load='_pr_order_details' onclick='_set_prOrderIndex(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>供应单号：<span>" + prOrderList[i].purchaseReturnCode + "</span></h5>");
		var ps_Ele = $("<p>入库门店：<span>" + prOrderList[i].shopName + "</span></p>");
		var pta_Ele = $("<p>总金额：<span>" + prOrderList[i].totalAmount + "</span></p>");
		var pprt_Ele = $("<p>开单时间：<span>" + prOrderList[i].purchaseReturnTime + "</span></p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_pr_order(" + i + ")'><i class='icon icon-delete'></i></div>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(ps_Ele);
		divEle.append(pta_Ele);
		divEle.append(pprt_Ele);
		liEle.append(del_divEle);
		listview_pr_order_list.append(liEle);
	}
	refresh_node('pr_order_box');
}

function _set_prOrderIndex(index) {
	prOrderIndex = index;
}

function _pr_order_details() {
	$("#det_pr_order_code").html(prOrderList[prOrderIndex].purchaseReturnCode);
	$("#det_pr_order_shopName").html(prOrderList[prOrderIndex].shopName);
	$("#det_pr_order_prTime").html(prOrderList[prOrderIndex].purchaseReturnTime);
	$("#det_pr_order_remarks").html(prOrderList[prOrderIndex].remarks);
	var data = {
		"prorder.purchaseReturnCode" : prOrderList[prOrderIndex].purchaseReturnCode
	};
	ajaxSend("WechatBossPRorder_goodsList", data, "GET", "JSON", true, "_init_pr_goods_list");
}

function _init_pr_goods_list(data) {
	var det_pr_order_goods_list = $('#det_pr_order_goods_list');
	det_pr_order_goods_list.empty();
	var _pgoodsCount = 0;
	var _rgoodsCount = 0;
	var totalAmount = 0.0;
	for (var i = 0; i < data.length; i++) {
		var _ta = parseFloat(data[i].goodsPrice) * parseFloat(data[i].goodsCount);
		var liEle = $("<li></li>");
		var h6Ele = $("<h6>" + data[i].commodityName + "</h6>");
		var divEle = $("<div class='nr1e-z co-back sm'><span>单价:￥" + data[i].price + "</span><span>数量:" + data[i].count + "</span><span>金额:￥" + data[i].total
				+ "</span></div>");
		liEle.append(h6Ele);
		liEle.append(divEle);
		det_pr_order_goods_list.append(liEle);

		if (data[i].count > 0) {
			_pgoodsCount = _pgoodsCount + parseInt(data[i].count);
		} else {
			_rgoodsCount = _rgoodsCount + parseInt(data[i].count);
		}
		totalAmount = totalAmount + parseFloat(data[i].total);
	}
	$("#det_pr_order_pgoodsCount").html(_pgoodsCount);
	$("#det_pr_order_rgoodsCount").html(Math.abs(_rgoodsCount));
	$("#det_pr_order_totalAmount").html("￥" + totalAmount);
}

function delete_pr_order(index) {
	var data = {
		"prorder.id" : prOrderList[index].id,
		"prorder.purchaseReturnCode" : prOrderList[index].purchaseReturnCode
	};
	ajaxSend("WechatBossPRorder_deletePurchaseReturnOrder", data, "GET", "JSON", true, "_init_pr_order_list");
}
