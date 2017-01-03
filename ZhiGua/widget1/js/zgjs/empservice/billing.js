var billingCustomerJson = undefined;
function _billing() {
	init_operation_order();
	if (billingCustomerJson != undefined) {
		hang_order();
		$('#span_customer_name').html(billingCustomerJson.customerName);
		$('#span_customer_name').attr("style", "color: black");
		$('#input_customer_code').val(billingCustomerJson.customerCode);
		_add_order();
		billingCustomerJson = undefined;
	}
	_init_hangBillListCount();
}

/*----------------搜索客户js开始------------------*/
function _select_customer() {
	oKeyABC('#input_search_customer');
}

var searchCustomerJson = new Array();
function search_customer() {
	var searchCustomer = $('#input_search_customer').val();
	var data = {
		"order.customerName" : searchCustomer
	};
	ajaxSend("WechatEmpBilling_customerSelect", data, "GET", "JSON", true, "_init_listview_customer");
}

function input_search_customer(value) {
	$('#input_search_customer').val(value);
	if (value != "") {
		search_customer();
	} else {
		clear_customer();
	}
}

function clear_customer() {
	var customerText = $('#input_search_customer').val();
	if (customerText == "") {
		$('#listview_customer').empty();
	}
}

function _init_listview_customer(data) {
	var listview_customerEle = $("#listview_customer");
	listview_customerEle.empty();
	searchCustomerJson = data;
	for (var i = 0; i < data.length; i++) {
		var customerName = data[i].customerName;
		var phone = data[i].phone;
		var customerPhoto = data[i].customerPhoto;
		if (customerPhoto == "") {
			customerPhoto = "imgs/customer.png";
		}

		var liEle = $("<li onclick='_select_customer_Name(" + i + ")'></li>");
		var ew_divEle = $("<div class='ew'></div>");
		var divEle = $("<div class='x_win'></div>");
		var img_liEle = $("<li class='clients-list-img' style='background-image: url(" + customerPhoto + ");'></li>");
		var mm_spanEle = $("<span class='mm'>" + customerName + "</span>");
		var p_spanEle = $("<span class='co-info'>" + phone + "</span>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(img_liEle);
		divEle.append(mm_spanEle);
		divEle.append(p_spanEle);
		listview_customerEle.append(liEle);
	}
	refresh_node('select_customer_box');
}

function _select_customer_Name(index) {
	var customer = searchCustomerJson[index];
	$('#span_customer_name').html(customer.customerName);
	$('#span_customer_name').attr("style", "color: black");
	$('#input_customer_code').val(customer.customerCode);
	if (orderData == undefined) {
		_add_order();
	} else {
		_update_order();
	}
}

/*----------------搜索客户js结束------------------*/

/*----------------搜索商品js开始------------------*/
function _select_commodity() {
	oKeyABC('#input_search_goods');
}

var searchGoodsJson = new Array();
function search_goods() {
	var searchGoods = $('#input_search_goods').val();
	var data = {
		"commodityName" : searchGoods
	};
	ajaxSend("WechatEmpBilling_commoditySelect", data, "GET", "JSON", true, "_init_listview_goods");
}

function input_search_goods(value) {
	$('#input_search_goods').val(value);
	if (value != "") {
		search_goods();
	} else {
		clear_goods();
	}
}

function clear_goods() {
	var searchText = $('#input_search_goods').val();
	if (searchText == "") {
		$('#listview_goods').empty();
	}
}

function _init_listview_goods(data) {
	var listview_goodsEle = $("#listview_goods");
	listview_goodsEle.empty();
	searchGoodsJson = data;
	for (var i = 0; i < data.length; i++) {
		var goodsName = data[i].commodityName;
		var goodsPrice = data[i].commodityPrice;
		var totalNumber = data[i].totalNumber;
		var remarks = data[i].remarks;

		var liEle = $("<li onclick='_select_goods_Name(" + i + ")'></li>");
		var ew_divEle = $("<div class='x_win ew ew-mw1e'></div>");
		// var gimg_divEle = $("<div class='goods-img nr20x'
		// style='background-image:url(imgs/goods1.jpg)'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + goodsName + "</h6>");
		var pcEle = $("<p class='co-info ss'>库存：<span>" + totalNumber + "件</span></p>");
		var ppEle = $("<p class='co-info ss'>零售价：<span class='goods-price co-warn'>" + goodsPrice + " / 件</span></p>");

		liEle.append(ew_divEle);
		// ew_divEle.append(gimg_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);
		listview_goodsEle.append(liEle);
	}
	refresh_node('select_goods_box');
}

function _select_goods_Name(index) {
	var goods = searchGoodsJson[index];
	add_goods(goods);
}

/*----------------搜索商品js结束------------------*/

/*----------------开单js开始------------------*/
var goodsArray = new Array();
var orderData = undefined;
var currGoods = undefined;
var currEditGoodsIndex = undefined;

// 如果员工有正在进行中的订单，就会被初始化
function init_operation_order() {
	var data = ajaxSend("WechatEmpBilling_operationOrder", null, "GET", "JSON", false, null);
	if (data.resultCode == "130401") {
		orderData = data
		data = ajaxSend("WechatEmpBilling_orderGoodsList", "order.orderCode=" + data.orderCode, "GET", "JSON", false, null);
		_init_order_goods_listview(data);
	}
}

function add_goods(_goods) {
	if (_check_repeat_goods(_goods.commodityCode)) {
		return false;
	}
	currGoods = {
		"id" : undefined,
		"goodsCode" : _goods.commodityCode,
		"goodsName" : _goods.commodityName,
		"goodsCount" : 1,
		"goodsPrice" : _goods.commodityPrice,
		"goodsReferencePrice" : _goods.referencePrice,
		"goodsTotal" : 1 * parseFloat(_goods.commodityPrice),
		"goodsSign" : _goods.sign
	};

	var _tmp_gsa = new Array();
	_tmp_gsa[_tmp_gsa.length] = currGoods;
	goodsArray = _tmp_gsa.concat(goodsArray);

	// goodsArray[goodsArray.length] = currGoods;
	// var index = goodsArray.length - 1;
	_create_listview_goods_unit();

	if (goodsArray.length == 1 && orderData == undefined) {
		_add_order();
	} else {
		_add_goods_byJson();
		_update_order();
	}
}

function _add_order() {
	var customerName = $('#span_customer_name').html();
	var customerCode = $('#input_customer_code').val();
	var pgoodsCount = $('#pgoodsCount').html();
	var rgoodsCount = $('#rgoodsCount').html();

	var totalAmount = 0.0;
	for (var i = 0; i < goodsArray.length; i++) {
		totalAmount = totalAmount + parseFloat(goodsArray[i].goodsTotal);
	}
	var data = {
		"order.customerName" : customerName,
		"order.customerCode" : customerCode,
		"order.purchaseGoodsCount" : pgoodsCount,
		"order.returnGoodsCount" : rgoodsCount,
		"order.goodsCategoryCount" : goodsArray.length,
		"order.orderTotalAmount" : totalAmount
	};

	ajaxSend("WechatEmpBilling_createOrder", data, "GET", "JSON", true, "_init_order_data");

	// 更新home页面点击的挂单列表
	_home_hang_bill();
}

function _init_order_data(data) {
	orderData = data;
	if (orderData != undefined) {
		var totalAmount = 0.0;
		for (var i = 0; i < goodsArray.length; i++) {
			totalAmount = totalAmount + parseFloat(goodsArray[i].goodsTotal);
		}
		orderData.orderTotalAmount = totalAmount;
	}
	_add_goods_byJson();
	_init_hangBillListCount();
}

function _add_goods_byJson() {
	// 货品JSON
	if (currGoods != undefined) {
		var gdJson = "{";
		gdJson = gdJson + "\"orderCode\":\"" + orderData.orderCode + "\",";
		gdJson = gdJson + "\"commodityCode\":\"" + currGoods.goodsCode + "\","
		gdJson = gdJson + "\"commodityName\":\"" + currGoods.goodsName + "\","
		gdJson = gdJson + "\"totalNumber\":\"" + currGoods.goodsCount + "\","
		gdJson = gdJson + "\"price\":\"" + currGoods.goodsPrice + "\","
		gdJson = gdJson + "\"goodsReferencePrice\":\"" + currGoods.goodsReferencePrice + "\","
		gdJson = gdJson + "\"sign\":\"" + currGoods.goodsSign + "\","
		gdJson = gdJson + "}";
		ajaxSend("WechatEmpBilling_addOrderGoods", "orderGoodsJson=" + gdJson, "GET", "JSON", true, "_init_goods_id");
		currGoods = undefined;
	}
}

function _init_goods_id(data) {
	goodsArray[0].id = data.id;
}

function _update_order() {
	var customerName = $('#span_customer_name').html();
	var customerCode = $('#input_customer_code').val();
	var pgoodsCount = $('#pgoodsCount').html();
	var rgoodsCount = $('#rgoodsCount').html();

	var totalAmount = 0.0;
	for (var i = 0; i < goodsArray.length; i++) {
		totalAmount = totalAmount + parseFloat(goodsArray[i].goodsTotal);
	}
	if (orderData != undefined) {
		orderData.orderTotalAmount = totalAmount;
	}
	var data = {
		"order.orderCode" : orderData.orderCode,
		"order.customerName" : customerName,
		"order.customerCode" : customerCode,
		"order.purchaseGoodsCount" : pgoodsCount,
		"order.returnGoodsCount" : rgoodsCount,
		"order.goodsCategoryCount" : goodsArray.length,
		"order.orderTotalAmount" : totalAmount
	};
	ajaxSend("WechatEmpBilling_updateOrder", data, "GET", "JSON", true, "updateOrder_callback");
}

function updateOrder_callback(data) {
	if (data.resultCode == "130201") {
		orderData = data;
	}
}

function _check_repeat_goods(goodsCode) {
	for (var i = 0; i < goodsArray.length; i++) {
		if (goodsArray[i].goodsCode == goodsCode) {
			window.wxc.xcConfirm("您已添加此商品！", "info", null);
			// alert("您已添加此商品！");
			return true;
		}
	}
	return false;
}

function _create_listview_goods_unit() {
	$("#order_goods_listview").empty();
	for (var i = 0; i < goodsArray.length; i++) {
		var goodsCode = goodsArray[i].goodsCode;
		var goodsName = goodsArray[i].goodsName;
		var goodsCount = goodsArray[i].goodsCount;
		var goodsPrice = goodsArray[i].goodsPrice;
		var goodsReferencePrice = goodsArray[i].goodsReferencePrice;
		var goodsSign = goodsArray[i].goodsSign;
		var goodsTotal = parseInt(goodsArray[i].goodsCount) * parseFloat(goodsArray[i].goodsPrice);

		var liEle = $("<li class='move_del'></li>");
		var ew_divEle = $("<div class='o_win ew ew-mw15x' data-load='_edit_goods' onclick=_init_edit_goods(" + i + ")></div>");
		// var gimg_divEle = $("<div class='goods-img nr20x'
		// style='background-image:url(imgs/goods1.jpg)'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + goodsName + "</h6>");
		var pcEle = $("<p class='co-info sm'>单价：<span class='goods-price co-warn'  id='_goodsPrice_" + goodsCode + "'>" + goodsPrice + " / 件</span></p>");
		var ppEle = $("<p class='co-info sm'>小计：<span class='goods-price co-warn' id='_goodsTotal_" + goodsCode + "'>" + goodsTotal + "</span></p>");

		var en_ulEle = $("<ul class='edit-number'></ul>");
		var jian_liEle = $("<li class='jian' onclick='_jian_number(" + i + ")'><i class='icon icon-minus'></i></li>");
		var buy_num_liEle = $("<li class='value gBuyNum' id='_buy_num_" + goodsCode + "'>" + goodsCount + "</li>");
		var jia_liEle = $("<li class='jia' onclick='_jia_number(" + i + ")'><i class='icon icon-plus'></i></li>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='_delete_listview_goods_unit(" + i + ")'><i class='icon icon-delete'></i></div>");
		if (goodsCount < 0) {
			liEle = $("<li class='move_del' style='background-color: #f9ecec'></li>");
			jian_liEle = $("<li class='jian' style='background-color: #f9ecec' onclick='_jian_number(" + i + ")'><i class='icon icon-minus'></i></li>");
			buy_num_liEle = $("<li class='value gBuyNum' style='background-color: #f9ecec' id='_buy_num_" + goodsCode + "'>" + goodsCount + "</li>");
			jia_liEle = $("<li class='jia' style='background-color: #f9ecec' onclick='_jia_number(" + i + ")'><i class='icon icon-plus'></i></li>");
		}

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);

		liEle.append(en_ulEle);
		en_ulEle.append(jian_liEle);
		en_ulEle.append(buy_num_liEle);
		en_ulEle.append(jia_liEle);

		liEle.append(del_divEle);

		$("#order_goods_listview").append(liEle);
	}
	_init_pr_goodsCount();
	refresh_node('billing_box');

	// var goodsName = _currGoods.goodsName;
	// var goodsCount = _currGoods.goodsCount;
	// var goodsPrice = _currGoods.goodsPrice;
	// var goodsTotal = _currGoods.goodsTotal;
	//
	// var liEle = $("<li class='move_del'></li>");
	// var ew_divEle = $("<div class='o_win ew ew-mw15x' data-load='_edit_goods'
	// onclick=_init_edit_goods(" + _index + ")></div>");
	// // var gimg_divEle = $("<div class='goods-img nr20x'
	// // style='background-image:url(imgs/goods1.jpg)'></div>");
	// var divEle = $("<div></div>");
	// var h6Ele = $(" <h6 class='goods-name mb15x'>" + goodsName + "</h6>");
	// var pcEle = $("<p class='co-info sm'>单价：<span class='goods-price co-warn'
	// id='_goodsPrice_" + _currGoods.goodsCode + "'>" + goodsPrice + " /
	// 件</span></p>");
	// var ppEle = $("<p class='co-info sm'>小计：<span class='goods-price co-warn'
	// id='_goodsTotal_" + _currGoods.goodsCode + "'>" + goodsTotal +
	// "</span></p>");
	//
	// var en_ulEle = $("<ul class='edit-number'></ul>");
	// var jian_liEle = $("<li class='jian' onclick='_jian_number(" + _index +
	// ")'><i class='icon icon-minus'></i></li>");
	// var buy_num_liEle = $("<li class='value gBuyNum' id='_buy_num_" +
	// _currGoods.goodsCode + "'>" + goodsCount + "</li>");
	// var jia_liEle = $("<li class='jia' onclick='_jia_number(" + _index +
	// ")'><i class='icon icon-plus'></i></li>");
	// var del_divEle = $("<div class='move-del-nav del_list'
	// onclick='_delete_listview_goods_unit(" + _index + ")'><i class='icon
	// icon-delete'></i></div>");
	//
	// liEle.append(ew_divEle);
	// ew_divEle.append(divEle);
	// divEle.append(h6Ele);
	// divEle.append(pcEle);
	// divEle.append(ppEle);
	//
	// liEle.append(en_ulEle);
	// en_ulEle.append(jian_liEle);
	// en_ulEle.append(buy_num_liEle);
	// en_ulEle.append(jia_liEle);
	//
	// liEle.append(del_divEle);
	//
	// $("#order_goods_listview").append(liEle);
	// _init_pr_goodsCount();
	// refresh_node('billing_box');
}

