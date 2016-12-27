//
//  LoginVC.m
//  BluePrint
//
//  Created by alexyang on 2016/11/15.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import "ZGManagerVC.h"
#import "ZGUserMapVC.h"
#import "SHAlertView.h"
#import "PrintMainVC.h"
#import "MBProgressHUD+Add.h"
#import "SecurityUtil.h"
#import "NetManager.h"
#import <APIManager.h>
#import <APIEvent.h>
#import <APIWebView.h>
#import <APIWindowContainer.h>
#import "MMPrinterManager.h"
#import <APIScriptMessage.h>
#import <APIModuleMethod.h>
#import "PrintService.h"
#import "YDBlutoothTool.h"
#import "UserDataMananger.h"

@interface ZGManagerVC ()
<APIWebViewDelegate, APIModuleMethodDelegate, APIScriptMessageDelegate>
@property (nonatomic, strong) APIWindowContainer *windowContainer;
@end

@implementation ZGManagerVC

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    [[APIManager manager] setWebViewDelegate:self];
    [[APIManager manager] setModuleMethodDelegate:self];
    [[APIManager manager] setScriptMessageDelegate:self];
    [[APIEventCenter defaultCenter] addEventListener:self selector:@selector(handleEvent:) name:@"printList"];
    
    NSString *strMainUrl = [NSString stringWithFormat:@"widget://login.html"];
    
    APIWindowContainer *windowContainer = [APIWindowContainer
                                           windowContainerWithUrl:strMainUrl name:@"MainVC" userInfo:nil];
    [windowContainer startLoad];
    BOOL bRemPsd = [[UserDataMananger sharedManager] bRemPsd];
    if (bRemPsd)
        [self autoLogin];
    
    self.windowContainer = windowContainer;
    self.navigationController.navigationBar.hidden = YES;
    [self.navigationController pushViewController:windowContainer animated:NO];
    [[APIEventCenter defaultCenter] addEventListener:self selector:@selector(handleEvent:) name:@"loginClick"];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(autoLogin) name:AUTOLOGIN object:nil];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(printInfo) name:NOTI_PRINT_STATE_NOPAPER object:nil];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(printCoverOpen) name:NOTI_PRINT_STATE_COVEROPEN object:nil];

}

- (void)autoLogin {
    
    BOOL bRemPsd = [[UserDataMananger sharedManager] bRemPsd];
    NSString *strName = [[UserDataMananger sharedManager] strUserName];
    NSString *strRPsd = [[UserDataMananger sharedManager] strUserPsd];
    NSString *strPsd = [[UserDataMananger sharedManager] strUserAPsd];
    NSString *strRoleType = [[UserDataMananger sharedManager] strRoleType];
    [self loginWithUserName:strName andPsd:strPsd andStrRPsd:strRPsd andRoleType:strRoleType andRemPsd:bRemPsd];
}

- (void)printInfo {
    [self showAlertViewWithTitle:@"打印机缺纸，请更换打印纸"];
}

- (void)printCoverOpen {
    
    [self showAlertViewWithTitle:@"打印机纸仓打开"];
}

- (void)viewWillAppear:(BOOL)animated {
    
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated {
    
    [super viewDidAppear:animated];
    
    if ([self.navigationController respondsToSelector:@selector(interactivePopGestureRecognizer)])
        self.navigationController.interactivePopGestureRecognizer.enabled = NO;
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)loginWithUserName:(NSString *)strName andPsd:(NSString *)strPsd andStrRPsd:(NSString *)strRPsd andRoleType:(NSString *) strRoleType andRemPsd:(BOOL) bRemPsd {
    
    strName = [strName stringByReplacingOccurrencesOfString:@" " withString:@""];
    NSString *strServAddr = [NSString stringWithFormat:@"%@/zgskwechat/WechatLoginAction_login",SERVADDR];
    NSDictionary *dicParams = @{@"account":strName,
                                @"password":strPsd,
                                @"rpassword":strRPsd,
                                @"roleType":strRoleType,
                                @"isApp":@"1"};
    SuccBlock sucBlock = ^(id  _Nullable responseObject) {
        
        NSLog(@"success: %@",responseObject);
        NSString *resData = [responseObject objectForKey:@"resultCode"];
        NSString *restInfo = [responseObject objectForKey:@"resultInfo"];
        
        if ([resData isEqualToString:@"230103"]) {
            
            NSString *url = [responseObject objectForKey:@"url"];
            [self switchToMainView:url];
            
            [[UserDataMananger sharedManager]setStrUserName:strName];
            [[UserDataMananger sharedManager]setStrRoleType:strRoleType];
            [[UserDataMananger sharedManager]setStrUserPsd:strRPsd];
            [[UserDataMananger sharedManager]setStrUserAPsd:strPsd];
            [[UserDataMananger sharedManager]setBRemPsd:bRemPsd];
            
            [[YDBlutoothTool sharedBlutoothTool]startPrintServ];
            [[PrintService shareInstance]startMQTTServ];
        } else {
            [self showAlertViewWithTitle:@"用户名或密码错误！"];
        }
        [self hideProgressView:NO];
    };
    FailBlock failBlock = ^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        NSLog(@"error: %@",error);
        [self hideProgressView:NO];
        [self showAlertViewWithTitle:@"连接服务器超时！"];
    };
    [self showProgressViewWithTitle:@"登录中..." andTimeout:5.0];
    [[NetManager shareInstance]getMsg:strServAddr andParam:dicParams withSuccBlock:sucBlock withFailBlock:failBlock];
}

