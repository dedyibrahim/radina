<?php
$canvas=imagecreatetruecolor(1000,ceil(19/5)*230);imagefill($canvas,0,0,imagecolorallocate($canvas,255,249,245));
for($i=1;$i<=19;$i++){$path=__DIR__.'/../frontend/public/images/demos/photo-'.$i.'.webp';if(!file_exists($path))continue;$image=imagecreatefromwebp($path);$x=(($i-1)%5)*200;$y=intdiv($i-1,5)*230;imagecopyresampled($canvas,$image,$x,$y,0,0,200,200,imagesx($image),imagesy($image));imagestring($canvas,5,$x+8,$y+207,(string)$i,imagecolorallocate($canvas,60,35,30));}
imagepng($canvas,__DIR__.'/../test-results/experiences/contact-sheet.png');