function _delete_listview_goods_unit(_index) {
	var _tmpGoods = goodsArray[_index];
	ajaxSend("WechatEmpBilling_deleteOrderGoods", "orderGoodsId=" + _tmpGoods.id, "GET", "JSON", true, null);
	goodsArray.splice(_index, 1);
	_update_order();
	_create_listview_goods_unit();
}

function _update_goods_byJson() {
	if (currGoods != undefined) {
		var gdJson = "{";
		gdJson = gdJson + "\"id\":\"" + currGoods.id + "\","
		gdJson = gdJson + "\"totalNumber\":\"" + currGoods.goodsCount + "\","
		gdJson = gdJson + "\"price\":\"" + currGoods.goodsPrice + "\","
		gdJson = gdJson + "}";
		ajaxSend("WechatEmpBilling_updateOrderGoods", "orderGoodsJson=" + gdJson, "GET", "JSON", true, null);
		currGoods = undefined;
	}
}

/**
 * 减商品数量
 * 
 * @param index
 */
function _jian_number(index) {
	currGoods = goodsArray[index];
	var goodsCode = currGoods.goodsCode;
	var _buy_num = $("#_buy_num_" + goodsCode).html();
	_buy_num = parseInt(_buy_num);
	_buy_num = _buy_num - 1;
	// if (_buy_num < -10000) {
	// _buy_num = -10000;
	// }
	if (_buy_num == 0) {
		_buy_num = -1;
	}
	currGoods.goodsCount = _buy_num;
	currGoods.goodsTotal = _buy_num * currGoods.goodsPrice;
	$("#_goodsTotal_" + goodsCode).html(currGoods.goodsTotal);
	$("#_buy_num_" + goodsCode).html(_buy_num);
	_create_listview_goods_unit();
	_update_goods_byJson();
	_update_order();
}

