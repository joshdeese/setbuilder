<?php
	if(file_exists('../content/pdf/'.$_GET['type'].'/'.$_GET['id'].'.pdf')){
		header('Content-type: application/pdf');
		header('Content-disposition: inline; filename='.$_GET['id'].'.pdf');
		@readfile('../content/pdf/'.$_GET['type'].'/'.$_GET['id'].'.pdf');
	} else {
		echo "This file doesn't yet exist";
	}
?>