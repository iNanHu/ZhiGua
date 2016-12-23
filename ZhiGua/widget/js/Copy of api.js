/*打开子页面*/
function openWin($this, oWin) {
    $('*').blur();
    xKeyABC();
    xKey123();
    var oLoadWin = $('#win' + oWin), oLoadBox = oLoadWin.find('.win-box'), oLoadTitle = $('#win' + oWin + '_title'), oLoad = window["load_" + $this.data('load')], oJson = window["json_" + $this.data('json')], toBarTitle = $this.data('title');
    if (toBarTitle) {
        oLoadTitle.text(toBarTitle);
    } else {
        oLoadTitle.text(oLoad.title);
    }
    oLoadWin.addClass('win-open');
    setTimeout(function () {
        showLoading(oLoadWin);
        if (oLoad) {
            fLoad(oLoadWin, oLoadBox, oLoad, oJson);
        }
        else {
            fLoad(load_error);
        }
    }, 500);
}

/*关闭页面*/
function closeWin(oWin) {
    xKeyABC();
    xKey123();
    var oLoadWin = $('#win' + oWin), oLoadBox = $('#win' + oWin + '-box'), oLoadTitle = $('#win' + oWin + '_title');
    oLoadWin.removeClass('win-open');
    /*清空容器*/
    setTimeout(function () {
        oLoadTitle.text('');
        oLoadBox.html('<div id="win'+oWin+'_box" class="wrapper"><div class="scroller"></div></div>');
    }, 450);
}

/*关闭页面*/
function closeAllWin() {
    xKeyABC();
    xKey123();
    $('#win2,#win3,#win4,#win5,#win6,#win7').removeClass('win-open');
    /*清空容器*/
    setTimeout(function () {
        $('#win2-title,#win3-titl,#win4-title,#win5-title,#win6-title,#win7-title').text('');
        $('#win2_box').html('<div id="win'+2+'_box" class="wrapper"><div class="scroller"></div></div>');
        $('#win3_box').html('<div id="win'+3+'_box" class="wrapper"><div class="scroller"></div></div>');
        $('#win4_box').html('<div id="win'+4+'_box" class="wrapper"><div class="scroller"></div></div>');
        $('#win5_box').html('<div id="win'+5+'_box" class="wrapper"><div class="scroller"></div></div>');
        $('#win6_box').html('<div id="win'+6+'_box" class="wrapper"><div class="scroller"></div></div>');
        $('#win7_box').html('<div id="win'+7+'_box" class="wrapper"><div class="scroller"></div></div>');
    }, 450);
}

function refreshWin(oLoad) {
    try {
        // 绑定数据并渲染至页面后刷新滚动条！
        oBox = window[oLoad.name + '_box'];
        oBox.refresh();
    } catch (e) {
    }
}

/*加载模版*/
function fLoad(oLoadWin, oLoadBox, oLoad, oJson) {
    var oLoadUrl = oLoad.url;
    oLoadBox.load(oLoadUrl, function (response, status, xhr) {
        if (status == "success") {
            // alert("内容加载成功!");
            /*显示加载动画*/
            try {
                // 执行每个加载子页面的事件,包括给加载内容页绑定数据等！
                if (oJson) {
                    eval(oLoad.name + '(oJson)');
                } else {
                    eval(oLoad.name + '()');
                }
                fLoaded(oLoadWin, oLoad);
            } catch (e) {
                fLoaded(oLoadWin, oLoad);
            }
        }
        if (status == "error") {
            // alert("内容加载失败!");
            hideLoading(oLoadWin);
        }
    })
}
/*加载模版*/
function fLoaded(oLoadWin, oLoad) {
    banMove();
    hideLoading(oLoadWin);
    refreshWin(oLoad);
}

/*打开加载动画*/
function showLoading(oLoadWin) {
    oLoadWin.find('.loading').css('display', 'block');
    $('html,body').on('touchmove', function () {
        return false;
    });
}

/*关闭加载动画*/
function hideLoading(oLoadWin) {
    oLoadWin.find('.loading').css('display', 'none');
    $('html,body').off('touchmove');
}

