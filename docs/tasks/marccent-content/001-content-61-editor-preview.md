# Task 001: Content #61, the editor's preview

Status: blocked
Repo: marccent-content
Issue: marcoscenteno89/marccent-theme#61 (label `project: marccent-content`, milestone 1.0, kind `bug`)
Branch base: origin/main, after PR #5 is merged
Give to: Code in marccent-content

## Goal

The editor previews a related Loop's first post, and shows counts and sums from the server, not empty labels.

## Files

- `inc/blocks.php`: a new REST route `GET marccent-content/v1/preview`, and `wp-url` added to the editor script's dependencies.
- `assets/editor.js`: a `marccent-content/preview` data store; the Loop note; count, sum and binding values read from the server.
- The patch: commit `c2c92c9`, made on top of PR #5's head `81d0bbe`. It is embedded in this task, below, as a `diff` block.

## Exact steps

1. Do not start until PR #5 (`claude/project-thread-1t553q`, head `81d0bbe`) is merged into `main`.
2. `git fetch origin && git checkout -b claude/content-61-editor-preview origin/main`.
3. Apply the patch from the block in **Patch** below:
   - Copy everything between the `diff` fences (not the fences) into a file outside the repo, e.g. `~/content-61.patch`.
   - `git am ~/content-61.patch`. If it fails on context lines after the merge, run `git apply --3way ~/content-61.patch`, resolve the conflicts by hand, and commit. Do not rewrite PR #5.
   - Check it: `git log -1 --format=%s` must show "The editor previews a related Loop's posts and counts and sums from the server (#61)".
4. Do not rebase or force-push anything already on origin.
5. The change, in short:
   - `GET marccent-content/v1/preview` takes `?post=ID&loop={json}` and returns `{ "id": N }`, the Loop's first post, from the page's own query (`mcc_loop_query`) run with the current post. Permission: `edit_post` for that post, or `edit_posts` when no post is given.
   - `?post=ID&key=count:…` or `sum:…` returns `{ "value": "…" }` from `mcc_value(…, 'raw')`. A private field stays empty here.
   - The editor caches each answer by path in the store, so blocks redraw when it arrives.
   - A related Loop's note shows the related first post. In a template with no current post, it says it previews any one post of its type.
6. Open the PR (one goal; see Done when).

## Patch

