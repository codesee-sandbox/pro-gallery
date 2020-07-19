import React from 'react';
// import GalleryItem from '../item/galleryItem';

import EVENTS from '../../../common/constants/events';
import GALLERY_SIZE_TYPE from '../../../common/constants/gallerySizeType';
import CROP_TYPES from '../../../common/constants/resizeMethods'
import {hasVerticalPlacement, default as INFO_PLACEMENT} from '../../../common/constants/placements'

import CLICK_ACTIONS from '../../../common/constants/itemClick'
import INFO_TYPE from '../../../common/constants/infoType';

import { isSEOMode } from '../../../common/window/viewModeWrapper';
import {getInnerInfoStyle} from '../../item/itemViewStyleProvider';

import { processLayouts } from '../../helpers/layoutHelper';
import { addPresetStyles } from '../presets/presets';

import './leanGallery.scss';

const get = (item, attr) => {
  if (typeof item[attr] !== 'undefined') {
    return item[attr]
  }

  const metadata = item.metadata || item.metaData;
  if (typeof metadata !== 'undefined') {
    if (typeof metadata[attr] !== 'undefined') {
      return metadata[attr]
    }
  }
}

export const formatLeanGalleryStyles = (styles) => {
	return processLayouts(addPresetStyles(styles)); // TODO make sure the processLayouts is up to date. delete addLayoutStyles from layoutsHelper when done with it...
};

export default class LeanGallery extends React.Component {
  constructor() {
    super();

    this.measureIfNeeded = this.measureIfNeeded.bind(this);
    this.eventsListener = this.eventsListener.bind(this);

    this.state = {
      itemStyle: {}
    };
  }

  eventsListener(eventName, eventData) {
    if (typeof this.props.eventsListener === 'function') {
      this.props.eventsListener(eventName, eventData);
    }
  }

  componentDidMount() {
    this.eventsListener(EVENTS.APP_LOADED, {});
  }

  resizeUrl({ item }) {
    const { styles, resizeMediaUrl } = this.props;
    const { cubeType, imageQuality, cubeRatio } = styles;
    const { itemStyle } = this.state;

    const { url, mediaUrl, src } = item;
    const itemUrl = url || mediaUrl || src;
    
    const itemSize = this.calcItemSize();
    const width = itemStyle.width || itemSize;
    // const height = itemStyle.height || (itemSize / cubeRatio);

    const height = width / get(item, 'width') * get(item, 'height');

    const focalPoint = false;

    const isPreload = !(itemStyle.width > 0)
    const options = isPreload ? {quality: 30, blur: 30} : {quality: imageQuality};

    if (typeof resizeMediaUrl === 'function') {
      try {
        return resizeMediaUrl({
          maxWidth: get(item, 'width'),
          maxHeight: get(item, 'height'),
        }, itemUrl, cubeType, width, height, options, false, focalPoint) || '';
      } catch (e) {
        return String(itemUrl);
      }
    } else {
      return String(itemUrl);
    }
  };

  calcItemSize() {
    const { styles, container } = this.props;
    const { gallerySizeType, gallerySize, gallerySizePx, gallerySizeRatio } = styles;

    let itemSize;

    if (gallerySizeType === GALLERY_SIZE_TYPE.PIXELS && gallerySizePx > 0) {
      itemSize = gallerySizePx;
    } else if (gallerySizeType === GALLERY_SIZE_TYPE.RATIO && gallerySizeRatio > 0) {
      itemSize = container.width * (gallerySizeRatio / 100);
    } else {
      itemSize = gallerySize;
    }

    const minmaxFix = 0.75; //this fix is meant to compensate for the css grid ability to use the number as a minimum only (the pro-gallery is trying to get as close as possible to this number)
    itemSize *= minmaxFix;

    return Math.min(itemSize, container.width);
  }

  createGalleryStyle() {
    const { styles } = this.props;
    const { gridStyle, numberOfImagesPerRow, imageMargin } = styles;

    // const minmaxFix = 0.75; //this fix is meant to compensate for the css grid ability to use the number as a minimum only (the pro-gallery is trying to get as close as possible to this number)
    const minmaxFix = 1;
    const itemSize = this.calcItemSize() * minmaxFix;

    const gridTemplateColumns = gridStyle === 1 ? `repeat(${numberOfImagesPerRow}, 1fr)` : `repeat(auto-fit, minmax(${itemSize}px, 1fr))`;
    
    return {
      gridTemplateColumns,
      columnGap: `${imageMargin}px`,
      gridAutoRows: '1px' 
    };
  }

  createImageStyle(imageSize) {
    const {width, height} = imageSize;
    const { styles } = this.props;
    let borderStyle;

    if(styles.imageInfoType !== INFO_TYPE.ATTACHED_BACKGROUND) {
      borderStyle = {
        borderStyle: 'solid',
        borderWidth: styles.itemBorderWidth,
        borderColor: styles.itemBorderColor.value,
        borderRadius: styles.itemBorderRadius,
        boxSizing: 'border-box'
      }
    }

    return {
      width,
      height,
      ...borderStyle
    }
  }

  createItemBorder() {
    // Set border of the entire Item - including the info text
    const { styles } = this.props;

    if(styles.imageInfoType === INFO_TYPE.ATTACHED_BACKGROUND) {
      return {
        borderStyle: 'solid',
        borderWidth: styles.itemBorderWidth,
        borderColor: styles.itemBorderColor.value,
        borderRadius: styles.itemBorderRadius,
      };
    }
  }

