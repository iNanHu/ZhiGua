//
//  SHBaseVC.m
//  SmartHouseNew
//
//  Created by shigaoyang on 15/2/6.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//

#import "SHBaseVC.h"
#import "SHRefreshControl.h"
#import "UINavigationBar+Awesome.h"
#import "UIButton+ImageWithLabel.h"
#import "UINavigationController+Custom.h"

#define TOP_BAR_HEIGHT 60

@interface SHBaseVC ()
{
    UIButton *_messageButton;
    UIButton *_leftButton;
    UILabel *_titleLabel;
    UIView *_titleView;
}

@property (nonatomic, strong) UIImageView *bgView;
@property (nonatomic, strong) UIImageView *defBgView;
@property (nonatomic, strong) UILabel *titleLabel;
@property (nonatomic, strong) NSObject *netStateObject;
@property (nonatomic, strong) NSTimer *titleTimer;
@end

@implementation SHBaseVC

- (void)viewDidLoad {
    [super viewDidLoad];
    NSLog(@"viewDidLoad is : %@", NSStringFromClass([self class]));
    
    self.navigationController.interactivePopGestureRecognizer.delegate = (id)self;
    
    //添加titleView
    self.topBgView = [[UIView alloc] initWithFrame:CGRectMake(0, 20, UI_SCREEN_WIDTH - 124, 44)];
    self.topBgView.backgroundColor = [UIColor clearColor];
    self.bgView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"导航条"]];
    self.bgView.frame = CGRectMake(0, 0, UI_SCREEN_WIDTH, 64);
    
    self.titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, UI_SCREEN_WIDTH - 124, 44)];
    self.titleLabel.textColor = [UIColor whiteColor];
    self.titleLabel.font = [UIFont boldSystemFontOfSize:16.f];
    [self.titleLabel setTextAlignment:NSTextAlignmentCenter];
    [self.topBgView addSubview:self.titleLabel];
    
    NSDictionary *dic = [NSDictionary dictionaryWithObject:[UIColor whiteColor] forKey:NSForegroundColorAttributeName];
    self.navigationController.navigationBar.titleTextAttributes = dic;
    [self.navigationController.navigationBar setHidden:NO];
    
    _leftButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_leftButton setImage:[UIImage imageNamed:@"nav_back"] forState:UIControlStateNormal];
    _leftButton.imageEdgeInsets = UIEdgeInsetsMake(0, -25, 0, 0);
    [_leftButton setTintColor:[UIColor whiteColor]];
    
    [_leftButton setFrame:CGRectMake(0, 0, 40, 40)];
    [_leftButton addTarget:self action:@selector(leftAction:) forControlEvents:UIControlEventTouchUpInside];
    
    [self.navigationController.navigationBar setBarTintColor:RGB(0x1B, 0xC0, 0xFF)];
    _defBgView = [[UIImageView alloc] initWithFrame:self.view.bounds];
    [_defBgView setImage:[UIImage imageNamed:@"底图"]];
    [self.view insertSubview:_defBgView atIndex:0];
    
    [self.view addSubview:self.bgView];
    
    self.hidLeftButton = NO;
    self.hidRightButton = YES;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar setBackgroundImage:[UIImage imageNamed:@"导航条"] forBarPosition:UIBarPositionAny barMetrics:UIBarMetricsDefault];
    [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
}

- (void)viewDidAppear:(BOOL)animated {
    
    [super viewDidAppear:animated];
    
    if ([self.navigationController respondsToSelector:@selector(interactivePopGestureRecognizer)])
        self.navigationController.interactivePopGestureRecognizer.enabled = YES;
}

- (void)setHidBgView:(BOOL)hidBgView {
    
    if (hidBgView) {
        [_defBgView removeFromSuperview];
    } else {
        [self.view insertSubview:_defBgView atIndex:0];
    }
}

#pragma mark network State
- (void)netStateChanged:(int)val {
    return ;
}

- (void)connectResult:(int)index {
    
    return ;
}

// 显示菊花指示器
- (void)showActivityViewWithTitle:(NSString *)title {
    
    self.navigationItem.titleView = self.topBgView;
    self.titleLabel.text = title;
}

//隐藏菊花指示器
- (void)hidActivityViewWithTitle:(NSString *)title {
    
    self.navigationItem.titleView = nil;
}

- (void)rightAction:(UIButton *)sender{

}
- (void)leftAction:(UIButton *)sender{
    UIViewController *nav = self.navigationController;
    if (nav) {
        [self.navigationController popViewControllerAnimated:YES];
    }
}

- (void)setHidLeftButton:(BOOL)hidLeftButton
{
    _hidLeftButton = hidLeftButton;
    if (!_hidLeftButton) {
        
        [self.navigationItem setLeftBarButtonItem:[[UIBarButtonItem alloc] initWithCustomView:_leftButton]];
    } else {
        
        [self.navigationItem setLeftBarButtonItem:nil];
    }
}

- (void)setHidRightButton:(BOOL)hidRightButton
{
    _hidRightButton = hidRightButton;
    if (!_hidRightButton) {
        
        _messageButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_messageButton setImage:[UIImage imageNamed:@"nav_add"] forState:UIControlStateNormal];
        _messageButton.imageEdgeInsets = UIEdgeInsetsMake(0, 10, 0, -10);
        [_messageButton setTintColor:[UIColor whiteColor]];
        [_messageButton setFrame:CGRectMake(0, 0, 40, 40)];
        [_messageButton.titleLabel setFont:[UIFont systemFontOfSize:15.f]];
        [_messageButton addTarget:self action:@selector(rightAction:) forControlEvents:UIControlEventTouchUpInside];
        [self.navigationItem setRightBarButtonItem:[[UIBarButtonItem alloc] initWithCustomView:_messageButton]];
        
    }else {
        
        [self.navigationItem setRightBarButtonItem:nil];
    }
}

- (void)setLeftButtonTitle:(NSString *)leftButtonTitle andImage:(UIImage *)leftButtonImage
{
    self.hidLeftButton = NO;
    [_leftButton setFrame:CGRectMake(0, 0, 50, 40)];
    [_leftButton setTitle:leftButtonTitle forState:UIControlStateNormal];
    [_leftButton setImage:leftButtonImage forState:UIControlStateNormal];
}

- (void)setRightButtonTitle:(NSString *)rightButtonTitle andImage:(UIImage *)rightImage
{
    self.hidRightButton = NO;
    [_messageButton setFrame:CGRectMake(0, 0, 100, 40)];
    _messageButton.contentHorizontalAlignment = UIControlContentHorizontalAlignmentRight;
    [_messageButton setTitle:rightButtonTitle forState:UIControlStateNormal];
    [_messageButton setImage:rightImage forState:UIControlStateNormal];
}

-(void)setScrollRefreshView:(UIScrollView *)scrollView {
    if (!_refreshCtrl) {
        [scrollView setBackgroundColor:[UIColor clearColor]];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - Notifying refresh control of scrolling

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    if (_refreshCtrl)
        [self.refreshCtrl scrollViewDidScroll];
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate
{
    if (_refreshCtrl)
        [self.refreshCtrl scrollViewDidEndDragging];
}

#pragma mark - Listening for the user to trigger a refresh

- (void)refreshTriggered:(id)sender
{
    [self performSelector:@selector(finishRefreshControl) withObject:nil afterDelay:1.5 inModes:@[NSRunLoopCommonModes]];
}

- (void)finishRefreshControl
{
    if (_refreshCtrl)
        [self.refreshCtrl finishingLoading];
}
@end
