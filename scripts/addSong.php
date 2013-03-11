<?php
	$myData = $_GET['songData'];
	$filename = '../data/songs.txt';
	$handler = fopen($filename, 'r');
	$read = fread($handler, filesize($filename));
	$liveData = array();
	$liveData = json_decode($read);
	$liveData[] = $myData;
	
	fclose($handler);
	
	asort($liveData);
	
	$write = file_put_contents($filename, json_encode($liveData));
	echo json_encode($liveData);
?>