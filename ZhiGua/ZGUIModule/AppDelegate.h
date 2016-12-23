//
//  AppDelegate.h
//  BluePrint
//
//  Created by sgyaaron on 16/9/5.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import <UIKit/UIKit.h>

#import <CoreData/CoreData.h>
//static NSString *appKey = @"125b15730f973cab55cfd100";
//static NSString *channel = @"Publish channel";
//static BOOL isProduction = FALSE;

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (readonly, strong, nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong, nonatomic) NSManagedObjectModel *managedObjectModel;
@property (readonly, strong, nonatomic) NSPersistentStoreCoordinator *persistentStoreCoordinator;

- (void)saveContext;
- (NSURL *)applicationDocumentsDirectory;
+ (AppDelegate *)sharedAppDelegate;

@end

