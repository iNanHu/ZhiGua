var inventoryList = new Array();
var inventoryIndex = undefined;

function _inventory() {
	m_search_inventory();
}

function m_search_inventory() {
	_init_inventory_list();
}

function _init_inventory_list() {
	var where = $('#m_input_search_inventory').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : where
	};
	// alert(JSON.stringify(data));
	ajaxSend("WechatBossInventory_inventoryList", data, "GET", "JSON", true, "_view_inventory_list");
}

function _view_inventory_list(data) {
	inventoryList = data.rows;
	var listview_inventory_list = $('#listview_inventory_list');
	listview_inventory_list.empty();
	for (var i = 0; i < inventoryList.length; i++) {
		var liEle = $("<li class='move_del'></li>");
		var divEle = $("<div class='o_win' data-load='_inventory_details' onclick='_set_inventoryIndex(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>盘点编号：<span>" + inventoryList[i].inventoryCode + "</span></h5>");
		var ps_Ele = $("<p>盘点门店：<span>" + inventoryList[i].shopName + "</span></p>");
		var pis_Ele = "";
		if (inventoryList[i].inventoryStatus == 1) {
			pis_Ele = $("<p>盘盈盘亏：<span>盘盈</span></p>");
		} else {
			pis_Ele = $("<p>盘盈盘亏：<span>盘亏</span></p>");
		}
		var pta_Ele = $("<p>盘盈金额：<span>" + inventoryList[i].totalAmount + "</span></p>");
		var pct_Ele = $("<p>盘点时间：<span>" + inventoryList[i].createTime + "</span></p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_inventory(" + i + ")'><i class='icon icon-delete'></i></div>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(ps_Ele);
		divEle.append(pis_Ele);
		divEle.append(pta_Ele);
		divEle.append(pct_Ele);
		liEle.append(del_divEle);
		listview_inventory_list.append(liEle);
	}
	refresh_node('inventory_box');
}

function _set_inventoryIndex(index) {
	inventoryIndex = index;
}

function _inventory_details() {
	$("#det_inventory_code").html(inventoryList[inventoryIndex].inventoryCode);
	$("#det_inventory_shopName").html(inventoryList[inventoryIndex].shopName);
	$("#det_inventory_totalAmount").html(inventoryList[inventoryIndex].totalAmount);
	if (inventoryList[inventoryIndex].inventoryStatus == 1) {
		$("#det_inventory_status").html("盘盈");
	} else {
		$("#det_inventory_status").html("盘亏");
	}

	$("#det_inventory_createTime").html(inventoryList[inventoryIndex].createTime);
	$("#det_inventory_remarks").html(inventoryList[inventoryIndex].remarks);
	var data = {
		"inventory.inventoryCode" : inventoryList[inventoryIndex].inventoryCode
	};
	ajaxSend("WechatBossInventory_inventoryRecordList", data, "GET", "JSON", true, "_init_inventoryRecord_list");
}

function _init_inventoryRecord_list(data) {
	var det_inventory_goods_list = $('#det_inventory_goods_list');
	det_inventory_goods_list.empty();
	var _pgoodsCount = 0;
	var _rgoodsCount = 0;
	for (var i = 0; i < data.length; i++) {
		var _ta = parseFloat(data[i].commodityPrice) * parseFloat(data[i].totalNumber);
		var liEle = $("<li></li>");
		var h6Ele = $("<h6>" + data[i].commodityName + "</h6>");
		var divEle = $("<div class='nr1e-z co-back sm'><span>单价:￥" + data[i].commodityPrice + "</span><span>数量:" + data[i].totalNumber + "</span><span>金额:￥"
				+ _ta + "</span></div>");
		liEle.append(h6Ele);
		liEle.append(divEle);
		det_inventory_goods_list.append(liEle);

		if (data[i].totalNumber > 0) {
			_pgoodsCount = _pgoodsCount + parseInt(data[i].totalNumber);
		} else {
			_rgoodsCount = _rgoodsCount + parseInt(data[i].totalNumber);
		}
	}
	$("#det_inventory_pgoodsCount").html(_pgoodsCount);
	$("#det_inventory_rgoodsCount").html(Math.abs(_rgoodsCount));
}

function delete_inventory(index) {
	var data = {
		"inventory.id" : inventoryList[index].id
	};
	ajaxSend("WechatBossInventory_deleteInventory", data, "GET", "JSON", true, "_init_inventory_list");
}

// 开始盘点 start

function _add_inventory() {
	clear_inventory();
}

/*----------------门店js开始------------------*/
function _select_inventory_shop() {
	ajaxSend("WechatBossInventory_shopSelect", null, "GET", "JSON", true, "_init_listview_inventory_shop");
}

function _init_listview_inventory_shop(data) {
	var add_listview_inventory_shop = $("#add_listview_inventory_shop");
	add_listview_inventory_shop.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		liEle = $("<li class='x_win' onclick=\"add_inventory_shop('" + data[i].shopCode + "', '" + data[i].shopName + "'," + data[i].onlineStatus + ")\">"
				+ data[i].shopName + "</li>");
		add_listview_inventory_shop.append(liEle);
	}
	refresh_node('select_inventory_shop_box');
}

