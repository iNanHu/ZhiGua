var webServer_url = "http://www.zhinengshagua.com/zgskwechat/";
function init_url(url) {
	webServer_url = url;
}
/**
 * @param url
 *            'UserAciont_deleteUser'
 * @param data
 *            "user.id=" + row[i].id
 * @param type
 *            'POST''GET'
 */
function ajaxSend(url, data, type, dataType, async, callback, errorCallback) {
	var jsonData;
	$.ajax({
		type : type,
		data : data,
		url : url,
		success : function(result) {
			// var result = eval('(' + result + ')');
			jsonData = result;
			if (callback != null) {
				createFunc(callback, result);
			}
		},
		error : function() {
			if (errorCallback != null) {
				createFunc(errorCallback);
			}
		},
		dataType : dataType,
		async : async
	});
	return jsonData;
}

//打开window
function GotoWin(url, name){
    if(!url){
        return;
    }
    if(!name){
        name = url;
    }
    api.openWin({
                name:name,
                url:url,
                pageParam: {
                name: 'test'
                },
                bounces: true,
                bgColor: 'rgba(0,0,0,0)',
                vScrollBarEnabled: true,
                hScrollBarEnabled: true,
                pageParam: {
                slidBackEnabled : 'false'
                }
                });
}

/**
 * 根据方法名创建一个对应的方法
 * 
 * @param funcName
 * @returns {fun}
 */
function createFunc(funcName, jsonData) {
	var fun = eval(funcName);
	if (jsonData == null) {
		return new fun();
	}
	return new fun(jsonData);
}

function refresh_node(id) {
	try {
		// 绑定数据并渲染至页面后刷新滚动条！
		oBox = window[id];
		oBox.refresh();
	} catch (e) {
	}
}

// **********************验证方法******************************
/**
 * 验证姓名
 * 
 * @param title
 * @param name
 * @param minSize
 * @param maxSize
 * @returns {Boolean}
 */
function validator_name(title, name, minSize, maxSize) {
	if (name == "") {
		window.wxc.xcConfirm(title + "不能为空!", "info", null);
//		alert(title + "不能为空!");
		return false;
	} else if (!/^[\u4e00-\u9fa5_a-zA-Z]+$/.test(name)) {
		window.wxc.xcConfirm(title + "只能为中文或英文组成!", "info", null);
//		alert(title + "只能为中文或英文组成!");
		return false;
	} else if (name.length < minSize || name.length > maxSize) {
		window.wxc.xcConfirm(title + "长度只能为" + minSize + "-" + maxSize + "个字符!", "info", null);
//		alert(title + "长度只能为" + minSize + "-" + maxSize + "个字符!");
		return false;
	} else {
		return true;
	}

}

/**
 * 验证账号信息
 * 
 * @param title
 * @param account
 * @param minSize
 * @param maxSize
 * @returns {Boolean}
 */
function validator_account(title, account, minSize, maxSize) {
	if (account == "") {
		window.wxc.xcConfirm(title + "不能为空!", "info", null);
//		alert(title + "不能为空!");
		return false;
	} else if (!/^[\u4E00-\u9FA5a-zA-Z0-9]+$/.test(account)) {
		window.wxc.xcConfirm(title + "只能是数字、字母!", "info", null);
//		alert(title + "只能是数字、字母、下划线构成!");
		return false;
	} else if (account.length < minSize || account.length > maxSize) {
		window.wxc.xcConfirm(title + "长度只能为" + minSize + "-" + maxSize + "个字符!", "info", null);
//		alert(title + "长度只能为" + minSize + "-" + maxSize + "个字符!");
		return false;
	} else {
		return true;
	}

}

/**
 * 验证手机号码
 * 
 * @param title
 * @param phone
 * @returns {Boolean}
 */
function validator_phone(title, phone) {
	if (phone == "") {
		window.wxc.xcConfirm(title + "不能为空!", "info", null);
//		alert(title + "不能为空!");
		return false;
	} else if (!/^(13|15|18)\d{9}$/.test(phone)) {
		window.wxc.xcConfirm(title + "格式不正确!", "info", null);
//		alert(title + "格式不正确!");
		return false;
	} else {
		return true;
	}
}

