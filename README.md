# Simple Blog / Online-Shop buidler

[Visit website](https://www.mymountmt.ru/main/)

## Features

+ Creation of pages and posts in 1 click.
+ Inline editing.
+ Embedding your own items (components).
+ Support of CSS styling.
+ Built-in messenger, written from scratch.
+ Built-in file manager. Storage on Google Drive (more adapters in future).
+ Built-in comments.
+ User sign-in through Google or Email/Password.

# Frontend
+ React 
+ Redux-Toolkit
+ TypeScript  

# Backend
+ Django Rest Framework
+ MySQL
+ Hosting on pythonanywhere.com
+ CDN - Google Photos / Drive (because it's free)

## Screenshots
<p float="left" align="middle">
  <img src="https://raw.githubusercontent.com/dialoss/MyMountMT/master/public/preview/preview.png" width=50%>
  <img src="https://raw.githubusercontent.com/dialoss/MyMountMT/master/public/preview/messenger.png" width=50%>
    <img src="https://raw.githubusercontent.com/dialoss/MyMountMT/master/public/preview/msg2.png" width=50%>


</p>


# Technical Details

Feature-Sliced design

All content is splitted in items, that forms entire page. Each item has it's own type: Image, Video, TextField, 3D Model, File, Button, Subcription etc. And custom items, that could be easily embedded into the site, for example: Intro, Tabs, Carousel.

Custom reusable UI components:
+ Modal
+ Alert
+ Tree structures (accordion)
+ Form builder
