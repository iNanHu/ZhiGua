var messageList = new Array();
var currMessageJson = undefined;
function _message() {
	m_search_message();
}

function m_search_message() {
	_init_listview_message_manage();
}

function _init_listview_message_manage() {
	var m_input_search_message = $('#m_input_search_message').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : m_input_search_message
	};
	ajaxSend("WechatEmpMessage_messageList", data, "GET", "JSON", true, "_listview_message_manage");
}

function _listview_message_manage(data) {
	messageList = data.rows;
	var listview_message_manage = $("#listview_message_manage");
	listview_message_manage.empty();
	for (var i = 0; i < messageList.length; i++) {
		var liEle = $("<li class='move_del' onclick='_set_message_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='o_win ew' data-load='_message_details'></div>");
		var _class_names = "";
		if (messageList[i].msgType == 0 || messageList[i].msgType == 1) {// 0表示系统升级维护，1新功能上线：bg2
			_class_names = "message-list-icon icon icon-notice-m bg2";
		} else if (messageList[i].msgType == 2) {// 2表示新增客户
			_class_names = "message-list-icon icon icon-accountsvg-on bg3";
		} else if (messageList[i].msgType == 3) {// 3表示新增商品
			_class_names = "message-list-icon icon icon-goods bg5";
		} else if (messageList[i].msgType == 4) {// 4表示库存变更
			_class_names = "message-list-icon icon icon-jhssql bg1";
		} else if (messageList[i].msgType == 7) {// 7用户产品到期提醒
			_class_names = "message-list-icon icon icon-broadcast bg4";
		}
		var ct_divEle = "";
		if (messageList[i].readStatus == 0) {
			ct_divEle = $("<div><i class='" + _class_names + "'></i><b id='" + messageList[i].id
					+ "' class='mo-badge basketCount' style='padding: 0.6em 0.6em'></b></div>");
		} else {
			ct_divEle = $("<div><i class='" + _class_names + "'></i></div>");
		}
		var divEle = $("<div></div>");
		var h4Ele = $("<h4 class='mm'>" + messageList[i].title + "<span class='fr ss co-back'>" + messageList[i].createTime + "</span></h4>");
		var c_pEle = $("<p class='co-back sm row1 v1e5'>" + messageList[i].content + "</p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_message(" + i + ")'><i class='icon icon-delete'></i></div>");

		liEle.append(ew_divEle);
		liEle.append(del_divEle);
		ew_divEle.append(ct_divEle);
		ew_divEle.append(divEle);
		divEle.append(h4Ele);
		divEle.append(c_pEle);
		listview_message_manage.append(liEle);
	}

	refresh_node('message_box');
}

function _set_message_id(index) {
	currMessageJson = messageList[index];
}

function _message_details() {
	$('#det_m_message_createTime').html(currMessageJson.createTime1);
	$('#det_m_message_title').html(currMessageJson.title);
	$('#det_m_message_content').html(currMessageJson.content);
	$('#' + currMessageJson.id).remove();
	var data = {
		"msgId" : currMessageJson.id
	};
	ajaxSend("WechatEmpMessage_readedMessage", data, "GET", "JSON", true, null);
	refresh_node('det_message_box');
	get_noRead_message_count();
}

function delete_message(index) {
	var data = {
		"msgId" : messageList[index].id
	};
	messageList.splice(index);
	ajaxSend("WechatEmpMessage_deleteMessage", data, "GET", "JSON", true, "_init_listview_message_manage");
}

function get_noRead_message_count() {
	ajaxSend("WechatEmpMessage_getNoReadMessageCount", null, "GET", "JSON", true, "_init_noReadMessageCount", "_error");
}

function _error() {
	if (_check_emp_nrmc != undefined) {
		window.clearInterval(_check_emp_nrmc);
		_check_emp_nrmc = undefined;
	}
}

function _init_noReadMessageCount(data) {
	if (data.resultCode == "230105") {
		window.wxc.xcConfirm("账号其它地方登陆！", "info", null);
//		alert("账号其它地方登陆！");
		window.clearInterval(_check_emp_nrmc);
		_check_emp_nrmc = undefined;
		window.location.href = "login.html";
	}
	$('#noReadMessageCount').empty();
	// $('#noReadMessageCount').append("<b class='mo-badge basketCount huxi'>" +
	// 9 + "</b>")
	if (data.noReadMessageCount > 0) {
		$('#noReadMessageCount').append("<b class='mo-badge basketCount huxi'>" + data.noReadMessageCount + "</b>");
	}
}

function _message_order_details(orderCode) {
	window.wxc.xcConfirm(orderCode, "info", null);
//	alert(orderCode);
}
