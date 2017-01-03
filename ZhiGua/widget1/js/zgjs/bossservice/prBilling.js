function _pr_order() {
	clear_pr_order();
}
/*----------------门店js开始------------------*/
function _select_shop() {
	ajaxSend("WechatBossPRorder_shopSelect", null, "GET", "JSON", true, "_init_listview_shop");
}

function _init_listview_shop(data) {
	var add_listview_shop = $("#add_listview_shop");
	add_listview_shop.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		liEle = $("<li class='x_win' onclick=\"add_shop('" + data[i].shopCode + "', '" + data[i].shopName + "'," + data[i].onlineStatus + ")\">"
				+ data[i].shopName + "</li>");
		add_listview_shop.append(liEle);
	}
	refresh_node('select_shop_box');
}

function add_shop(shopCode, shopName) {
	$('#span_shop_name').html(shopName);
	$('#span_shop_name').attr("style","color: black");
	$('#input_shop_code').val(shopCode);
}
/*----------------门店js结束------------------*/

/*----------------搜索商品js开始------------------*/
function _select_commodity() {
	oKeyABC('#input_search_goods');
}

var searchGoodsJson = new Array();
function search_goods() {
	var searchGoods = $('#input_search_goods').val();
	var shopCode = $('#input_shop_code').val();
	var data = {
		"commodityName" : searchGoods,
		"shopCode" : shopCode
	};
	ajaxSend("WechatBossPRorder_commoditySelect", data, "GET", "JSON", true, "_init_listview_goods");
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

/*----------------供货单js开始------------------*/
var goodsArray = new Array();
var currGoods = undefined;
var currEditGoodsIndex = undefined;

function add_goods(_goods) {
	var goodsCode = _goods.commodityCode;
	var goodsName = _goods.commodityName;
	var goodsCount = 1;
	var goodsPrice = _goods.referencePrice;
	var goodsTotal = parseFloat(goodsCount) * parseFloat(goodsPrice);
	if (_check_repeat_goods(goodsCode)) {
		return false;
	}
	currGoods = {
		"goodsCode" : goodsCode,
		"goodsName" : goodsName,
		"goodsCount" : goodsCount,
		"goodsPrice" : goodsPrice,
		"goodsTotal" : goodsTotal
	};

	var _tmp_gsa = new Array();
	_tmp_gsa[_tmp_gsa.length] = currGoods;
	goodsArray = _tmp_gsa.concat(goodsArray);

	// goodsArray[goodsArray.length] = currGoods;
	// var index = goodsArray.length - 1;
	_create_listview_goods_unit();

}

function _check_repeat_goods(goodsCode) {
	for (var i = 0; i < goodsArray.length; i++) {
		if (goodsArray[i].goodsCode == goodsCode) {
			window.wxc.xcConfirm("您已添加此商品！", "info", null);
//			alert("您已添加此商品！");
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
	refresh_node('pr_order_box');
}

function _delete_listview_goods_unit(_index) {
	goodsArray.splice(_index, 1);
	_init_pr_goodsCount();
	_create_listview_goods_unit();
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
	if (_buy_num == 0) {
		_buy_num = -1;
	}
	currGoods.goodsCount = _buy_num;
	currGoods.goodsTotal = _buy_num * currGoods.goodsPrice;
	$("#_goodsTotal_" + goodsCode).html(currGoods.goodsTotal);
	$("#_buy_num_" + goodsCode).html(_buy_num);

	_create_listview_goods_unit();
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
	if (_buy_num == 0) {
		_buy_num = 1;
	}
	currGoods.goodsCount = _buy_num;
	currGoods.goodsTotal = _buy_num * currGoods.goodsPrice;
	$("#_goodsTotal_" + goodsCode).html(currGoods.goodsTotal);
	$("#_buy_num_" + goodsCode).html(_buy_num);
	_create_listview_goods_unit();
}

/**
 * 初始化进退数量
 */
var currTotalAmount = undefined;
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
	currTotalAmount = totalAmount;
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
}

function _save_pr_order() {
	$('#order_total_amount').html(currTotalAmount);
}

function add_pr_remarks() {
	var remarks = $('#add_pr_remarks').val();
	if (validator_remarks(remarks)) {
		$('#pr_remarks').html(remarks);
		close_win();
	}

}

function save_pr_order() {
	currTotalAmount = $('#order_total_amount').html();
	var pr_remarks = $('#pr_remarks').html();
	var shopName = $('#span_shop_name').html();
	var shopCode = $('#input_shop_code').val();
	if (shopCode != "" && goodsArray.length != 0) {
		var prdatasJson = "[";
		for (var i = 0; i < goodsArray.length; i++) {
			var gdJson = "{";
			gdJson = gdJson + "\"commodityCode\":\"" + goodsArray[i].goodsCode + "\","
			gdJson = gdJson + "\"commodityName\":\"" + goodsArray[i].goodsName + "\","
			gdJson = gdJson + "\"totalNumber\":\"" + goodsArray[i].goodsCount + "\","
			gdJson = gdJson + "\"price\":\"" + goodsArray[i].goodsPrice + "\","
			gdJson = gdJson + "}";
			prdatasJson = prdatasJson + gdJson;
			if (i != goodsArray.length - 1) {
				prdatasJson = prdatasJson + ","
			}
		}
		prdatasJson = prdatasJson + "]";

		var data = {
			"commodityDataJsons" : prdatasJson,
			"prorder.shopCode" : shopCode,
			"prorder.shopName" : shopName,
			"prorder.totalAmount" : currTotalAmount,
			"prorder.remarks" : pr_remarks
		};
		ajaxSend("WechatBossPRorder_addPRorder", data, "GET", "JSON", true, "_save_pr_order_callback");
	} else {
		window.wxc.xcConfirm("没有选择门店！", "info", null);
//		alert("没有选择门店！");
	}
}

function _save_pr_order_callback(data) {
	if (data.resultCode == "150101") {
		clear_pr_order();
	}
}

function clear_pr_order() {
	currGoods = undefined;
	goodsArray.splice(0, goodsArray.length);
	currTotalAmount = undefined;
	currEditGoodsIndex = undefined;
	$("#order_goods_listview").empty();
	$("#pgoodsCount").html(0);
	$("#rgoodsCount").html(0);
	$("#span_total_amount").html("￥0");
	$('#span_shop_name').html("选择门店");
	$('#span_shop_name').attr("style","color: #cacaca");
	$('#input_shop_code').val("");
}
