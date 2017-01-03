function _cust_arrears_echarts() {
	_init_customerCurrdebts2Echarts();
}

var _customerCurrdebts_myChart = undefined;
function _init_customerCurrdebts2Echarts() {
	ajaxSend("WechatCustStatistics_customerCurrdebts2Echarts", null, "get", "JSON", false, "_customerCurrdebts_callback");
}

function _customerCurrdebts_callback(data) {
	_customerCurrdebts_myChart = echarts.init(document.getElementById('customerCurrdebtsEcharts'));
	var option = {
		title : {
			text : '未支出额统计',
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
			data : [ '未支出总金额' ],
			top : '10%',
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
			name : '未支出总金额',
			type : 'bar',
			data : data.seriesCurrdebtsData,
			itemStyle : {
				normal : {
					color : '#93e354'
				}
			}
		} ]
	};
	_customerCurrdebts_myChart.setOption(option);

}