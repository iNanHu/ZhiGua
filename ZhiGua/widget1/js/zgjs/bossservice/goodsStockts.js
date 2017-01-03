/*----------------门店js开始------------------*/
function _gsts_select_shop() {
	ajaxSend("WechatBossPRorder_shopSelect", null, "GET", "JSON", true, "_init_listview_gsts_shop");
}

function _init_listview_gsts_shop(data) {
	var gsts_add_listview_shop = $("#gsts_add_listview_shop");
	gsts_add_listview_shop.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = "";
		liEle = $("<li class='x_win' onclick=\"gsts_add_shop('" + data[i].shopCode + "', '" + data[i].shopName + "'," + data[i].onlineStatus + ")\">"
				+ data[i].shopName + "</li>");
		gsts_add_listview_shop.append(liEle);
	}
	refresh_node('gsts_select_shop_box');
}

function gsts_add_shop(shopCode, shopName) {
	$('#goodsStockts_shopName').html(shopName);
	$('#goodsStockts_shopCode').val(shopCode);
}
/*----------------门店js结束------------------*/

/*----------------搜索商品js开始------------------*/
function _gsts_select_commodity() {
	oKeyABC('#input_search_gsts_goods');
}

function gsts_search_goods() {
	var searchGoods = $('#input_search_gsts_goods').val();
	var shopCode = $('#goodsStockts_shopCode').val();
	var data = {
		"commodityName" : searchGoods,
		"shopCode" : shopCode
	};
	ajaxSend("WechatBossPRorder_commoditySelect", data, "GET", "JSON", true, "_init_listview_gsts_goods");
}

function input_search_gsts_goods(value) {
	$('#input_search_gsts_goods').val(value);
	if (value != "") {
		gsts_search_goods();
	} else {
		clear_gsts_goods();
	}
}

function clear_gsts_goods() {
	var searchText = $('#input_search_gsts_goods').val();
	if (searchText == "") {
		$('#gsts_listview_goods').empty();
	}
}

function _init_listview_gsts_goods(data) {
	var gsts_listview_goods = $("#gsts_listview_goods");
	gsts_listview_goods.empty();
	searchGoodsJson = data;
	for (var i = 0; i < data.length; i++) {
		var goodsName = data[i].commodityName;
		var goodsPrice = data[i].commodityPrice;
		var totalNumber = data[i].totalNumber;
		var remarks = data[i].remarks;

		var liEle = $("<li onclick='_gsts_select_goods_Name(" + i + ")'></li>");
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
		gsts_listview_goods.append(liEle);
	}
	refresh_node('gsts_select_goods_box');
}

function _gsts_select_goods_Name(index) {
	$('#goodsStockts_commodityName').html(searchGoodsJson[index].commodityName);
	$('#goodsStockts_commodityCode').val(searchGoodsJson[index].commodityCode);
	checkCAmap(searchGoodsJson[index].commodityCode);
}

function checkCAmap(commodityCode) {
	var data = {
		"stockDto.stsId" : currStockts.id,
		"stockDto.supplierCommodityCode" : currStockts.commodityCode,
		"stockDto.commodityCode" : commodityCode
	};
	ajaxSend("WechatBossGoodsStockts_checkCAmap", data, "GET", "JSON", true, "_checkCAmap_callback");
}

function _checkCAmap_callback(data) {
	if (data.resultCode == "210401") {
		$('#goodsStockts_commodityName').append("（此商品已被关联）");
	}
}

/*----------------搜索商品js结束------------------*/
var stocktsList = new Array();
var currStockts = undefined;
function _goods_stockts() {
	ajaxSend("WechatBossGoodsStockts_stockTransferStationList", null, "GET", "JSON", true, "_goods_stockts_list");
}

function _goods_stockts_list(data) {
	stocktsList = data;
	var listview_goods_stockts_list = $('#listview_goods_stockts_list');
	listview_goods_stockts_list.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='move_del'></li>");
		var divEle = $("<div class='o_win' data-load='_goods_ware_housing' onclick='_set_goodsStockts_id(" + i + ")'></div>");
		var h5Ele = $("<h5 class='v2e5 co-read'>商品名称 ：<span>" + data[i].commodityName + "</span></h5>");
		var pm_Ele = $("<p>供应商：<span>" + data[i].merchantName + "</span></p>");
		var pt_Ele = $("<p>数量：<span>" + data[i].totalNumber + "</span></p>");
		var pp_Ele = $("<p>进价：<span>" + data[i].price + "</span></p>");
		var pct_Ele = $("<p>供货时间：<span>" + data[i].createTime + "</span></p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='_delete_goodsStockts(" + i + ")'><i class='icon icon-delete'></i></div>");
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(pm_Ele);
		divEle.append(pt_Ele);
		divEle.append(pp_Ele);
		divEle.append(pct_Ele);
		liEle.append(del_divEle);
		listview_goods_stockts_list.append(liEle);
	}
	refresh_node('goods_stockts_box');
}

