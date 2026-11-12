<?php
/*
 * TYPESET on the server (#22): core/typeset.js's rules in PHP, so a WordPress page arrives set and nothing shifts
 * after it loads. Same rules, same output: markup/typeset.json holds the cases, and `npm test` runs this file against
 * them (php server/typeset.php --cases markup/typeset.json). Change a rule in core/typeset.js first, then here and in
 * typeset.py, then `npm run typeset`.
 *
 *   require_once 'node_modules/marccent-theme/server/typeset.php';
 *   echo \Marccent\typeset_html($block_html);    // markup: every text in it but code, pre, kbd, samp, script, style,
 *                                                // textarea, sup, sub, .no-typeset and [contenteditable]
 *   echo \Marccent\typeset('Mon--Fri', true);    // plain text in, escaped HTML out (true: keep the last two words)
 */

namespace Marccent;

const TYPESET_NBSP = "\u{00A0}";
// The units a number keeps beside it (core/typeset.js UNITS).
const TYPESET_UNITS = [ 'kg', 'g', 'mg', 'lbs?', 'oz', 'km', 'm', 'cm', 'mm', 'mi', 'ft', 'in', 'yd', 'ac', 'ha', 'L',
	'ml', 'gal', '°F', '°C', '°', '%', 'hrs?', 'min', 'sec', 'mph', 'km/h', 'kWh', 'kW', 'W', 'V', 'psi', 'sq ft', 'sq m' ];
