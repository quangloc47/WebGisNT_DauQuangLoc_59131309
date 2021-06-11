<?php
    $host = "localhost";
    $dbname = "QLNT";
    $port = "5432";
    $user = "postgres";
    $password = "admin";
    $conn = pg_connect("host = $host dbname= $dbname port= $port user = $user password = $password") 
    or die ("Could not connect to Server");
    
    if (!$conn) {
        echo die("Connection failed !!!");
    }
    // pg_close($conn);
?>