function add_inventory_shop(shopCode, shopName) {
	$('#span_inventory_shop_name').html(shopName);
	$('#input_inventory_shop_code').val(shopCode);
}
/*----------------门店js结束------------------*/

/*----------------搜索商品js开始------------------*/
function _select_inventory_commodity() {
	oKeyABC('#input_search_inventory_goods');
}

var searchGoodsJson = new Array();
function search_inventory_goods() {
	var searchGoods = $('#input_search_inventory_goods').val();
	var shopCode = $('#input_inventory_shop_code').val();
	var data = {
		"commodityName" : searchGoods,
		"shopCode" : shopCode
	};
	ajaxSend("WechatBossInventory_commoditySelect", data, "GET", "JSON", true, "_init_listview_inventory_goods");
}

function input_search_inventory_goods(value) {
	$('#input_search_inventory_goods').val(value);
	if (value != "") {
		search_inventory_goods();
	} else {
		clear_inventory_goods();
	}
}

function clear_inventory_goods() {
	var searchText = $('#input_search_inventory_goods').val();
	if (searchText == "") {
		$('#listview_inventory_goods').empty();
	}
}

function _init_listview_inventory_goods(data) {
	var listview_goodsEle = $("#listview_inventory_goods");
	listview_goodsEle.empty();
	searchGoodsJson = data;
	for (var i = 0; i < data.length; i++) {
		var goodsName = data[i].commodityName;
		var goodsPrice = data[i].commodityPrice;
		var totalNumber = data[i].totalNumber;
		var remarks = data[i].remarks;

		var liEle = $("<li onclick='_select_inventory_goods_Name(" + i + ")'></li>");
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
	refresh_node('select_inventory_goods_box');
}

function _select_inventory_goods_Name(index) {
	var goods = searchGoodsJson[index];
	add_inventory_goods(goods);
}
/*----------------搜索商品js结束------------------*/

function add_inventory_goods(_goods) {
	if (_check_repeat_inventory_goods(_goods.commodityCode)) {
		return false;
	}
	currGoods = {
		"goodsCode" : _goods.commodityCode,
		"goodsName" : _goods.commodityName,
		"goodsCount" : 1,
		"goodsPrice" : _goods.commodityPrice,
		"referencePrice" : _goods.referencePrice,
		"actualPurchasePrice" : _goods.unitPrice,
		"goodsTotal" : 1 * parseFloat(_goods.commodityPrice)
	};

	var _tmp_gsa = new Array();
	_tmp_gsa[_tmp_gsa.length] = currGoods;
	goodsArray = _tmp_gsa.concat(goodsArray);

	// goodsArray[goodsArray.length] = currGoods;
	// var index = goodsArray.length - 1;
	_create_listview_inventory_goods_unit();

}

function _check_repeat_inventory_goods(goodsCode) {
	for (var i = 0; i < goodsArray.length; i++) {
		if (goodsArray[i].goodsCode == goodsCode) {
			alert("您已添加此商品！");
			return true;
		}
	}
	return false;
}

function _create_listview_inventory_goods_unit() {
	$("#inventory_goods_listview").empty();
	for (var i = 0; i < goodsArray.length; i++) {
		var goodsCode = goodsArray[i].goodsCode;
		var goodsName = goodsArray[i].goodsName;
		var goodsCount = goodsArray[i].goodsCount;
		var goodsPrice = goodsArray[i].goodsPrice;
		var goodsTotal = parseInt(goodsArray[i].goodsCount) * parseFloat(goodsArray[i].goodsPrice);

		var liEle = $("<li class='move_del'></li>");
		var ew_divEle = $("<div class='o_win ew ew-mw15x' data-load='_inventory_edit_goods' onclick=_init_inventory_edit_goods(" + i + ")></div>");
		// var gimg_divEle = $("<div class='goods-img nr20x'
		// style='background-image:url(imgs/goods1.jpg)'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + goodsName + "</h6>");
		var pcEle = $("<p class='co-info sm'>单价：<span class='goods-price co-warn'  id='_goodsPrice_" + goodsCode + "'>" + goodsPrice + " / 件</span></p>");
		var ppEle = $("<p class='co-info sm'>小计：<span class='goods-price co-warn' id='_goodsTotal_" + goodsCode + "'>" + goodsTotal + "</span></p>");

		var en_ulEle = $("<ul class='edit-number'></ul>");
		var jian_liEle = $("<li class='jian' onclick='_inventory_jian_number(" + i + ")'><i class='icon icon-minus'></i></li>");
		var buy_num_liEle = $("<li class='value gBuyNum' id='_buy_num_" + goodsCode + "'>" + goodsCount + "</li>");
		var jia_liEle = $("<li class='jia' onclick='_inventory_jia_number(" + i + ")'><i class='icon icon-plus'></i></li>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='_delete_listview_inventory_goods_unit(" + i
				+ ")'><i class='icon icon-delete'></i></div>");

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

		$("#inventory_goods_listview").append(liEle);
	}
	_init_inventory_goodsCount();
	refresh_node('inventory_box');
}

function _delete_listview_inventory_goods_unit(_index) {
	goodsArray.splice(_index, 1);
	_init_inventory_goodsCount();
	_create_listview_inventory_goods_unit();
}

/**
 * 减商品数量
 * 
 * @param index
 */
function _inventory_jian_number(index) {
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

	_init_inventory_goodsCount();
}

/**
 * 加商品数量
 * 
 * @param index
 */
function _inventory_jia_number(index) {
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
	_init_inventory_goodsCount();
}

/**
 * 初始化进退数量
 */
function _init_inventory_goodsCount() {
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

function _init_inventory_edit_goods(index) {
	currEditGoodsIndex = index;
}

/**
 * 初始化订单货品页面
 */
function _inventory_edit_goods() {
	// $("#edit_goods_count").focus(function() {
	// $('#edit_goods_count').val("");
	// });
	if (currEditGoodsIndex != undefined) {
		$("#edit_goods_name").html(goodsArray[currEditGoodsIndex].goodsName);
		$("#edit_goods_price_old").html(goodsArray[currEditGoodsIndex].goodsPrice + " / 件");
		$("#edit_goods_count").val(goodsArray[currEditGoodsIndex].goodsCount);
		oKey123("#edit_goods_count");
		$("#edit_goods_count").focus();
		currGoods = goodsArray[currEditGoodsIndex];
	}
	currEditGoodsIndex = undefined;
}

/**
 * 确认修改货单信息
 * 
 * @param index
 */
function update_inventory_goods() {
	var _buy_num = $("#edit_goods_count").val();
	if (_buy_num == "" || _buy_num == 0) {
		_buy_num = 1;
	}
	currGoods.goodsCount = _buy_num;
	currGoods.goodsTotal = _buy_num * currGoods.goodsPrice;
	$("#_goodsTotal_" + currGoods.goodsCode).html(currGoods.goodsTotal);
	$("#_buy_num_" + currGoods.goodsCode).html(_buy_num);
	_init_inventory_goodsCount();
}

function _save_inventory() {
	$('#inventory_total_amount').html(currTotalAmount);
	if (currTotalAmount > 0) {
		$('#inventory_status').html("盘盈");
	} else {
		$('#inventory_status').html("盘亏");
	}
}

function add_inventory_remarks() {
	var remarks = $('#add_inventory_remarks').val();
	if (validator_remarks(remarks)) {
		$('#inventory_remarks').html(remarks);
	}
}

function save_inventory() {
	currTotalAmount = $('#inventory_total_amount').html();
	var inventory_remarks = $('#inventory_remarks').html();
	var shopName = $('#span_inventory_shop_name').html();
	var shopCode = $('#input_inventory_shop_code').val();
	if (shopCode != "" && goodsArray.length != 0) {
		var prdatasJson = "[";
		for (var i = 0; i < goodsArray.length; i++) {
			var gdJson = "{";
			gdJson = gdJson + "\"commodityCode\":\"" + goodsArray[i].goodsCode + "\","
			gdJson = gdJson + "\"commodityName\":\"" + goodsArray[i].goodsName + "\","
			gdJson = gdJson + "\"totalNumber\":\"" + goodsArray[i].goodsCount + "\","
			gdJson = gdJson + "\"commodityPrice\":\"" + goodsArray[i].goodsPrice + "\","
			gdJson = gdJson + "\"referencePrice\":\"" + goodsArray[i].referencePrice + "\","
			gdJson = gdJson + "\"actualPurchasePrice\":\"" + goodsArray[i].actualPurchasePrice + "\","
			gdJson = gdJson + "}";
			prdatasJson = prdatasJson + gdJson;
			if (i != goodsArray.length - 1) {
				prdatasJson = prdatasJson + ","
			}
		}
		prdatasJson = prdatasJson + "]";

		var data = {
			"inventoryRecordJsons" : prdatasJson,
			"inventory.shopCode" : shopCode,
			"inventory.shopName" : shopName,
			"inventory.totalAmount" : currTotalAmount,
			"inventory.remarks" : inventory_remarks
		};
		// alert(JSON.stringify(data));
		ajaxSend("WechatBossInventory_addInventory", data, "GET", "JSON", true, "_save_inventory_callback");
	} else {
		alert("没有选择门店！");
	}
}

function _save_inventory_callback(data) {
	if (data.resultCode == "100101") {
		clear_inventory();
		_init_inventory_list();
	}
}

function clear_inventory() {
	currGoods = undefined;
	goodsArray.splice(0, goodsArray.length);
	currTotalAmount = undefined;
	currEditGoodsIndex = undefined;
	$("#inventory_goods_listview").empty();
	$("#pgoodsCount").html(0);
	$("#rgoodsCount").html(0);
	$("#span_total_amount").html("￥0");
	$('#span_inventory_shop_name').html("选择门店");
	$('#input_inventory_shop_code').val("");
}

// 开始盘点 end

