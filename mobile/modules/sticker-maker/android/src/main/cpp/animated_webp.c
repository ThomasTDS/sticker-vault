// JNI bridge between Android bitmaps and libwebp's animation encoder (WebPAnimEncoder).
#include <android/bitmap.h>
#include <jni.h>
#include <stdint.h>
#include <stdlib.h>

#include "webp/encode.h"
#include "webp/mux.h"

typedef struct {
  WebPAnimEncoder* encoder;
  WebPConfig config;
  int width;
  int height;
} Encoder;

JNIEXPORT jlong JNICALL
Java_com_thomastds_stickermaker_AnimatedWebpEncoder_nativeCreate(JNIEnv* env, jclass clazz, jint width,
                                                                 jint height, jfloat quality) {
  Encoder* handle = calloc(1, sizeof(Encoder));
  if (handle == NULL) {
    return 0;
  }

  WebPAnimEncoderOptions options;
  if (!WebPAnimEncoderOptionsInit(&options) || !WebPConfigInit(&handle->config)) {
    free(handle);
    return 0;
  }
  options.anim_params.loop_count = 0;  // loop forever, as WhatsApp expects
  handle->config.quality = quality;
  handle->config.method = 4;

  handle->encoder = WebPAnimEncoderNew(width, height, &options);
  if (handle->encoder == NULL) {
    free(handle);
    return 0;
  }
  handle->width = width;
  handle->height = height;
  return (jlong)(intptr_t)handle;
}

JNIEXPORT jboolean JNICALL
Java_com_thomastds_stickermaker_AnimatedWebpEncoder_nativeAddFrame(JNIEnv* env, jclass clazz, jlong pointer,
                                                                   jobject bitmap, jint timestampMs) {
  Encoder* handle = (Encoder*)(intptr_t)pointer;
  AndroidBitmapInfo info;
  if (AndroidBitmap_getInfo(env, bitmap, &info) != ANDROID_BITMAP_RESULT_SUCCESS ||
      info.format != ANDROID_BITMAP_FORMAT_RGBA_8888 || (int)info.width != handle->width ||
      (int)info.height != handle->height) {
    return JNI_FALSE;
  }

  void* pixels = NULL;
  if (AndroidBitmap_lockPixels(env, bitmap, &pixels) != ANDROID_BITMAP_RESULT_SUCCESS) {
    return JNI_FALSE;
  }

  WebPPicture picture;
  int ok = WebPPictureInit(&picture);
  if (ok) {
    picture.width = handle->width;
    picture.height = handle->height;
    picture.use_argb = 1;
    ok = WebPPictureImportRGBA(&picture, (const uint8_t*)pixels, (int)info.stride);
  }
  AndroidBitmap_unlockPixels(env, bitmap);

  if (ok) {
    ok = WebPAnimEncoderAdd(handle->encoder, &picture, timestampMs, &handle->config);
  }
  WebPPictureFree(&picture);
  return ok ? JNI_TRUE : JNI_FALSE;
}

// The end timestamp sets how long the last frame stays on screen.
JNIEXPORT jbyteArray JNICALL
Java_com_thomastds_stickermaker_AnimatedWebpEncoder_nativeFinish(JNIEnv* env, jclass clazz, jlong pointer,
                                                                 jint endTimestampMs) {
  Encoder* handle = (Encoder*)(intptr_t)pointer;
  if (!WebPAnimEncoderAdd(handle->encoder, NULL, endTimestampMs, NULL)) {
    return NULL;
  }

  WebPData data;
  WebPDataInit(&data);
  if (!WebPAnimEncoderAssemble(handle->encoder, &data)) {
    return NULL;
  }

  jbyteArray result = (*env)->NewByteArray(env, (jsize)data.size);
  if (result != NULL) {
    (*env)->SetByteArrayRegion(env, result, 0, (jsize)data.size, (const jbyte*)data.bytes);
  }
  WebPDataClear(&data);
  return result;
}

JNIEXPORT void JNICALL
Java_com_thomastds_stickermaker_AnimatedWebpEncoder_nativeRelease(JNIEnv* env, jclass clazz, jlong pointer) {
  Encoder* handle = (Encoder*)(intptr_t)pointer;
  if (handle == NULL) {
    return;
  }
  WebPAnimEncoderDelete(handle->encoder);
  free(handle);
}
