#  litcal-ios

Yes, it is definitely possible to embed a SwiftUI view into a UIKit application, even if your UIKit app is written in Objective-C. `UIHostingController` is a UIKit controller that can host a SwiftUI view, enabling you to integrate SwiftUI components seamlessly into your UIKit-based projects. Here's how you can do it:

### Step 1: Create Your SwiftUI View

First, define your SwiftUI view in Swift. If you haven't already, you will need to create a Swift file in your Objective-C project to write your SwiftUI code. Xcode will automatically prompt you to create a bridging header if needed, which allows your Objective-C code to access Swift classes and vice versa.

**Example SwiftUI View (Swift)**
```swift
import SwiftUI

struct MySwiftUIView: View {
    var body: some View {
        Text("Hello, SwiftUI!")
            .padding()
    }
}
```

### Step 2: Use `UIHostingController` to Embed SwiftUI in UIKit

You'll embed your SwiftUI view in a `UIHostingController`. Since `UIHostingController` is a Swift class, you'll need to create a Swift class that initializes the `UIHostingController` with your SwiftUI view. This is because Objective-C doesn't directly support generics, which `UIHostingController` uses to specify the SwiftUI view it will host.

**Example Swift Class to Host SwiftUI View**
```swift
import UIKit
import SwiftUI

// Define a Swift class that creates a UIHostingController
class MySwiftUIHostingController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // Initialize your SwiftUI view
        let swiftUIView = MySwiftUIView()

        // Create a UIHostingController with your SwiftUI view
        let hostingController = UIHostingController(rootView: swiftUIView)

        // Add the hostingController as a child view controller
        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.didMove(toParent: self)

        // Set constraints or frame for the hostingController's view as needed
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        hostingController.view.frame = self.view.bounds
    }
}
```

### Step 3: Bridge Your Swift Class to Objective-C

To use your new Swift class (`MySwiftUIHostingController`) in Objective-C, you need to ensure it inherits from an Objective-C compatible class (like `UIViewController`, as in the example) and is marked with `@objc` or `@objcMembers` if you want to expose the entire class to Objective-C. The example above is already compatible due to inheriting from `UIViewController`.

**Ensure Your Swift Class is Accessible**
- The Swift file with your class should automatically be visible to Objective-C files in the same project, thanks to the project's bridging header. If not, you might need to import your project's Swift header into the Objective-C implementation file where you want to use your Swift class. This header is typically named `<YourProjectName>-Swift.h`.

### Step 4: Instantiate Your Swift Class in Objective-C

Now you can instantiate and use `MySwiftUIHostingController` in your Objective-C code.

**Example Objective-C Usage**
```objective-c
#import "<YourProjectName>-Swift.h"

@implementation SomeObjectiveCClass

- (void)presentSwiftUI {
    MySwiftUIHostingController *swiftUIController = [[MySwiftUIHostingController alloc] init];
    [self presentViewController:swiftUIController animated:YES completion:nil];
}

@end
```

This example demonstrates how to present your SwiftUI view modally from an Objective-C class. Adjust the instantiation and presentation logic as needed for your app's architecture, such as pushing to a navigation controller or embedding as a child view controller in an existing UI layout.

### Final Notes

- **Interoperability**: Remember that Swift and Objective-C can interoperate seamlessly within the same project, so you can incrementally introduce SwiftUI into your existing Objective-C UIKit app.
- **Project Configuration**: Ensure your project is configured to support both Swift and Objective-C. This typically involves having a bridging header for Objective-C to Swift usage and ensuring your build settings are correct for Swift compilation.

