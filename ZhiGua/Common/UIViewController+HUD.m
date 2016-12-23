//
//  UIViewController+HUD.m
//  SmartHouseNew
//
//  Created by yyh on 15/6/12.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//
#define NSObject_key_titleTimer @"NSObject_key_titleTimer"
#import "UIViewController+HUD.h"

@implementation UIViewController (HUD)

- (id)titleTimer
{
    return objc_getAssociatedObject(self, NSObject_key_titleTimer);
}

- (void)setTitleTimer:(id)titleTimer
{
    objc_setAssociatedObject(self, NSObject_key_titleTimer, titleTimer, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)showHudWithTitle:(NSString *)title {
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:[AppDelegate sharedAppDelegate].window animated:YES];
    hud.mode = MBProgressHUDModeText;
    hud.detailsLabelText = title;
    hud.margin = 10.f;
    hud.yOffset = 5.f;
    hud.removeFromSuperViewOnHide = YES;
    [hud hide:YES afterDelay:1.5];
}

- (void)showHud{
    
    [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    
}
- (void)hideHud {
    
    [MBProgressHUD hideHUDForView:self.view animated:YES];
    
}
#pragma mark progressTitle
- (void)showProgressViewWithTitle:(NSString *)strTitle {
    
    [DejalBezelActivityView activityViewForView:UI_KEYWINDOW withLabel:strTitle];
}

- (void)showProgressViewWithTitle:(NSString *)strTitle andTimeout:(NSInteger) nTime {
    
    [self.titleTimer invalidate];
    self.titleTimer = nil;
    
    [DejalBezelActivityView activityViewForView:UI_KEYWINDOW withLabel:strTitle];
    
    self.titleTimer = [NSTimer scheduledTimerWithTimeInterval:nTime target:self selector:@selector(hideProgressView) userInfo:nil repeats:NO];
}

- (void)hideProgressView {
    
    RunOnMainThread([self showAlertViewWithTitle:@"操作超时"]);
    [DejalBezelActivityView removeViewAnimated:YES];
}

- (void)hideProgressViewN {
    
    [self hideProgressView:NO];
}

- (void)hideProgressView:(BOOL) bShow {
    
    [self.titleTimer invalidate];
    self.titleTimer = nil;
    
    if (bShow)
        RunOnMainThread([self showAlertViewWithTitle:@"操作超时"]);
    [DejalBezelActivityView removeViewAnimated:YES];
}

- (void)showHudProgressWithTitle:(NSString *)title {

    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    hud.mode = MBProgressHUDModeDeterminate;
    hud.detailsLabelText = title;
    hud.detailsLabelFont = [UIFont systemFontOfSize:15.f];
    hud.margin = 27.f;
    hud.yOffset = 0;
    hud.removeFromSuperViewOnHide = YES;
}

- (void)showAlertViewWithTitle:(NSString *)title {
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    hud.mode = MBProgressHUDModeText;
    hud.detailsLabelText = title;
    hud.detailsLabelFont = [UIFont systemFontOfSize:15.f];
    hud.margin = 27.f;
    //hud.yOffset = UI_SCREEN_HEIGHT/2 - 80;
    hud.yOffset = 0;
    hud.removeFromSuperViewOnHide = YES;
    [hud hide:YES afterDelay:1];
    
}

- (void)showAlertViewWithTitle:(NSString *)title withOffset:(CGFloat)yOffset {
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    hud.mode = MBProgressHUDModeText;
    hud.detailsLabelText = title;
    hud.detailsLabelFont = [UIFont systemFontOfSize:15.f];
    hud.margin = 27.f;
    hud.yOffset = yOffset;
    hud.removeFromSuperViewOnHide = YES;
    [hud hide:YES afterDelay:1];
}

@end