// 打开数字键盘
function oKey123(thisId) {
	xKeyABC();
	xKey123();
    $(thisId).focus();
    var _thisId = thisId.replace("#", "");
    $('.mo-key-123').addClass('on');
    var password = $(thisId).val();
    // 点击数字
    $('.mo-key-123 .key').each(function () {
        $(this).on('touchstart', function () {
			// alert($(this).data('key'));
			// console.log($(this).data('key'));
			var value = $(thisId).val();
			if (value != "0") {
				createFunc(_thisId, value + $(this).data('key'));
			} else {
				if ($(this).data('key') == ".") {
					createFunc(_thisId, value + $(this).data('key'));
				} else {
					createFunc(_thisId, $(this).data('key'));
				}
			}
        });
    });
    // 按键效果
    $(document).on('touchstart', '.mo-key-123 td', function () {
        $(this).addClass('active');
        var $this = $(this);
        setTimeout(function () {
            $this.removeClass('active');
        }, 200);
        // alert('键盘效果');
        // console.log('键盘效果');
        return false;
    });
    // 关闭键盘
    $(document).on('touchstart', '.x_key_123', function () {
        xKey123();
        // alert('关闭键盘');
        // console.log('关闭键盘');
        return false;
    });
    // 删除一位
    $('.mo-key-123 .key_del').on('touchstart', function () {
        // alert('删作一位');
        // console.log('删作一位');
        createFunc(_thisId, "");
        return false;
    });
    // 清空全部
    $('.mo-key-123 .key_reset').on('touchstart', function () {
        // alert('清空输入');
        // console.log('清空输入');
        oKeyABC(thisId);
        return false;
    });

    // 加一个
    $('.mo-key-123 .key_plus').on('touchstart', function () {
        // alert('加一个');
        // console.log('加一个');
        if(value != ""){
			var value = $(thisId).val();
			if (value.indexOf(".") != -1) {
				value = parseFloat(value) + 1;
				value = value.toFixed(2);
				createFunc(_thisId, value);
			} else {
				value = parseInt(value) + 1;
				createFunc(_thisId, value);
			}
		}
        return false;
    });

    // 减一个
    $('.mo-key-123 .key_minus').on('touchstart', function () {
        // alert('减一个');
        // console.log('减一个');
        var value = $(thisId).val();
		if(value != ""){
			if (value.indexOf(".") != -1) {
				value = parseFloat(value) - 1;
				value = value.toFixed(2);
				createFunc(_thisId, value);
			} else {
				value = parseInt(value) - 1;
				createFunc(_thisId, value);
			}
		}else{
			createFunc(_thisId, '-');
		}
        return false;
    });

    // 下一项
    $('.mo-key-123 .key_next').on('touchstart', function () {
        // alert('下一项');
        // console.log('下一项');
        createFunc(_thisId + '_tab');
        return false;
    });
}

// 关闭数字键盘
function xKey123() {
	// 清空所有键盘绑定事件
	$('.mo-key-123 .key').each(function() {
		$(this).off('touchstart');
	});
	$(document).off('touchstart', '.mo-key-123 td');
	$(document).off('touchstart', '.x_key_123');
	$('.mo-key-123 .key_del').off('touchstart');
	$('.mo-key-123 .key_reset').off('touchstart');
	$('.mo-key-123 .key_plus').off('touchstart');
	$('.mo-key-123 .key_minus').off('touchstart');
	$('.mo-key-123 .key_next').off('touchstart');
	
    $('.mo-key-123').removeClass('on');
}

// 打开字母键盘
function oKeyABC(thisId) {
	xKey123();
	xKeyABC();
    $(thisId).focus();
    var _thisId = thisId.replace("#", "");
    $('.mo-key-abc').addClass('on');
    var password = $(thisId).val();
    // 点击数字
    $('.mo-key-abc .key').each(function () {
        $(this).on('touchstart', function () {
            // alert($(this).data('key'));
            // console.log($(this).data('key'));
            var value = $(thisId).val();
			createFunc(_thisId, value + $(this).data('key'));
        });
    });
    // 按键效果
    $(document).on('touchstart', '.mo-key-abc td', function () {
        $(this).addClass('active');
        var $this = $(this);
        setTimeout(function () {
            $this.removeClass('active');
        }, 200);
        // alert('键盘效果');
        // console.log('键盘效果');
        return false;
    });
    // 关闭键盘
    $(document).on('touchstart', '.x_key_abc', function () {
        xKeyABC();
        // alert('关闭键盘');
        console.log('关闭键盘');
        return false;
    });
    // 删除一位
    $('.mo-key-abc .key_del').on('touchstart', function () {
        // alert('删作一位');
        // console.log('删作一位');
        createFunc(_thisId, "");
        return false;
    });
    // 清空全部
    $('.mo-key-abc .key_reset').on('touchstart', function () {
        // alert('清空输入');
        // console.log('清空输入');
        oKey123(thisId);
        return false;
    });

	// // 加一个
	// $('.mo-key-abc .key_plus').on('touchstart',function () {
	// // alert('加一个');
	// console.log('加一个');
	// return false;
	// });
	//
	// // 减一个
	// $('.mo-key-abc .key_minus').on('touchstart',function () {
	// // alert('减一个');
	// console.log('减一个');
	// return false;
	// });

    // 下一项
    $('.mo-key-abc .key_next').on('touchstart', function () {
        // alert('下一项');
        console.log('下一项');
        return false;
    });
}