/**
 * 加商品数量
 * 
 * @param index
 */
function _jia_number(index) {
	currGoods = goodsArray[index];
	var goodsCode = currGoods.goodsCode;
	var _buy_num = $("#_buy_num_" + goodsCode).html();
	_buy_num = parseInt(_buy_num);
	_buy_num = _buy_num + 1;
	// if (_buy_num > 10000) {
	// _buy_num == 10000;
	// }
	if (_buy_num == 0) {
		_buy_num = 1;
	}
	currGoods.goodsCount = _buy_num;
	currGoods.goodsTotal = _buy_num * currGoods.goodsPrice;
	$("#_goodsTotal_" + goodsCode).html(currGoods.goodsTotal);
	$("#_buy_num_" + goodsCode).html(_buy_num);
	_create_listview_goods_unit();
	_update_goods_byJson();
	_update_order();
}

/**
 * 初始化进退数量
 */
function _init_pr_goodsCount() {
	var _pgoodsCount = 0;
	var _rgoodsCount = 0;
	var totalAmount = 0.0;
	for (var i = 0; i < goodsArray.length; i++) {
		if (goodsArray[i].goodsCount > 0) {
			_pgoodsCount = _pgoodsCount + parseInt(goodsArray[i].goodsCount);
		} else {
			_rgoodsCount = _rgoodsCount + parseInt(goodsArray[i].goodsCount);
		}
		totalAmount = totalAmount + parseFloat(goodsArray[i].goodsTotal);
	}
	$("#pgoodsCount").html(_pgoodsCount);
	$("#rgoodsCount").html(Math.abs(_rgoodsCount));
	$("#span_total_amount").html("￥" + totalAmount);
}

