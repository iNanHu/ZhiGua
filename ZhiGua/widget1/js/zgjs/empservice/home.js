function home() {
	_init_shopSalesTrends2Echarts();
	shopTotalSales_D();
	shopTotalSales_M();
	shopTotalSales_Y();
}
var _shopSalesTrends_myChart = undefined;
var _shopTotalSales_X_myChart = undefined;
var shopTotalSales_D_data = undefined;
var shopTotalSales_M_data = undefined;
var shopTotalSales_Y_data = undefined;
var shopTotalSales_data = undefined;
var stsType = undefined;
function _init_shopSalesTrends2Echarts() {
	ajaxSend("WechatEmpStatistics_shopSalesTrends2Echarts", null, "get", "JSON", true, "_shopSalesTrends_callback");
}

function _shopSalesTrends_callback(data) {
	_shopSalesTrends_myChart = echarts.init(document.getElementById('shopSalesTrends_echarts'));
	option = {
		tooltip : {
			trigger : 'axis',
			axisPointer : { // 坐标轴指示器，坐标轴触发有效
				type : 'shadow' // 默认为直线，可选为：'line' | 'shadow'
			},
			textStyle : {
				fontSize : 22
			}

		},
		grid : {
			left : '5%',
			right : '4%',
			bottom : '5%',
			containLabel : true
		},
		xAxis : [ {
			type : 'category',
			data : data.xAxisData,
			axisTick : {
				alignWithLabel : true
			},
			axisLabel : {
				show : true,
				interval : 0, // {number}
				margin : 10,
				textStyle : {
					color : "#fff",
					fontSize : 22
				}
			},
			axisLine : {
				lineStyle : {
					color : 'rgba(255,255,255,.5)'
				}
			}
		} ],
		yAxis : [ {
			type : 'value',
			axisLabel : {
				textStyle : {
					color : "#fff",
					fontSize : 22
				}
			},
			axisLine : {
				lineStyle : {
					color : 'rgba(255,255,255,.5)'
				}
			},
			splitLine : {
				lineStyle : {
					color : 'rgba(255,255,255,.3)'
				}
			}
		} ],
		series : [ {
			name : '日销售额',
			type : 'bar',
			barWidth : '60%',
			data : data.seriesDaySalesData
		} ],
		backgroundColor : '#1bc0ff',
		textStyle : {
			color : '#fff'
		},
		itemStyle : {
			normal : {
				color : 'rgba(255,255,255,.9)',
			}
		}
	};

	_shopSalesTrends_myChart.setOption(option);
}

function shopTotalSales_D() {
	var data = {
		"stsType" : "D"
	};
	ajaxSend("WechatEmpStatistics_shopTotalSales", data, "get", "JSON", true, "_shopTotalSales_D_callback");
}

function _shopTotalSales_D_callback(data) {
	shopTotalSales_D_data = data;
	$('#shopTotalSales_D').html(data.sales);
}

function shopTotalSales_M() {
	var data = {
		"stsType" : "M"
	};
	ajaxSend("WechatEmpStatistics_shopTotalSales", data, "get", "JSON", true, "_shopTotalSales_M_callback");
}

function _shopTotalSales_M_callback(data) {
	shopTotalSales_M_data = data;
	$('#shopTotalSales_M').html(data.sales);
}

function shopTotalSales_Y() {
	var data = {
		"stsType" : "Y"
	};
	ajaxSend("WechatEmpStatistics_shopTotalSales", data, "get", "JSON", true, "_shopTotalSales_Y_callback");
}

function _shopTotalSales_Y_callback(data) {
	shopTotalSales_Y_data = data;
	$('#shopTotalSales_Y').html(data.sales);
	$('#home_shop_name').html(data.shopName);
}

function set_shopTotalSales_(_stsType) {
	stsType = _stsType;
	if (stsType == "D") {
		shopTotalSales_data = shopTotalSales_D_data;
	} else if (stsType == "M") {
		shopTotalSales_data = shopTotalSales_M_data;
	} else if (stsType == "Y") {
		shopTotalSales_data = shopTotalSales_Y_data;
	}
}