function _set_goodsStockts_id(index) {
	currStockts = stocktsList[index];
}

function getCommodityAssociationInfo() {
	var data = {
		"stockDto.supplierCommodityCode" : currStockts.commodityCode
	};
	ajaxSend("WechatBossGoodsStockts_getCommodityAssociationInfo", data, "GET", "JSON", true, "_getCAInfo_callback");
}

function _getCAInfo_callback(data) {
	if (data.resultCode == "210301") {
		$('#_gsts_select_commodity').removeClass("o_win");
		$('#_gsts_select_commodity').removeAttr("data-load");
		$('#goodsStockts_commodityName').html(data.commodityName);
		$('#goodsStockts_commodityCode').val(data.commodityCode);
	}
}

function _goods_ware_housing() {
	getCommodityAssociationInfo();
	$('#goodsStockts_name').html(currStockts.commodityName);
	$('#goodsStockts_count').html(currStockts.totalNumber);
	$('#goodsStockts_price').html(currStockts.price);
}

function _gsts_add_count() {
	oKey123('#m_goodsStockts_count');
}

function m_goodsStockts_count(value) {
	if (value == "" || value == "-") {
		$('#m_goodsStockts_count').val(value);
	} else {
		if (/^(-)?\d+$/.test(value)) {
			$('#m_goodsStockts_count').val(parseInt(value));
		}
	}
}

function goodsStockts_count() {
	var value = $('#m_goodsStockts_count').val();
	if (value <= currStockts.totalNumber) {
		$('#goodsStockts_count').html(value);
	} else {
		$('#goodsStockts_count').html(currStockts.totalNumber);
	}
}

function _gsts_add_price() {
	oKey123('#m_goodsStockts_price');
}

function m_goodsStockts_price(value) {
	if (value == "") {
		$('#m_goodsStockts_price').val(value);
	}
	if (/^\d{0,19}\.\d{0,2}$|^\d{0,19}$/.test(value)) {
		$('#m_goodsStockts_price').val(value);
	}
}

function goodsStockts_price() {
	var value = $('#m_goodsStockts_price').val();
	$('#goodsStockts_price').html(value);
}

function _gsts_add_remarks() {

}

function gsts_add_remarks() {
	var value = $('#m_gsts_add_remarks').val();
	if (validator_remarks(value)) {
		$('#gsts_add_remarks').html(value);
		close_win();
	}
}

function goodsWarehousing() {
	var goodsStockts_shopCode = $('#goodsStockts_shopCode').val();
	if(goodsStockts_shopCode==""){
		window.wxc.xcConfirm("请选择门店！", "info", null);
		return false;
	}
	var goodsStockts_shopName = $('#goodsStockts_shopName').html();
	var goodsStockts_commodityCode = $('#goodsStockts_commodityCode').val();
	if(goodsStockts_commodityCode==""){
		window.wxc.xcConfirm("请选择商品！", "info", null);
		return false;
	}
	var goodsStockts_commodityName = $('#goodsStockts_commodityName').html();
	var goodsStockts_count = $('#goodsStockts_count').html();
	if(goodsStockts_count==""){
		window.wxc.xcConfirm("请填写数量！", "info", null);
		return false;
	}
	var goodsStockts_price = $('#goodsStockts_price').html();
	if(goodsStockts_price==""){
		window.wxc.xcConfirm("请填写价格！", "info", null);
		return false;
	}
	var gsts_add_remarks = $('#gsts_add_remarks').html();
	var data = {
		"stockDto.stsId" : currStockts.id,
		"stockDto.supplierCommodityCode" : currStockts.commodityCode,
		"stockDto.shopCode" : goodsStockts_shopCode,
		"stockDto.shopName" : goodsStockts_shopName,
		"stockDto.commodityCode" : goodsStockts_commodityCode,
		"stockDto.commodityName" : goodsStockts_commodityName,
		"stockDto.count" : goodsStockts_count,
		"stockDto.price" : goodsStockts_price,
		"stockDto.remarks" : gsts_add_remarks
	};

	// alert(JSON.stringify(data));
	ajaxSend("WechatBossGoodsStockts_goodsWarehousing", data, "POST", "JSON", true, "_goodsWarehousing_callback");
	close_win();
}

function _goodsWarehousing_callback(data) {
	if (data.resultCode == '230101') {
		_goods_stockts();
	} else {
		// 失败
	}
}

function _delete_goodsStockts(index) {
	var data = {
		"stockDto.stsId" : stocktsList[index].id
	};
	ajaxSend("WechatBossGoodsStockts_deleteStockTransferStation", data, "GET", "JSON", true, "_goods_stockts");
}
