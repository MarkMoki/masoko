# Android location permissions

After `npx cap add android`, ensure `android/app/src/main/AndroidManifest.xml` includes:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

iOS: add `NSLocationWhenInUseUsageDescription` to `Info.plist` when using GPS on merchant map.
