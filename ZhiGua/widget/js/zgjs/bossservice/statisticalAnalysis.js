/** ************库存统计****************** */
function _stock_shop() {
	ajaxSend("WechatBossStatistics_shopList", null, "GET", "JSON", true, "_init_stock_shop_list");
}

function _init_stock_shop_list(data) {
	var stock_listview_shop = $("#stock_listview_shop");
	stock_listview_shop.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li class='o_win' data-load='_commodity_stock' onclick=\"select_stock_shop('" + data[i].shopCode + "')\">" + data[i].shopName + "</li>");
		stock_listview_shop.append(liEle);
	}
	refresh_node('stock_shop_box');
}

var stock_shopCode = undefined;
function select_stock_shop(shopCode) {
	stock_shopCode = shopCode;
}

function _commodity_stock() {
	_init_commodity_stock_list()
}

function _init_commodity_stock_list() {
	var where = $('#input_search_commodity_stock').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : where,
		"shopCode" : stock_shopCode
	};
	ajaxSend("WechatBossStatistics_commodityStockList", data, "GET", "JSON", true, "_commodity_stock_list");
}

function search_commodity_stock() {
	_init_commodity_stock_list();
}

function input_search_commodity_stock(value) {
	$('#input_search_commodity_stock').val(value);
	search_commodity_stock();
}

