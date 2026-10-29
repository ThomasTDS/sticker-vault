# ML Kit discovers its components by reflection; R8 must keep their no-arg constructors.
-keep class * implements com.google.firebase.components.ComponentRegistrar { public <init>(); }
-keep class com.google.mlkit.** { *; }

# JNI looks up the native methods by class and method name.
-keepclasseswithmembernames,includedescriptorclasses class com.thomastds.stickermaker.AnimatedWebpEncoder {
    native <methods>;
}
