# macOS Internal Webview App SourceCode

## Read First

[Inspecting Web Views in macOS](https://blog.jim-nielsen.com/2022/inspecting-web-views-in-macos/)


## System Preferences 

### Family Sharing

```
wget https://setup.icloud.com/resource/14f86e49ca62/family-mac/family-members/javascript-packed.js.map -O ./files/family-members.js.map
```

### Location Sharing

```
wget https://setup.icloud.com/resource/14f86e49ca62/family-mac/location-sharing/javascript-packed.js.map -O ./files/location-sharing.js.map
```

### App Subscription Sharing 

```
wget https://setup.icloud.com/resource/14f86e49ca62/family-mac/subscription-details/javascript-packed.js.map -O ./files/subscription-details.js.map
```

### Apple Subscription Sharing 

```
wget https://setup.icloud.com/resource/14f86e49ca62/family-mac/apple-subscriptions/javascript-packed.js.map -O ./files/apple-subscription.js.map
```

### Generate SourceCode

download files above, then


```shell
yarn

yarn generate

```