- (void)switchToMainView:(NSString *) strMainUrl {
    NSString *script = [NSString stringWithFormat:@"GotoWin('%@')",strMainUrl];
    NSLog(@"switchToMainView: %@",script);
    [self.windowContainer execScript:script window:@"MainVC" frame:nil];
}

#pragma mark - 监听html页面发送的事件
- (void)handleEvent:(APIEvent *)event {
    NSString *msg = [NSString stringWithFormat:@"收到来自Html5的%@事件，传入的参数为:%@", event.name, event.userInfo];
    NSLog(@"handleEvent: %@",msg);
    if ([event.name isEqual:@"loginClick"]) {
        NSDictionary *dicUserInfo = event.userInfo;
        NSString *strName = [dicUserInfo objectForKey:@"account"];
        NSString *strRPsd = [dicUserInfo objectForKey:@"rpassword"];
        NSString *strPsd = [dicUserInfo objectForKey:@"password"];
        NSString *strRoleType = [NSString stringWithFormat:@"%d",[[dicUserInfo objectForKey:@"roleType"] intValue]];
        BOOL bRemPsd = [[dicUserInfo objectForKey:@"rempasswd"] boolValue];
        if ([strName isEqualToString:@""] || [strPsd isEqualToString:@""]) {
            [self showAlertViewWithTitle:@"账号密码不能为空"];
            return;
        }
        [self loginWithUserName:strName andPsd:strPsd andStrRPsd:strRPsd andRoleType:strRoleType andRemPsd:bRemPsd];
    }
}

#pragma mark - APIScriptMessageDelegate
- (void)webView:(APIWebView *)webView didReceiveScriptMessage:(APIScriptMessage *)scriptMessage {
    
    NSString *msg = [NSString stringWithFormat:@"收到来自Html5的操作请求，访问的名称标识为%@，传入的参数为:%@", scriptMessage.name, scriptMessage.userInfo];
}

#pragma mark - APIWebViewDelegate
- (BOOL)webView:(APIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSString *url = request.URL.absoluteString;
    NSLog(@"shouldStartLoadWithRequest: %@",url);
    
    if ([self.navigationController respondsToSelector:@selector(interactivePopGestureRecognizer)])
        self.navigationController.interactivePopGestureRecognizer.enabled = NO;
    
    if([url containsString:PRINTERURL]) {
        
        NSLog(@"Enter PrintListVC");
        PrintMainVC *SVC = [[PrintMainVC alloc] init];
        [self.navigationController pushViewController:SVC animated:YES];
        return NO;
    } else if([url containsString:USERLOCURL]){
    
        UIStoryboard *main = [UIStoryboard storyboardWithName:@"Main" bundle:nil];
        ZGUserMapVC *mapVC = [main instantiateViewControllerWithIdentifier:@"ZGUserMapVC"];
        [self.navigationController pushViewController:mapVC animated:YES];
    } else if([url containsString:EXITURL]) {
        
        if ([[YDBlutoothTool sharedBlutoothTool] isPrint]) {
            [self showAlertViewWithTitle:@"设备仍在打印中..."];
            return NO;
        }
        NSLog(@"PrintVC Logout");
        [[UserDataMananger sharedManager]setBRemPsd:NO];
        [[YDBlutoothTool sharedBlutoothTool]printOffline];
        [[YDBlutoothTool sharedBlutoothTool]breakConnect:NO];
        [[YDBlutoothTool sharedBlutoothTool]stopPrintServ];
        [[PrintService shareInstance]stopMQTTServ];
        [self switchToMainView:@"login.html"];
        return NO;
    }
    
    return YES;
}

#pragma mark - APIModuleMethodDelegate
- (BOOL)shouldInvokeModuleMethod:(APIModuleMethod *)moduleMethod {
    NSLog(@"shouldInvokeModuleMethod: %@",moduleMethod.method);
    if ([moduleMethod.module isEqualToString:@"api"] && [moduleMethod.method isEqualToString:@"sms"]) {
        return NO;
    }
    return YES;
}

- (void)showAlertViewWithTitle:(NSString *)title {
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:UI_KEYWINDOW animated:YES];
    hud.mode = MBProgressHUDModeText;
    hud.detailsLabelText = title;
    hud.detailsLabelFont = [UIFont systemFontOfSize:15.f];
    hud.margin = 27.f;
    hud.yOffset = 0;
    hud.removeFromSuperViewOnHide = YES;
    [hud hide:YES afterDelay:1];
    
}

- (void)showAlertViewWithTitle:(NSString *)title withOffset:(CGFloat)yOffset {
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:UI_KEYWINDOW animated:YES];
    hud.mode = MBProgressHUDModeText;
    hud.detailsLabelText = title;
    hud.detailsLabelFont = [UIFont systemFontOfSize:15.f];
    hud.margin = 27.f;
    hud.yOffset = yOffset;
    hud.removeFromSuperViewOnHide = YES;
    [hud hide:YES afterDelay:1];
}
@end