function _init_edit_goods(index) {
	currEditGoodsIndex = index;
}

/**
 * 初始化订单货品页面
 */
function _edit_goods() {
	// $("#edit_goods_count").focus(function() {
	// $('#edit_goods_count').val("");
	// });
	// $("#edit_goods_price_new").focus(function() {
	// $('#edit_goods_price_new').val("");
	// });
	if (currEditGoodsIndex != undefined) {
		$("#edit_goods_name").html(goodsArray[currEditGoodsIndex].goodsName);
		$("#edit_goods_price_old").html(goodsArray[currEditGoodsIndex].goodsPrice + " / 件");
		$("#edit_goods_count").val(goodsArray[currEditGoodsIndex].goodsCount);
		$("#edit_goods_price_new").val(goodsArray[currEditGoodsIndex].goodsPrice);
		oKey123("#edit_goods_count");
		$("#edit_goods_count").focus();
		currGoods = goodsArray[currEditGoodsIndex];
	}
	currEditGoodsIndex = undefined;
}

function edit_goods_count_tab() {
	$("#edit_goods_price_new").focus();
	oKey123("#edit_goods_price_new");
}

function edit_goods_count(value) {
	if (value == "" || value == "-") {
		$('#edit_goods_count').val(value);
	} else {
		if (/^(-)?\d+$/.test(value)) {
			$('#edit_goods_count').val(parseInt(value));
		}
	}
}

