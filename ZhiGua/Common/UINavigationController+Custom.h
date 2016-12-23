//
//  UINavigationController+Custom.h
//  SmartHouseNew
//
//  Created by sgyaaron on 16/6/15.
//  Copyright © 2016年 一道物联科技. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UINavigationController(Custom)<UIGestureRecognizerDelegate>
- (void)pushViewController: (UIViewController*)controller
    animatedWithTransition: (UIViewAnimationTransition)transition;
- (UIViewController*)popViewControllerAnimatedWithTransition:(UIViewAnimationTransition)transition;
@end
