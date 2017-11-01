import {
  Directive,
  ElementRef,
  Renderer,
  Input,
} from '@angular/core';

import { TsVerticalSpacingTypes } from './../utilities/types';


/**
 * This is the vertical spacing UI directive. Accepts {@link TsVerticalSpacingTypes}
 *
 * @example
 * <div
 *              tsVerticalSpacing
 * ></div>
 *
 * <div
 *              tsVerticalSpacing="large--1x"
 * ></div>
 */
@Directive({
  selector: '[tsVerticalSpacing]',
})
export class TsVerticalSpacingDirective {
  /**
   * Set a spacing class based on the passed in value
   *
   * @param {String} value The spacing value passed in.
   */
  @Input()
  public set tsVerticalSpacing(value: TsVerticalSpacingTypes) {
    // Fall back to default class if no value is passed in
    const className = (value && value.length > 0) ? `u-vertical-spacing__${value}` : `u-vertical-spacing`;

    this.renderer.setElementClass(this.elementRef.nativeElement, className, true)
  }


  /**
   * Inject services
   */
  constructor(
    private renderer: Renderer,
    private elementRef: ElementRef,
  ) {}

}
