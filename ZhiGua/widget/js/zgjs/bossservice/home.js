function home() {
	_init_merchantSalesTrends2Echarts();
	merchantTotalSales_D();
	merchantTotalSales_M();
	merchantTotalSales_Y();
}
var _merchantSalesTrends_myChart = undefined;
var _merchantTotalSales_X_myChart = undefined;
var merchantTotalSales_D_data = undefined;
var merchantTotalSales_M_data = undefined;
var merchantTotalSales_Y_data = undefined;
var merchantTotalSales_data = undefined;
var stsType = undefined;
function _init_merchantSalesTrends2Echarts() {
	ajaxSend("WechatBossStatistics_merchantSalesTrends2Echarts", null, "get", "JSON", true, "_merchantSalesTrends_callback");
}

function _merchantSalesTrends_callback(data) {
	_merchantSalesTrends_myChart = echarts.init(document.getElementById('merchantSalesTrends_echarts'));
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

	_merchantSalesTrends_myChart.setOption(option);
}

function merchantTotalSales_D() {
	var data = {
		"stsType" : "D"
	};
	ajaxSend("WechatBossStatistics_merchantTotalSales", data, "get", "JSON", true, "_merchantTotalSales_D_callback");
}

function _merchantTotalSales_D_callback(data) {
	var sales = 0.0;
	for (var i = 0; i < data.length; i++) {
		sales = sales + parseFloat(data[i].sales);
	}
	merchantTotalSales_D_data = data;
	$('#merchantTotalSales_D').html(sales);
}

function merchantTotalSales_M() {
	var data = {
		"stsType" : "M"
	};
	ajaxSend("WechatBossStatistics_merchantTotalSales", data, "get", "JSON", true, "_merchantTotalSales_M_callback");
}

function _merchantTotalSales_M_callback(data) {
	var sales = 0.0;
	for (var i = 0; i < data.length; i++) {
		sales = sales + parseFloat(data[i].sales);
	}
	merchantTotalSales_M_data = data;
	$('#merchantTotalSales_M').html(sales);
}

function merchantTotalSales_Y() {
	var data = {
		"stsType" : "Y"
	};
	ajaxSend("WechatBossStatistics_merchantTotalSales", data, "get", "JSON", true, "_merchantTotalSales_Y_callback");
}

function _merchantTotalSales_Y_callback(data) {
	var sales = 0.0;
	for (var i = 0; i < data.length; i++) {
		sales = sales + parseFloat(data[i].sales);
	}
	merchantTotalSales_Y_data = data;
	$('#merchantTotalSales_Y').html(sales);
}

function set_merchantTotalSales_(_stsType) {
	stsType = _stsType;
	if (stsType == "D") {
		merchantTotalSales_data = merchantTotalSales_D_data;
	} else if (stsType == "M") {
		merchantTotalSales_data = merchantTotalSales_M_data;
	} else if (stsType == "Y") {
		merchantTotalSales_data = merchantTotalSales_Y_data;
	}
}

function init_merchantTotalSales_data() {
	var salesData = new Array();
	var costData = new Array();
	var discountPayData = new Array();
	var profitData = new Array();
	var actualPaymentData = new Array();
	var yAxisData = new Array();
	for (var i = 0; i < merchantTotalSales_data.length; i++) {
		salesData[i] = merchantTotalSales_data[i].sales;
		costData[i] = merchantTotalSales_data[i].cost;
		discountPayData[i] = merchantTotalSales_data[i].discountPay;
		profitData[i] = merchantTotalSales_data[i].profit;
		actualPaymentData[i] = merchantTotalSales_data[i].actualPayment;
		yAxisData[i] = merchantTotalSales_data[i].shopName;
	}

	var data = {
		"salesData" : salesData,
		"costData" : costData,
		"discountPayData" : discountPayData,
		"profitData" : profitData,
		"actualPaymentData" : actualPaymentData,
		"yAxisData" : yAxisData
	}
	return data;
}

function _merchant_sales_echarts() {
	_merchantTotalSales_X_myChart = echarts.init(document.getElementById('merchantTotalSales_X'));
	var data = init_merchantTotalSales_data();
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
			top : '15%',
			bottom : '5%',
			containLabel : true
		},
		legend : {
			data : [ '销售总金额', '成本总金额', '优惠总金额', '利润总金额', '实收总金额' ],
			top : '8%',
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
			data : data.yAxisData,
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
			data : data.salesData,
			itemStyle : {
				normal : {
					color : '#1199ff'
				}
			}
		}, {
			name : '成本总金额',
			type : 'bar',
			data : data.costData,
			itemStyle : {
				normal : {
					color : '#ff5049'
				}
			}
		}, {
			name : '优惠总金额',
			type : 'bar',
			data : data.discountPayData,
			itemStyle : {
				normal : {
					color : '#ffba46'
				}
			}
		}, {
			name : '利润总金额',
			type : 'bar',
			data : data.profitData,
			itemStyle : {
				normal : {
					color : '#3eb93e'
				}
			}
		}, {
			name : '实收总金额',
			type : 'bar',
			data : data.actualPaymentData,
			itemStyle : {
				normal : {
					color : '#93e354'
				}
			}
		} ]
	};
	_merchantTotalSales_X_myChart.setOption(option);
}
