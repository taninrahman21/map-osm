<?php
class MOSMHelloBlock{
	public function __construct(){
		add_action( 'init', [$this, 'onInit'] );
	}
	function onInit() {
		wp_register_style( 'mosm-hello-style', MOSM_DIR_URL . 'dist/style.css', [ ], MOSM_VERSION ); // Style
		wp_register_style( 'mosm-hello-editor-style', MOSM_DIR_URL . 'dist/editor.css', [ 'mosm-hello-style' ], MOSM_VERSION ); // Backend Style

		register_block_type( __DIR__, [
			'editor_style'		=> 'mosm-hello-editor-style',
			'render_callback'	=> [$this, 'render']
		] ); // Register Block

		wp_set_script_translations( 'mosm-hello-editor-script', 'map-osm', MOSM_DIR_PATH . 'languages' );
	}

	function render( $attributes ){
		extract( $attributes );

		wp_enqueue_style( 'mosm-hello-style' );
		wp_enqueue_script( 'mosm-hello-script', MOSM_DIR_URL . 'dist/script.js', [ 'react', 'react-dom' ], MOSM_VERSION, true );
		wp_set_script_translations( 'mosm-hello-script', 'map-osm', MOSM_DIR_PATH . 'languages' );

		$className = $className ?? '';
		$blockClassName = "wp-block-mosm-hello $className align$align";

		ob_start(); ?>
		<div class='<?php echo esc_attr( $blockClassName ); ?>' id='mosmHelloBlock-<?php echo esc_attr( $cId ) ?>' data-attributes='<?php echo esc_attr( wp_json_encode( $attributes ) ); ?>'></div>

		<?php return ob_get_clean();
	}
}
new MOSMHelloBlock();
