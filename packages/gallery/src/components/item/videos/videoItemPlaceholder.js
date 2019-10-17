import React from 'react';
import { GalleryComponent } from '../../galleryComponent';
import { URL_TYPES, URL_SIZES } from '../../../common/constants/urlTypes';
import PlayBackground from '../../svgs/components/play_background';
import PlayTriangle from '../../svgs/components/play_triangle';

class VideoItemPlaceholder extends GalleryComponent {
  createImageElement() {
    return (
      <canvas
        key={'image-' + this.props.id}
        alt={this.props.alt ? this.props.alt : 'untitled video'}
        className={
          'gallery-item-hidden gallery-item-visible gallery-item gallery-item-preloaded ' +
          (this.props.loadingStatus.loaded ? ' gallery-item-loaded ' : '') +
          (this.props.loadingStatus.failed ? ' failed ' : '')
        }
        data-src={this.props.createUrl(URL_SIZES.RESIZED, URL_TYPES.HIGH_RES)}
      />
    );
  }
  render() {
    const { marginLeft, marginTop, ...restOfDimensions } =
      this.props.imageDimensions || {};
    const videoControls = this.props.hidePlay
      ? false
      : [
          <i
            key="play-triangle"
            data-hook="play-triangle"
            className={
              'gallery-item-video-play-triangle play-triangle '
            }
          ><PlayTriangle/></i>,
          <i
            key="play-bg"
            data-hook="play-background"
            className={
              'gallery-item-video-play-background play-background '
            }
          ><PlayBackground/></i>,
        ];

    const baseClassName =
      'gallery-item-content gallery-item-visible gallery-item-preloaded gallery-item-video gallery-item video-item';
    const placeHolder = (
      <div
        className={baseClassName}
        data-hook="video-placeholder_container-image-element"
        key={'video-and-hover-container' + this.props.id}
        style={{
          backgroundImage: `url(${this.props.createUrl(
            URL_SIZES.RESIZED,
            URL_TYPES.HIGH_RES,
          )})`,
          ...restOfDimensions,
        }}
      >
        {this.createImageElement()}
        {videoControls}
      </div>
    );

    const hover = this.props.hover;

    return (
      <div key={'video-and-hover-container' + this.props.idx}>
        {[placeHolder, hover]}
      </div>
    );
  }
}

export default VideoItemPlaceholder;