// 关闭字母键盘
function xKeyABC() {
	// 清空所有键盘绑定事件
	$('.mo-key-abc .key').each(function() {
		$(this).off('touchstart');
	});
	$(document).off('touchstart', '.mo-key-abc td');
	$(document).off('touchstart', '.x_key_abc');
	$('.mo-key-abc .key_del').off('touchstart');
	$('.mo-key-abc .key_reset').off('touchstart');
	$('.mo-key-abc .key_next').off('touchstart');
	
    $('.mo-key-abc').removeClass('on');
}

/* ---------- 刷新和翻页滚动条封装 ---------- */
function MyScroll(obj) {
    var scrollEndTimer;

    function hidePullUp() { //拉动结束后延迟
        scrollEndTimer && clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(function () {
            $('.pullUp').css('display', 'none');
            // scroll.refresh();
        }, 300);
    }

    var page = 1;
    var scroll = new IScroll(obj.wrapper, {
        probeType: 3,
        mouseWheel: true,
        click: true,
        bindToWrapper: true,
        deceleration:0.0015
    });
    // 下拉
    var downAction = obj.downAction || function () {
            page = 1;
            $.get(obj.dataFrom + '?page=' + page + (obj.query || ''), function (data) {
                $('.pullUp span').html('上拉加载更多');
                $(obj.dataTo).html(data); // 可能是会话过期脚本
                scroll.refresh();
            });
        };
    // 上拉
    var upAction = obj.upAction || function () {
            page += 1;
            $.get(obj.dataFrom + '?page=' + page + (obj.query || ''), function (data) {
                if (!(data && data.trim())) {
                    page -= 1;
                    $('.pullUp').addClass('dataEnd');
                    $('.pullUp span').html('已经到底了...');
                }
                $(obj.dataTo).append(data); // 可能是会话过期脚本
                scroll.refresh();
            });
        };
    scroll.on("scroll", function () {
        var y = this.y,
            maxY = this.maxScrollY - y;
        if (y > 0 && y < 100) {
            if ($('.pullDown').hasClass('flip') && !$('.pullDown').hasClass('loading')) {
                $('.pullDown').removeClass('flip');
                $('.pullDown span').html('下拉刷新');
            }
            return;
        } else if (y >= 100) {
            if (!$('.pullDown').hasClass('flip') && !$('.pullDown').hasClass('loading')) {
                $('.pullDown').addClass('flip');
                $('.pullDown span').html('重新加载');
            }
            return;
        }
        hidePullUp();
        if (maxY > 0 && maxY < 65) {
            $('.pullUp').css('display', 'block');
            if ($('.pullUp').hasClass('flip') && !$('.pullUp').hasClass('loading')) {
                $('.pullUp').removeClass('flip');
                if (!$('.pullUp').hasClass('dataEnd')) {
                    $('.pullUp span').html('上拉加载更多');
                }
            }
            return;
        } else if (maxY > 65) {
            $('.pullUp').css('display', 'block');
            if (!$('.pullUp').hasClass('flip') && !$('.pullUp').hasClass('loading') && !$('.pullUp').hasClass('dataEnd')) {
                $('.pullUp').addClass('flip');
                $('.pullUp span').html('加载更多');
            }
            return;
        }
    });
    scroll.on("slideDown", function () {
        if ($('.pullDown').hasClass('flip')) {
            $('.pullDown').addClass('loading');
            $('.pullDown span').html('加载中...');
            $('.pullUp').removeClass('dataEnd');
            downAction();
        }
    });
    scroll.on("slideUp", function () {
        if (!$('.pullUp').hasClass('dataEnd') && $('.pullUp').hasClass('flip')) {
            $('.pullUp').addClass('loading');
            $('.pullUp span').html('加载中...');
            upAction();
        }
    });
    scroll.on("scrollEnd", function () {
        if ($('.pullDown').hasClass('loading')) {
            $('.pullDown').removeClass('loading');
        }
        if ($('.pullUp').hasClass('loading')) {
            $('.pullUp').removeClass('loading');
            // 延迟隐藏,用于显示到底了信息
            hidePullUp();
        }
    });
    // 首次加载,延迟到窗口出现以后加载数据
    downActionTimer && clearTimeout(downActionTimer);
    var downActionTimer = setTimeout(function () {
        downAction();
    }, 500);
    return scroll;
}