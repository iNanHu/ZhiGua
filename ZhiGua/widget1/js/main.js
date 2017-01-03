/*禁止滑动*/
function banMove() {
    $(document).on('touchmove', '.ban_move', function () {
        return false;
    });
}

/*打开页面*/
$(document).on('touchstart', '.o_main', function () {
    var $this = $(this), oWin = 1;
    $('#fo_menu').removeClass('open');
    xMenu();
    $this.addClass('active').siblings().removeClass('active');
    openWin($this, oWin);
    return false;
});
$(document).on('click', '.o_win', function () {
    var $this = $(this), oWin = $this.parents('.win').data('win')+1;
    openWin($this, oWin);
    return false;
});

// 特殊（底栏中间按钮）
$(document).on('touchstart', '#o_win', function () {
    var $this = $(this), oWin = $this.parents('.win').data('win')+1;
    openWin($this, oWin);
    return false;
});

// 打开搜索
$(document).on('click', '.o_search', function () {
    $('*').blur();
    $('.win-search').addClass('on');
    oKeyABC('#search-input');
    setTimeout(function () {
        // $('#search-input').focus();
    },100);
    return false;
});
// 打开搜索
$(document).on('touchstart', '.x_search', function () {
    $('*').blur();
    $('.win-search').removeClass('on').find('#search-input').blur();
    xKeyABC('#search-input');
    return false;
});

$(document).on('click', '.x_win', function () {
    $('*').blur();
    var oWin = $(this).parents('.win').data('win');
    closeWin(oWin);
    return false;
});

//层级的“返回”使用这个更快
$(document).on('touchstart', '.x_back', function () {
    $('*').blur();
    var oWin = $(this).parents('.win').data('win');
    closeWin(oWin);
    return false;
});

//打开弹出框
$(document).on('click', '.o_popup', function () {
    var popup = $(this).data('popup');
    oPopup(popup);
});

// 关闭弹出框
$(document).on('click', '.x_popup', function () {
    xPopup();
});

$(document).on('touchstart', '.x_all_win', function () {
    $('*').blur();
    closeAllWin();
    return false;
    // e.stopPropagation();
});

$(document).on('click', '.del_list', function () {
    $(this).parent().slideUp(250, function () {
        $(this).detach();
    });
    return false;
});

$(document).on('click', '.o_key', function () {
    var thisId = '#'+$(this).attr('id');
    if($(this).data('key-type') == '123' ){
        oKey123(thisId);
    }else if($(this).data('key-type') == 'abc'){
        oKeyABC(thisId);
    }
    return false;
});

// 客户列表首字母跳转
$(document).on('touchmove', '.szm-list', function () {
 return false;
 });
 $(document).on('touchstart', '.szm-list>li', function () {
 var maoDin = '#MD-'+ $(this).text();
 if($(maoDin).length>0){
 clients_scroll.scrollToElement(document.querySelector(maoDin),300);
 }
 return false;
 });


 var startPosition, endPosition, deltaX, deltaY;
 $(document).on('touchstart', '.move_del', function (e) {
     var touch = e.touches[0];
     startPosition = {
         x: touch.pageX
     };
 }).on('touchmove', '.move_del', function (e) {
     var touch = e.touches[0];
     endPosition = {
         x: touch.pageX
     };
     deltaX = endPosition.x - startPosition.x;
 }).on('touchend', '.move_del', function (e) {
     if (deltaX < -80) {
         $(this).addClass('show-del');
     } else if (deltaX > 30) {
         $(this).removeClass('show-del');
     }
     deltaX = 0;
     e.stopPropagation();
 });

/* ********** 存储 ********** */

var Storage = {
    get: function (k) {
        return localStorage && localStorage.getItem(k);
    },
    set: function (k, v) {
        try {
            localStorage && localStorage.setItem(k, v);
        } catch(e) {
            alert("无法储存设置");
            // 这是跳出临时设置字号
        }
    }
};

/** 切换全局字号 **/
var fontSize = Storage.get('fontSize') || 'm';
Storage.set('fontSize', fontSize);
$('html').attr('data-sz', fontSize);

// 底部中间菜单
$(document).on('touchstart', '.fo_menu', function () {
    $(this).toggleClass('open');
    if ($(this).hasClass('open')) {
        oMenu()
    } else {
        xMenu()
    }
});
function oMenu() {
    $('.fo-menu').show(10, function () {
        $('#win1-box').addClass('blur');
    });
}
function xMenu() {
    $('.fo-menu').hide(10, function () {
        $('#win1-box').removeClass('blur');
    });
}

$(function () {
    showLoading($('#win1'));
    setTimeout(function () {
        fLoad($('#win1'), $('#win1').find('.win-box'), load_home);
    },200);
});