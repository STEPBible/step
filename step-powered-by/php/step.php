<?php
    class STEP {
        private static $STEP_URI = "http://step.tyndalehouse.com/rest/";
        private static $GET_TEXT = "/bible/getBibleText/%s/%s/%s";
        private static $version = "1.0";
        private $stepSession;
        
        public function getPassage($version, $reference) {
            $url = "a"; //+self::$STEP_URI; // + sprintf(self::$GET_TEXT, $version, $reference, "HEADINGS,VERSE_NUMBERS");
            echo "---" + $url + "---";
            
            return $this->accessBackend($url);
        }
        
        private function accessBackend($url) {
            echo $url;
            $stepSession = $ch = curl_init( $url );

            // Configuring curl options
            $options = array(
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => array('Content-type: application/json') ,
            );
 
            // Setting curl options
            curl_setopt_array( $stepSession, $options );
 
 
            // Getting results
            $response = curl_exec($stepSession);
            
            echo curl_error($stepSession);
            
            curl_close($stepSession);
            
            return $response;
        }
    }
?>
