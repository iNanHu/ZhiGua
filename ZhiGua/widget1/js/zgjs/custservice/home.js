function home() {
	_init_custTransactionAmount2Echarts();
	custTransactionAmountTotal_D();
	custTransactionAmountTotal_M();
	custTransactionAmountTotal_Y();
}
var _custTransactionAmount_myChart = undefined;
var _custTransactionAmountTotal_X_myChart = undefined;
var custTransactionAmountTotal_D_data = undefined;
var custTransactionAmountTotal_M_data = undefined;
var custTransactionAmountTotal_Y_data = undefined;
var custTransactionAmountTotal_data = undefined;
var stsType = undefined;
function _init_custTransactionAmount2Echarts() {
	ajaxSend("WechatCustStatistics_custTransactionAmount2Echarts", null, "get", "JSON", true, "_custTransactionAmount_callback");
}

function _custTransactionAmount_callback(data) {
	_custTransactionAmount_myChart = echarts.init(document.getElementById('custTransactionAmount_echarts'));
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
			name : '日进货额',
			type : 'bar',
			barWidth : '60%',
			data : data.seriesDaySalesData
		} ],
		backgroundColor : '#FFB502',
		textStyle : {
			color : '#fff'
		},
		itemStyle : {
			normal : {
				color : 'rgba(255,255,255,.9)',
			}
		}
	};

	_custTransactionAmount_myChart.setOption(option);
}

function custTransactionAmountTotal_D() {
	var data = {
		"stsType" : "D"
	};
	ajaxSend("WechatCustStatistics_custTransactionAmountTotal2Echarts", data, "get", "JSON", true, "_custTransactionAmountTotal_D_callback");
}

function _custTransactionAmountTotal_D_callback(data) {
	custTransactionAmountTotal_D_data = data;
	$('#custTransactionAmountTotal_D').html(data.sales);
}

function custTransactionAmountTotal_M() {
	var data = {
		"stsType" : "M"
	};
	ajaxSend("WechatCustStatistics_custTransactionAmountTotal2Echarts", data, "get", "JSON", true, "_custTransactionAmountTotal_M_callback");
}

function _custTransactionAmountTotal_M_callback(data) {
	custTransactionAmountTotal_M_data = data;
	$('#custTransactionAmountTotal_M').html(data.sales);
}

function custTransactionAmountTotal_Y() {
	var data = {
		"stsType" : "Y"
	};
	ajaxSend("WechatCustStatistics_custTransactionAmountTotal2Echarts", data, "get", "JSON", true, "_custTransactionAmountTotal_Y_callback");
}

function _custTransactionAmountTotal_Y_callback(data) {
	custTransactionAmountTotal_Y_data = data;
	$('#custTransactionAmountTotal_Y').html(data.sales);
	$('#home_shop_name').html(data.shopName);
}

function set_custTransactionAmountTotal_(_stsType) {
	stsType = _stsType;
	if (stsType == "D") {
		custTransactionAmountTotal_data = custTransactionAmountTotal_D_data;
	} else if (stsType == "M") {
		custTransactionAmountTotal_data = custTransactionAmountTotal_M_data;
	} else if (stsType == "Y") {
		custTransactionAmountTotal_data = custTransactionAmountTotal_Y_data;
	}
}

function _cust_trade_echarts() {
	_custTransactionAmountTotal_X_myChart = echarts.init(document.getElementById('custTransactionAmountTotal_X'));
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
			text : subText + '进货额统计',
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
			data : [ '进货总金额', '支出总金额', '优惠总金额' ],
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
			data : custTransactionAmountTotal_data.yAxisData,
			axisLabel : {
				rotate : 90,
				textStyle : {
					fontSize : 26
				}
			},
		},
		series : [ {
			name : '进货总金额',
			type : 'bar',
			data : custTransactionAmountTotal_data.seriesSalesData,
			itemStyle : {
				normal : {
					color : '#93e354'
				}
			}
		}, {
			name : '支出总金额',
			type : 'bar',
			data : custTransactionAmountTotal_data.seriesActualPaymentData,
			itemStyle : {
				normal : {
					color : '#1cc0ff'
				}
			}
		}, {
			name : '优惠总金额',
			type : 'bar',
			data : custTransactionAmountTotal_data.seriesDiscountPayData,
			itemStyle : {
				normal : {
					color : '#ffba46'
				}
			}
		} ]
	};
	_custTransactionAmountTotal_X_myChart.setOption(option);
}