const TYPESET_LENGTHS = 'mm|cm|km|m|ft|in|yd|mi';
// Not a letter or a digit next (JS (?![\p{L}\d])). (*UCP) makes \s and \S Unicode, as JS's are; \d stays [0-9].
const TYPESET_END = '(?![\p{L}0-9])';
const TYPESET_SKIP = [ 'code', 'pre', 'kbd', 'samp', 'script', 'style', 'textarea', 'sup', 'sub' ];
const TYPESET_VOID = [ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr' ];

/** The text with its characters replaced: everything that needs no element. */
function typeset_characters( string $text ): string {
	$nbsp = TYPESET_NBSP;
	$end  = TYPESET_END;
	$text = str_replace( '...', '…', $text );
	$text = preg_replace( '~([0-9]) ?-- ?(?=[0-9])~u', '$1–', $text );
	$text = preg_replace( '~(*UCP)(\S)--(?=\S)~u', '$1–', $text );
	$text = preg_replace( '~ ?-- ?~u', '—', $text );
	$text = preg_replace_callback( '~\((tm|r|sm|c)\)~iu', fn( $m ) => [ 'tm' => '™', 'r' => '®', 'sm' => '℠', 'c' => '©' ][ strtolower( $m[1] ) ], $text );
	$text = preg_replace( '~([0-9])\'([0-9]{1,2})"~u', '$1′$2″', $text );
	$text = preg_replace( "~([0-9])\"$end~u", '$1″', $text );
	$text = preg_replace( "~([0-9])'$end~u", '$1′', $text );
	$text = preg_replace_callback( '~([0-9][0-9,.]*) ?(' . TYPESET_LENGTHS . ")([23])$end~u", fn( $m ) => $m[1] . $nbsp . $m[2] . [ 2 => '²', 3 => '³' ][ $m[3] ], $text );
	return preg_replace( '~([0-9]) (?=(?:' . implode( '|', TYPESET_UNITS ) . ")$end)~u", '$1' . $nbsp, $text );
}

/**
 * The text set, as HTML: escaped, raised parts (an ordinal's letters, ™ ® ℠) in <sup>.
 * @param string $text Plain text.
 * @param bool   $widow Keep the last two words together.
 */
function typeset( string $text, bool $widow = false ): string {
	$set = typeset_characters( $text );
	if ( $widow ) {
		$set = preg_replace( '~(*UCP) (\S{1,12}\s*)$~uD', TYPESET_NBSP . '$1', $set, 1 );
	}
	$esc = fn( $s ) => htmlspecialchars( $s, ENT_NOQUOTES | ENT_HTML5, 'UTF-8' );
	$out = '';
	$at  = 0;
	preg_match_all( '~([0-9])(st|nd|rd|th)' . TYPESET_END . '|([™®℠])~u', $set, $found, PREG_SET_ORDER | PREG_OFFSET_CAPTURE );
	foreach ( $found as $m ) {
		$ordinal = isset( $m[2] ) && $m[2][1] >= 0 && '' !== $m[2][0];
		$start   = $m[0][1] + ( $ordinal ? 1 : 0 );
		$out    .= $esc( substr( $set, $at, $start - $at ) ) . '<sup>' . ( $ordinal ? $m[2][0] : $m[3][0] ) . '</sup>';
		$at      = $m[0][1] + strlen( $m[0][0] );
	}
	return $out . $esc( substr( $set, $at ) );
}

/**
 * Markup set in place, as typesetElement() sets an element: every text but the skipped ones, the last one keeping
 * its last two words together.
 * @param string $html Markup a server wrote (a block, a post's content).
 */
function typeset_html( string $html ): string {
	$attr   = '(?:\s+[^\s"\'>/=]+(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?)*';
	$tokens = preg_split( "~(<!--.*?-->|<![^>]*>|<\?.*?>|</?[a-zA-Z][^\s/>]*$attr\s*/?>)~s", $html, -1, PREG_SPLIT_DELIM_CAPTURE );
	$stack  = []; // [ name, skipped ]
	$texts  = []; // token indexes of the texts to set
	for ( $i = 0; $i < count( $tokens ); $i++ ) {
		$t = $tokens[ $i ];
		if ( 1 === $i % 2 ) {
			if ( ! preg_match( '~^<(/?)([a-zA-Z][^\s/>]*)~', $t, $tag ) ) {
				continue; // A comment, a doctype.
			}
			$name = strtolower( $tag[2] );
			if ( '/' === $tag[1] ) {
				$open = array_keys( array_column( $stack, 0 ), $name, true );
				if ( $open ) {
					$stack = array_slice( $stack, 0, end( $open ) );
				}
				continue;
			}
			if ( in_array( $name, TYPESET_VOID, true ) || str_ends_with( $t, '/>' ) ) {
				continue;
			}
			$skipped = ( $stack && end( $stack )[1] ) || in_array( $name, TYPESET_SKIP, true )
				|| preg_match( '~\scontenteditable(?=[\s=/>])~i', $t )
				|| preg_match( '~\sclass\s*=\s*(?:"[^"]*|\'[^\']*|)(?<![\w-])no-typeset(?![\w-])~i', $t );
			$stack[] = [ $name, (bool) $skipped ];
			if ( in_array( $name, [ 'script', 'style', 'textarea', 'title' ], true ) ) {
				// Raw text up to its end tag, which the split may have cut at a "<" inside it.
				while ( $i + 2 < count( $tokens ) && ! preg_match( "~^</$name\s*>~i", $tokens[ $i + 2 ] ) ) {
					$tokens[ $i + 1 ] .= $tokens[ $i + 2 ] . $tokens[ $i + 3 ];
					array_splice( $tokens, $i + 2, 2 );
				}
			}
		} elseif ( '' !== $t && ! ( $stack && end( $stack )[1] ) ) {
			$texts[] = $i;
		}
	}
	foreach ( $texts as $n => $i ) {
		$plain = html_entity_decode( $tokens[ $i ], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$set   = typeset( $plain, count( $texts ) - 1 === $n );
		if ( $set !== htmlspecialchars( $plain, ENT_NOQUOTES | ENT_HTML5, 'UTF-8' ) ) {
			$tokens[ $i ] = $set;
		}
	}
	return implode( '', $tokens );
}

// php server/typeset.php --cases markup/typeset.json: every case set as core/typeset.js sets it.
if ( PHP_SAPI === 'cli' && isset( $argv ) && realpath( $argv[0] ) === __FILE__ && ( $argv[1] ?? '' ) === '--cases' ) {
	$cases  = json_decode( file_get_contents( $argv[2] ), true );
	$failed = 0;
	foreach ( $cases['text'] as $c ) {
		$got = typeset( $c['text'], ! empty( $c['widow'] ) );
		if ( $got !== $c['html'] ) {
			echo 'FAIL typeset php: ' . json_encode( $c['text'], JSON_UNESCAPED_UNICODE ) . ' gave ' . json_encode( $got, JSON_UNESCAPED_UNICODE ) . ', not ' . json_encode( $c['html'], JSON_UNESCAPED_UNICODE ) . "\n";
			$failed++;
		}
	}
	foreach ( $cases['markup'] as $c ) {
		$got = typeset_html( $c['markup'] );
		if ( $got !== $c['html'] ) {
			echo 'FAIL typeset php: ' . json_encode( $c['markup'], JSON_UNESCAPED_UNICODE ) . ' gave ' . json_encode( $got, JSON_UNESCAPED_UNICODE ) . ', not ' . json_encode( $c['html'], JSON_UNESCAPED_UNICODE ) . "\n";
			$failed++;
		}
	}
	if ( ! $failed ) {
		echo 'ok   typeset php: ' . ( count( $cases['text'] ) + count( $cases['markup'] ) ) . " cases set as core/typeset.js sets them\n";
	}
	exit( $failed ? 1 : 0 );
}
