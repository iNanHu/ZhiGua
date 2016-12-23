var purchaseNotesList = new Array();
var currPurchaseNotesJson = undefined;
function _purchase_notes() {
	m_search_purchaseNotes();
}

function m_search_purchaseNotes() {
	_init_listview_purchaseNotes_manage();
}

function _init_listview_purchaseNotes_manage() {
	var m_input_search_purchaseNotes = $('#m_input_search_purchaseNotes').val();
	var data = {
		"page" : 1,
		"pageSize" : 20,
		"where" : m_input_search_purchaseNotes
	};
	ajaxSend("WechatCustPurchaseNotes_purchaseNotesList", data, "GET", "JSON", true, "_listview_purchaseNotes_manage");
}

function _listview_purchaseNotes_manage(data) {
	purchaseNotesList = data.rows;
	var listview_purchaseNotes_manage = $("#listview_purchaseNotes_manage");
	listview_purchaseNotes_manage.empty();
	for (var i = 0; i < purchaseNotesList.length; i++) {
		var liEle = $("<li class='move_del' onclick='_set_purchaseNotes_id(" + i + ")'></li>");
		var ew_divEle = $("<div class='o_win ew' data-load='_purchase_notes_details'></div>");
		var ct_divEle = $("<div><i class='co-warn'>" + purchaseNotesList[i].createTime + "</i></div>");
		var divEle = $("<div></div>");
		var h4Ele = $("<h4 class='mm row1'>" + purchaseNotesList[i].title + "</h4>");
		var c_pEle = $("<p class='co-back sm row1 v1e5'>" + purchaseNotesList[i].content + "</p>");
		var del_divEle = $("<div class='move-del-nav del_list' onclick='delete_purchaseNotes(" + i + ")'><i class='icon icon-delete'></i></div>");

		liEle.append(ew_divEle);
		liEle.append(del_divEle);
		ew_divEle.append(ct_divEle);
		ew_divEle.append(divEle);
		divEle.append(h4Ele);
		divEle.append(c_pEle);
		listview_purchaseNotes_manage.append(liEle);
	}

	refresh_node('purchaseNotes_box');
}

function _set_purchaseNotes_id(index) {
	currPurchaseNotesJson = purchaseNotesList[index];
}

function _purchase_notes_details() {
	$('#det_m_purchaseNotes_createTime').html(currPurchaseNotesJson.createTime1);
	$('#det_m_purchaseNotes_title').html(currPurchaseNotesJson.title);
	$('#det_m_purchaseNotes_content').html(currPurchaseNotesJson.content);
}

function delete_purchaseNotes(index) {
	var data = {
		"purchaseNotes.id" : purchaseNotesList[index].id
	};
	purchaseNotesList.splice(index);
	ajaxSend("WechatCustPurchaseNotes_deletePurchaseNotes", data, "GET", "JSON", true, "_init_listview_purchaseNotes_manage");
}

function add_purchaseNotes_title() {
	var value = $('#m_add_purchaseNotes_title').val();
	if (validator_varLength("标题", value, 16)) {
		$('#add_purchaseNotes_title').html(value);
	}
	$('#m_add_purchaseNotes_title').blur();
}

function add_purchaseNotes_content() {
	var value = $('#m_add_purchaseNotes_content').val();
	if (validator_remarks(value)) {
		$('#add_purchaseNotes_content').html(value);
	}
	$('#m_add_purchaseNotes_content').blur();
}

function add_purchaseNotes() {
	var title = $('#add_purchaseNotes_title').html();
	var content = $('#add_purchaseNotes_content').html();
	if (title != "" && content != "") {
		var data = {
			"purchaseNotes.title" : title,
			"purchaseNotes.content" : content
		};
		ajaxSend("WechatCustPurchaseNotes_addPurchaseNotes", data, "GET", "JSON", true, "_init_listview_purchaseNotes_manage");
	} else {
		alert("标题或内容不能为空！");
	}

}
