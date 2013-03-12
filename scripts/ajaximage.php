<?php
error_reporting(E_ALL);
ini_set("display_errors", 1); 

//include('db.php');
session_start();
$session_id='1'; //$session id
$path = "../content/pdf/";
if($_GET['opt1'] != -1){
	$path = $path.$_GET['opt1'].'/';
}

	$valid_formats = array("jpg", "jpeg", "png", "gif", "bmp", "pdf");
	if(isset($_POST) and $_SERVER['REQUEST_METHOD'] == "POST")
		{
			$name = $_FILES['photoimg']['name'];
			$size = $_FILES['photoimg']['size'];
			
			if(strlen($name))
				{
					list($txt, $ext) = explode(".", $name);
					if(in_array(strtolower($ext),$valid_formats))
					{
					if($size<(2048*2048))
						{
							$actual_image_name = /* todo: generate id */"123abc.".$ext;
							$tmp = $_FILES['photoimg']['tmp_name'];
							if(move_uploaded_file($tmp, $path.$actual_image_name))
								{
									$image_id = substr($actual_image_name, 0, strlen($actual_image_name)-4);
									
									echo "Done Uploading!";
								}
							else
								echo "failed";
						}
						else
						echo "Image file size max 4 MB";					
						}
						else
						echo "Invalid file format..";	
				}
				
			else
				echo "Please select image..!";
				
			exit;
		}
?>