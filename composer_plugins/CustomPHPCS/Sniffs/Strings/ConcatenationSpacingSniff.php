<?php
/**
 * CustomPHPCS_Sniffs_Strings_ConcatenationSpacingSniff.
 *
 * PHP version 5
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @author    Marc McIntyre <mmcintyre@squiz.net>
 * @copyright 2006-2014 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   https://github.com/squizlabs/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */

/**
 * CustomPHPCS_Sniffs_Strings_ConcatenationSpacingSniff.
 *
 * Makes sure there are no spaces between the concatenation operator (.) and
 * the strings being concatenated.
 *
 * @category  PHP
 * @package   PHP_CodeSniffer
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @author    Marc McIntyre <mmcintyre@squiz.net>
 * @copyright 2006-2014 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   https://github.com/squizlabs/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 * @version   Release: @package_version@
 * @link      http://pear.php.net/package/PHP_CodeSniffer
 */
class CustomPHPCS_Sniffs_Strings_ConcatenationSpacingSniff implements PHP_CodeSniffer_Sniff
{


    /**
     * Returns an array of tokens this test wants to listen for.
     *
     * @return array
     */
    public function register()
    {
        return array(T_STRING_CONCAT);

    }//end register()


    /**
     * Processes this test, when one of its tokens is encountered.
     *
     * @param PHP_CodeSniffer_File $phpcsFile The file being scanned.
     * @param int                  $stackPtr  The position of the current token in the
     *                                        stack passed in $tokens.
     *
     * @return void
     */
    public function process(PHP_CodeSniffer_File $phpcsFile, $stackPtr)
    {
		$tokens = $phpcsFile->getTokens();

		if ($tokens[($stackPtr + 1)]['code'] != T_WHITESPACE)
		{
			// space after
			$message = 'Concat operator must be followed by one space';
			$phpcsFile->addError($message, $stackPtr, 'Missing');
		}
		else
		{
			if ((strpos($tokens[($stackPtr + 2)]['content'], $phpcsFile->eolChar) !== false
            && strpos($tokens[($stackPtr + 2)]['content'], $phpcsFile->eolChar) == 0)
            || (strpos($tokens[($stackPtr + 1)]['content'], $phpcsFile->eolChar) !== false
            && strpos($tokens[($stackPtr + 1)]['content'], $phpcsFile->eolChar) == 0))
			{
				// the period is followed by a new line
				return;
			}

			$found = strlen($tokens[($stackPtr + 1)]['content']);

			if ($found > 1)
			{
				$error = sprintf('Expected 1 space after concat operator; %s found', $found);
				$phpcsFile->addError($error, $stackPtr, 'Too much');
			}
		}

		if ($tokens[($stackPtr - 1)]['code'] != T_WHITESPACE)
		{
			// space before
			$message = 'Concat operator must be preceded by one space';
			$phpcsFile->addError($message, $stackPtr, 'Missing');
		}
		else
		{
			if (strpos($tokens[($stackPtr - 2)]['content'], $phpcsFile->eolChar) !== false
			|| strpos($tokens[($stackPtr - 1)]['content'], $phpcsFile->eolChar) !== false)
			{
				// the period is on a new line
				return;
			}

			$found = strlen($tokens[($stackPtr - 1)]['content']);

			if ($found > 1)
			{
				$error = sprintf('Expected 1 space before concat operator; %s found', $found);
				$phpcsFile->addError($error, $stackPtr, 'Too much');
			}
		}

    }//end process()


}//end class

?>