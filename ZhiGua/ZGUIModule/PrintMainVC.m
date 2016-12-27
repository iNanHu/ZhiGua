//
//  ViewController.m
//  MPBluetoothKitDemo
//
//  Created by MacPu on 15/10/29.
//  Copyright © 2015年 www.imxingzhe.com. All rights reserved.
//

#import "YDBluetoothConnectModel.h"
#import "PrintMainVC.h"
#import "YDBlutoothTool.h"
#import "WJSCommonDefine.h"
#import "PrintService.h"
#import "YDBluetoothCell.h"

NSString *const kPeripheralCellIdentifier = @"kPeripheralCellIdentifier";

@interface PrintMainVC () <UITableViewDataSource, UITableViewDelegate>

@property (strong, nonatomic) UITableView *discoverdPeripheralsTableView;
@property (strong, nonatomic) NSArray *sourceArray;
@property (strong, nonatomic) YDBluetoothConnectModel *curBluConModel;

@end

@implementation PrintMainVC

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.title = @"我的打印机";
    
    self.hidLeftButton = NO;
    self.hidRightButton = NO;
    [self setRightButtonTitle:@"清空状态" andImage:nil];
    
    [self initTableView];
    
    YDBlutoothTool *blutooth = [YDBlutoothTool sharedBlutoothTool];
    blutooth.blutoothToolContectedList = ^(NSArray *tempArray){
        self.sourceArray = tempArray;
        [self.discoverdPeripheralsTableView reloadData];
    };
    
    blutooth.blutoothToolContectedSucceed = ^ (NSArray *tempArray){
        NSLog(@"连接成功");
        self.sourceArray = tempArray;
        [self.discoverdPeripheralsTableView reloadData];
    };
    
    blutooth.blutoothToolContectedFailed = ^(NSArray *tempArray){
        //连接失败
        NSLog(@"连接失败");
        self.sourceArray = tempArray;
        [self.discoverdPeripheralsTableView reloadData];
    };
    
    blutooth.blutoothToolContectedUnlink = ^(NSArray *tempArray){
        NSLog(@"断开连接");
        self.sourceArray = tempArray;
        [self.discoverdPeripheralsTableView reloadData];
    };
    
    [_discoverdPeripheralsTableView registerClass:[YDBluetoothCell class] forCellReuseIdentifier:kPeripheralCellIdentifier];
    
    [[NSNotificationCenter defaultCenter] addObserver:self.discoverdPeripheralsTableView selector:@selector(reloadData) name:UPDATE_PRINTERINFO object:nil];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(showConnectSucc:) name:@"connectSucc" object:nil];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(showConnectFail:) name:@"connectFail" object:nil];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(showDisconSucc:) name:@"disConnectSucc" object:nil];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(showDisconFail:) name:@"disConnectFail" object:nil];
}

- (void)rightAction:(UIButton *)sender {
    [[YDBlutoothTool sharedBlutoothTool]breakConnect:NO];
}

- (void)initTableView {
    
    UITableView *tableView = [[UITableView alloc] initWithFrame:CGRectMake(0, 64, UI_SCREEN_WIDTH, UI_SCREEN_HEIGHT - 64)];
    tableView.delegate = self;
    tableView.dataSource = self;
    [tableView setTableFooterView:[[UIView alloc] initWithFrame:CGRectZero]];
    [self.view addSubview:tableView];
    self.discoverdPeripheralsTableView = tableView;
    tableView.separatorColor = RGB(0xC9, 0xC9, 0xC9);
    tableView.separatorInset = UIEdgeInsetsMake(0, -20, 0, 0);        // 设置端距，这里表示separator离左边和右边均80像素
    tableView.separatorStyle = UITableViewCellSeparatorStyleSingleLine;
    [tableView registerNib:[UINib nibWithNibName:@"YDBluetoothCell" bundle:nil] forCellReuseIdentifier:@"bluetoothCell"];
    self.automaticallyAdjustsScrollViewInsets = NO;
}

- (void)viewWillAppear:(BOOL)animated {
    
    [super viewWillAppear:animated];
    [self.navigationController setNavigationBarHidden:NO animated:YES];
    
    if([[YDBlutoothTool sharedBlutoothTool]getBluetoothState] != CBCentralManagerStatePoweredOn)
       [self showAlertViewWithTitle:@"蓝牙开关尚未开启"];
    
    [[YDBlutoothTool sharedBlutoothTool]updateBlueToothArray];
    
}
- (void)showConnectFail:(NSNotification *)noti {

    NSString *strName = (NSString *)[noti object];
    [self hideProgressViewN];
    //[self showAlertViewWithTitle:[NSString stringWithFormat:@"与%@断开连接",strName]];
}

- (void)showConnectSucc:(NSNotification *)noti {
    
    NSString *strName = (NSString *)[noti object];
    [self hideProgressViewN];
    [self showAlertViewWithTitle:[NSString stringWithFormat:@"与%@连接成功",strName]];
}
- (void)showDisconFail:(NSNotification *)noti {
    
    NSString *strName = (NSString *)[noti object];
    [self hideProgressViewN];
    [self showAlertViewWithTitle:[NSString stringWithFormat:@"与%@断开失败",strName]];
}

- (void)showDisconSucc:(NSNotification *)noti {
    
    NSString *strName = (NSString *)[noti object];
    [self hideProgressViewN];
    [self showAlertViewWithTitle:[NSString stringWithFormat:@"与%@断开成功",strName]];
}

- (void)viewWillDisappear:(BOOL)animated {

    [super viewWillDisappear:animated];
    [self.navigationController setNavigationBarHidden:YES animated:YES];
}

#pragma mark - UITableViewDelegate, UITableViewDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    return 45.f;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.sourceArray.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    YDBluetoothCell *cell = [YDBluetoothCell bluetoothCellWithTableView:tableView andIndexPath:indexPath];
    cell.conStateBtn.tag = indexPath.row;
    
    cell.selectedBackgroundView = [[UIView alloc] initWithFrame:cell.frame];
    cell.selectedBackgroundView.backgroundColor = RGBA(0x00, 0x00, 0x00, 0.3);
    [cell setBackgroundColor:[UIColor clearColor]];
    
    YDBluetoothConnectModel *model = self.sourceArray[indexPath.row];
    cell.titilString = model.peripheral.name;
    if (model.bluetoothConnectType == YDBluetoothConnect)
    {
        cell.isConnected = YES;
    }
    else
    {
        cell.isConnected = NO;
    }
    [cell.conStateBtn addTarget:self action:@selector(connectBluePrintAtIndex:) forControlEvents:UIControlEventTouchUpInside];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section
{
    return 0.1;
}

- (void)connectBluePrintAtIndex:(UIButton *)selBtn{
    
    _curBluConModel = [_sourceArray objectAtIndex:selBtn.tag];
    if (_curBluConModel.bluetoothConnectType == YDBluetoothConnect) {
        RunOnMainThread([self showProgressViewWithTitle:@"蓝牙打印机断开中..." andTimeout:5.0];)
    } else {
        RunOnMainThread([self showProgressViewWithTitle:@"蓝牙打印机连接中..." andTimeout:5.0];)
    }
    [[YDBlutoothTool sharedBlutoothTool] connectActionWithPerial:_curBluConModel];
}
@end
