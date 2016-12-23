//
//  UINavigationController+Custom.m
//  SmartHouseNew
//
//  Created by sgyaaron on 16/6/15.
//  Copyright © 2016年 一道物联科技. All rights reserved.
//
#import "WJSCommonDefine.h"
#import "UINavigationController+Custom.h"

@implementation UINavigationController(Custom)

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (void)pushViewController: (UIViewController*)controller
    animatedWithTransition: (UIViewAnimationTransition)transition {
    
    [self pushViewController:controller animated:NO];
    
    [UIView beginAnimations:nil context:nil];
    [UIView setAnimationDuration:TT_FLIP_TRANSITION_DURATION];
    [UIView setAnimationDelegate:self];
    [UIView setAnimationDidStopSelector:@selector(pushAnimationDidStop)];
    [UIView setAnimationTransition:transition forView:self.view cache:YES];
    [UIView commitAnimations];
}

- (UIViewController*)popViewControllerAnimatedWithTransition:(UIViewAnimationTransition)transition {
    UIViewController* poppedController = [self popViewControllerAnimated:NO];
    
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:TT_FLIP_TRANSITION_DURATION];
    [UIView setAnimationDelegate:self];
    [UIView setAnimationDidStopSelector:@selector(pushAnimationDidStop)];
    [UIView setAnimationTransition:transition forView:self.view cache:NO];
    [UIView commitAnimations];
    
    return poppedController;
}

//- (void)pushViewController:(UIViewController *)viewController animated:(BOOL)animated
//{
//    // fix 'nested pop animation can result in corrupted navigation bar'
//    if ([self respondsToSelector:@selector(interactivePopGestureRecognizer)]) {
//        self.interactivePopGestureRecognizer.enabled = NO;
//    }
//    
//    //[super pushViewController:viewController animated:animated];
//}

- (void)navigationController:(UINavigationController *)navigationController
       didShowViewController:(UIViewController *)viewController
                    animated:(BOOL)animated
{
    if ([navigationController respondsToSelector:@selector(interactivePopGestureRecognizer)]) {
        navigationController.interactivePopGestureRecognizer.enabled = YES;
    }
}
@end