function edit_goods_price_new(value) {
	if (value == "") {
		$('#edit_goods_price_new').val(value);
	}
	if (/^\d{0,19}\.\d{0,2}$|^\d{0,19}$/.test(value)) {
		$('#edit_goods_price_new').val(value);
	}
}

/**
 * 确认修改订货单信息
 * 
 * @param index
 */
function update_goods() {
	var _buy_num = $("#edit_goods_count").val();
	var _goods_price = $("#edit_goods_price_new").val();
	if (_buy_num == "" || _buy_num == 0) {
		_buy_num = 1;
	}
	currGoods.goodsPrice = _goods_price;
	currGoods.goodsCount = _buy_num;
	currGoods.goodsTotal = _buy_num * currGoods.goodsPrice;
	$("#_goodsTotal_" + currGoods.goodsCode).html(currGoods.goodsTotal);
	$("#_buy_num_" + currGoods.goodsCode).html(_buy_num);
	$("#_goodsPrice_" + currGoods.goodsCode).html(_goods_price + " / 件");
	_create_listview_goods_unit();
	_update_goods_byJson();
	_update_order();
}

// 挂起单子
function hang_order() {
	if (orderData != undefined) {
		ajaxSend("WechatEmpBilling_updateOrder", "order.orderStatus=0&order.orderCode=" + orderData.orderCode, "GET", "JSON", true, "hang_order_callback");
		orderData = undefined;
		$("#order_goods_listview").empty();
		goodsArray.splice(0, goodsArray.length);
		$("#pgoodsCount").html(0);
		$("#rgoodsCount").html(0);
		$("#span_total_amount").html("￥0.00");
		$('#span_customer_name').html("选择客户");
		$('#span_customer_name').attr("style", "color: #cacaca");
		$('#input_customer_code').val("");
	}
}

function hang_order_callback(data) {
	if (data.resultCode == "130201") {
		_home_hang_bill();
	}
}

function _settlement() {
	if (orderData != undefined) {
		var data = ajaxSend("WechatEmpBilling_customerArrears", "order.customerCode=" + orderData.customerCode, "GET", "JSON", false, null);
		var historyArrears = data.arrears;
		data = ajaxSend("WechatEmpBilling_getDefualtPrinter", null, "GET", "JSON", false, null);
		if (data.onlineStatus == 0) {
			$('#print_equipment_name').html(data.printerNickName + "<span class='co-error'>(离线)</span>");
		} else {
			if (data.printerStatus) {
				$('#print_equipment_name').html(data.printerNickName + "<span class='co-error'>(" + data.printerStatus + ")</span>");
			} else {
				$('#print_equipment_name').html(data.printerNickName);
			}
		}
		$('#print_equipment_id').val(data.equipmentID);
		add_print_count(data.printType);

		var totalAmount = orderData.orderTotalAmount
		var receivablePay = 0.0;
		if (totalAmount) {
			receivablePay = parseFloat(totalAmount) + parseFloat(historyArrears);
		} else {
			receivablePay = historyArrears;
		}
		if (orderData.customerCode != "") {
			data = {
				"order.customerCode" : orderData.customerCode
			};
			data = ajaxSend("WechatEmpBilling_getCustDiscount", data, "GET", "JSON", false, null);
			if (data.memberDiscount) {
				var dp_ = parseFloat(totalAmount) * parseFloat(data.memberDiscount);
				var discount_pay = parseInt(totalAmount) - parseInt(dp_.toFixed(0));
				$('#discount_pay').html(parseFloat(discount_pay).toFixed(1));
				var receivable_pay = parseInt(dp_.toFixed(0)) + parseInt(historyArrears);
				$('#receivable_pay').html(parseFloat(receivable_pay).toFixed(1));
			}
		} else {
			$('#receivable_pay').html(parseFloat(receivablePay).toFixed(1));
		}
		$('#order_total_amount').html(parseFloat(totalAmount).toFixed(1));
		$('#history_arrears').html(historyArrears);
	}
}

