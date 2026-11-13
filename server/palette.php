<?php
/*
 * The site's colors on the server: lib/palette.js's rules in PHP (themeVars, textOn, contrast), so a WordPress page
 * paints the theme as the browser would, from one set of rules. `npm test` checks this file against the JS
 * (scripts/palette.mjs: php server/palette.php --cases <file>). Change a rule in lib/palette.js first, then here.
 *
 *   require_once 'node_modules/marccent-theme/server/palette.php';
 *   $vars = \Marccent\theme_vars( \Marccent\effective_theme( $site, $defaults ) );   // [ '--primary' => '#1f64cf', … ]
 */

namespace Marccent;

/** WCAG relative luminance of a #rgb or #rrggbb color. */
function luminance( string $hex ): float {
	$h = ltrim( $hex, '#' );
	if ( 3 === strlen( $h ) ) {
		$h = implode( '', array_map( fn( $c ) => $c . $c, str_split( $h ) ) );
	}
	$lin = function ( string $pair ): float {
		$v = hexdec( $pair ) / 255;
		return $v <= 0.03928 ? $v / 12.92 : ( ( $v + 0.055 ) / 1.055 ) ** 2.4;
	};
	[ $r, $g, $b ] = array_map( $lin, str_split( substr( $h, 0, 6 ), 2 ) );
	return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
}

/** The WCAG contrast ratio of two colors, 1 to 21. */
function contrast( string $a, string $b ): float {
	$l = array( luminance( $a ), luminance( $b ) );
	rsort( $l );
	return ( $l[0] + 0.05 ) / ( $l[1] + 0.05 );
}

/** The text on a fill of these colors: var(--dark) when dark text contrasts more than light with every one. */
function text_on( string ...$colors ): string {
	$l = array_map( __NAMESPACE__ . '\luminance', $colors );
	return min( array_map( fn( $x ) => ( $x + 0.05 ) / 0.05, $l ) ) >= min( array_map( fn( $x ) => 1.05 / ( $x + 0.05 ), $l ) ) ? 'var(--dark)' : 'var(--light)';
}

/** The theme in effect: the package's defaults with the site's on top; its palettes first. */
function effective_theme( array $site, array $defaults ): array {
	$own = (array) ( $site['palettes'] ?? array() );
	$ids = array_column( $own, 'id' );
	return array_merge(
		$defaults,
		$site,
		array(
			'vars'     => array_merge( (array) ( $defaults['vars'] ?? array() ), (array) ( $site['vars'] ?? array() ) ),
			'palettes' => array_merge( $own, array_values( array_filter( (array) ( $defaults['palettes'] ?? array() ), fn( $p ) => ! in_array( $p['id'] ?? null, $ids, true ) ) ) ),
		)
	);
}

/** The palette a theme picks, else its first. */
function palette_of( array $theme ): ?array {
	foreach ( (array) ( $theme['palettes'] ?? array() ) as $p ) {
		if ( ( $p['id'] ?? null ) === ( $theme['palette'] ?? null ) ) {
			return $p;
		}
	}
	return $theme['palettes'][0] ?? null;
}

/** The CSS variables a theme paints on <html> (lib/palette.js themeVars). */
function theme_vars( array $theme ): array {
	$p    = palette_of( $theme );
	$vars = array();
	if ( $p ) {
		$vars = array(
			'--primary'           => $p['primary'],
			'--primary-lighter'   => $p['primary'],
			'--primary-darker'    => $p['primary'],
			'--secondary'         => $p['secondary'],
			'--secondary-lighter' => $p['secondary'],
			'--secondary-darker'  => $p['secondary'],
			'--gradient'          => 'linear-gradient(to right, var(--primary), var(--secondary))',
			'--gradient-lighter'  => 'linear-gradient(to right, var(--primary-lighter), var(--secondary-lighter))',
			'--gradient-darker'   => 'linear-gradient(to right, var(--primary-darker), var(--secondary-darker))',
			'--primary-text'      => text_on( $p['primary'] ),
			'--secondary-text'    => text_on( $p['secondary'] ),
			'--gradient-text'     => text_on( $p['primary'], $p['secondary'] ),
		);
		foreach ( array( 'primary', 'secondary' ) as $name ) {
			foreach ( array( 'lighter', 'darker' ) as $side ) {
				$vars[ "--$name-$side-text" ] = $vars[ "--$name-text" ];
			}
		}
	}
	foreach ( array( 'dark', 'light' ) as $mode ) {
		if ( ! empty( $theme[ $mode ] ) ) {
			$vars[ "--$mode" ] = $theme[ $mode ];
		}
	}
	return array_merge( $vars, (array) ( $theme['vars'] ?? array() ) );
}

// Run directly with --cases <file>: each case's theme_vars as JSON, for the check (scripts/palette.mjs).
if ( PHP_SAPI === 'cli' && realpath( $_SERVER['SCRIPT_FILENAME'] ?? '' ) === __FILE__ && ( $argv[1] ?? '' ) === '--cases' ) {
	$cases = json_decode( (string) file_get_contents( $argv[2] ), true );
	echo json_encode( array_map( fn( $c ) => theme_vars( effective_theme( $c['site'], $c['defaults'] ) ), $cases ), JSON_UNESCAPED_SLASHES );
}
