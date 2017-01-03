function login() {
    if (!data) {
        var account = $('#account').val();
        var password = $('#password').val();
        var roleType = $("input[name='roleType']:checked").val();
        var data;
        if (roleType == 0) {
            data = {
                "account" : account,
                "password" : password,
                "rpassword": password,
                "roleType" : roleType
            };
        } else if (roleType == 1) {
            data = {
                "account" : account,
                "password" : b64_md5(password) + "==",
                "rpassword": password,
                "roleType" : roleType
            };
        }
    }
    
    api.sendEvent({
                  name: 'loginClick',
                  extra: data
                  });
}

function login_callback(data) {
	if (data.resultCode == "230103") {
		window.location.href = data.url;
	} else {
		alert("用户名或密码错误！");
	}
}