  calcImageSize(image) {
    const { styles } = this.props;
    if (styles.cubeType !== CROP_TYPES.FIT) {
      return this.state.itemStyle
    }

    const {width, height} = this.state.itemStyle;
    const imageWidth = get(image, 'width');
    const imageHeight = get(image, 'height');
    const imageRatio = imageWidth / imageHeight;
    const containerRatio = width / height;
    return {
      width: imageWidth,
      height: imageHeight,
    };
    if (imageRatio > containerRatio) {
      //image is wider than container
      const _height = width / imageRatio;
      return {
        width,
        height: _height ,
        marginTop: (height - _height) / 2
      }
    } else {
      const _width = height * imageRatio;
      return {
        height,
        width: _width,
        marginLeft: (width - _width) / 2
      }
    }
  }

  calcContainerHeight(item) {
    let { height = null } = this.state.itemStyle
    const { textBoxHeight = 0, titlePlacement, cubeRatio } = this.props.styles;

    if (height === null) {
      const ratio = get(item, 'width') / get(item, 'height');
      const itemSize = this.calcItemSize();
      height = itemSize / ratio;
    }

    if (hasVerticalPlacement(titlePlacement)) {
      return height + textBoxHeight;
    } else {
      return height;
    }
  }

  createLinkParams(item) {
    const { noFollowForSEO, styles } = this.props;
    const { itemClick } = styles;

    const { directLink } = item;
    const { url, target } = directLink || {};
    const isSEO = isSEOMode();
    const shouldUseNofollow = isSEO && noFollowForSEO;
    const seoLinkParams = shouldUseNofollow ? { rel: 'nofollow' } : {};
    const shouldUseDirectLink = !!(url && target && itemClick === CLICK_ACTIONS.LINK);
    const linkParams = shouldUseDirectLink
      ? { href: url, target, ...seoLinkParams }
      : false;
    return linkParams;
  }

  measureIfNeeded(node) {
    const { styles } = this.props;
    if (!this.node && node) {
      this.node = node;
    }
    if (this.node && (this.node.clientWidth !== this.clientWidth)) {
      this.clientWidth = this.node.clientWidth;
      this.setState({
        itemStyle: {
          width: this.clientWidth,
          // height: this.clientHeight//Math.round(this.clientWidth / styles.cubeRatio),
        }
      });
    }
  }

  fixStylesIfNeeded(styles) {
    return {
      ...styles,
      externalInfoHeight: styles.textBoxHeight
    }
  }

  componentDidUpdate() {
    this.measureIfNeeded();
  }

  render() {
    const { eventsListener, props } = this;

    const { customInfoRenderer, items } = props;

    const styles = this.fixStylesIfNeeded(props.styles);

    const { itemClick, imageMargin } = styles;

    return (
      <div
        data-hook="lean-gallery"
        className={['pro-gallery', 'inline-styles', 'lean-gallery-gallery'].join(' ')}
        style={this.createGalleryStyle()}
      >
        {items.map((item, itemIdx) => {
          const linkParams = this.createLinkParams(item);
          const clickable = (linkParams && itemClick === CLICK_ACTIONS.LINK) || ([CLICK_ACTIONS.EXPAND, CLICK_ACTIONS.FULLSCREEN].includes(itemClick));
          const imageSize = this.calcImageSize(item);
          const itemData = {...item, id: item.itemId, idx: itemIdx};
          const itemProps = {...itemData, ...item.metaData, style: this.state.itemStyle, styleParams: styles};
          const texts = placement => (typeof customInfoRenderer === 'function') && (styles.titlePlacement === placement) && (
            <div className={`gallery-item-common-info gallery-item-${placement === INFO_PLACEMENT.SHOW_ABOVE ? `top` : `bottom`}-info`} style={getInnerInfoStyle(placement, styles)} >{customInfoRenderer(itemProps, placement)}</div>
          );
          const containerStyle={...this.createItemBorder(), marginBottom: `${imageMargin}px`, gridRowEnd: `span ${Math.round(this.calcContainerHeight(item))}`, cursor: clickable ? 'pointer' : 'default'};
          console.log({containerStyle})
          
          return (
            <a
              className={['gallery-item-container', 'lean-gallery-cell'].join(' ')}
              style={containerStyle}
              ref={node => {
                this.measureIfNeeded(node);
                eventsListener(EVENTS.ITEM_CREATED, itemData);
              }}
              key={'item-container-' + itemIdx}
              {...linkParams}
              >{texts(INFO_PLACEMENT.SHOW_ABOVE)}
              <div
                style={imageSize}
                className={['gallery-item-hover', 'lean-gallery-image-wrapper'].join(' ')}
                onClick={() => eventsListener(EVENTS.ITEM_ACTION_TRIGGERED, itemData)}
              ><img
                src={this.resizeUrl({ item })}
                loading="lazy"
                className={['gallery-item-content', 'lean-gallery-image'].join(' ')}
                alt={get(item, 'title')}
                style={this.createImageStyle(imageSize)}
                onLoad={() => eventsListener(EVENTS.ITEM_LOADED, itemData)}
              /></div>
              {texts(INFO_PLACEMENT.SHOW_BELOW)}
            </a>
          )
        })
        }
      </div >
    )
  }
}