function _add_actual_payment() {
	oKey123('#m_add_actual_pay');
	$('#m_add_actual_pay').attr("placeholder", "请输入实收金额（应收：￥" + $('#receivable_pay').html() + "）");
}

function m_add_actual_pay(value) {
	$('#m_add_actual_pay').val(value);
}

function add_actual_pay() {
	var value = $('#m_add_actual_pay').val();
	if (value != "") {
		$('#actual_pay').html(value);
	}
}

function _add_discount_pay() {
	oKey123('#m_add_discount_pay');
}

function m_add_discount_pay(value) {
	$('#m_add_discount_pay').val(value);
}

function add_discount_pay() {
	var value = $('#m_add_discount_pay').val();
	if (value != "") {
		$('#discount_pay').html(parseFloat(value).toFixed(1));
		var totalAmount = $('#order_total_amount').html();
		var historyArrears = $('#history_arrears').html();
		var receivablePay = parseInt(totalAmount) + parseInt(historyArrears) - parseInt(value);
		$('#receivable_pay').html(parseFloat(receivablePay).toFixed(1));
	}
}

function _add_bill_remarks() {
	$('#add_bill_remarks').focus();
}

function add_bill_remarks() {
	var add_bill_remarks = $('#add_bill_remarks').val();
	if (validator_remarks(add_bill_remarks)) {
		$('#bill_remarks').html(add_bill_remarks);
		close_win();
	}
	$('#add_bill_remarks').blur();
	refresh_node('settlement_box');
}

function add_payment_type(value) {
	if (value == 0) {
		$('#payment_type_name').html("现金支付");
		$('#payment_type').val(value);
	} else if (value == 1) {
		$('#payment_type_name').html("银联支付");
		$('#payment_type').val(value);
	} else if (value == 2) {
		$('#payment_type_name').html("支付宝");
		$('#payment_type').val(value);
	} else if (value == 3) {
		$('#payment_type_name').html("微信支付");
		$('#payment_type').val(value);
	}
}

function update_defualt_printer(equipmentID, printType) {
	var data = {
		"equipmentID" : equipmentID,
		"printType" : printType
	}
	ajaxSend("WechatEmpBilling_updateDefualtPrinter", data, "GET", "JSON", true, null);

}

function _add_print_equipment() {
	ajaxSend("WechatEmpBilling_printerSelect", null, "GET", "JSON", true, "_init_listview_printer");
}

function _init_listview_printer(data) {
	var add_listview_printer = $("#add_listview_printer");
	add_listview_printer.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		if (data[i].onlineStatus == 0) {
			liEle = $("<li class='x_win' onclick=\"add_print_equipment('" + data[i].equipmentID + "', '" + data[i].printerNickName + "',"
					+ data[i].onlineStatus + ")\">" + data[i].printerNickName + "<span class='co-error'>(离线)</span></li>");
		} else {
			if (data[i].printerStatus) {
				liEle = $("<li class='x_win' onclick=\"add_print_equipment('" + data[i].equipmentID + "', '" + data[i].printerNickName + "',"
						+ data[i].onlineStatus + ",'" + data[i].printerStatus + "')\">" + data[i].printerNickName + "<span class='co-error'>("
						+ data[i].printerStatus + ")</span></li>");
			} else {
				liEle = $("<li class='x_win' onclick=\"add_print_equipment('" + data[i].equipmentID + "', '" + data[i].printerNickName + "',"
						+ data[i].onlineStatus + ")\">" + data[i].printerNickName + "</li>");
			}
		}
		add_listview_printer.append(liEle);
	}
	refresh_node('add_print_equipment_box');
}

function add_print_equipment(equipmentID, equipmentName, onlineStatus, printerStatus) {
	if (onlineStatus == 0) {
		$('#print_equipment_name').html(equipmentName + "<span class='co-error'>(离线)</span>");
	} else {
		if (printerStatus) {
			$('#print_equipment_name').html(equipmentName + "<span class='co-error'>(" + printerStatus + ")</span>");
		} else {
			$('#print_equipment_name').html(equipmentName);
		}
	}
	$('#print_equipment_id').val(equipmentID);
	update_defualt_printer(equipmentID, "");
}

