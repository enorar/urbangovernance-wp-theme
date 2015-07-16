<?php
/**
 * Register translatable theme strings for Polylang, if Polylang is active.
 */
if(function_exists('pll_register_string')) {
  // Polylang translation context for this theme
  define('URBANGOVERNANCE_POLYLANG_CONTEXT', 'urbangovernance');

  pll_register_string('"View more" button', 'View more', URBANGOVERNANCE_POLYLANG_CONTEXT, FALSE);
}
