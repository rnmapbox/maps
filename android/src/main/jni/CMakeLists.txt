cmake_minimum_required(VERSION 3.13)

set(LIB_LITERAL rnmapbox_maps_specs)
set(LIB_TARGET_NAME react_codegen_${LIB_LITERAL})

set(LIB_ANDROID_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../..)
set(LIB_CPP_DIR ${LIB_ANDROID_DIR}/../cpp)
set(LIB_ANDROID_GENERATED_JNI_DIR ${LIB_ANDROID_DIR}/build/generated/source/codegen/jni)
set(LIB_ANDROID_GENERATED_COMPONENTS_DIR ${LIB_ANDROID_GENERATED_JNI_DIR}/react/renderer/components/${LIB_LITERAL})

file(GLOB LIB_CUSTOM_SRCS CONFIGURE_DEPENDS ${LIB_CPP_DIR}/react/renderer/components/${LIB_LITERAL}/*.cpp ${CMAKE_CURRENT_SOURCE_DIR}/*.cpp)
file(GLOB LIB_CODEGEN_SRCS CONFIGURE_DEPENDS ${LIB_ANDROID_GENERATED_JNI_DIR}/*.cpp ${LIB_ANDROID_GENERATED_COMPONENTS_DIR}/*.cpp)

add_library(${LIB_TARGET_NAME} OBJECT ${LIB_CUSTOM_SRCS} ${LIB_CODEGEN_SRCS})

# `.` comes first so autolinking picks up our rnmapbox_maps_specs.h instead of the generated one.
target_include_directories(
  ${LIB_TARGET_NAME}
  PUBLIC
  .
  ${LIB_CPP_DIR}
  ${LIB_ANDROID_GENERATED_JNI_DIR}
  ${LIB_ANDROID_GENERATED_COMPONENTS_DIR}
)

target_link_libraries(${LIB_TARGET_NAME} fbjni jsi reactnative)

if(COMMAND target_compile_reactnative_options)
  target_compile_reactnative_options(${LIB_TARGET_NAME} PRIVATE)
else()
  target_compile_options(${LIB_TARGET_NAME} PRIVATE -DLOG_TAG=\"ReactNative\" -fexceptions -frtti -std=c++20 -Wall)
endif()