function _commodity_stock_list(data) {
	commodityStockList = data.rows;
	var listview_commodity_stock_list = $('#listview_commodity_stock_list');
	listview_commodity_stock_list.empty();
	for (var i = 0; i < commodityStockList.length; i++) {
		var liEle = $("<li ></li>");
		var ew_divEle = $("<div class='ew ew-mw1e'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + commodityStockList[i].commodityName + "</h6>");
		var pcEle = $("<p class='co-info ss'>库存：<span>" + commodityStockList[i].totalNumber + commodityStockList[i].unitName + "</span></p>");
		var ppEle = $("<p class='co-info ss'>零售价：<span class='goods-price co-warn'>" + commodityStockList[i].commodityPrice + " / "
				+ commodityStockList[i].unitName + "</span></p>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);
		listview_commodity_stock_list.append(liEle);
	}
	refresh_node('commodity_stock_box');
}
/** ************库存统计****************** */

/** ************门店销售统计****************** */
function _search_statistical_year(value) {
	$('#_search_statistical_year').val(value);
}

function _search_statistical_month(value) {
	$('#_search_statistical_month').val(value);
}

var _search_s_year = -1;
var _search_s_month = -1;
/**
 * 0表示销售统计，1表示客户统计，2表示商品统计，3表示员工统计
 */
var _statistical_type = 0;
function set_statistical_type(value) {
	_statistical_type = value;
}

function set_statistical_year_month(value) {
	if (value != 1) {
		_search_s_year = $('#_search_statistical_year').val();
		_search_s_month = $('#_search_statistical_month').val();
	} else {
		_search_s_year = -1;
		_search_s_month = -1;
	}

	if (_statistical_type == 0) {
		_shop_sales_statistical();
	} else if (_statistical_type == 1) {
		_customer_sales_statistical();
	} else if (_statistical_type == 2) {
		_commodity_sales_statistical();
	} else if (_statistical_type == 3) {
		_employee_sales_statistical();
	}
}

function _shop_sales_statistical() {
	var data = null;
	if (_search_s_year != "-1") {
		data = {
			"year" : _search_s_year,
			"month" : _search_s_month
		};
	}
	ajaxSend("WechatBossStatistics_shopSalesList", data, "GET", "JSON", true, "_init_shop_sales_statistical");
}

function _init_shop_sales_statistical(data) {
	var listview_shopSales_list = $('#listview_shopSales_list');
	listview_shopSales_list.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle = $("<li ></li>");
		var ew_divEle = $("<div class='ew ew-mw1e'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + data[i].shopName + "</h6>");
		var pcEle = $("<p class='co-info ss'>总销售额：<span class='goods-price co-warn'>" + data[i].sales + "</span></p>");
		var ppEle = $("<p class='co-info ss'>总利润：<span class='goods-price co-warn'>" + data[i].profit + "</span></p>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);
		listview_shopSales_list.append(liEle);
	}
	refresh_node('shopSales_box');
}

/** ************门店销售统计****************** */

/** ************客户销售统计****************** */
function _customer_sales_statistical() {
	var where = $('#input_search_customerSales').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : where,
	};
	if (_search_s_year != "-1") {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : where,
			"year" : _search_s_year,
			"month" : _search_s_month
		};
	}
	ajaxSend("WechatBossStatistics_customerSalesList", data, "GET", "JSON", true, "_customer_sales_statistical_list");
}

function search_customer_sales_statistical() {
	_customer_sales_statistical();
}

function input_search_customerSales(value) {
	$('#input_search_customerSales').val(value);
	search_customer_sales_statistical();
}

function _customer_sales_statistical_list(data) {
	customerSalesList = data.rows;
	var listview_customerSales_list = $('#listview_customerSales_list');
	listview_customerSales_list.empty();
	for (var i = 0; i < customerSalesList.length; i++) {
		var liEle = $("<li ></li>");
		var ew_divEle = $("<div class='ew ew-mw1e'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + customerSalesList[i].customerName + "</h6>");
		var pcEle = $("<p class='co-info ss'>总交易额：<span class='goods-price co-warn'>" + customerSalesList[i].sales + "</span></p>");
		var ppEle = $("<p class='co-info ss'>当前欠款：<span class='goods-price co-warn'>" + customerSalesList[i].currdebts + "</span></p>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);
		listview_customerSales_list.append(liEle);
	}
	refresh_node('customerSales_box');
}

/** ************客户销售统计****************** */

/** ************商品销售统计****************** */
function _commodity_sales_statistical() {
	var where = $('#input_search_commoditySales').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : where,
	};
	if (_search_s_year != "-1") {
		data = {
			"page" : 1,
			"pageSize" : 20,
			"where" : where,
			"year" : _search_s_year,
			"month" : _search_s_month
		};
	}
	ajaxSend("WechatBossStatistics_commidtySalesList", data, "GET", "JSON", true, "_commodity_sales_statistical_list");
}

function search_commodity_sales_statistical() {
	_commodity_sales_statistical();
}

function input_search_commoditySales(value) {
	$('#input_search_commoditySales').val(value);
	search_commodity_sales_statistical();
}

function _commodity_sales_statistical_list(data) {
	commoditySalesList = data.rows;
	var listview_commoditySales_list = $('#listview_commoditySales_list');
	listview_commoditySales_list.empty();
	for (var i = 0; i < commoditySalesList.length; i++) {
		var liEle = $("<li ></li>");
		var ew_divEle = $("<div class='ew ew-mw1e'></div>");
		var divEle = $("<div></div>");
		var h6Ele = $(" <h6 class='goods-name mb15x'>" + commoditySalesList[i].commodityName + "</h6>");
		var pcEle = $("<p class='co-info ss'>总销售额：<span class='goods-price co-warn'>" + commoditySalesList[i].sales + "</span></p>");
		var ppEle = $("<p class='co-info ss'>总利润：<span class='goods-price co-warn'>" + commoditySalesList[i].profit + "</span></p>");
		var ptEle = $("<p class='co-info ss'>总数量：<span>" + commoditySalesList[i].totalNumber + "</span></p>");

		liEle.append(ew_divEle);
		ew_divEle.append(divEle);
		divEle.append(h6Ele);
		divEle.append(pcEle);
		divEle.append(ppEle);
		divEle.append(ptEle);
		listview_commoditySales_list.append(liEle);
	}
	refresh_node('commoditySales_box');
}

/** ************商品销售统计****************** */

/** ************员工销售统计****************** */
function _employee_sales_statistical() {
	var data = null;
	if (_search_s_year != "-1") {
		data = {
			"year" : _search_s_year,
			"month" : _search_s_month
		};
	}
	ajaxSend("WechatBossStatistics_employeeSalesList", data, "GET", "JSON", true, "_init_employee_sales_statistical");
}

function _init_employee_sales_statistical(data) {
	var listview_employeeSales_list = $('#listview_employeeSales_list');
	listview_employeeSales_list.empty();
	for (var i = 0; i < data.length; i++) {
		if (data[i].employeeName != null) {
			var liEle = $("<li ></li>");
			var ew_divEle = $("<div class='ew ew-mw1e'></div>");
			var divEle = $("<div></div>");
			var h6Ele = $(" <h6 class='goods-name mb15x'>" + "[" + data[i].shopName + "]" + data[i].employeeName + "</h6>");
			var pcEle = $("<p class='co-info ss'>总销售额：<span class='goods-price co-warn'>" + data[i].sales + "</span></p>");
			var ppEle = $("<p class='co-info ss'>总利润：<span class='goods-price co-warn'>" + data[i].profit + "</span></p>");

			liEle.append(ew_divEle);
			ew_divEle.append(divEle);
			divEle.append(h6Ele);
			divEle.append(pcEle);
			divEle.append(ppEle);
			listview_employeeSales_list.append(liEle);
		}
	}
	refresh_node('employeeSales_box');
}

/** ************员工销售统计****************** */
