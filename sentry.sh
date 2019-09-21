#!/bin/sh

sentry-cli releases -o trustwallet -p platform new -p platform $SOURCE_VERSION
sentry-cli releases -o trustwallet -p platform files $SOURCE_VERSION  upload-sourcemaps "./dist"
sentry-cli releases -o trustwallet -p platform set-commits --auto $SOURCE_VERSION
releases finalize $SOURCE_VERSION
