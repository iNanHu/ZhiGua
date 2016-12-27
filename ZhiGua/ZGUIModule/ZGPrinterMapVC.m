//
//  ZGPrinterMapVC.m
//  ZhiGua
//
//  Created by alexyang on 2016/12/25.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import "ZGPrinterMapVC.h"
//#import "AnimatedAnnotation.h"
//#import <MAMapKit/MAMapKit.h>

@interface ZGPrinterMapVC ()//<MAMapViewDelegate>
//@property (nonatomic, strong) MAMapView *mapView;
//@property (nonatomic, strong) AnimatedAnnotation *animatedCarAnnotation;
//@property (nonatomic, strong) AnimatedAnnotation *animatedTrainAnnotation;
@end

@implementation ZGPrinterMapVC
//@synthesize animatedCarAnnotation = _animatedCarAnnotation;
//@synthesize animatedTrainAnnotation = _animatedTrainAnnotation;

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
//    self.mapView = [[MAMapView alloc] initWithFrame:self.view.bounds];
//    self.mapView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
//    self.mapView.delegate = self;
//    [self.view addSubview:self.mapView];
//    
//    [self addCarAnnotationWithCoordinate:CLLocationCoordinate2DMake(39.948691, 116.492479)];
//    [self addTrainAnnotationWithCoordinate:CLLocationCoordinate2DMake(39.843349, 116.315633)];
}

#pragma mark - Utility

//-(void)addCarAnnotationWithCoordinate:(CLLocationCoordinate2D)coordinate
//{
//    NSMutableArray *carImages = [[NSMutableArray alloc] init];
//    [carImages addObject:[UIImage imageNamed:@"animatedCar_1.png"]];
//    [carImages addObject:[UIImage imageNamed:@"animatedCar_2.png"]];
//    [carImages addObject:[UIImage imageNamed:@"animatedCar_3.png"]];
//    [carImages addObject:[UIImage imageNamed:@"animatedCar_4.png"]];
//    [carImages addObject:[UIImage imageNamed:@"animatedCar_3.png"]];
//    [carImages addObject:[UIImage imageNamed:@"animatedCar_4.png"]];
//    
//    self.animatedCarAnnotation = [[AnimatedAnnotation alloc] initWithCoordinate:coordinate];
//    self.animatedCarAnnotation.animatedImages   = carImages;
//    self.animatedCarAnnotation.title            = @"AutoNavi";
//    self.animatedCarAnnotation.subtitle         = [NSString stringWithFormat:@"Car: %lu images",(unsigned long)[self.animatedCarAnnotation.animatedImages count]];
//    
//    [self.mapView addAnnotation:self.animatedCarAnnotation];
//}
//
//-(void)addTrainAnnotationWithCoordinate:(CLLocationCoordinate2D)coordinate
//{
//    NSMutableArray *trainImages = [[NSMutableArray alloc] init];
//    [trainImages addObject:[UIImage imageNamed:@"animatedTrain_1.png"]];
//    [trainImages addObject:[UIImage imageNamed:@"animatedTrain_2.png"]];
//    [trainImages addObject:[UIImage imageNamed:@"animatedTrain_3.png"]];
//    [trainImages addObject:[UIImage imageNamed:@"animatedTrain_4.png"]];
//    
//    self.animatedTrainAnnotation = [[AnimatedAnnotation alloc] initWithCoordinate:coordinate];
//    self.animatedTrainAnnotation.animatedImages = trainImages;
//    self.animatedTrainAnnotation.title          = @"AutoNavi";
//    self.animatedTrainAnnotation.subtitle       = [NSString stringWithFormat:@"Train: %lu images",(unsigned long)[self.animatedTrainAnnotation.animatedImages count]];
//    
//    [self.mapView addAnnotation:self.animatedTrainAnnotation];
//    [self.mapView selectAnnotation:self.animatedTrainAnnotation animated:YES];
//}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
