# Yidm V3

An attempt to reverse engineer an Android React Native APP.

While in theory you could inject your own JS code and debug it dynamically, this is almost entirely static analysis.

Provided method to generate random device ID and app token.

## NOTICE

This project is for learning and communication purposes only. Any misuse of the code in this project is at the user's sole responsibility.

## usage

Install this package by `yarn add @kohaku/yidm-v3` and use it to construct params in request sent to yidm.

It is now possible to construct device id randomly from strings.

Though it is configured to generate both `commonjs` and `esmodule`, it seems to only work in `commonjs`.

## demo

A demo of using this package to log in and crawl book information and bulk download books in epub format is provided at branch `demo`.

There are still some problems and imperfections, but it works; You can get the demo by access: <https://github.com/ymd45921/Yidm-v3/tree/demo>.

The package and the demo will not be updated any more.

---

*The greatest respect and most sincere thanks to Yidm, R.I.P.*
