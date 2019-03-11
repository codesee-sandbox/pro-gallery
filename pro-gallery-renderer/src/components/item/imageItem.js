import React from 'react';
import utils from '../../utils/index.js';
import Consts from 'photography-client-lib/dist/src/utils/consts';

export default class ImageItem extends React.Component {

  componentDidMount() {
    try {
      this.props.actions.setItemLoaded();
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const {isThumbnail, alt, visible, loaded, displayed, styleParams, imageDimensions, resized_url, id, actions, settings} = this.props;
    const imageProps = (settings && settings.imageProps && (typeof settings.imageProps === 'function')) ? settings.imageProps(id) : {};
    const backgroundStyle = {}; //remove this inline style if rendered padding (using css) is used
    const {marginLeft, marginTop, ...restOfDimensions} = imageDimensions || {};
    const imageItemClassName = [
      'gallery-item-content',
      'image-item',
      'gallery-item-visible',
      'gallery-item',
      'gallery-item-preloaded',
      ((styleParams.cubeImages && styleParams.cubeType === 'fit') ? 'grid-fit' : ''),
      (styleParams.imageLoadingMode === Consts.loadingMode.COLOR ? 'load-with-color' : '')
    ].join(' ');

    return (<div
      className={imageItemClassName}
      onTouchStart={actions.handleItemMouseDown}
      onTouchEnd={actions.handleItemMouseUp}
      key={'image_container-' + id}
      data-hook={'image-item'}
        style={displayed ? {} : {...backgroundStyle, ...restOfDimensions}}
        >
        {this.useCssScrolling ? <canvas
            key={((styleParams.cubeImages && styleParams.cubeType === 'fill') ? 'cubed-' : '') + 'image'}
						className={'gallery-item-visible gallery-item gallery-item-hidden gallery-item-preloaded'}
						role="img"
            arial-label={alt}
            data-src={resized_url.img}
            style={restOfDimensions}
            {...imageProps}
          /> : <img
            onLoad={actions.setItemLoaded}
            key={((styleParams.cubeImages && styleParams.cubeType === 'fill') ? 'cubed-' : '') + 'image'}
            className={'gallery-item-visible gallery-item ' + (loaded ? 'gallery-item-loaded' : 'gallery-item-hidden')}
            src={resized_url.img}
            alt={isThumbnail ? '' : alt}
            onError={actions.setItemError}
            style={restOfDimensions}
            {...imageProps}
          />}
    </div>);
  }
}
