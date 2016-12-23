//
//  SHAlertView.m
//  SmartHouseNew
//
//  Created by shigaoyang on 15/4/25.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//

#import "SHAlertView.h"
#import "MBProgressHUD.h"
#import "MBProgressHUD+Add.h"
#import "UIAlertView+BlocksKit.h"

@interface SHAlertView ()<UIAlertViewDelegate>
{
    NSString *_canceliTitle;
    NSString *_otherStr;
    NSString *_title;
    NSString *_message;
}
@property (nonatomic,strong) UIAlertView *alertView;
@property (nonatomic,strong) MBProgressHUD *mbProgressHUD;
@property (nonatomic, strong) UIActivityIndicatorView *aiView;

@end


@implementation SHAlertView

+(id)shareInstance
{
    static SHAlertView *errorMessage = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        errorMessage = [[SHAlertView alloc] init];
        
    });
    return errorMessage;
}

- (void)showError:(NSString *)error
{
    dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"showError当前线程%@",[NSThread currentThread]);
        [self.mbProgressHUD showError:error toView:nil];
    });
}

- (void)showSuccess:(NSString *)success
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.mbProgressHUD showSuccess:success toView:nil];
    });
    
}

- (void)showSuccess:(NSString *)success atInView:(UIView *)view
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.mbProgressHUD showSuccess:success toView:view];
    });
    
}

- (void)showAlertView:(NSString *)message withCanceliTitle:(NSString *)canceliTitle withOther:(NSString *)otherStr withHandler:(Handler)handler
{
    if (self.alertView)
    {
        self.alertView.alpha = 0;
        [self.alertView removeFromSuperview];
        [self.alertView dismissWithClickedButtonIndex:0 animated:YES];
        self.alertView = nil;
    }
    
    _alertView = [[UIAlertView alloc] initWithTitle:@"提示" message:message delegate:self cancelButtonTitle:canceliTitle otherButtonTitles:otherStr, nil];
    _alertView.delegate = self;
    [_alertView show];
    [self.alertView bk_setDidDismissBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        if (handler) handler(alertView,buttonIndex);
    }];
}

- (void)showMessag:(NSString *)message
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.mbProgressHUD showMessag:message];
    });
    
}

- (void)submitView
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.mbProgressHUD showMessag:@"加载中" toView:nil];
    });
    
}

- (void)hidSubmitView
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [MBProgressHUD hideHUDForView:nil animated:YES];
    });
    
}

- (void)submitViewMessage:(NSString *)message
{
    @weakify(self);
    dispatch_async(dispatch_get_main_queue(), ^{
        @strongify(self);
        [self.mbProgressHUD setHidden:NO];
        [self.mbProgressHUD showMessag:message toView:nil];
    });
}

#pragma mark - 属性初始化

- (MBProgressHUD *)mbProgressHUD
{
    if (!_mbProgressHUD) {
        _mbProgressHUD = [[MBProgressHUD alloc] init];
    }
    return _mbProgressHUD;
}

#pragma mark - btn上显示菊花
- (void)showActivityViewButton:(UIButton*)sender
{
    self.aiView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    self.aiView.frame = CGRectMake(10, 10, 20, 20);
    self.aiView.hidesWhenStopped = YES;
    [sender addSubview:_aiView];
    [self.aiView startAnimating];
    sender.enabled = NO;
}

- (void)hideActivityViewOnButton:(UIButton *)sender
{
    sender.enabled = YES;
    [self.aiView stopAnimating];
}

#pragma mark - UIAlertViewDelegate
//弹出框消失以后将其设为空
- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex
{
    self.alertView = nil;
}

@end
