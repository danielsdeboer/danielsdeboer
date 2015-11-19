<?php

include 'wordlist.php';

// var_dump($wordlist);

$word_list_extended = file('wordlist.txt', FILE_IGNORE_NEW_LINES);

// var_dump($word_list_extended);

foreach($word_list_extended as $key => &$words) {

    // Break up the string into parts
    $words = ( explode( ' ', strtolower($words) ) );

    // Get rid of the part of speech definition
    unset($words[1]);

    // Check each subarray against the canonical word_list array
    // If it isn't there, discard that index
    if (!in_array($words[0], $word_list)) {
        unset($word_list_extended[$key]);
    }

    // Filter out any non-alphabetical characters
    foreach($words as &$word) {
        $word = preg_replace('/[^a-z]+/', '', $word);
    }

    // Unset indexes with empty values
    foreach($words as $key => &$word) {
        if (empty($word)) {
            unset($words[$key]);
        }
    }
}

$words = [];

// Flatten the word_list_extended array
foreach($word_list_extended as $word_list) {
    foreach ($word_list as $word) {
        $words[] = $word;
    }
}

// Output the array so I can lazily copy and paste it to javascript
echo '\'';
foreach($words as $word) {
    echo $word . '\',\'';
}

?>