function add_print_count(value) {
	if (value == 0) {
		$('#print_count_name').html("不打印");
		$('#print_count').val(value);
	} else if (value == 1) {
		$('#print_count_name').html("单打");
		$('#print_count').val(value);
	} else if (value == 2) {
		$('#print_count_name').html("双打");
		$('#print_count').val(value);
	} else if (value == 3) {
		$('#print_count_name').html("三打");
		$('#print_count').val(value);
	}
	update_defualt_printer("", value);
}

function payment_order() {
	if (orderData != undefined) {
		// alert(orderData.customerCode);
		if (orderData.customerCode == "") {
			window.wxc.xcConfirm("没有选择客户！", "info", null);
			// alert("没有选择客户！");
			return false;
		}
		// ajaxSend("WechatEmpBilling_updateOrder",
		// "order.orderStatus=0&order.orderCode=" + orderData.orderCode, "GET",
		// "JSON", true, null);
		var billAmount = $('#order_total_amount').html();
		var receivablePay = $('#receivable_pay').html();
		var actualPayment = $('#actual_pay').html();
		var discountPay = $("#discount_pay").html();
		var paymentType = $('#payment_type').val();
		// var equipmentID = $('#print_equipment_id').val();
		// var printCount = $('#print_count').val();
		var remarks = $('#bill_remarks').html();
		var equipmentID = $('#print_equipment_id').val();
		var printCount = $('#print_count').val();
		var data = {
			"bill.billAmount" : billAmount,
			"bill.receivablePay" : receivablePay,
			"bill.actualPayment" : actualPayment,
			"bill.discountPay" : discountPay,
			"bill.paymentType" : paymentType,
			"bill.remarks" : remarks,
			"order.orderCode" : orderData.orderCode,
			"equipmentID" : equipmentID,
			"printCount" : printCount
		};

		ajaxSend("WechatEmpBilling_payOrder", data, "GET", "JSON", true, "_payment_order_back");
		orderData = undefined;
		$("#order_goods_listview").empty();
		goodsArray.splice(0, goodsArray.length);
		$("#pgoodsCount").html(0);
		$("#rgoodsCount").html(0);
		$("#span_total_amount").html("￥0.00");
		$('#span_customer_name').html("选择客户");
		$('#span_customer_name').attr("style", "color: #cacaca");
		$('#input_customer_code').val("");
	}
}

function _payment_order_back(data) {
	_init_hangBillListCount();
	if ("130208" == data.resultCode) {
		window.wxc.xcConfirm('打印订单失败！请检查设备是否故障或在线！', "info", null);
		// alert('打印订单失败！请检查设备是否故障或在线！');
	} else if ("130206" == data.resultCode) {
		window.wxc.xcConfirm("订单结算成功，请在订单管理中查看！", "info", null);
	}
}

/*----------------开单js结束------------------*/

/*----------------挂单列表js开始------------------*/
function _init_hangBillListCount() {
	ajaxSend("WechatEmpBilling_hangBillListCount", null, "GET", "JSON", true, "_set_hang_bill_list_count");
}

function _set_hang_bill_list_count(data) {
	$('#hang_bill_list_count').html(data.hblCount);
}

var orderList = new Array();
function _hang_bill() {
	ajaxSend("WechatEmpBilling_hangBillList", null, "GET", "JSON", true, "_hang_bill_list");
}

function _hang_bill_list(data) {
	orderList = data;
	var listview_hang_bill_list = $('#listview_hang_bill_list');
	listview_hang_bill_list.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle;
		var divEle;
		var h5Ele = $("<h5 class='v2e5 co-read'>客户 ：<span>" + data[i].customerName + "</span></h5>");
		var pc_Ele = $("<p>开单员：<span>" + data[i].creator + "</span></p>");
		var pct_Ele = $("<p>开单时间：<span>" + data[i].createTime + "</span></p>");
		var ps_Ele;
		var del_divEle;
		if (data[i].orderStatus == 1) {
			liEle = $("<li></li>");
			divEle = $("<div class='x_win'></div>");
			ps_Ele = $("<p>状态：<span style='font-size: 40px;color: red;'>" + data[i].operator + "</span><span>正在操作中......</span></p>");
			del_divEle = "";
		} else if (data[i].orderStatus == 0) {
			liEle = $("<li class='move_del'></li>");
			divEle = $("<div class='x_win' onclick='_init_order(" + i + ")'></div>");
			ps_Ele = $("<p>状态：<span>挂单中......</span></p>");
			del_divEle = $("<div class='move-del-nav del_list' onclick='_delete_hang_bill(" + i + ")'><i class='icon icon-delete'></i></div>");
		}
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(pc_Ele);
		divEle.append(pct_Ele);
		divEle.append(ps_Ele);
		liEle.append(del_divEle);
		listview_hang_bill_list.append(liEle);
	}
	refresh_node('hang_bill_box');
}

