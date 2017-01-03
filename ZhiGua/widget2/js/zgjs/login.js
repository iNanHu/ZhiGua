
function login_blur() {
    $("#account").blur();
    $("#password").blur();
}

function login_callback(data) {
    if (data.resultCode == "230103") {
        window.location.href = data.url;
    } else {
        alert("用户名或密码错误！");
    }
}
function login() {
	if (!data) {
		var account = $('#account').val();
		var password = $('#password').val();
		var roleType = $("input[name='roleType']:checked").val();
        var remPsd = document.getElementById("remPsd").checked;
        
		var data;
		if (roleType == 0) {
			data = {
				"account" : account,
				"password" : password,
                "rpassword": password,
				"roleType" : roleType,
                "rempasswd": remPsd
			};
		} else if (roleType == 1) {
			data = {
				"account" : account,
				"password" : b64_md5(password) + "==",
                "rpassword": password,
				"roleType" : roleType,
                "rempasswd": remPsd
			};
		}
	}
    
	api.sendEvent({
                  name: 'loginClick',
                  extra: data
                  });
	// alert(JSON.stringify(data));
	//ajaxSend("WechatLoginAction_login", data, "GET", "JSON", true, "login_callback");
}