```diff
From c2c92c909215936683867f5687986eca3e46e13a Mon Sep 17 00:00:00 2001
From: Claude <noreply@anthropic.com>
Date: Sun, 15 Nov 2026 00:01:33 +0000
Subject: [PATCH] The editor previews a related Loop's posts and counts and
 sums from the server (#61)

A Loop previewed its type's first post, whatever its relation; a Field block with
count: or sum: showed only its label. Both now ask marccent-content/v1/preview,
which runs the page's own code: mcc_loop_query with the current post (the outer
Loop's item, else the post being edited) and mcc_value. A wp.data store keeps each
answer, so the blocks and the binding source redraw when it arrives. In a template
there's no current post, so a related Loop previews any one of its type's posts
and says so.

Fixes marcoscenteno89/marccent-theme#61

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Bd3Mdb9FRdzWSpXkQJR2QM
---
 assets/editor.js | 56 +++++++++++++++++++++++++++++++++++++++++++-----
 inc/blocks.php   | 42 +++++++++++++++++++++++++++++++++++-
 2 files changed, 92 insertions(+), 6 deletions(-)

diff --git a/assets/editor.js b/assets/editor.js
index 2b3c897..c854cab 100644
--- a/assets/editor.js
+++ b/assets/editor.js
@@ -103,8 +103,41 @@
 	// A relation's value as a list of ids.
 	const idsOf = ( v ) => ( Array.isArray( v ) ? v : [ v ] ).map( Number ).filter( Boolean );
 
+	// What only the server can preview (#61): a Loop's first post and a count's or sum's value, from the same queries as
+	// the page (inc/blocks.php, marccent-content/v1/preview). A store, so the blocks and the bindings redraw when it
+	// arrives; each answer is kept, by its path. undefined while it loads, null when it failed.
+	const PREVIEW = 'marccent-content/preview';
+	wp.data.register( wp.data.createReduxStore( PREVIEW, {
+		reducer: ( state = {}, action ) => ( action.type === 'SET' ? { ...state, [ action.path ]: action.value } : state ),
+		actions: { set: ( path, value ) => ( { type: 'SET', path, value } ) },
+		selectors: { get: ( state, path ) => state[ path ] },
+		resolvers: {
+			get: ( path ) => async ( { dispatch } ) => {
+				let value = null;
+				try {
+					value = await wp.apiFetch( { path } );
+				} catch ( e ) {}
+				dispatch.set( path, value );
+			},
+		},
+	} ) );
+	const fromServer = ( select, query ) => select( PREVIEW ).get( wp.url.addQueryArgs( '/marccent-content/v1/preview', query ) );
+	const AGGREGATES = [ 'count', 'sum', 'average', 'minimum', 'maximum', 'avg', 'min', 'max' ];
+	// A count or sum (count:work_order.account?status=New): its value on the post, as the page shows it.
+	const aggregateOf = ( select, postId, key ) => {
+		const [ name, arg ] = key.split( ':' );
+		if ( ! postId || ! AGGREGATES.includes( name ) || ! arg ) return undefined;
+		const answer = fromServer( select, { post: postId, key } );
+		return answer?.value ?? null;
+	};
+
 	// A post's value for a key, as the editor can show it (a close preview of inc/values.php); null when unknown.
-	const usePreview = ( postType, postId, key ) => useSelect( ( select ) => ( postId && key ? previewOf( select( 'core' ), postType, postId, key.split( '|' )[ 0 ].trim() ) : null ), [ postType, postId, key ] );
+	const usePreview = ( postType, postId, key ) => useSelect( ( select ) => {
+		if ( ! postId || ! key ) return null;
+		const k = key.split( '|' )[ 0 ].trim();
+		const total = aggregateOf( select, postId, k );
+		return total !== undefined ? total : previewOf( select( 'core' ), postType, postId, k );
+	}, [ postType, postId, key ] );
 
 	const previewOf = ( core, postType, postId, key ) => {
 		const post = core.getEditedEntityRecord( 'postType', postType, postId );
@@ -189,8 +222,19 @@
 			];
 			const group = a.source ? data.groups[ a.source ] : null;
 			const repeating = Object.entries( data.groups ).filter( ( [ , g ] ) => g.repeat );
-			const first = useSelect( ( select ) => ( group ? null : select( 'core' ).getEntityRecords( 'postType', a.postType, { per_page: 1, status: 'publish', orderby: 'date' } ) ), [ a.postType, !! group ] );
-			const postId = first?.[ 0 ]?.id;
+			// Its first post, as the page lists it: related to the current post (the outer Loop's item, else the one being
+			// edited), with its where, order and terms. In a template there is no current post, so a related Loop
+			// previews any one of its type's posts.
+			const current = context.postId || 0;
+			const query = { postType: a.postType, relation: current ? a.relation : '', where: a.where, orderBy: a.orderBy, order: a.order, taxonomy: a.taxonomy, terms: a.terms, parent: a.parent, offset: a.offset, excludeCurrent: a.excludeCurrent };
+			const first = useSelect( ( select ) => {
+				if ( group ) return null;
+				const found = fromServer( select, { post: current, loop: JSON.stringify( query ) } );
+				if ( ! found?.id ) return found === undefined ? undefined : null;
+				return select( 'core' ).getEntityRecord( 'postType', a.postType, found.id ) ?? undefined;
+			}, [ JSON.stringify( query ), current, !! group ] );
+			const postId = first?.id;
+			const unrelated = a.relation && ! current;
 			const blockProps = useBlockProps( { className: 'mcc-loop' } );
 			const inner = useInnerBlocksProps( { className: [ ( { 'auto-cols': 'grid auto-cols', 'row-wrap': 'row-wrap' } )[ a.layout ] || `grid cols-${ a.columns }`, a.gap ].filter( Boolean ).join( ' ' ) }, { template: ITEM, orientation: 'horizontal' } );
 			const orders = [ ...( forward ? [ opt( 'Their order in the relation', 'post__in' ) ] : [] ),
@@ -258,7 +302,7 @@
 					el( 'p', { className: 'mcc-loop-note', style: { margin: '0 0 .5rem', fontSize: '12px', opacity: 0.7 } },
 						group
 							? `Loop: ${ group.label } rows${ a.from ? ` from ${ a.from }` : '' }${ a.where ? ` where ${ a.where }` : '' }. This item repeats for each one.`
-							: `Loop: ${ type.label }${ a.relation ? ` (${ relations.find( ( r ) => r.value === a.relation )?.label ?? a.relation })` : '' }. This item repeats for each one${ postId ? `, previewing “${ text( first[ 0 ].title ) }”` : first ? ' (none published yet)' : ' (loading a preview…)' }.` ),
+							: `Loop: ${ type.label }${ a.relation ? ` (${ relations.find( ( r ) => r.value === a.relation )?.label ?? a.relation })` : '' }. This item repeats for each one${ postId ? `, previewing “${ text( first.title ) }”${ unrelated ? ', any one of them: the related ones show on a post' : '' }` : first === null ? ( a.relation && ! unrelated ? ' (none related to this one)' : ' (none published yet)' ) : ' (loading a preview…)' }.` ),
 					el( BlockContextProvider, { value: group ? { 'marccent/source': a.source } : { postId, postType: a.postType, 'marccent/source': '' } }, el( 'div', inner ) )
 				)
 			);
@@ -586,7 +630,9 @@
 					const key = ( args?.key || '' ).split( '|' )[ 0 ].trim();
 					const field = typeOf( context.postType ).fields[ key ];
 					let v = null;
-					if ( post ) {
+					const total = aggregateOf( select, context.postId, key );
+					if ( total !== undefined ) v = total;
+					else if ( post ) {
 						if ( key === 'title' ) v = text( post.title );
 						else if ( key === 'excerpt' ) v = text( post.excerpt );
 						else if ( key === 'link' ) v = post.link;
diff --git a/inc/blocks.php b/inc/blocks.php
index 2d27f27..a303623 100644
--- a/inc/blocks.php
+++ b/inc/blocks.php
@@ -11,7 +11,7 @@ add_action( 'init', function () {
 	wp_register_script(
 		'marccent-content-editor',
 		plugins_url( 'assets/editor.js', MCC_FILE ),
-		array( 'wp-api-fetch', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins' ),
+		array( 'wp-api-fetch', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins', 'wp-url' ),
 		filemtime( MCC_DIR . '/assets/editor.js' ),
 		true
 	);
@@ -67,6 +67,46 @@ add_filter(
 	2
 );
 
+/*
+ * The editor's preview (#61), from the same code as the page: a Loop's first post (related to the post being edited,
+ * or to the outer Loop's item, as on the page) and a count's or sum's value. The editor can't work either out: a
+ * relation's other side and an aggregate's where need the database's queries.
+ *   GET marccent-content/v1/preview?post=12&loop={"postType":"contact","relation":"account"}  { "id": 34 }
+ *   GET marccent-content/v1/preview?post=12&key=count:work_order.account?status=New           { "value": "3" }
+ * Only to those who can edit the post (any post, without one); a private field shows nothing here either.
+ */
+add_action( 'rest_api_init', function () {
+	register_rest_route( 'marccent-content/v1', '/preview', array(
+		'methods'             => 'GET',
+		'args'                => array(
+			'post' => array( 'type' => 'integer', 'default' => 0, 'minimum' => 0 ),
+			'loop' => array( 'type' => 'string', 'default' => '' ),
+			'key'  => array( 'type' => 'string', 'default' => '' ),
+		),
+		'permission_callback' => fn( WP_REST_Request $r ) => $r['post'] ? current_user_can( 'edit_post', $r['post'] ) : current_user_can( 'edit_posts' ),
+		'callback'            => function ( WP_REST_Request $r ) {
+			$post = (int) $r['post'];
+			if ( '' !== $r['key'] ) {
+				return $post ? array( 'value' => mcc_value( $post, $r['key'], 'raw' ) ) : new WP_Error( 'mcc_preview', __( 'A value needs a post.', 'marccent-content' ), array( 'status' => 400 ) );
+			}
+			$loop = json_decode( $r['loop'], true );
+			$type = WP_Block_Type_Registry::get_instance()->get_registered( 'marccent/loop' );
+			if ( ! is_array( $loop ) || ! $type ) {
+				return new WP_Error( 'mcc_preview', __( 'No Loop given.', 'marccent-content' ), array( 'status' => 400 ) );
+			}
+			$a = $type->prepare_attributes_for_render( mcc_loop_upgrade( $loop ) );
+			if ( str_contains( (string) $a['where'], '{{' ) ) { // as blocks/loop/render.php: the item around it
+				$GLOBALS['mcc_no_visitor'] = true;
+				$a['where']                = mcc_fill( $a['where'], $post );
+				$GLOBALS['mcc_no_visitor'] = false;
+			}
+			$a['perPage'] = 1;
+			$ids          = mcc_loop_query( $a, $post )->posts;
+			return array( 'id' => $ids ? (int) ( is_object( $ids[0] ) ? $ids[0]->ID : $ids[0] ) : 0 );
+		},
+	) );
+} );
+
 // The fields panel is part of the same script, so it loads in every post editor, not only with a block.
 add_action( 'enqueue_block_editor_assets', fn() => wp_enqueue_script( 'marccent-content-editor' ) );
 
-- 
2.43.0
```

## Checks

- `php -l inc/blocks.php` and `node --check assets/editor.js`. Paste the output.
- If the repo has a test or lint script, run it and paste the output.
- Do not say it works in the editor. Those checks need wp.localhost, so they are Chrome's, given through Marcos. Write them in the PR body under "Still to check on wp.localhost":
  - a Loop related to the post being edited previews the related post, not the type's first;
  - a Loop in a template previews a post of its type and says so;
  - a count such as `count:work_order.account?status=New` shows its number in the editor;
  - a private field's count or sum shows nothing, in the editor and in the REST preview when logged out.

## Done when

- The PR title is "The editor previews a related Loop and counts and sums from the server".
- The PR body starts with `Fixes marcoscenteno89/marccent-theme#61`, then the summary, the checks run with output, and the wp.localhost list above.
- No model name in the commit or the PR. Attribution lines as the repo's PR convention asks.

## Notes

- Blocked until PR #5 is merged to `main`. Hub changes this to `open` when that happens.
- The old patch `patches/content-61-editor-preview.patch` in /mnt/project-files is commit `0a8cecd`, from before PR #5. Do not use it.
