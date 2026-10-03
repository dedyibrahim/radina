<?php
$image = imagecreatefromstring(file_get_contents($argv[1]));
if (!$image) exit(1);
$scale = min(1,1000/max(imagesx($image),imagesy($image)));
$resized = imagescale($image,max(1,(int)(imagesx($image)*$scale)),max(1,(int)(imagesy($image)*$scale)));
imagewebp($resized,$argv[2],79);