/**
 * 
 * @param title
 * @param password
 * @param repeat_password
 * @returns {Boolean}
 */
function validator_password(title, password, repeat_password) {
	if (password == "") {
		window.wxc.xcConfirm(title + "格式不正确!", "info", null);
//		alert(title + "格式不正确!");
		return false;
	} else if (!/(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,20}/.test(password)) {
		window.wxc.xcConfirm(title + "中必须包含字母、数字、特称字符，至少6个字符，最多20个字符!", "info", null);
//		alert(title + "中必须包含字母、数字、特称字符，至少6个字符，最多20个字符!");
		return false;
	} else if (password.length > 20) {
		window.wxc.xcConfirm(title + "字符长度超长!", "info", null);
//		alert(title + "字符长度超长!");
		return false;
	} else if (repeat_password != null && password != repeat_password) {
		window.wxc.xcConfirm(title + "确认密码不一致!", "info", null);
//		alert(title + "确认密码不一致!");
		return false;
	} else {
		return true;
	}
}

/**
 * 优惠折扣验证
 * 
 * @param title
 * @param value
 * @param minValue
 * @param maxValue
 * @returns {Boolean}
 */
function validator_double(title, value, minValue, maxValue) {
	if (value == "") {
		window.wxc.xcConfirm(title + "不能为空！", "info", null);
//		alert(title + "不能为空！");
		return false;
	} else if (value < minValue) {
		window.wxc.xcConfirm(title + "不能小于" + minValue + "!", "info", null);
//		alert(title + "不能小于" + minValue + "!");
		return false;
	} else if (value > maxValue) {
		window.wxc.xcConfirm(title + "不能大于" + maxValue + "!", "info", null);
//		alert(title + "不能大于" + maxValue + "!");
		return false;
	} else if (!/^\d{0,19}\.\d{0,2}$|^\d{0,19}$/.test(value)) {
		window.wxc.xcConfirm(title + "最多可以保留2位小数!", "info", null);
//		alert(title + "最多可以保留2位小数!");
		return false;
	} else {
		return true;
	}

}

/**
 * 验证不能为空
 * 
 * @param title
 * @param value
 * @returns {Boolean}
 */
function validator_null(title, value) {
	if (value == "") {
		window.wxc.xcConfirm(title + "不能为空！", "info", null);
//		alert(title + "不能为空！");
		return false;
	}
	return true;
}

/**
 * 判断输入的值是否是纯数字
 * 
 * @param value
 * @returns {Boolean}
 */
function validator_number(value) {
	if (!/^[0-9]*$/.test(value)) {
		window.wxc.xcConfirm(title + "只能为数字字符！", "info", null);
//		alert(title + "只能为数字字符！");
		return false;
	}
	return true;
}

/**
 * 去掉字符串空格和换行符
 * 
 * @param value
 * @returns {String}
 */
function blankAndNewline(value) {
	var newValue = "";
	newValue = value.replace(/\ +/g, "");
	newValue = newValue.replace(/[\r\n]/g, "");
	return newValue;
}

/**
 * 验证备注
 * 
 * @param value
 * @param id
 * @param hintId
 * @returns {Boolean}
 */
function validator_remarks(value) {
	if (value.length > 500) {
		window.wxc.xcConfirm("输入字符大于500!", "info", null);
//		alert("输入字符大于500!");
		return false;
	} else {
		return true;
	}
}

/**
 * 地址校验
 * 
 * @param title
 * @param value
 * @param id
 * @param hintId
 * @param length
 * @returns {Boolean}
 */
function validator_varLength(title, value, length) {
	if (value.length < 1) {
		window.wxc.xcConfirm(title + "不能为空！", "info", null);
//		alert(title + "不能为空！");
		return false;
	} else if (value.length > length) {
		window.wxc.xcConfirm(title + "长度不能大于" + length + "!", "info", null);
//		alert(title + "长度不能大于" + length + "!");
		return false;
	} else if (value.length <= length) {
		return true;
	}
}
