//
//  ZGUserMapVC.m
//  ZhiGua
//
//  Created by alexyang on 2016/12/25.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//
#import "WGS84TOGCJ02.h"
#import "ZGUserMapVC.h"
#import "ZJLocationService.h"
#import "AnimatedAnnotation.h"
#import <MAMapKit/MAMapKit.h>
#import "MMPrinterManager.h"
#import "UserDataMananger.h"

@interface ZGUserMapVC ()<MAMapViewDelegate>
@property (nonatomic, strong) MAMapView *mapView;
@property (nonatomic, strong) NSMutableArray *arrAniotation;
@property (nonatomic, strong) AnimatedAnnotation *animatedCarAnnotation;
@property (nonatomic, strong) AnimatedAnnotation *animatedTrainAnnotation;
@end

@implementation ZGUserMapVC
@synthesize animatedCarAnnotation = _animatedCarAnnotation;
@synthesize animatedTrainAnnotation = _animatedTrainAnnotation;

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.title = @"我的商客圈";
    self.hidLeftButton = NO;
    
    self.mapView = [[MAMapView alloc] initWithFrame:CGRectMake(0, 0, UI_SCREEN_WIDTH, UI_SCREEN_HEIGHT)];
    self.mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.mapView.delegate = self;
    [self.mapView setZoomLevel:12];
    [self.view addSubview:self.mapView];

    //开始定位
    [self startLocation];
    CLLocationCoordinate2D curLocation = [[UserDataMananger sharedManager] curLoaction2D];
    _mapView.centerCoordinate = curLocation;
}

- (void)startLocation {

    BOOL bLocation = [ZJLocationService statrLocation];
    if (bLocation) {
        //开启后台定位
        [ZJLocationService backgroundForPauseTime:0 locationCounts:5];
        
        [ZJLocationService sharedModel].lastBlock = ^(CLLocation *location) {
            NSLog(@"block backgroundLocation: %f", location.coordinate.latitude);
            [ZJLocationService statrLocation];
            //开启后台定位
            [ZJLocationService backgroundForPauseTime:0 locationCounts:100];
        };
        [ZJLocationService sharedModel].updateBlock = ^(CLLocation *location) {
            //NSLog(@"update Location: %f,%f", location.coordinate.latitude,location.coordinate.longitude);
            CLLocationCoordinate2D curLocation;
            //判断是不是属于国内范围
            if ([WGS84TOGCJ02 isLocationOutOfChina:location.coordinate]) {
                return ;
            }
            //转换后的coord
            curLocation = [WGS84TOGCJ02 transformFromWGSToGCJ:location.coordinate];
            
            //获取当前位置信息
            CLLocationCoordinate2D lasLocation2D = [[UserDataMananger sharedManager] curLoaction2D];
            if (lasLocation2D.longitude == 0 && lasLocation2D.latitude == 0) {
                _mapView.centerCoordinate = curLocation;
                [[MMPrinterManager shareInstance]getUserPostionList];
            }
            [[UserDataMananger sharedManager]setCurLoaction2D:curLocation];
            NSInteger iPos = [[ZJLocationService sharedModel] updateRate];
            if (iPos++ == 0 || iPos >= 20) {
                iPos = iPos%20;
                [[MMPrinterManager shareInstance]reportLatitude:curLocation.latitude andLongitude:curLocation.longitude];
                [[MMPrinterManager shareInstance]getUserPostionList];
            }
            [[ZJLocationService sharedModel]setUpdateRate:iPos];
        };
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)updateUserMapInfo:(NSNotification*) noti {
    
    NSArray *arrMapInfo = (NSArray *)[noti object];
    NSLog(@"updateUserMapInfo: %@",[arrMapInfo description]);
    [_mapView removeAnnotations:self.arrAniotation];
    [self.arrAniotation removeAllObjects];
    for (NSDictionary *dicInfo in arrMapInfo) {
        CLLocationDegrees latitude = [[dicInfo objectForKey:@"latitude"] doubleValue];
        CLLocationDegrees longitude = [[dicInfo objectForKey:@"longitude"] doubleValue];
        [self addPrinterAnnotationWithCoordinate:CLLocationCoordinate2DMake(latitude, longitude)];
    }
}

- (void)viewWillAppear:(BOOL)animated {
    
    [super viewWillAppear:animated];
    
    [self.navigationController setNavigationBarHidden:NO animated:YES];
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(updateUserMapInfo:) name:@"updateUserMapInfo" object:nil];
     [[MMPrinterManager shareInstance]getUserPostionList];
}

- (void)viewWillDisappear:(BOOL)animated {
    
    [super viewWillDisappear:animated];
    [self.navigationController setNavigationBarHidden:YES animated:YES];
    [[NSNotificationCenter defaultCenter]removeObserver:self name:@"updateUserMapInfo" object:nil];
}

-(void)addPrinterAnnotationWithCoordinate:(CLLocationCoordinate2D)coordinate
{
    MAPointAnnotation *pointAnnotation = [[MAPointAnnotation alloc] init];
    pointAnnotation.coordinate = coordinate;
    pointAnnotation.title = @"1商客用户";
    pointAnnotation.subtitle = @"";
    [self.arrAniotation addObject:pointAnnotation];
    [_mapView addAnnotation:pointAnnotation];
}

- (MAAnnotationView *)mapView:(MAMapView *)mapView viewForAnnotation:(id <MAAnnotation>)annotation
{
    if ([annotation isKindOfClass:[MAPointAnnotation class]])
    {
        static NSString *pointReuseIndentifier = @"pointReuseIndentifier";
        MAPinAnnotationView*annotationView = (MAPinAnnotationView*)[mapView dequeueReusableAnnotationViewWithIdentifier:pointReuseIndentifier];
        if (annotationView == nil)
        {
            annotationView = [[MAPinAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:pointReuseIndentifier];
        }
        annotationView.canShowCallout= YES;       //设置气泡可以弹出，默认为NO
        annotationView.animatesDrop = YES;        //设置标注动画显示，默认为NO
        annotationView.pinColor = MAPinAnnotationColorRed;
        return annotationView;
    }
    return nil;
}
//- (MAAnnotationView *)mapView:(MAMapView *)mapView viewForAnnotation:(id<MAAnnotation>)annotation
//{
//    if ([annotation isKindOfClass:[MAPointAnnotation class]])
//    {
//        static NSString *reuseIndetifier = @"annotationReuseIndetifier";
//        MAAnnotationView *annotationView = (MAAnnotationView *)[mapView dequeueReusableAnnotationViewWithIdentifier:reuseIndetifier];
//        if (annotationView == nil)
//        {
//            annotationView = [[MAAnnotationView alloc] initWithAnnotation:annotation
//                                                          reuseIdentifier:reuseIndetifier];
//        }
//        annotationView.image = [UIImage imageNamed:@"icon_printer"];
//        annotationView.canShowCallout= YES;       //设置气泡可以弹出，默认为NO
//        //设置中心点偏移，使得标注底部中间点成为经纬度对应点
//        annotationView.centerOffset = CGPointMake(0, -18);
//        return annotationView;
//    }
//    return nil;
//}

- (NSMutableArray *)arrAniotation {
    
    if (!_arrAniotation) {
        _arrAniotation = [NSMutableArray new];
    }
    return _arrAniotation;
}
@end
