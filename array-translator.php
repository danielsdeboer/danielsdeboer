<!DOCTYPE html>
<html>
<head>
    <title>Array Translator</title>
    <link rel="stylesheet" type="text/css" href="c/array-translator.css">
    <script type="text/javascript" src='j/jquery-2.1.4.min.js'></script>
</head>
<body>
<h1>Array Translator</h1>


<article class="container">
    <form class="input" method="POST" action="">
        <textarea placeholder="Paste your non-associative array here. Only unique values will be preserved, as they become keys. It may be helpful to paste the body aka anything between [] and not the var itself." name="input"></textarea>
        <fieldset>
            <select name="type">
                <option value='php' selected>PHP Associative</option>
                <option value='js'>Javascript Object</option>
            </select>
            <button>Submit</button>
        </fieldset>

    </form>

<?php

if (isset($_POST['input'])) {

    $input = $_POST['input'];

    // Split the array into parts
    $input = preg_split('/[=,\'\]\[;\s]+/', $input);

    // Get rid of any empty values
    foreach ($input as $key => $value) {
        if (empty($value)) {
            unset($input[$key]);
        }
    }

    $input_translated =[];

    // Translate the values to keys, leaving an empty value
    foreach ($input as $key => $value) {
        $input_translated[$value] = '';
    }

    // Assemble the end product differently depending on what type is desired
    switch($_POST['type']) {
        case 'php':
            // Declare some array parts
            $array_start = 'array = [\'';
            $array_end = '];';

            $counter = 0;

            //
            $output = $array_start;

            foreach ($input_translated as $key => $value) {

                if ($counter == 0) {
                    $output = $output . $key . '\' => \'' . $value . '\'';
                } else {
                    $output = $output . ',\'' . $key . '\' => \'' . $value . '\'';
                }

                $counter++;
            }

            $output = $output . $array_end;
            break;

        // var car = {type:"Fiat", model:500, color:"white"};

        case 'js':
            // Declare some array parts
            $array_start = 'var obj = {';
            $array_end = '};';

            $counter = 0;

            //
            $output = $array_start;

            foreach ($input_translated as $key => $value) {

                if ($counter == 0) {
                    $output = $output . $key . ':""';
                } else {
                    $output = $output . ', ' . $key . ':""';
                }

                $counter++;
            }

            $output = $output . $array_end;
            break;
    }



}

?>

    <form class="output">
        <textarea placeholder="Get the result here"><?php if (isset($output)) { echo $output; } ?></textarea>
    </form>
</article>

</body>
</html>