function _shop_sales_echarts() {
	_shopTotalSales_X_myChart = echarts.init(document.getElementById('shopTotalSales_X'));
	var subText = "";
	if (stsType == "D") {
		subText = "今日";
	} else if (stsType == "M") {
		subText = "本月";
	} else if (stsType == "Y") {
		subText = "本年";
	}
	var option = {
		title : {
			text : subText + '销售额统计',
			subtext : '(智瓜科技)',
			left : '3%',
			top : '1%',
			textStyle : {
				fontSize : 26
			},
			subtextStyle : {
				color : '#aaa',
				fontSize : 20
			}
		},
		tooltip : {
			trigger : 'axis',
			axisPointer : {
				type : 'shadow'
			},
			textStyle : {
				fontSize : 26
			}
		},
		grid : {
			left : '5%',
			right : '10%',
			top : '13%',
			bottom : '5%',
			containLabel : true
		},
		legend : {
			data : [ '销售总金额', '实收总金额', '优惠总金额' ],
			top : '9%',
			textStyle : {
				fontSize : 22
			}
		},
		xAxis : {
			type : 'value',
			boundaryGap : [ 0, 0.01 ],
			axisLabel : {
				textStyle : {
					fontSize : 22
				}
			},
		},
		yAxis : {
			type : 'category',
			data : [ shopTotalSales_data.shopName ],
			axisLabel : {
				rotate : 90,
				textStyle : {
					fontSize : 26
				}
			},
		},
		series : [ {
			name : '销售总金额',
			type : 'bar',
			data : [ shopTotalSales_data.sales ],
			itemStyle : {
				normal : {
					color : '#93e354'
				}
			}
		}, {
			name : '实收总金额',
			type : 'bar',
			data : [ shopTotalSales_data.actualPayment ],
			itemStyle : {
				normal : {
					color : '#1cc0ff'
				}
			}
		}, {
			name : '优惠总金额',
			type : 'bar',
			data : [ shopTotalSales_data.discountPay ],
			itemStyle : {
				normal : {
					color : '#ffba46'
				}
			}
		} ]
	};
	_shopTotalSales_X_myChart.setOption(option);
}

/*----------------挂单列表js开始------------------*/
var homeOrderList = new Array();
function _home_hang_bill() {
	ajaxSend("WechatEmpBilling_hangBillList", null, "GET", "JSON", true, "_home_hang_bill_list");
}

function _home_hang_bill_list(data) {
	orderList = data;
	var home_listview_hang_bill_list = $('#home_listview_hang_bill_list');
	home_listview_hang_bill_list.empty();
	for (var i = 0; i < data.length; i++) {
		var liEle;
		var divEle;
		var h5Ele = $("<h5 class='v2e5 co-read'>客户 ：<span>" + data[i].customerName + "</span></h5>");
		var pc_Ele = $("<p>开单员：<span>" + data[i].creator + "</span></p>");
		var pct_Ele = $("<p>开单时间：<span>" + data[i].createTime + "</span></p>");
		var ps_Ele;
		var del_divEle;
		if (data[i].orderStatus == 1) {
			if (employeeJson.employeeId == data[i].operatorId) {
				liEle = $("<li></li>");
				divEle = $("<div class='o_win' data-load='_billing'></div>");
				ps_Ele = $("<p>状态：<span style='font-size: 40px;color: red;'>" + data[i].operator + "</span><span>正在操作中......</span></p>");
				del_divEle = "";
			} else {
				liEle = $("<li></li>");
				divEle = $("<div></div>");
				ps_Ele = $("<p>状态：<span style='font-size: 40px;color: red;'>" + data[i].operator + "</span><span>正在操作中......</span></p>");
				del_divEle = "";
			}
		} else if (data[i].orderStatus == 0) {
			liEle = $("<li class='move_del'></li>");
			divEle = $("<div  class='o_win' data-load='_billing' onclick='_init_order(" + i + ")'></div>");
			ps_Ele = $("<p>状态：<span>挂单中......</span></p>");
			del_divEle = $("<div class='move-del-nav del_list' onclick='_delete_home_hang_bill(" + i + ")'><i class='icon icon-delete'></i></div>");
		}
		liEle.append(divEle);
		divEle.append(h5Ele);
		divEle.append(pc_Ele);
		divEle.append(pct_Ele);
		divEle.append(ps_Ele);
		liEle.append(del_divEle);
		home_listview_hang_bill_list.append(liEle);
	}
	refresh_node('home_hang_bill_box');
}

function _delete_home_hang_bill(_index) {
	ajaxSend("WechatEmpBilling_deleteHangBill", "order.id=" + orderList[_index].id, "GET", "JSON", true, null);
	orderList.splice(_index, 1);
	_hang_bill_list(orderList);
}