function _delete_hang_bill(_index) {
	ajaxSend("WechatEmpBilling_deleteHangBill", "order.id=" + orderList[_index].id, "GET", "JSON", false, null);
	orderList.splice(_index, 1);
	_hang_bill_list(orderList);
	_init_hangBillListCount();

	// 更新home页面点击的挂单列表
	_home_hang_bill();
}

function _init_order(index) {
	if (orderData == undefined) {
		var order = orderList[index];
		var data = ajaxSend("WechatEmpBilling_checkHangBillStatus", "order.orderCode=" + order.orderCode, "GET", "JSON", false, null);
		if (data.resultCode == "130401") {
			orderData = order;
			ajaxSend("WechatEmpBilling_orderGoodsList", "order.orderCode=" + order.orderCode, "GET", "JSON", true, "_init_order_goods_listview");
			// 更新home页面点击的挂单列表
			_home_hang_bill();
		}

	} else {

	}
}

function _init_order_goods_listview(data) {
	$("#order_goods_listview").empty();
	goodsArray = new Array();
	for (var i = 0; i < data.length; i++) {
		var id = data[i].id;
		var goodsCode = data[i].goodsCode;
		var goodsName = data[i].goodsName;
		var goodsCount = data[i].goodsCount;
		var goodsPrice = data[i].goodsPrice;
		var goodsReferencePrice = data[i].goodsReferencePrice;
		var goodsSign = data[i].goodsSign;
		var goodsTotal = parseInt(data[i].goodsCount) * parseFloat(data[i].goodsPrice);

		currGoods = {
			"id" : id,
			"goodsCode" : goodsCode,
			"goodsName" : goodsName,
			"goodsCount" : goodsCount,
			"goodsPrice" : goodsPrice,
			"goodsReferencePrice" : goodsReferencePrice,
			"goodsTotal" : goodsTotal,
			"goodsSign" : goodsSign
		};
		goodsArray[goodsArray.length] = currGoods;

		var liEle = $("<li class='move_del'></li>");
		var ew_divEle = $("<div class='o_win ew ew-mw15x' data-load='_edit_goods' onclick=_init_edit_goods(" + i + ")></div>");
		// var gimg_divEle = $("<div class='goods-img nr20x'
		// style='background-image:url(imgs/goods1.jpg)'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + goodsName + "</h6>");
		var pcEle = $("<p class='co-info sm'>单价：<span class='goods-price co-warn'  id='_goodsPrice_" + currGoods.goodsCode + "'>" + goodsPrice
				+ " / 件</span></p>");
		var ppEle = $("<p class='co-info sm'>小计：<span class='goods-price co-warn' id='_goodsTotal_" + currGoods.goodsCode + "'>" + goodsTotal + "</span></p>");

		var en_ulEle = $("<ul class='edit-number'></ul>");
		var jian_liEle = $("<li class='jian' onclick='_jian_number(" + i + ")'><i class='icon icon-minus'></i></li>");
		var buy_num_liEle = $("<li class='value gBuyNum' id='_buy_num_" + currGoods.goodsCode + "'>" + goodsCount + "</li>");
		var jia_liEle = $("<li class='jia' onclick='_jia_number(" + i + ")'><i class='icon icon-plus'></i></li>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='_delete_listview_goods_unit(" + i + ")'><i class='icon icon-delete'></i></div>");
		if (goodsCount < 0) {
			liEle = $("<li class='move_del' style='background-color: #f9ecec'></li>");
			jian_liEle = $("<li class='jian' style='background-color: #f9ecec' onclick='_jian_number(" + i + ")'><i class='icon icon-minus'></i></li>");
			buy_num_liEle = $("<li class='value gBuyNum' style='background-color: #f9ecec' id='_buy_num_" + goodsCode + "'>" + goodsCount + "</li>");
			jia_liEle = $("<li class='jia' style='background-color: #f9ecec' onclick='_jia_number(" + i + ")'><i class='icon icon-plus'></i></li>");
		}
		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);

		liEle.append(en_ulEle);
		en_ulEle.append(jian_liEle);
		en_ulEle.append(buy_num_liEle);
		en_ulEle.append(jia_liEle);

		liEle.append(del_divEle);

		$("#order_goods_listview").append(liEle);
	}
	$('#span_customer_name').html(orderData.customerName);
	if (orderData.customerName == "选择客户") {
		$('#span_customer_name').attr("style", "color: #cacaca");
	} else {
		$('#span_customer_name').attr("style", "color: black");
	}
	$('#input_customer_code').val(orderData.customerCode);
	_init_pr_goodsCount();
	refresh_node('billing_box');
}

/*----------------挂单列表js结束------------------*/

