cmake_minimum_required(VERSION 3.22)
project(stickermaker C)

include(FetchContent)

# Only the libraries are needed: the command-line tools and extras are skipped.
set(WEBP_BUILD_ANIM_UTILS OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_CWEBP OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_DWEBP OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_GIF2WEBP OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_IMG2WEBP OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_VWEBP OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_WEBPINFO OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_WEBPMUX OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_EXTRAS OFF CACHE BOOL "" FORCE)
set(WEBP_BUILD_LIBWEBPMUX ON CACHE BOOL "" FORCE)

# libwebp (BSD license) from the official release, pinned by hash.
FetchContent_Declare(
  libwebp
  URL https://github.com/webmproject/libwebp/archive/refs/tags/v1.6.0.tar.gz
  URL_HASH SHA256=93a852c2b3efafee3723efd4636de855b46f9fe1efddd607e1f42f60fc8f2136
  DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(libwebp)

add_library(animated-webp SHARED src/main/cpp/animated_webp.c)
target_include_directories(animated-webp PRIVATE ${libwebp_SOURCE_DIR}/src)
target_link_libraries(animated-webp libwebpmux webp jnigraphics log)
